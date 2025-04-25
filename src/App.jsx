import React, { useState, useEffect, useCallback } from 'react';
import Shape from './components/Shape';
import {
  SHAPES,
  CIRCLE_RADIUS,
  BLANK_SCREEN_DURATION,
  SHAPE_DISPLAY_DURATION,
  generateGameSequence
} from './constants';
import './App.css';

const GameStates = {
  INTRO: 'intro',
  BLANK: 'blank',
  DISPLAY: 'display',
  POST_DISPLAY_BLANK: 'post_display_blank',
  CHOICE: 'choice',
  RESULTS: 'results'
};

function App() {
  const [gameState, setGameState] = useState(GameStates.INTRO);
  const [sequence, setSequence] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState([]);
  const [timer, setTimer] = useState(null);

  const startGame = useCallback(() => {
    setSequence(generateGameSequence());
    setCurrentIndex(0);
    setResults([]);
    setGameState(GameStates.BLANK);
  }, []);

  const handleChoice = (selectedShape) => {
    const current = sequence[currentIndex];
    setResults(prev => [...prev, {
      position: current.position,
      shownShape: current.shape,
      chosenShape: selectedShape,
      correct: current.shape === selectedShape
    }]);

    if (currentIndex === sequence.length - 1) {
      setGameState(GameStates.RESULTS);
    } else {
      setCurrentIndex(prev => prev + 1);
      setGameState(GameStates.BLANK);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space' && gameState === GameStates.INTRO) {
        e.preventDefault();
        startGame();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, startGame]);

  useEffect(() => {
    if (gameState === GameStates.BLANK) {
      clearTimeout(timer);
      const newTimer = setTimeout(() => {
        setGameState(GameStates.DISPLAY);
      }, BLANK_SCREEN_DURATION);
      setTimer(newTimer);
    } else if (gameState === GameStates.DISPLAY) {
      clearTimeout(timer);
      const newTimer = setTimeout(() => {
        setGameState(GameStates.POST_DISPLAY_BLANK);
      }, SHAPE_DISPLAY_DURATION);
      setTimer(newTimer);
    } else if (gameState === GameStates.POST_DISPLAY_BLANK) {
      clearTimeout(timer);
      const newTimer = setTimeout(() => {
        setGameState(GameStates.CHOICE);
      }, BLANK_SCREEN_DURATION);
      setTimer(newTimer);
    }

    return () => clearTimeout(timer);
  }, [gameState]);

  const getCurrentShape = () => {
    if (gameState !== GameStates.DISPLAY || !sequence[currentIndex]) return null;

    const { shape, position } = sequence[currentIndex];
    const angle = (position * Math.PI) / 180;
    const x = Math.cos(angle) * CIRCLE_RADIUS;
    const y = Math.sin(angle) * CIRCLE_RADIUS;

    return (
      <div
        style={{
          position: 'absolute',
          transform: `translate(${x}px, ${y}px)`,
          top: '50%',
          left: '50%',
          marginLeft: '-29.5px',
          marginTop: '-29.5px'
        }}
      >
        <Shape type={shape} />
      </div>
    );
  };

  const renderContent = () => {
    switch (gameState) {
      case GameStates.INTRO:
        return (
          <div className="intro">
            <h1>Peripheral Vision Test</h1>
            <p>Press SPACE to start the test</p>
            <p>You will see shapes appear briefly on the screen.</p>
            <p>Try to identify which shape you saw.</p>
          </div>
        );

      case GameStates.BLANK:
      case GameStates.POST_DISPLAY_BLANK:
        return (
          <div className="blank-screen">
            <div className="fixation-dot" />
          </div>
        );

      case GameStates.DISPLAY:
        return (
          <>
            <div className="fixation-dot" />
            {getCurrentShape()}
          </>
        );

      case GameStates.CHOICE:
        return (
          <div className="choice-container">
            <h2>Which shape did you see?</h2>
            <div className="shapes-grid">
              {SHAPES.map(shape => (
                <div
                  key={shape}
                  onClick={() => handleChoice(shape)}
                  className="shape-choice"
                >
                  <Shape type={shape} isButton />
                </div>
              ))}
            </div>
          </div>
        );

      case GameStates.RESULTS:
        return (
          <div className="results">
            <h2>Test Results</h2>
            <table>
              <thead>
                <tr>
                  <th>Position</th>
                  <th>Shown Shape</th>
                  <th>Chosen Shape</th>
                  <th>Correct</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={index}>
                    <td>{result.position}°</td>
                    <td>{result.shownShape}</td>
                    <td>{result.chosenShape}</td>
                    <td>{result.correct ? '✓' : '✗'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={startGame} className="restart-button">
              Start New Test
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="app">
      {renderContent()}
    </div>
  );
}

export default App;
