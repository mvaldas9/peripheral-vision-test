import React, { useState, useEffect, useCallback } from 'react';
import Shape from './components/Shape';
import {
  SHAPES,
  CIRCLE_RADIUS,
  POSITIONS,
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

// Translation function for shape names
const translateShape = (shape) => {
  const translations = {
    circle: 'apskritimas',
    square: 'kvadratas',
    triangle: 'trikampis',
    star: 'žvaigždė',
    cross: 'kryžius'
  };
  return translations[shape] || shape;
};

function App() {
  const [gameState, setGameState] = useState(GameStates.INTRO);
  const [sequence, setSequence] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState([]);
  const [timer, setTimer] = useState(null);
  const [isDebugMode, setIsDebugMode] = useState(false);

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
      } else if (e.code === 'KeyD') {
        e.preventDefault();
        setIsDebugMode(prev => !prev);
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
    const radian = ((position - 90) * Math.PI) / 180;
    const x = Math.cos(radian) * CIRCLE_RADIUS;
    const y = Math.sin(radian) * CIRCLE_RADIUS;

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

  const renderDebugElements = () => {
    if (!isDebugMode) return null;

    return (
      <>
        <div 
          className="debug-circle" 
          style={{
            width: CIRCLE_RADIUS * 2,
            height: CIRCLE_RADIUS * 2,
          }}
        />
        {POSITIONS.map(angle => {
          const radian = ((angle - 90) * Math.PI) / 180;
          const x = Math.cos(radian) * CIRCLE_RADIUS;
          const y = Math.sin(radian) * CIRCLE_RADIUS;

          return (
            <React.Fragment key={angle}>
              <div
                className="debug-position"
                style={{
                  top: `calc(50% + ${y}px)`,
                  left: `calc(50% + ${x}px)`,
                }}
              />
              <div
                className="debug-label"
                style={{
                  top: `calc(50% + ${y * 1.1}px)`,
                  left: `calc(50% + ${x * 1.1}px)`,
                }}
              >
                {angle}°
              </div>
            </React.Fragment>
          );
        })}
      </>
    );
  };

  const renderContent = () => {
    switch (gameState) {
      case GameStates.INTRO:
        return (
          <div className="intro">
            <h1>Periferinio matymo testas</h1>
            <p>Paspauskite TARPO klavišą, kad pradėtumėte testą</p>
            <p>Ekrane trumpai pasirodys figūros.</p>
            <p>Pabandykite atpažinti, kokią figūrą matėte.</p>
            <p className="debug-hint">Paspauskite 'D' mygtuką, kad įjungtumėte derinimo režimą</p>
          </div>
        );

      case GameStates.BLANK:
      case GameStates.POST_DISPLAY_BLANK:
        return (
          <div className="blank-screen">
            <div className="fixation-dot" />
            {renderDebugElements()}
          </div>
        );

      case GameStates.DISPLAY:
        return (
          <>
            <div className="fixation-dot" />
            {getCurrentShape()}
            {renderDebugElements()}
          </>
        );

      case GameStates.CHOICE:
        return (
          <div className="choice-container">
            <h2>Kokią figūrą matėte?</h2>
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
            <h2>Testo rezultatai</h2>
            <table>
              <thead>
                <tr>
                  <th>Pozicija</th>
                  <th>Parodyta figūra</th>
                  <th>Pasirinkta figūra</th>
                  <th>Teisingai</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={index}>
                    <td>{result.position}°</td>
                    <td>{translateShape(result.shownShape)}</td>
                    <td>{translateShape(result.chosenShape)}</td>
                    <td>{result.correct ? '✓' : '✗'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={startGame} className="restart-button">
              Pradėti naują testą
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
