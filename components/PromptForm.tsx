"use client";

import { FormEvent, useState } from "react";
import { GeneratorInput, SoundtrackMood, VisualStyle } from "@/types/generator";

type PromptFormProps = {
  onGenerate: (input: GeneratorInput) => void;
  loading: boolean;
};

const STYLE_OPTIONS: { value: VisualStyle; label: string; hint: string }[] = [
  { value: "cinematic", label: "Cinematic Noir", hint: "Deep contrast, anamorphic glow" },
  { value: "dreamscape", label: "Dreamscape", hint: "Ethereal hues, slow motion" },
  { value: "neonwave", label: "Neonwave", hint: "Electric colours, kinetic energy" },
  { value: "documentary", label: "Documentary", hint: "Natural texture, grounded palette" },
  { value: "analog", label: "Analog Future", hint: "Retro VHS fuzz, chromatic flares" }
];

const SOUNDTRACK_OPTIONS: { value: SoundtrackMood; label: string }[] = [
  { value: "ambient", label: "Ambient Atmospherics" },
  { value: "pulse", label: "Pulse Engine" },
  { value: "orchestral", label: "Orchestral Swell" },
  { value: "lofi", label: "Lo-fi Dreamwave" }
];

const EXAMPLES = [
  "A neon-drenched cyberpunk alley where rain refracts into holographic shards.",
  "A tranquil forest lake at dawn with mist swirling above the water line.",
  "Macro shots of circuitry blooming into crystalline landscapes."
];

const PromptForm = ({ onGenerate, loading }: PromptFormProps) => {
  const [prompt, setPrompt] = useState(EXAMPLES[0]);
  const [duration, setDuration] = useState(12);
  const [style, setStyle] = useState<VisualStyle>("neonwave");
  const [soundtrack, setSoundtrack] = useState<SoundtrackMood>("pulse");
  const [aspectRatio, setAspectRatio] = useState<GeneratorInput["aspectRatio"]>("16:9");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!prompt.trim()) return;

    onGenerate({
      prompt,
      duration,
      style,
      soundtrack,
      aspectRatio
    });
  };

  return (
    <div className="panel panel-light" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
      <header style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <span className="pill">NovaForge Studio</span>
        <h1 style={{ fontSize: "1.95rem", fontWeight: 700, lineHeight: 1.1 }}>
          Design an <span className="gradient-text">AI-driven</span> motion sequence
        </h1>
        <p style={{ color: "rgba(226,232,240,0.78)", lineHeight: 1.55, fontSize: "0.98rem" }}>
          Describe your scene, choose a visual language, and NovaForge will generate story beats and bring them to life as a cohesive micro-video.
        </p>
      </header>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {EXAMPLES.map((example) => (
          <button key={example} type="button" className="btn-ghost" onClick={() => setPrompt(example)} disabled={loading}>
            {example.slice(0, 42)}…
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <label style={{ display: "grid", gap: "8px" }}>
          <span style={{ fontSize: "0.95rem", fontWeight: 600 }}>Concept Prompt</span>
          <textarea
            className="textarea"
            placeholder="Describe mood, motion, texture, and narrative moments."
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            disabled={loading}
          />
        </label>

        <label style={{ display: "grid", gap: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.95rem", fontWeight: 600 }}>Duration</span>
            <span style={{ fontSize: "0.85rem", color: "rgba(203,213,225,0.8)" }}>{duration}s</span>
          </div>
          <input
            type="range"
            min={6}
            max={30}
            step={1}
            value={duration}
            onChange={(event) => setDuration(Number(event.target.value))}
            className="input"
            style={{ accentColor: "#38bdf8", padding: 0, height: "4px" }}
            disabled={loading}
          />
        </label>

        <div style={{ display: "grid", gap: "16px" }}>
          <label style={{ display: "grid", gap: "8px" }}>
            <span style={{ fontSize: "0.95rem", fontWeight: 600 }}>Visual Language</span>
            <select className="select" value={style} onChange={(event) => setStyle(event.target.value as VisualStyle)} disabled={loading}>
              {STYLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} — {option.hint}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "grid", gap: "8px" }}>
            <span style={{ fontSize: "0.95rem", fontWeight: 600 }}>Sound Design</span>
            <select className="select" value={soundtrack} onChange={(event) => setSoundtrack(event.target.value as SoundtrackMood)} disabled={loading}>
              {SOUNDTRACK_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "grid", gap: "8px" }}>
            <span style={{ fontSize: "0.95rem", fontWeight: 600 }}>Aspect Ratio</span>
            <select className="select" value={aspectRatio} onChange={(event) => setAspectRatio(event.target.value as GeneratorInput["aspectRatio"])} disabled={loading}>
              <option value="16:9">16:9 — Landscape</option>
              <option value="9:16">9:16 — Vertical</option>
              <option value="1:1">1:1 — Square</option>
            </select>
          </label>
        </div>

        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: "8px" }}>
          {loading ? "Designing storyboard…" : "Generate Storyboard"}
        </button>
      </form>
    </div>
  );
};

export default PromptForm;
