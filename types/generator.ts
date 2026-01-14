export type VisualStyle = "cinematic" | "documentary" | "dreamscape" | "neonwave" | "analog";

export type SoundtrackMood = "ambient" | "pulse" | "orchestral" | "lofi";

export type GeneratorInput = {
  prompt: string;
  duration: number;
  style: VisualStyle;
  soundtrack: SoundtrackMood;
  aspectRatio: "16:9" | "9:16" | "1:1";
};

export type SceneDescriptor = {
  id: string;
  label: string;
  summary: string;
  mood: string;
  duration: number;
  palette: string[];
  motion: "pan" | "zoom" | "orbit" | "pulse";
  camera: string;
  keywords: string[];
};

export type Storyboard = {
  synopsis: string;
  tone: string;
  soundtrackNotes: string;
  scenes: SceneDescriptor[];
};
