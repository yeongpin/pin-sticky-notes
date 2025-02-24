# 📝 Pin Sticky Notes

<div align="center">

<p align="center">
  <img src="./src/assets/pin-note.png" alt="Pin Note Logo" width="200"/>
</p>

<p align="center">
  <a href="https://github.com/yeongpin/pin-sticky-notes/releases/latest">
    <img src="https://img.shields.io/github/v/release/yeongpin/pin-sticky-notes?style=flat-square&logo=github&color=blue" alt="Release"/>
  </a>
  <a href="https://creativecommons.org/licenses/by-nc-nd/4.0/">
    <img src="https://img.shields.io/badge/License-CC_BY--NC--ND_4.0-lightgrey.svg" alt="License"/>
  </a>
  <a href="https://github.com/yeongpin/pin-sticky-notes/stargazers">
    <img src="https://img.shields.io/github/stars/yeongpin/pin-sticky-notes?style=flat-square&logo=github" alt="Stars"/>
  </a>
  <br/>
  <a href="https://github.com/yeongpin/pin-sticky-notes/releases">
    <img src="https://img.shields.io/github/downloads/yeongpin/pin-sticky-notes/total?style=flat-square&logo=github" alt="Downloads"/>
  </a>
</p>

<p align="center">
  <b>A modern and elegant sticky notes application built with Electron and Vue.js</b>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-development">Development</a>
</p>


<img src="./images/preview.png" alt="Pin Sticky Notes Preview" width="800"/>

</div>

## ✨ Features

- 📝 Create and manage multiple sticky notes
- 🎨 Customizable note colors
- 🌍 Multi-language support (English/Traditional Chinese)
- 🔍 Text zoom functionality
- 🔄 Text translation support
- 📌 Pin notes to top
- 🔔 System tray support
- 💾 Auto-save functionality
- 🌓 Light/Dark theme support
- ⚡ Fast and lightweight

## 🚀 Installation

### System Requirements

| Requirement | Version |
|------------|---------|
| Node.js | ≥ 16.0.0 |
| npm | ≥ 8.0.0 |

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yeongpin/pin-sticky-notes.git

# Navigate to project directory
cd pin-sticky-notes

# Install dependencies
npm install

# Start development server
npm run electron:dev
```

## 🛠 Tech Stack

| Category | Technologies |
|----------|-------------|
| Framework | ![Electron](https://img.shields.io/badge/Electron-47848F?style=flat-square&logo=electron&logoColor=white) ![Vue.js](https://img.shields.io/badge/Vue.js-4FC08D?style=flat-square&logo=vuedotjs&logoColor=white) |
| UI | ![Element Plus](https://img.shields.io/badge/Element_Plus-409EFF?style=flat-square&logo=element&logoColor=white) |
| State Management | ![Vue.js](https://img.shields.io/badge/Vue_Store-4FC08D?style=flat-square&logo=vue.js&logoColor=white) |
| Build Tools | ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white) |

## 📁 Project Structure

```plaintext
pin-sticky-notes/
├── src/
│   ├── main/          # Main process files
│   ├── preload/       # Preload scripts
│   └── renderer/      # Frontend Vue.js files
│       ├── components/  # Vue components
│       ├── store/       # State management
│       ├── locales/     # i18n translations
│       └── assets/      # Static assets
└── build/            # Build configuration
```

## 🔨 Development

```bash
# Start development
npm run electron:dev

# Build application
npm run build

# Run tests
npm run test
```

## 📄 License

This project is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License - see the [LICENSE](LICENSE.md) file for details.

## 🙏 Acknowledgments

- [Electron](https://www.electronjs.org/)
- [Vue.js](https://vuejs.org/)
- [Element Plus](https://element-plus.org/)

---

<p align="center">Made with ❤️ by <a href="https://github.com/yeongpin">yeongpin</a></p>




