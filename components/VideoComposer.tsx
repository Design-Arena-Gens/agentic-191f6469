"use client";

import { useEffect, useRef, useState } from "react";
import type { SceneDescriptor, Storyboard } from "@/types/generator";

type VideoComposerProps = {
  storyboard: Storyboard | null;
  aspectRatio: "16:9" | "9:16" | "1:1";
};

type RecorderBundle = {
  recorder: MediaRecorder;
  stream: MediaStream;
};

const aspectRatios: Record<VideoComposerProps["aspectRatio"], number> = {
  "16:9": 16 / 9,
  "9:16": 9 / 16,
  "1:1": 1
};

const buildCanvasDimensions = (ratio: number) => {
  if (ratio === 1) {
    return { width: 1024, height: 1024 };
  }

  if (ratio > 1) {
    const width = 1280;
    return { width, height: Math.round(width / ratio) };
  }

  const height = 1280;
  return { width: Math.round(height * ratio), height };
};

const seededRandom = (seed: number, index: number) => {
  const x = Math.sin(seed * 9999 + index * 2222) * 10000;
  return x - Math.floor(x);
};

const drawScene = (
  ctx: CanvasRenderingContext2D,
  scene: SceneDescriptor,
  timeInScene: number,
  sceneDuration: number,
  width: number,
  height: number
) => {
  const baseSeed = Number(scene.id.replace(/\D/g, "")) || 1;
  const palette = scene.palette;
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  const stops = palette.length - 1 || 1;

  palette.forEach((color, index) => gradient.addColorStop(index / stops, color));

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const t = timeInScene / sceneDuration;

  // Abstract particles
  const particleCount = 18;
  for (let i = 0; i < particleCount; i += 1) {
    const variance = seededRandom(baseSeed, i);
    const radius = (width * 0.06 + variance * width * 0.04) * (0.6 + 0.4 * Math.sin(t * Math.PI + variance * 6));
    const x =
      width * (0.1 + seededRandom(baseSeed * 2, i) * 0.8) +
      Math.sin(t * 2 * Math.PI + variance * 12) * width * 0.08;
    const y =
      height * (0.2 + seededRandom(baseSeed * 3, i) * 0.6) +
      Math.cos(t * 2 * Math.PI + variance * 8) * height * 0.08;

    ctx.beginPath();
    const alpha = 0.12 + variance * 0.15;
    ctx.fillStyle = palette[(i + 1) % palette.length] + "22";
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = `rgba(241,245,249,${alpha})`;
    ctx.lineWidth = 2;
    ctx.arc(x, y, radius * (0.4 + variance * 0.6), 0, Math.PI * 2);
    ctx.stroke();
  }

  // Camera motion overlays
  ctx.save();
  ctx.translate(width / 2, height / 2);
  const motionFactor = Math.sin(t * Math.PI * 2) * 0.12;

  switch (scene.motion) {
    case "pan":
      ctx.translate(width * motionFactor, height * motionFactor * 0.5);
      break;
    case "zoom":
      const scale = 1 + motionFactor * 0.5;
      ctx.scale(scale, scale);
      break;
    case "orbit":
      ctx.rotate(motionFactor * 0.7);
      break;
    case "pulse":
      ctx.scale(1 + motionFactor * 0.35, 1 + motionFactor * 0.35);
      break;
    default:
      break;
  }

  ctx.translate(-width / 2, -height / 2);

  ctx.fillStyle = "rgba(15, 23, 42, 0.28)";
  const bandHeight = height * 0.35;
  ctx.fillRect(0, height - bandHeight, width, bandHeight);

  ctx.restore();

  // Typography overlays
  ctx.fillStyle = "rgba(241,245,249,0.92)";
  ctx.font = `600 ${Math.round(height * 0.056)}px "Inter", sans-serif`;
  ctx.textBaseline = "top";
  ctx.fillText(scene.label, width * 0.08, height * 0.12);

  ctx.fillStyle = "rgba(226,232,240,0.84)";
  ctx.font = `400 ${Math.round(height * 0.028)}px "Inter", sans-serif`;

  const summaryWidth = width * 0.7;
  const words = scene.summary.split(" ");
  const lines: string[] = [];
  let current = "";
  words.forEach((word) => {
    const test = current ? `${current} ${word}` : word;
    const metrics = ctx.measureText(test);
    if (metrics.width > summaryWidth) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  });
  if (current) lines.push(current);

  const startY = height * 0.2;
  lines.slice(0, 4).forEach((line, idx) => {
    ctx.fillText(line, width * 0.08, startY + idx * height * 0.045);
  });

  ctx.fillStyle = "rgba(148, 163, 184, 0.86)";
  ctx.font = `500 ${Math.round(height * 0.022)}px "Inter", sans-serif`;
  ctx.fillText(`Camera: ${scene.camera}`, width * 0.08, height * 0.7);
  ctx.fillText(`Mood: ${scene.mood}`, width * 0.08, height * 0.76);
  ctx.fillText(`Keywords: ${scene.keywords.slice(0, 4).join(", ")}`, width * 0.08, height * 0.82);
};

