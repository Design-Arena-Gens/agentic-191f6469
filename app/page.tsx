"use client";

import { useMemo, useState } from "react";
import PromptForm from "@/components/PromptForm";
import TimelineView from "@/components/TimelineView";
import VideoComposer from "@/components/VideoComposer";
import { buildStoryboard } from "@/lib/prompt";
import type { GeneratorInput, SceneDescriptor, Storyboard } from "@/types/generator";

const Page = () => {
  const [storyboard, setStoryboard] = useState<Storyboard | null>(null);
  const [activeScene, setActiveScene] = useState<SceneDescriptor | null>(null);
  const [loading, setLoading] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<GeneratorInput["aspectRatio"]>("16:9");

  const handleGenerate = (input: GeneratorInput) => {
    setLoading(true);
    setAspectRatio(input.aspectRatio);

    window.setTimeout(() => {
      const board = buildStoryboard(input);
      setStoryboard(board);
      setActiveScene(board.scenes[0] ?? null);
      setLoading(false);
    }, 420);
  };

  const paletteSwatch = useMemo(() => {
    if (!storyboard?.scenes.length) return null;
    const swatch = storyboard.scenes[0].palette;
    return swatch;
  }, [storyboard]);

  return (
    <div className="app-shell" style={{ display: "grid", gap: "32px" }}>
      <div className="panel" style={{ padding: "26px", display: "grid", gap: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "18px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <span className="pill">NovaForge · AI Motion Lab</span>
            <h2 style={{ fontSize: "1.45rem", fontWeight: 600, display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              Generative video sequences from natural language
            </h2>
            <p style={{ color: "rgba(203,213,225,0.85)", maxWidth: "680px", lineHeight: 1.55 }}>
              Translate narrative ideas into evolving motion graphics. NovaForge analyses your prompt, builds a visual storyboard, and synthesises an animated webm clip using procedural shaders on the fly—no external APIs required.
            </p>
          </div>
          {paletteSwatch && (
            <div style={{ display: "flex", gap: "8px" }}>
              {paletteSwatch.map((hex) => (
                <span
                  key={hex}
                  style={{
                    width: "46px",
                    height: "46px",
                    borderRadius: "12px",
                    background: hex,
                    border: "1px solid rgba(15,23,42,0.4)",
                    boxShadow: "0 12px 30px -20px rgba(15,118,110,0.6)"
                  }}
                />
              ))}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
          <span style={{ color: "rgba(165,180,252,0.8)", fontSize: "0.88rem" }}>Procedural canvas compositor</span>
          <span style={{ color: "rgba(165,180,252,0.8)", fontSize: "0.88rem" }}>Realtime MediaRecorder capture</span>
          <span style={{ color: "rgba(165,180,252,0.8)", fontSize: "0.88rem" }}>Storyboarding heuristics</span>
        </div>
      </div>

      <div className="grid-col-two">
        <PromptForm onGenerate={handleGenerate} loading={loading} />
        <VideoComposer storyboard={storyboard} aspectRatio={aspectRatio} />
      </div>

      <TimelineView
        storyboard={storyboard}
        activeSceneId={activeScene?.id ?? null}
        onSelect={(scene) => {
          setActiveScene(scene);
        }}
      />
    </div>
  );
};

export default Page;
