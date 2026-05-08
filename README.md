<div align="center">

<img src="public/logo.png" alt="GradVex Logo" width="120" height="120" />

# GradVex

**Neural Network Studio — Learn how AI thinks by watching it think.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20App-00d4aa?style=for-the-badge&logo=cloudflare&logoColor=white)](https://gradvex.pages.dev)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=nextdotjs)](https://nextjs.org)
[![Three.js](https://img.shields.io/badge/Three.js-3D%20Viz-049ef4?style=for-the-badge&logo=threedotjs)](https://threejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![Cloudflare Pages](https://img.shields.io/badge/Deployed-Cloudflare%20Pages-f38020?style=for-the-badge&logo=cloudflare)](https://pages.cloudflare.com)

*Draw a digit. Watch 109,386 parameters fire in real time. Understand exactly why the prediction happened.*

</div>

---

## What is GradVex?

GradVex is a **self-explanatory AI lab** — a browser-native neural network visualizer that makes the math of deep learning visible, interactive, and intuitive. No backend. No accounts. No installation. Everything runs in your browser using pure JavaScript.

You draw a handwritten digit. A trained MNIST classifier runs instantly in your browser. Every layer, every weight, every activation, every probability — shown live as the model runs.

---

## Features

### Live Neural Playground
Draw any digit (0–9) on the canvas. Inference runs in ~1–2ms with zero server round-trips. Watch every layer respond simultaneously:
- **Input layer** — Your 28×28 drawing becomes 784 normalized pixel values
- **Hidden Layer 1** — 128 ReLU neurons detect strokes and edges
- **Hidden Layer 2** — 64 ReLU neurons detect shapes and digit parts
- **Output layer** — 10 Softmax neurons vote on the digit class

### Real-Time Math Panel
Three tabbed views appear after inference:
- **Forward Pass** — Matrix multiply trace: every `z = Wx + b` and activation computation shown with actual numbers from your drawing
- **Weight Inspector** — Distribution histograms of W1, W2, W3 with per-layer statistics (mean, std, min, max)
- **Backpropagation** — Gradient explanation: how error flows back and which weights would move to reduce loss

### 3D Neural Network Lab
Full immersive Three.js visualization:
- **Pixel voxels** — Your 28×28 drawing appears as a 3D relief map. Bright pixels extrude into 3D space, dark pixels stay flat. Draw stroke by stroke, voxels update live
- **Real-time connections** — Connection lines update at 60fps via RAF-throttled `runInferenceSync`. Lines originate from exactly the pixels you drew, routed to the H1 neurons those pixels most strongly activate
- **Color-coded weights** — Green edges = positive/excitatory, Red edges = negative/inhibitory. Brightness encodes magnitude
- **Activation nodes** — Hidden neurons glow cyan, the winning output neuron glows lime proportional to confidence
- **Layer stats bar** — Shows `fired/total · avg%` for Input, H1, H2, Output while you draw

### Break It Mode
Controlled failure lab. Damage network components and watch predictions degrade:
- **Disable biases** — Removes all `b` terms. Decision boundaries lose learned thresholds. Off-center digits fail first
- **Weight noise** — Inject random perturbation (0–100%) simulating model drift or corrupted weights
- **Zero layer weights** — Kill W1 (pixel→feature path), W2 (feature→shape path), or W3 (shape→digit path) entirely. The model fails in different ways depending on which path you cut

### Architecture Explorer
Compare three MLP designs side by side with live SVG diagrams:
- **Shallow MLP** `784 → 10` — Linear mapping, ~92% accuracy, no hidden features
- **Standard MLP** `784 → 128 → 64 → 10` — GradVex model, **97.67% accuracy**, 109,386 parameters
- **Deep MLP** `784 → 256 → 128 → 64 → 32 → 10` — More capacity, diminishing returns on MNIST

Each shows: parameter count, accuracy, training speed, real-world analogues, pros/cons accordion, and a mathematically correct layer diagram.

### Learn — 7-Module Guided Curriculum
Sequential learning path connected to live playground experiments:

| # | Module | Core concept |
|---|--------|--------------|
| 1 | Mental Model | What a neural network actually does |
| 2 | Weights | How learned parameters encode importance |
| 3 | Bias | Why neurons need adjustable thresholds |
| 4 | Activation Functions | Why non-linearity is non-negotiable |
| 5 | Softmax & Confidence | How raw scores become probabilities |
| 6 | Training & Loss | Backpropagation and gradient descent |
| 7 | Dataset & Training | MNIST, Adam, 10 epochs, 97.67% test accuracy |

---

## The Model

| Property | Value |
|----------|-------|
| Architecture | `784 → 128 (ReLU) → 64 (ReLU) → 10 (Softmax)` |
| Total parameters | **109,386** |
| Training dataset | MNIST — 60,000 images |
| Test dataset | 10,000 held-out images |
| Test accuracy | **97.67%** |
| Optimizer | Adam |
| Training epochs | 10 |
| Inference runtime | **~1–2ms** (pure JS, no ML libraries) |
| Model size | ~2.3 MB JSON |

### Forward Pass

When you draw, this executes in your browser:

```
x ∈ ℝ⁷⁸⁴      ← 28×28 pixel values, normalized to [0, 1]

z₁ = W₁x + b₁  ← 784×128 weight matrix multiply + bias
a₁ = ReLU(z₁)  ← 128-dim activation, negatives zeroed

z₂ = W₂a₁ + b₂ ← 128×64 weight matrix multiply + bias
a₂ = ReLU(z₂)  ← 64-dim activation

z₃ = W₃a₂ + b₃ ← 64×10 weight matrix multiply + bias
ŷ  = Softmax(z₃) ← 10 class probabilities, always sum to 1
```

Zero ML library dependencies at inference time. No TensorFlow.js, no ONNX Runtime, no WebGL compute shaders. Just typed arrays and arithmetic.

### Weight Matrix Layout

```
W1: [784][128]   — 100,352 weights  (input → hidden 1)
b1: [128]        — 128 biases
W2: [128][64]    — 8,192 weights    (hidden 1 → hidden 2)
b2: [64]         — 64 biases
W3: [64][10]     — 640 weights      (hidden 2 → output)
b3: [10]         — 10 biases
Total: 109,386 parameters
```

---

## Project Structure

```
gradvex/
├── public/
│   └── model/
│       ├── weights.json      # Trained weights (2.3 MB)
│       └── meta.json         # Architecture metadata
├── src/
│   ├── app/
│   │   ├── page.tsx          # Home — cursor-reactive hero + feature overview
│   │   ├── playground/       # Main lab — draw + 2D network + math tabs
│   │   ├── viz3d/            # 3D lab — Three.js immersive orbit view
│   │   ├── learn/            # 7-module guided curriculum
│   │   ├── architecture/     # MLP type explorer with live SVG diagrams
│   │   └── about/            # Project info
│   ├── components/
│   │   ├── canvas/           # DrawingCanvas — pointer events, 28×28 sampling
│   │   ├── network/          # NetworkVisualizer — 2D SVG, hover tooltips
│   │   ├── viz3d/            # NetworkMesh3D + Network3DScene (Three.js/R3F)
│   │   ├── math/             # ForwardPassTab, WeightsTab, BackpropTab
│   │   ├── prediction/       # PredictionPanel, ConfidenceBar
│   │   ├── breakit/          # BreakItPanel + BreakItBar
│   │   ├── hero/             # NeuralHeroCanvas — spring-physics cursor animation
│   │   └── layout/           # Navbar (auto-hide on scroll, framer-motion)
│   ├── hooks/
│   │   ├── useInference.ts          # 80ms debounce + multi-digit detection
│   │   ├── useRealtimeInference.ts  # RAF-throttled sync inference for 3D lab
│   │   └── useModelLoader.ts        # Fetch weights.json, cache in Zustand
│   ├── lib/
│   │   ├── model/
│   │   │   ├── inference.ts         # runInferenceSync — matmul, ReLU, Softmax
│   │   │   ├── preprocessing.ts     # canvasToInputTensor — bilinear 28×28
│   │   │   └── types.ts
│   │   └── utils/
│   │       ├── canvas.ts            # Stroke drawing utilities
│   │       └── multiDigit.ts        # Region detection for multi-digit inputs
│   └── store/
│       ├── networkStore.ts    # weights, result, activations (Zustand)
│       ├── uiStore.ts         # theme, archMode, animating
│       └── breakItStore.ts    # breakit experiment state
```

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 16 — App Router, static export |
| Language | TypeScript 5 |
| 3D Rendering | Three.js + React Three Fiber |
| Animations | Framer Motion |
| State Management | Zustand |
| Styling | Tailwind CSS v4 + CSS custom properties |
| Icons | Lucide React |
| Deployment | Cloudflare Pages — global CDN, zero cold starts |
| ML Inference | Pure JavaScript — no library dependencies |

---

## Design System

GradVex uses a semantic CSS token system with full dark/light theme support (toggle in navbar):

```css
--gv-bg, --gv-bg-2         /* page backgrounds       */
--gv-text, --gv-muted       /* text hierarchy         */
--gv-panel, --gv-panel-strong /* card surfaces        */
--gv-line                   /* all borders            */
--gv-cyan, --gv-cyan-soft   /* primary accent         */
--gv-lime, --gv-lime-soft   /* success / prediction   */
--gv-violet, --gv-violet-soft /* secondary accent     */
--gv-coral, --gv-coral-soft /* error / break it mode  */
```

Navbar hides on scroll down (delta > 6px) and reappears on scroll up via `requestAnimationFrame`-throttled scroll detection + Framer Motion spring.

---

## Local Development

```bash
# 1. Clone
git clone https://github.com/kumarwaibhav/gradvex.git
cd gradvex

# 2. Install dependencies
npm install

# 3. Run dev server
npm run dev
# → http://localhost:3000

# 4. Type check
npx tsc --noEmit

# 5. Build (static export → /out)
npm run build
```

**Requirements:** Node.js 20+

---

## License

MIT — free to use, study, fork, and build on.

---

<div align="center">

Built by [Waibhav Kumar](https://github.com/kumarwaibhav) · Part of an AI visualization trilogy

*"The best way to understand a neural network is to watch one think."*

</div>
