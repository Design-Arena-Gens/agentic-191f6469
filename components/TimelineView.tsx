"use client";

import { SceneDescriptor, Storyboard } from "@/types/generator";

type TimelineViewProps = {
  storyboard: Storyboard | null;
  activeSceneId: string | null;
  onSelect: (scene: SceneDescriptor) => void;
};

const TimelineView = ({ storyboard, activeSceneId, onSelect }: TimelineViewProps) => {
  if (!storyboard) {
    return (
      <div className="panel panel-light" style={{ padding: "24px" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "10px" }}>Storyboard Blueprint</h2>
        <p style={{ color: "rgba(203,213,225,0.8)", lineHeight: 1.55, fontSize: "0.95rem" }}>
          Craft a prompt to unlock NovaForge&apos;s timeline. We&apos;ll orchestrate beats, mood, and motion arcs on the fly.
        </p>
      </div>
    );
  }

  return (
    <div className="panel panel-light" style={{ padding: "24px", display: "grid", gap: "20px" }}>
      <header style={{ display: "grid", gap: "10px" }}>
        <h2 style={{ fontSize: "1.15rem", fontWeight: 600 }}>Storyboard Blueprint</h2>
        <p style={{ color: "rgba(148,163,184,0.9)", fontSize: "0.92rem", lineHeight: 1.5 }}>
          {storyboard.synopsis}
          <br />
          <strong style={{ fontWeight: 600, color: "rgba(221,214,254,0.9)" }}>Tone:</strong> {storyboard.tone.trim()}
          <br />
          <strong style={{ fontWeight: 600, color: "rgba(221,214,254,0.9)" }}>Soundscape:</strong> {storyboard.soundtrackNotes}
        </p>
      </header>

      <div className="timeline">
        {storyboard.scenes.map((scene, index) => {
          const isActive = activeSceneId === scene.id;
          return (
            <button
              key={scene.id}
              type="button"
              className="timeline-item"
              onClick={() => onSelect(scene)}
              style={{
                borderColor: isActive ? "rgba(56,189,248,0.6)" : undefined,
                boxShadow: isActive ? "0 0 0 1px rgba(56,189,248,0.35)" : undefined,
                textAlign: "left",
                cursor: "pointer"
              }}
            >
              <span style={{ fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(165,180,252,0.75)" }}>
                Scene {index + 1} · {scene.duration}s · {scene.motion}
              </span>
              <strong>{scene.label}</strong>
              <span>{scene.summary}</span>
              <span style={{ fontSize: "0.8rem", color: "rgba(148,163,184,0.8)" }}>Camera: {scene.camera}</span>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
                {scene.palette.map((hex) => (
                  <span
                    key={hex}
                    style={{
                      background: hex,
                      width: "26px",
                      height: "18px",
                      borderRadius: "8px",
                      border: "1px solid rgba(15,23,42,0.4)"
                    }}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TimelineView;
