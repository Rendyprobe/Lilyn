import { useEffect, useState } from "react";

const LED_FONT = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  " ": ["000", "000", "000", "000", "000", "000", "000"],
};

const LED_MESSAGES = ["HAPPY BIRTHDAY", "LINDA", "PUTRI", "RAHAYU"];
const LED_GLYPH_SPACING = 2;
const MAX_LED_COLUMNS = Math.max(...LED_MESSAGES.map(getMessageColumns));
const FIREWORKS = [
  { id: "fw-a", left: "12%", top: "18%", size: "11rem", hue: 128, delay: "0s", duration: "4.8s" },
  { id: "fw-b", left: "26%", top: "10%", size: "9rem", hue: 188, delay: "1.3s", duration: "4.2s" },
  { id: "fw-c", left: "78%", top: "16%", size: "12rem", hue: 42, delay: "0.8s", duration: "5.2s" },
  { id: "fw-d", left: "86%", top: "34%", size: "10rem", hue: 328, delay: "2s", duration: "4.6s" },
  { id: "fw-e", left: "18%", top: "58%", size: "8.5rem", hue: 104, delay: "2.6s", duration: "4.4s" },
  { id: "fw-f", left: "74%", top: "60%", size: "10.5rem", hue: 210, delay: "3.1s", duration: "5s" },
];

function App() {
  const { currentMessage, visibleCount, phase } = useLedTypewriter(LED_MESSAGES);
  const ledDots = buildLedDots(currentMessage, visibleCount, phase);
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  const [isCandleBlown, setIsCandleBlown] = useState(false);
  const [closeNotice, setCloseNotice] = useState("");

  const handleEnvelopeOpen = () => {
    setIsEnvelopeOpen(true);
    setIsCandleBlown(false);
    setCloseNotice("");
  };

  const handleEnvelopeClose = () => {
    if (!isCandleBlown) {
      setCloseNotice("Silakan tiup lilinnya dulu");
      return;
    }

    setIsEnvelopeOpen(false);
    setCloseNotice("");
  };

  const handleBlowCandle = () => {
    setIsCandleBlown(true);
    setCloseNotice("");
  };

  useEffect(() => {
    if (!closeNotice) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setCloseNotice(""), 2400);
    return () => window.clearTimeout(timeoutId);
  }, [closeNotice]);

  useEffect(() => {
    if (!isEnvelopeOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleEnvelopeClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCandleBlown, isEnvelopeOpen]);

  return (
    <main
      className={`scene${isEnvelopeOpen ? " scene-envelope-open" : ""}`}
      aria-label={`Kipas 3D dengan tulisan ${currentMessage}`}
    >
      <div className="scene-shell">
        <FireworksBackdrop />
        <div className="scene-vignette" aria-hidden="true" />
        <div className="scene-aura scene-aura-left" aria-hidden="true" />
        <div className="scene-aura scene-aura-right" aria-hidden="true" />
        <div className="scene-floor" aria-hidden="true" />
        <FanDisplay ledDots={ledDots} currentMessage={currentMessage} />
      </div>

      <EnvelopeFeature
        isOpen={isEnvelopeOpen}
        isCandleBlown={isCandleBlown}
        closeNotice={closeNotice}
        onOpen={handleEnvelopeOpen}
        onClose={handleEnvelopeClose}
        onBlowCandle={handleBlowCandle}
      />
    </main>
  );
}

