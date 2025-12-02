# AIAm Focus Timer

A simple Pomodoro-style focus timer with a React-based UI and a lightweight Python launcher.  
Run a single terminal command to open the timer in your web browser.

---

## Features

- **Pomodoro workflow**: Focus, Short Break, Long Break  
- **Adjustable durations**  
- **Start / Pause / Reset controls**  
- **End-of-session beep**  
- **Clean Vite + React UI**  
- **Launchable from the terminal with one command**  

---

## Tech Stack

- **Python 3** — serves the built React UI  
- **React 18 + Vite** — fast development & build tooling  
- **Vanilla CSS** — lightweight styling  

---

## Prerequisites

You’ll need:

- **Python 3.8+**
- **Node.js 16+**
- **npm** (comes with Node)

Verify your versions:

```bash
python --version
node --version
npm --version

## Installation

### Clone the repo

```bash
git clone https://github.com/vidhya-kewale/AIAm-Focus-Timer.git
cd AIAm-Focus-Timer
```

### Install React dependencies

```bash
cd ui
npm install
```

### Build the React app

```bash
npm run build
```

This outputs the production build to `ui/build/`.

### Return to project root

```bash
cd ..
```

---

## Running the Timer

From the project root:

```bash
python focus_timer.py
```
