import React, { useEffect, useState, useRef } from "react";

// ⏱ Default durations in minutes
const DEFAULT_DURATIONS = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
};

const MODE_LABELS = {
  focus: "Focus",
  shortBreak: "Short Break",
  longBreak: "Long Break",
};

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function App() {
  // 🧠 React tip: keep a single source of truth for important state.
  // Here, `mode`, `secondsLeft`, and `isRunning` control most of the UI.
  const [mode, setMode] = useState("focus");
  const [durations, setDurations] = useState(DEFAULT_DURATIONS);
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_DURATIONS.focus * 60);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  // React tip: when something should happen "over time" (like a timer),
  // use useEffect + setInterval, and always clean up the interval.
  useEffect(() => {
    if (!isRunning) {
      clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          playBeep();
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup: runs when component unmounts or effect dependencies change
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  // When mode changes, reset timer to that mode's duration
  useEffect(() => {
    setSecondsLeft(durations[mode] * 60);
    setIsRunning(false);
  }, [mode, durations]);

  const handleModeChange = (newMode) => {
    setMode(newMode);
  };

  const handleStartPause = () => {
    setIsRunning((prev) => !prev);
  };

  const handleReset = () => {
    setSecondsLeft(durations[mode] * 60);
    setIsRunning(false);
  };

  const handleDurationChange = (modeKey, minutes) => {
    const value = Number(minutes) || 0;
    setDurations((prev) => ({
      ...prev,
      [modeKey]: value,
    }));
  };

  const playBeep = () => {
    // Small inline beep for when a session ends
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = context.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, context.currentTime);
    oscillator.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.4);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>AIAm Focus Timer</h1>
        <p className="tagline">Stay in flow with structured focus & breaks.</p>
      </header>

      <main className="main">
        {/* Mode selection */}
        <div className="mode-switcher">
          {Object.keys(MODE_LABELS).map((key) => (
            <button
              key={key}
              className={`mode-button ${mode === key ? "active" : ""}`}
              onClick={() => handleModeChange(key)}
            >
              {MODE_LABELS[key]}
            </button>
          ))}
        </div>

        {/* Timer display */}
        <div className="timer-card">
          <div className="timer-display">
            <span className="time">{formatTime(secondsLeft)}</span>
          </div>
          <div className="controls">
            <button className="primary" onClick={handleStartPause}>
              {isRunning ? "Pause" : "Start"}
            </button>
            <button className="secondary" onClick={handleReset}>
              Reset
            </button>
          </div>
          <p className="hint">
            Pro tip: use this as <strong>{MODE_LABELS[mode]}</strong> time. Put your phone away ✨
          </p>
        </div>

        {/* Duration settings */}
        <section className="durations">
          <h2>Session lengths (minutes)</h2>
          <div className="duration-grid">
            {Object.keys(MODE_LABELS).map((key) => (
              <label key={key} className="duration-item">
                <span>{MODE_LABELS[key]}</span>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={durations[key]}
                  onChange={(e) => handleDurationChange(key, e.target.value)}
                />
              </label>
            ))}
          </div>
        </section>

        {/* Tips for you as a new React dev */}
        <section className="tips">
          <h2>React tips (for future you 👩‍💻👨‍💻)</h2>
          <ul>
            <li>
              <strong>State lives where it’s needed.</strong> The timer state is in <code>App</code>{" "}
              because multiple parts of the UI depend on it (display, buttons, tips).
            </li>
            <li>
              <strong>useEffect = reacting to changes.</strong> The timer interval is set up in a{" "}
              <code>useEffect</code> that depends on <code>isRunning</code>. When{" "}
              <code>isRunning</code> changes, React re-runs the effect and resets the interval.
            </li>
            <li>
              <strong>Derived values = functions, not state.</strong> We don’t store a formatted
              time string in state; we derive it from <code>secondsLeft</code> using{" "}
              <code>formatTime()</code>.
            </li>
            <li>
              <strong>Small components are easier to test.</strong> When this file starts feeling
              big, you can extract pieces (e.g., <code>TimerDisplay</code>,{" "}
              <code>ModeSwitcher</code>) into their own components.
            </li>
            <li>
              <strong>Start simple, then refactor.</strong> It’s totally fine to write “one big
              component” first, then break it up as new requirements show up.
            </li>
          </ul>
        </section>
      </main>

      <footer className="footer">
        <small>Built with React & Python • AIAm Focus Timer</small>
      </footer>
    </div>
  );
}

export default App;
