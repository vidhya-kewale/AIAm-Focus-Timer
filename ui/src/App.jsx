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

// 🔁 Default pattern: focus → short break → focus → short break → focus → long break
const DEFAULT_PATTERN = [
  "focus",
  "shortBreak",
  "focus",
  "shortBreak",
  "focus",
  "longBreak",
];

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function App() {
  const [pattern, setPattern] = useState(DEFAULT_PATTERN);
  const [patternInput, setPatternInput] = useState(DEFAULT_PATTERN.join(", "));
  const [stepIndex, setStepIndex] = useState(0); // index into pattern

  const [mode, setMode] = useState(pattern[0] || "focus");
  const [durations, setDurations] = useState(DEFAULT_DURATIONS);
  const [secondsLeft, setSecondsLeft] = useState(
    DEFAULT_DURATIONS[pattern[0]] * 60
  );
  const [isRunning, setIsRunning] = useState(false);

  // ✅ Counts
  const [focusSessionsCompleted, setFocusSessionsCompleted] = useState(0); // individual focus blocks
  const [cyclesCompleted, setCyclesCompleted] = useState(0); // full pattern completions

  const intervalRef = useRef(null);
  const previousModeRef = useRef(mode);

  // 🔊 End-of-session beep (kept short and simple)
  const playEndBeep = () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  };

  // 🌿 Calm sound for entering a break
  const playBreakSound = () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(520, ctx.currentTime); // soft mid tone
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  };

  // 🌱 Calm sound for entering a focus session
  const playFocusSound = () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(420, ctx.currentTime); // slightly lower, grounding
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.16, ctx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  };

  // 🎯 Timer effect with automatic pattern progression
  useEffect(() => {
    if (!isRunning) {
      clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Session finishes here
          const wasFocus = mode === "focus";

          // Count individual focus sessions
          if (wasFocus) {
            setFocusSessionsCompleted((c) => c + 1);
          }

          playEndBeep();

          // Move to next step in the pattern
          const patternLength = pattern.length || 1;
          const nextIndex = (stepIndex + 1) % patternLength;
          const completedFullCycle = nextIndex === 0; // wrapped around

          if (completedFullCycle) {
            setCyclesCompleted((c) => c + 1);
          }

          const nextMode = pattern[nextIndex] || "focus";

          // Update step index and mode
          setStepIndex(nextIndex);
          setMode(nextMode);

          // Start next session automatically
          return durations[nextMode] * 60;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isRunning, mode, stepIndex, pattern, durations]);

  // 🧭 Reset timer whenever mode or durations change (e.g., user edits durations)
  useEffect(() => {
    const safeMode = MODE_LABELS[mode] ? mode : "focus";
    setSecondsLeft(durations[safeMode] * 60);
  }, [mode, durations]);

  // 🔁 Calm sound cues when entering new session types
  useEffect(() => {
    const previousMode = previousModeRef.current;

    if (previousMode !== mode) {
      if (mode === "focus") {
        playFocusSound();
      } else {
        playBreakSound();
      }
    }

    previousModeRef.current = mode;
  }, [mode]);

  const handleModeChange = (newMode) => {
    // Manual override of current step & mode
    const idx = pattern.indexOf(newMode);
    if (idx !== -1) {
      setStepIndex(idx);
    }
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

  // 🧩 Pattern input: "focus, shortBreak, focus, longBreak" etc.
  const handlePatternInputChange = (e) => {
    setPatternInput(e.target.value);
  };

  const normalizeToken = (token) => {
    const t = token.toLowerCase();
    if (t === "focus") return "focus";
    if (t === "short" || t === "shortbreak" || t === "short_break")
      return "shortBreak";
    if (t === "long" || t === "longbreak" || t === "long_break")
      return "longBreak";
    return null;
  };

  const handlePatternInputBlur = () => {
    const rawTokens = patternInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const mapped = rawTokens
      .map(normalizeToken)
      .filter((m) => m !== null);

    if (mapped.length === 0) {
      // Invalid input, revert to current pattern text
      setPatternInput(pattern.join(", "));
      return;
    }

    setPattern(mapped);
    setStepIndex(0);
    setMode(mapped[0]);
    setSecondsLeft(durations[mapped[0]] * 60);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Focus Timer</h1>
        <p className="tagline">Structured focus cycles with smart breaks.</p>
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

          {/* Stats */}
          <p className="hint">
            Focus blocks completed: <strong>{focusSessionsCompleted}</strong>
          </p>
          <p className="hint">
            Full cycles completed: <strong>{cyclesCompleted}</strong>
          </p>
        </div>

        {/* Pattern editor */}
        <section className="durations">
          <h2>Pattern & session lengths</h2>

          <div style={{ marginBottom: "0.9rem" }}>
            <label className="duration-item">
              <span>Session pattern</span>
              <input
                type="text"
                value={patternInput}
                onChange={handlePatternInputChange}
                onBlur={handlePatternInputBlur}
                placeholder="focus, short, focus, short, focus, long"
              />
            </label>
            <p className="hint">
              Default: <code>focus block, short break, focus block, short break, focus block, long break</code>.
              Allowed values: <code>focus</code>, <code>shortBreak</code>,{" "}
              <code>longBreak</code>. You can also type <code>short</code> /
              <code>long</code>.
            </p>
          </div>

          <div className="duration-grid">
            {Object.keys(MODE_LABELS).map((key) => (
              <label key={key} className="duration-item">
                <span>{MODE_LABELS[key]} (minutes)</span>
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={durations[key]}
                  onChange={(e) => handleDurationChange(key, e.target.value)}
                />
              </label>
            ))}
          </div>
        </section>

        {/* Tips for future you */}
        {/*<section className="tips">*/}
        {/*  <h2>React tips (for future you 👩‍💻👨‍💻)</h2>*/}
        {/*  <ul>*/}
        {/*    <li>*/}
        {/*      <strong>Patterns as data.</strong> The sequence is just an array of*/}
        {/*      mode keys (<code>["focus","shortBreak",...]</code>). That makes it*/}
        {/*      easy to let users customize it.*/}
        {/*    </li>*/}
        {/*    <li>*/}
        {/*      <strong>Automatic flows via state.</strong> Advancing the pattern*/}
        {/*      when the timer hits zero is just updating <code>stepIndex</code>{" "}*/}
        {/*      and <code>mode</code> inside a single effect.*/}
        {/*    </li>*/}
        {/*    <li>*/}
        {/*      <strong>Validation at the edges.</strong> The pattern input parses*/}
        {/*      free text, normalizes it, and falls back gracefully if the input*/}
        {/*      is invalid.*/}
        {/*    </li>*/}
        {/*    <li>*/}
        {/*      <strong>Different levels of counting.</strong> You now track both*/}
        {/*      individual focus blocks and full cycles, which you can later*/}
        {/*      visualize as stats or charts.*/}
        {/*    </li>*/}
        {/*  </ul>*/}
        {/*</section>*/}
      </main>

      <footer className="footer">
        <small>Built with React & Python • Focus Timer</small>
      </footer>
    </div>
  );
}

export default App;
