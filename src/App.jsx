import React, { useState, useEffect, useCallback } from 'react';
import Shape, { ShapeStyles } from './components/Shape';
import {
  SHAPES,
  POSITIONS,
  DEFAULT_PX_PER_10CM,
  DEFAULT_SHAPE_SIZE_CM,
  DEFAULT_CIRCLE_RADIUS_CM,
  DEFAULT_SHAPE_COLOR,
  DEFAULT_BACKGROUND_COLOR,
  BLANK_SCREEN_DURATION,
  SHAPE_DISPLAY_DURATION,
  generateGameSequence,
  calculateSizes
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
  const [pxPer10cm, setPxPer10cm] = useState(() => {
    const saved = localStorage.getItem('pxPer10cm');
    return saved ? Number(saved) : DEFAULT_PX_PER_10CM;
  });
  const [shapeSizeCm, setShapeSizeCm] = useState(() => {
    const saved = localStorage.getItem('shapeSizeCm');
    return saved ? Number(saved) : DEFAULT_SHAPE_SIZE_CM;
  });
  const [circleRadiusCm, setCircleRadiusCm] = useState(() => {
    const saved = localStorage.getItem('circleRadiusCm');
    return saved ? Number(saved) : DEFAULT_CIRCLE_RADIUS_CM;
  });
  const [shapeColor, setShapeColor] = useState(() => {
    return localStorage.getItem('shapeColor') || DEFAULT_SHAPE_COLOR;
  });
  const [backgroundColor, setBackgroundColor] = useState(() => {
    return localStorage.getItem('backgroundColor') || DEFAULT_BACKGROUND_COLOR;
  });
  const [blankDuration, setBlankDuration] = useState(() => {
    const saved = localStorage.getItem('blankDuration');
    return saved ? Number(saved) : BLANK_SCREEN_DURATION;
  });
  const [shapeDuration, setShapeDuration] = useState(() => {
    const saved = localStorage.getItem('shapeDuration');
    return saved ? Number(saved) : SHAPE_DISPLAY_DURATION;
  });
  const [shapeStyle, setShapeStyle] = useState(() => {
    return localStorage.getItem('shapeStyle') || ShapeStyles.FILLED;
  });
  
  const { circleRadius, shapeSize } = calculateSizes(pxPer10cm, shapeSizeCm, circleRadiusCm);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('pxPer10cm', pxPer10cm);
    localStorage.setItem('shapeSizeCm', shapeSizeCm);
    localStorage.setItem('circleRadiusCm', circleRadiusCm);
    localStorage.setItem('shapeColor', shapeColor);
    localStorage.setItem('backgroundColor', backgroundColor);
    localStorage.setItem('blankDuration', blankDuration);
    localStorage.setItem('shapeDuration', shapeDuration);
    localStorage.setItem('shapeStyle', shapeStyle);
  }, [pxPer10cm, shapeSizeCm, circleRadiusCm, shapeColor, backgroundColor, blankDuration, shapeDuration, shapeStyle]);

  const startGame = useCallback(() => {
    setSequence(generateGameSequence());
    setCurrentIndex(0);
    setResults([]);
    setGameState(GameStates.BLANK);
    setIsDebugMode(false);
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

  const handleKeyPress = useCallback((e) => {
    if (e.code === 'Space' && gameState === GameStates.INTRO) {
      e.preventDefault();
      startGame();
    } else if (e.code === 'KeyD') {
      e.preventDefault();
      setIsDebugMode(prev => !prev);
    }
  }, [gameState, startGame]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    if (gameState === GameStates.BLANK) {
      clearTimeout(timer);
      const newTimer = setTimeout(() => {
        setGameState(GameStates.DISPLAY);
      }, blankDuration);
      setTimer(newTimer);
    } else if (gameState === GameStates.DISPLAY) {
      clearTimeout(timer);
      const newTimer = setTimeout(() => {
        setGameState(GameStates.POST_DISPLAY_BLANK);
      }, shapeDuration);
      setTimer(newTimer);
    } else if (gameState === GameStates.POST_DISPLAY_BLANK) {
      clearTimeout(timer);
      const newTimer = setTimeout(() => {
        setGameState(GameStates.CHOICE);
      }, blankDuration);
      setTimer(newTimer);
    }

    return () => clearTimeout(timer);
  }, [gameState, blankDuration, shapeDuration]);

  const renderCalibration = () => {
    if (!isDebugMode) return null;

    return (
      <div className="calibration">
        {/* Screen calibration section */}
        <div className="calibration-section">
          <h3>Ekrano kalibravimas</h3>
          <div className="calibration-line" style={{ width: pxPer10cm }} />
          <div className="calibration-hint">
            Ši atkarpa turėtų būti lygiai 10 centimetrų
          </div>
          <div className="calibration-input">
            <label>
              Pikselių skaičius 10 centimetrų atkarpai:
              <input
                type="number"
                value={pxPer10cm}
                onChange={(e) => setPxPer10cm(Number(e.target.value))}
                min="100"
                max="2000"
              />
            </label>
          </div>
        </div>

        {/* Shape appearance section */}
        <div className="calibration-section">
          <h3>Figūros išvaizda</h3>
          <div className="preview-container">
            <div className="preview-shape">
              <Shape 
                type="star" 
                size={shapeSize} 
                color={shapeColor} 
                style={shapeStyle}
              />
            </div>
          </div>
          <div className="calibration-input">
            <label>
              Figūros dydis (cm):
              <input
                type="number"
                value={shapeSizeCm}
                onChange={(e) => setShapeSizeCm(Number(e.target.value))}
                min="0.1"
                max="10"
                step="0.01"
              />
            </label>
          </div>
          <div className="calibration-input">
            <label>
              Figūros stilius:
              <select
                value={shapeStyle}
                onChange={(e) => setShapeStyle(e.target.value)}
                className="style-select"
              >
                <option value={ShapeStyles.FILLED}>Užpildyta</option>
                <option value={ShapeStyles.THIN_BORDER}>Kontūras</option>
                <option value={ShapeStyles.THIN_BORDER_DASHED}>Brūkšninis kontūras</option>
                <option value={ShapeStyles.DOTTED}>Taškelių kontūras</option>
              </select>
            </label>
          </div>
          <div className="calibration-input">
            <label>
              Figūros spalva:
              <input
                type="color"
                value={shapeColor}
                onChange={(e) => setShapeColor(e.target.value)}
              />
            </label>
          </div>
        </div>

        {/* Test configuration section */}
        <div className="calibration-section">
          <h3>Testo nustatymai</h3>
          <div className="calibration-input">
            <label>
              Apskritimo spindulys (cm):
              <input
                type="number"
                value={circleRadiusCm}
                onChange={(e) => setCircleRadiusCm(Number(e.target.value))}
                min="1"
                max="50"
                step="0.01"
              />
            </label>
          </div>
          <div className="calibration-input">
            <label>
              Tuščio ekrano trukmė (ms):
              <input
                type="number"
                value={blankDuration}
                onChange={(e) => setBlankDuration(Number(e.target.value))}
                min="100"
                max="5000"
                step="100"
              />
            </label>
          </div>
          <div className="calibration-input">
            <label>
              Figūros rodymo trukmė (ms):
              <input
                type="number"
                value={shapeDuration}
                onChange={(e) => setShapeDuration(Number(e.target.value))}
                min="50"
                max="1000"
                step="10"
              />
            </label>
          </div>
        </div>

        {/* Background color section */}
        <div className="calibration-section">
          <h3>Fono spalva</h3>
          <div className="preview-container" style={{ backgroundColor }}>
            <div className="color-preview" />
          </div>
          <div className="calibration-input">
            <label>
              Pasirinkti spalvą:
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
              />
            </label>
          </div>
        </div>

        <button 
          className="start-button"
          onClick={startGame}
        >
          Pradėti testą
        </button>
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
            width: circleRadius * 2,
            height: circleRadius * 2,
          }}
        />
        {POSITIONS.map(angle => {
          const radian = ((angle - 90) * Math.PI) / 180;
          const x = Math.cos(radian) * circleRadius;
          const y = Math.sin(radian) * circleRadius;

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

  const getCurrentShape = () => {
    if (gameState !== GameStates.DISPLAY || !sequence[currentIndex]) return null;

    const { shape, position } = sequence[currentIndex];
    const radian = ((position - 90) * Math.PI) / 180;
    const x = Math.cos(radian) * circleRadius;
    const y = Math.sin(radian) * circleRadius;

    return (
      <div
        style={{
          position: 'absolute',
          transform: `translate(${x}px, ${y}px)`,
          top: '50%',
          left: '50%',
          marginLeft: `-${shapeSize / 2}px`,
          marginTop: `-${shapeSize / 2}px`
        }}
      >
        <Shape type={shape} size={shapeSize} color={shapeColor} style={shapeStyle} />
      </div>
    );
  };

  const copyResultsToClipboard = () => {
    // Create header
    const header = ['Pozicija', 'Parodyta figūra', 'Pasirinkta figūra', 'Teisingai'].join('\t');
    
    // Create rows
    const rows = results.map(result => [
      `${result.position}°`,
      translateShape(result.shownShape),
      translateShape(result.chosenShape),
      result.correct ? '1' : '0'
    ].join('\t'));

    // Combine header and rows
    const textToCopy = [header, ...rows].join('\n');

    // Copy to clipboard
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        // Visual feedback that copy was successful
        const button = document.getElementById('copy-button');
        button.textContent = 'Nukopijuota!';
        setTimeout(() => {
          button.textContent = 'Kopijuoti rezultatus';
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
      });
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
            {renderCalibration()}
          </div>
        );

      case GameStates.BLANK:
      case GameStates.POST_DISPLAY_BLANK:
        return (
          <div 
            className="app blank-screen cursor-hide" 
            style={{ backgroundColor }}
          >
            <div className="fixation-cross" style={{ color: shapeColor }} />
            {renderDebugElements()}
          </div>
        );

      case GameStates.DISPLAY:
        return (
          <div 
            className="app cursor-hide"
            style={{ backgroundColor }}
          >
            <div className="fixation-cross" style={{ color: shapeColor }} />
            {getCurrentShape()}
            {renderDebugElements()}
          </div>
        );

      case GameStates.CHOICE:
        return (
          <div 
            className="app choice-container"
            style={{ backgroundColor }}
          >
            <h2 style={{ color: shapeColor }}>Kokią figūrą matėte?</h2>
            <div className="shapes-grid">
              {SHAPES.map(shape => (
                <div
                  key={shape}
                  onClick={() => handleChoice(shape)}
                  className="shape-choice"
                  style={{ backgroundColor }}
                >
                  <Shape type={shape} isButton size={shapeSize} color={shapeColor} style={shapeStyle} />
                </div>
              ))}
            </div>
          </div>
        );

      case GameStates.RESULTS:
        return (
          <div className="results">
            <h2>Testo rezultatai</h2>
            <div className="results-actions">
              <button 
                id="copy-button"
                onClick={copyResultsToClipboard} 
                className="copy-button"
              >
                Kopijuoti rezultatus
              </button>
            </div>
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
                    <td>{result.correct ? '1' : '0'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {renderContent()}
    </>
  );
}

export default App;