const VideoComposer = ({ storyboard, aspectRatio }: VideoComposerProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const recorderRef = useRef<RecorderBundle | null>(null);
  const frameRef = useRef<number | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeScene, setActiveScene] = useState<SceneDescriptor | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setVideoUrl(null);
    setProgress(0);
    setActiveScene(null);
    setError(null);
  }, [storyboard, aspectRatio]);

  useEffect(
    () => () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      if (recorderRef.current) {
        recorderRef.current.recorder.stop();
        recorderRef.current.stream.getTracks().forEach((track) => track.stop());
      }
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    },
    [videoUrl]
  );

  const renderStoryboard = () => {
    if (!storyboard) return;
    if (typeof window === "undefined") return;
    if (typeof MediaRecorder === "undefined") {
      setError("MediaRecorder API is not supported in this environment.");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      setError("Canvas not available.");
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setError("Unable to initialise 2D context.");
      return;
    }

    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    if (recorderRef.current) {
      recorderRef.current.recorder.stop();
      recorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }

    const { width, height } = buildCanvasDimensions(aspectRatios[aspectRatio]);
    canvas.width = width;
    canvas.height = height;

    const stream = canvas.captureStream(30);
    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm";

    try {
      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 6_000_000 });
      recorderRef.current = { recorder, stream };

      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        setIsRendering(false);
        setProgress(1);
        setActiveScene(null);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
    } catch (recorderError) {
      setError(`Unable to initialise recorder: ${(recorderError as Error).message}`);
      setIsRendering(false);
      return;
    }

    const totalDuration = storyboard.scenes.reduce((sum, scene) => sum + scene.duration, 0);
    const begin = performance.now();

    setIsRendering(true);
    setProgress(0);
    setError(null);

    const animate = (timestamp: number) => {
      const elapsedSeconds = (timestamp - begin) / 1000;
      const clampedTime = Math.min(elapsedSeconds, totalDuration);

      let traversed = 0;
      let currentScene = storyboard.scenes[0];

      for (const scene of storyboard.scenes) {
        if (clampedTime >= traversed && clampedTime < traversed + scene.duration) {
          currentScene = scene;
          break;
        }
        traversed += scene.duration;
      }

      const sceneOffset = Math.max(0, clampedTime - traversed);
      setActiveScene(currentScene);
      setProgress(clampedTime / totalDuration);

      drawScene(ctx, currentScene, sceneOffset, currentScene.duration, width, height);

      if (elapsedSeconds < totalDuration) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        if (recorderRef.current) {
          recorderRef.current.recorder.stop();
        }
      }
    };

    frameRef.current = requestAnimationFrame(animate);
  };

  return (
    <div className="panel" style={{ padding: "24px", display: "grid", gap: "18px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Visual Synthesiser</h2>
          <p style={{ color: "rgba(148,163,184,0.88)", fontSize: "0.9rem" }}>
            Render abstract motion graphics from the storyboard blueprint directly in your browser.
          </p>
        </div>
        <button className="btn-primary" type="button" onClick={renderStoryboard} disabled={!storyboard || isRendering}>
          {isRendering ? "Rendering…" : "Generate Video"}
        </button>
      </div>

      <div className="video-preview" style={{ position: "relative" }}>
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
        {isRendering && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(15,23,42,0.46)",
              backdropFilter: "blur(6px)",
              flexDirection: "column",
              gap: "12px"
            }}
          >
            <div className="sparkle" />
            <span style={{ fontSize: "1.05rem", fontWeight: 600 }}>Synthesising timeline…</span>
            <div
              style={{
                width: "60%",
                height: "6px",
                borderRadius: "999px",
                background: "rgba(71,85,105,0.4)",
                overflow: "hidden"
              }}
            >
              <div
                style={{
                  width: `${Math.round(progress * 100)}%`,
                  height: "100%",
                  borderRadius: "999px",
                  background: "linear-gradient(90deg, #38bdf8, #a855f7)"
                }}
              />
            </div>
            {activeScene && <span style={{ fontSize: "0.9rem", color: "rgba(203,213,225,0.85)" }}>{activeScene.label}</span>}
          </div>
        )}
      </div>

      {videoUrl && (
        <div style={{ display: "grid", gap: "14px" }}>
          <video ref={videoRef} src={videoUrl} controls loop style={{ width: "100%", borderRadius: "16px", border: "1px solid rgba(148,163,184,0.25)" }} />
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <a className="btn-primary" href={videoUrl} download="novaforge-sequence.webm">
              Download .webm
            </a>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = 0;
                  void videoRef.current.play();
                }
              }}
            >
              Replay
            </button>
          </div>
        </div>
      )}

      {error && (
        <p style={{ color: "#fda4af", fontSize: "0.9rem", background: "rgba(127,29,29,0.15)", padding: "12px 16px", borderRadius: "12px" }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default VideoComposer;
