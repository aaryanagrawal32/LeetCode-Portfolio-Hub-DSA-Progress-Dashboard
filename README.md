# 💻 LeetCode Portfolio Hub & DSA Progress Dashboard

An interactive, premium-designed React & Vite dashboard for visualizing LeetCode progression, tracking topic tag statistics, analyzing algorithmic complexities, and walking through code solutions. It features a complete DSA study manual, dynamic search indexing, dry run execution simulators, and smooth responsive theme switching.

---

## 🌟 Key Features

- **📊 Solved Problems Feed**: Expandable solved problems table with difficulty indicators, links to problem statements, complexity charts, and inline IDE sub-tabs.
- **🧭 Inline IDE Sub-tabs**:
  - **Problem Description**: Dynamically fetched and rendered rich text problem statements.
  - **Walkthrough & Complexity**: Solid white visual cards showing Time and Space Complexity gauges, and detailed conceptual explanations.
  - **C++ Code View**: Fully formatted, syntax-highlighted code viewer.
- **⚡ Live Dry Run Simulators**: Trace line-by-line code executions for specific algorithms in an animated interactive console box. Features full console-hide controls and safety updates.
- **🧠 Complete Core Concepts & C++ Templates**: Features a dedicated DSA topic list, complete with dynamic C++ templates and implementations for over 30 categories (Math, DFS, Graphs, Sliders, Monotonic Stack, Backtracking, etc.).
- **🌡️ Skills Heatmap**: Visual grid tracking problem tag density and topic progress.
- **🎨 Glassmorphic Theme Switcher**: Fluid toggle between a vibrant, cosmic Dark Mode and a warm pastel lavender Light Mode.
- **⚙️ Optimized Search**: Type-ahead filtering on solved problems and concepts.

---

## 🛠️ Technology Stack

- **Framework**: React 19 (Functional components, hooks, local storage sync)
- **Bundler & Dev Server**: Vite 8
- **Styling**: Tailwind CSS v4 & custom glassmorphism styles
- **Icons**: Lucide React
- **Syntax Highlighting**: Custom custom-themed syntax highlights

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (version 18+ is recommended).

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/aaryanagrawal32/Leetcode-summary.git
   cd Leetcode-summary
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173/`.

4. **Build for Production**:
   ```bash
   npm run build
   ```
   This generates static assets inside the `dist` directory.

---

## 📁 Project Structure

```
Leetcode-summary/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable React components (ComplexityGauge, CodeBlock, etc.)
│   ├── data/               # Static dataset configurations
│   │   ├── edgeCases.js          # Edge case configurations
│   │   ├── fallbackTemplates.js  # Backup C++ template codes
│   │   ├── predefinedProblems.js # DSA solved problem catalogs
│   │   ├── stlCheatSheets.js     # STL cheatsheet structures
│   │   └── stlDirectory.js       # Directory configurations
│   ├── utils/              # Dry run trace and playground helpers
│   ├── App.jsx             # Main Application hub
│   ├── index.css           # Global Tailwind stylesheet and Light Mode overrides
│   └── main.jsx            # React root mount entry point
├── package.json            # Scripts and dependency manifests
└── README.md               # User manual
```

---

## 🌗 Light & Dark Theme Customizations

The application supports responsive design styles for both cosmic Dark Mode and clean Light Mode. Toggle themes using the Sun/Moon button in the header bar.
- Custom Light Mode colors are set via the `.light` theme wrapper class in `index.css`.
- Widgets such as dry run log terminals, complexity card gauges, sidebars, and topic progress tracks automatically adapt colors for maximum readability.

---

## 🛡️ License

Distributed under the MIT License. See `LICENSE` for more information.
