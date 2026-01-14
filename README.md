# NovaForge · AI Video Generator

NovaForge transforms natural language prompts into animated motion clips directly in the browser. It analyses narrative cues, builds a procedural storyboard, and renders a stylised `.webm` sequence using the Canvas API and MediaRecorder—no external rendering farm required.

## ✨ Features
- Storyboard composer that derives tone, colour palettes, and camera moves from your prompt
- Procedural canvas renderer with dynamic gradients, particle systems, and typography overlays
- Web-native capture pipeline that records the animation to downloadable video
- Support for multiple visual styles, soundtrack directions, and aspect ratios

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000` to access the studio.

## 🧱 Tech Stack
- Next.js 14 (App Router) + React 18
- TypeScript with strict mode
- CSS-driven glassmorphism UI
- MediaRecorder + Canvas 2D rendering

## 🛠 Build

```bash
npm run build
npm start
```

## 📄 License

MIT © Design Arena Gens
