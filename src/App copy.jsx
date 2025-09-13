import React, { useState, useRef, useCallback, useEffect } from "react";
import ReactCanvasConfetti from "react-canvas-confetti";

const EXERCISES = {
  Shapes: ["circle", "square", "triangle", "rectangle", "oval", "star", "heart", "diamond", "pentagon", "hexagon"],
  Fruits: ["apple", "banana", "grape", "orange", "mango", "papaya", "pear", "plum", "peach", "melon"],
  Animals: ["lion", "tiger", "zebra", "horse", "monkey", "panda", "camel", "sheep", "goat", "whale"],
};

const VISUALS = {
  circle: "⚪", square: "⬜", triangle: "🔺", rectangle: "▭", oval: "🟠", star: "⭐", heart: "❤️",
  diamond: "💎", pentagon: "🔷", hexagon: "⬡",
  apple: "🍎", banana: "🍌", grape: "🍇", orange: "🍊", mango: "🥭", papaya: "🟠", pear: "🍐",
  plum: "🟣", peach: "🍑", melon: "🍈",
  lion: "🦁", tiger: "🐯", zebra: "🦓", horse: "🐴", monkey: "🐒", panda: "🐼",
  camel: "🐪", sheep: "🐑", goat: "🐐", whale: "🐋",
};

function App() {
  const [category, setCategory] = useState("Shapes");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState({});
  const [showScore, setShowScore] = useState(false);

  const confettiRef = useRef(null);
  const audioRef = useRef(null);

  const getInstance = useCallback((instance) => {
    confettiRef.current = instance;
  }, []);

  const fireConfetti = () => {
    if (!confettiRef.current) return;
    const duration = 5000;
    const end = Date.now() + duration;

    const frame = () => {
      confettiRef.current({
        particleCount: 5,
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
      });
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const words = EXERCISES[category];

  const handleChange = (value) => {
    setAnswers((prev) => ({ ...prev, [currentIndex]: value }));
  };

  const checkAnswer = () => {
    const word = words[currentIndex];
    const isCorrect = (answers[currentIndex] || "").toLowerCase() === word.toLowerCase();
    setResults((prev) => ({ ...prev, [currentIndex]: isCorrect }));

    if (currentIndex === words.length - 1) {
      setTimeout(() => setShowScore(true), 500);
    }
  };

  const getMaskedWord = (word) => {
    if (word.length <= 2) return word;
    return word[0] + " " + "_ ".repeat(word.length - 2) + word[word.length - 1];
  };

  const score = Object.values(results).filter(Boolean).length;

  // ✅ Trigger confetti + cheer AFTER finishing
  useEffect(() => {
    if (showScore && score >= 6) {
      fireConfetti();
      if (audioRef.current) {
        audioRef.current.play();
      }
    }
  }, [showScore, score]);

  return (
    <div className="app">
      {/* Confetti overlay */}
      <ReactCanvasConfetti
        refConfetti={getInstance}
        style={{ position: "fixed", width: "100%", height: "100%", top: 0, left: 0, pointerEvents: "none",  zIndex: 9999, }}
      />

      {/* Cheer sound */}
      <audio ref={audioRef} src="/cheer.mp3" preload="auto" />

      {/* Category menu */}
      <div className="menu">
        {Object.keys(EXERCISES).map((cat) => (
          <button
            key={cat}
            className={category === cat ? "active" : ""}
            onClick={() => {
              setCategory(cat);
              setCurrentIndex(0);
              setAnswers({});
              setResults({});
              setShowScore(false);
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {!showScore ? (
        <div className="exercise">
          {/* Left panel */}
          <div className="left">
            <div className="masked">{getMaskedWord(words[currentIndex])}</div>
            <input
              type="text"
              value={answers[currentIndex] || ""}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
            />
            <div className="controls">
              {!results[currentIndex] && (
                <button onClick={checkAnswer}>Check</button>
              )}
              {results[currentIndex] && currentIndex < words.length - 1 && (
                <button onClick={() => setCurrentIndex((i) => i + 1)}>Next</button>
              )}
            </div>
          </div>

          {/* Right panel */}
          <div className="right">
            {results[currentIndex] ? (
              <div style={{ fontSize: "120px" }}>
                {VISUALS[words[currentIndex]]}
              </div>
            ) : (
              <div style={{ fontSize: "40px", color: "#aaa" }}>?</div>
            )}
          </div>
        </div>
      ) : (
        <div className="score">
          <h2>You got {score} out of {words.length} correct!</h2>
          <button
            onClick={() => {
              setAnswers({});
              setResults({});
              setShowScore(false);
              setCurrentIndex(0);
            }}
          >
            Play Again
          </button>
        </div>
      )}

      {/* Styles */}
      <style>{`
        body {
          margin: 0;
          font-family: "Comic Sans MS", cursive, sans-serif;
          background: linear-gradient(to bottom right, #ffe4c4, #ffcccb);
        }
         #root {width: 100%} 
        .app {
          text-align: center;
          padding: 20px;
          height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .menu {
          margin-bottom: 20px;
        }
        .menu button {
          margin: 5px;
          padding: 12px 24px;
          font-size: 20px;
          border: none;
          border-radius: 12px;
          background: #ff7f7f;
          color: white;
          cursor: pointer;
        }
        .menu button.active {
          background: #ff4d4d;
          font-weight: bold;
        }
        .exercise {
            flex: 1;
            display: flex;
            width: 100%;
            height: 100%;              /* stretch vertically */
            background: #fffaf0;
            border-radius: 20px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.2);
          }

          .left, .right {
            flex: 1;                   /* equal space */
            padding: 30px;
            display: flex; 
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
        .masked {
          font-size: 42px;
          margin-bottom: 20px;
          letter-spacing: 8px;
          color: #ff4d4d;
        }
        input {
          padding: 12px;
          font-size: 24px;
          border: 2px solid #ccc;
          border-radius: 10px;
          width: 70%;
          text-align: center;
        }
        .controls {
          margin-top: 20px;
        }
        .controls button {
          margin: 10px;
          padding: 12px 24px;
          font-size: 20px;
          border: none;
          border-radius: 12px;
          background: #9370db;
          color: white;
          cursor: pointer;
        }
        .score h2 {
          font-size: 32px;
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  );
}

export default App;