function FireworksBackdrop() {
  return (
    <div className="fireworks-layer" aria-hidden="true">
      {FIREWORKS.map((firework) => (
        <div
          key={firework.id}
          className="firework"
          style={{
            "--left": firework.left,
            "--top": firework.top,
            "--size": firework.size,
            "--hue": firework.hue,
            "--delay": firework.delay,
            "--duration": firework.duration,
          }}
        >
          <div className="firework-trail" />
          <div className="firework-ring" />
          <div className="firework-core" />
          <div className="firework-burst">
            {Array.from({ length: 12 }).map((_, index) => (
              <span
                key={`${firework.id}-spark-${index}`}
                className="firework-spark"
                style={{
                  "--rotation": `${index * 30}deg`,
                  "--spark-delay": `${(index % 4) * 0.03}s`,
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function FanDisplay({ ledDots, currentMessage }) {
  return (
    <section
      className="fan-display"
      aria-label={`Kipas portabel dengan baling-baling berputar dan tulisan ${currentMessage}`}
    >
      <div className="depth-ring depth-ring-back" aria-hidden="true" />
      <div className="depth-ring depth-ring-front" aria-hidden="true" />

      <div className="fan-device">
        <div className="fan-head">
          <div className="head-shell head-shell-back" aria-hidden="true" />
          <div className="fan-grill fan-grill-back" aria-hidden="true" />
          <div className="fan-rim" aria-hidden="true" />
          <div className="led-haze" aria-hidden="true" />

          <div className="rotor" aria-hidden="true">
            <div className="rotor-spin rotor-spin-primary">
              <span className="blade blade-a" />
              <span className="blade blade-b" />
              <span className="blade blade-c" />
            </div>

            <div className="rotor-spin rotor-spin-secondary">
              <span className="blade blade-a" />
              <span className="blade blade-b" />
              <span className="blade blade-c" />
            </div>
          </div>

          <div className="led-display-ring" aria-hidden="true">
            <svg viewBox="0 0 240 240" className="led-svg">
              <defs>
                <filter id="led-dot-glow">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="2.6" result="blurred" />
                  <feColorMatrix
                    in="blurred"
                    type="matrix"
                    values="0.6 0 0 0 0
                            0 1.4 0 0 0
                            0 0.25 0.08 0 0
                            0 0 0 22 -7"
                    result="glow"
                  />
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <g className="led-dot-glow-layer" filter="url(#led-dot-glow)">
                {ledDots.map((dot) => (
                  <circle
                    className={`led-dot led-dot-glow${dot.fresh ? " led-dot-fresh" : ""}`}
                    cx={dot.x}
                    cy={dot.y}
                    r="1.95"
                    key={`g-${dot.id}`}
                  />
                ))}
              </g>

              <g className="led-dot-core-layer">
                {ledDots.map((dot) => (
                  <circle
                    className={`led-dot led-dot-core${dot.fresh ? " led-dot-fresh-core" : ""}`}
                    cx={dot.x}
                    cy={dot.y}
                    r="1.12"
                    key={`c-${dot.id}`}
                  />
                ))}
              </g>
            </svg>
          </div>

          <div className="fan-grill fan-grill-front" aria-hidden="true" />
        </div>

        <div className="yoke yoke-left" aria-hidden="true" />
        <div className="yoke yoke-right" aria-hidden="true" />
        <div className="head-joint" aria-hidden="true" />
        <div className="neck" aria-hidden="true" />
        <div className="handle" aria-hidden="true">
          <span className="handle-shine" />
          <span className="grip-slot" />
          <span className="handle-basecap" />
        </div>
        <div className="power-button" aria-hidden="true" />
        <div className="lanyard" aria-hidden="true" />
        <div className="shadow" aria-hidden="true" />
      </div>
    </section>
  );
}

function EnvelopeFeature({ isOpen, isCandleBlown, closeNotice, onOpen, onClose, onBlowCandle }) {
  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();

      if (!isOpen) {
        onOpen();
      }
    }
  };

  return (
    <>
      <button
        type="button"
        className={`envelope-backdrop${isOpen ? " is-visible" : ""}`}
        aria-label="Tutup surat"
        aria-hidden={!isOpen}
        tabIndex={isOpen ? 0 : -1}
        onClick={onClose}
      />

      <div className={`envelope-stage${isOpen ? " is-open" : ""}`}>
        <div
          className="envelope-card"
          role={isOpen ? "dialog" : "button"}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Surat ucapan terbuka" : "Buka amplop ucapan"}
          aria-modal={isOpen ? "true" : undefined}
          tabIndex={0}
          onClick={isOpen ? undefined : onOpen}
          onKeyDown={handleKeyDown}
        >
          <div className="envelope-outer-shadow" aria-hidden="true" />
          <div className="envelope-back-panel" aria-hidden="true" />

          <article className="letter-sheet" aria-label="Isi surat ucapan">
            <div className="letter-paper">
              <p className="letter-kicker">Special Note</p>
              <h2>Untukmu yang sedang berbahagia,</h2>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus luctus, velit non
                viverra feugiat, sem justo ultricies metus, at varius augue ipsum nec risus.
              </p>
              <p>
                Phasellus sit amet eros vitae lorem sollicitudin rhoncus. Curabitur vehicula nibh
                ac arcu aliquet, non placerat justo feugiat. Integer fermentum, augue id aliquet
                interdum, magna sapien mattis nunc, sit amet ultrices mauris mi vitae urna.
              </p>
              <p className="letter-signoff">Dengan hangat,<br />Someone who cares</p>
            </div>
          </article>

          <div className="envelope-flap" aria-hidden="true" />
          <div className="envelope-front" aria-hidden="true" />
          <div className="envelope-seal" aria-hidden="true">
            <span />
          </div>
          {!isOpen ? <p className="envelope-hint">Tap to open</p> : null}
        </div>

        <BirthdayCake isVisible={isOpen} isCandleBlown={isCandleBlown} onBlowCandle={onBlowCandle} />

        {isOpen ? (
          <button type="button" className="letter-close" onClick={onClose}>
            Tutup
          </button>
        ) : null}
      </div>

      <div
        className={`envelope-toast${closeNotice ? " is-visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        {closeNotice}
      </div>
    </>
  );
}

function BirthdayCake({ isVisible, isCandleBlown, onBlowCandle }) {
  return (
    <div className={`cake-stage${isVisible ? " is-visible" : ""}`} aria-hidden={!isVisible}>
      <p className={`cake-instruction${isCandleBlown ? " is-complete" : ""}`}>
        {isCandleBlown
          ? "Lilin sudah padam. Sekarang boleh tutup amplop."
          : "Tap api untuk tiup lilin"}
      </p>

      <div className="birthday-cake" aria-label="Kue ulang tahun dengan lilin menyala">
        <div className="cake-glow" aria-hidden="true" />
        <div className="cake-plate" aria-hidden="true" />

        <div className="cake-body" aria-hidden="true">
          <div className="cake-top-icing" />
          <div className="cake-side-icing cake-side-icing-left" />
          <div className="cake-side-icing cake-side-icing-center" />
          <div className="cake-side-icing cake-side-icing-right" />
          <div className="cake-ribbon" />

          <div className="cake-candle">
            <span className="cake-candle-stick" />
            <span className="cake-candle-wick" />
            <button
              type="button"
              className={`candle-flame${isCandleBlown ? " is-out" : ""}`}
              aria-label={isCandleBlown ? "Lilin sudah padam" : "Tap api untuk tiup lilin"}
              onClick={onBlowCandle}
              disabled={isCandleBlown || !isVisible}
              tabIndex={isVisible && !isCandleBlown ? 0 : -1}
            >
              <span className="candle-flame-core" aria-hidden="true" />
              <span className="candle-smoke" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function useLedTypewriter(messages) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(0);
  const [phase, setPhase] = useState("typing");
  const currentMessage = messages[messageIndex];

  useEffect(() => {
    const isComplete = visibleCount >= currentMessage.length;
    const isEmpty = visibleCount === 0;
    let timeoutId;

    if (phase === "typing") {
      if (isComplete) {
        timeoutId = window.setTimeout(() => setPhase("holding"), 1100);
      } else {
        const nextCharacter = currentMessage[visibleCount];
        const stepDelay = nextCharacter === " " ? 120 : 92;
        timeoutId = window.setTimeout(() => setVisibleCount((count) => count + 1), stepDelay);
      }
    } else if (phase === "holding") {
      timeoutId = window.setTimeout(() => setPhase("erasing"), 900);
    } else if (isEmpty) {
      timeoutId = window.setTimeout(() => {
        setMessageIndex((index) => (index + 1) % messages.length);
        setPhase("typing");
      }, 240);
    } else {
      timeoutId = window.setTimeout(() => setVisibleCount((count) => count - 1), 42);
    }

    return () => window.clearTimeout(timeoutId);
  }, [currentMessage, messageIndex, messages.length, phase, visibleCount]);

  return { currentMessage, visibleCount, phase };
}

function buildLedDots(text, visibleCount, phase) {
  const chars = [...text.toUpperCase()];
  const rowSpacing = 3.35;
  const startAngle = 191;
  const endAngle = -11;
  const centerX = 120;
  const centerY = 122;
  const baseRadius = 95;
  const messageColumns = getMessageColumns(text);
  const leadingColumns = (MAX_LED_COLUMNS - messageColumns) / 2;

  const dots = [];
  let cursor = 0;

  chars.forEach((char, charIndex) => {
    const glyph = LED_FONT[char] ?? LED_FONT[" "];
    const isVisible = charIndex < visibleCount;
    const isFresh = phase === "typing" && charIndex === visibleCount - 1;

    glyph.forEach((row, rowIndex) => {
      [...row].forEach((cell, columnIndex) => {
        if (cell !== "1" || !isVisible) {
          return;
        }

        const progress = (leadingColumns + cursor + columnIndex + 0.5) / MAX_LED_COLUMNS;
        const angle = toRadians(startAngle + progress * (endAngle - startAngle));
        const radialOffset = ((glyph.length - 1) / 2 - rowIndex) * rowSpacing;
        const radius = baseRadius + radialOffset;

        dots.push({
          id: `${charIndex}-${rowIndex}-${columnIndex}`,
          fresh: isFresh,
          x: centerX + Math.cos(angle) * radius,
          y: centerY - Math.sin(angle) * radius,
        });
      });
    });

    cursor += glyph[0].length + LED_GLYPH_SPACING;
  });

  return dots;
}

function getMessageColumns(text) {
  const chars = [...text.toUpperCase()];

  return chars.reduce((sum, char, index) => {
    const glyph = LED_FONT[char] ?? LED_FONT[" "];
    const spacing = index === chars.length - 1 ? 0 : LED_GLYPH_SPACING;
    return sum + glyph[0].length + spacing;
  }, 0);
}

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

export default App;
