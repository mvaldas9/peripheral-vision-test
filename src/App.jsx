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
    cross: 'kryžius',
    unknown: 'nežinau'
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
  const [fixationShape, setFixationShape] = useState(null);
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
  const [selectedPeripheralShape, setSelectedPeripheralShape] = useState(null);
  const [selectedFixationShape, setSelectedFixationShape] = useState(null);
  
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
    setFixationShape(SHAPES[Math.floor(Math.random() * SHAPES.length)]);
  }, []);

  const handleChoice = (selectedShape, isPeripheral) => {
    if (isPeripheral) {
      setSelectedPeripheralShape(selectedShape);
    } else {
      setSelectedFixationShape(selectedShape);
    }

    // If both shapes have been selected, proceed
    if ((isPeripheral && selectedFixationShape) || (!isPeripheral && selectedPeripheralShape)) {
      const current = sequence[currentIndex];
      const chosenFixationShape = isPeripheral ? selectedFixationShape : selectedShape;
      const isFixationCorrect = fixationShape === chosenFixationShape;

      // Add result to results array
      setResults(prev => [...prev, {
        position: current.position,
        shownShape: current.shape,
        chosenPeripheralShape: isPeripheral ? selectedShape : selectedPeripheralShape,
        correctPeripheral: current.shape === (isPeripheral ? selectedShape : selectedPeripheralShape),
        fixationShape: fixationShape,
        chosenFixationShape: chosenFixationShape,
        correctFixation: isFixationCorrect,
        isRetry: current.isRetry,
        originalIndex: current.originalIndex
      }]);

      // If fixation shape was incorrect or unknown, and not already a retry, add it to the end of sequence
      if ((!isFixationCorrect || chosenFixationShape === 'unknown') && !current.isRetry) {
        setSequence(prev => [
          ...prev,
          {
            ...current,
            isRetry: true,
            originalIndex: currentIndex
          }
        ]);
      }

      if (currentIndex === sequence.length - 1) {
        setGameState(GameStates.RESULTS);
      } else {
        setCurrentIndex(prev => prev + 1);
        setGameState(GameStates.BLANK);
        setFixationShape(SHAPES[Math.floor(Math.random() * SHAPES.length)]);
      }
      
      // Reset selections for next round
      setSelectedPeripheralShape(null);
      setSelectedFixationShape(null);
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
    try {
      // Create header
      const header = [
        'Nr.',
        'Pozicija',
        'Parodyta periferinė figūra',
        'Pasirinkta periferinė figūra',
        'Periferinė teisingai',
        'Parodyta centrinė figūra',
        'Pasirinkta centrinė figūra',
        'Centrinė teisingai',
        'Pakartotinis bandymas',
        'Originalaus bandymo nr.'
      ].join('\t');
      
      // Create rows
      const rows = results.map((result, index) => {
        const row = [
          (index + 1).toString(),
          `${result.position}°`,
          translateShape(result.shownShape),
          translateShape(result.chosenPeripheralShape),
          result.correctPeripheral ? '1' : '0',
          translateShape(result.fixationShape),
          translateShape(result.chosenFixationShape),
          result.correctFixation ? '1' : '0',
          result.isRetry ? '1' : '0',
          result.isRetry ? (result.originalIndex + 1).toString() : ''
        ];
        return row.join('\t');
      });

      // Combine header and rows
      const textToCopy = [header, ...rows].join('\n');

      // For debugging
      console.log('Copying text:', textToCopy);

      // Copy to clipboard using a temporary textarea element
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);

      // Update button text
      const button = document.getElementById('copy-button');
      button.textContent = 'Nukopijuota!';
      setTimeout(() => {
        button.textContent = 'Kopijuoti rezultatus';
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Nepavyko nukopijuoti rezultatų. Bandykite dar kartą.');
    }
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
            <div className="fixation-symbol" style={{ color: shapeColor }}>
              <div className="fixation-circle"></div>
              <div className="fixation-circle"></div>
              <div className="fixation-circle"></div>
              <div className="fixation-circle"></div>
              <div className="fixation-circle"></div>
              <div className="fixation-circle"></div>
              <div className="fixation-circle"></div>
              <div className="fixation-circle"></div>
            </div>
            {renderDebugElements()}
          </div>
        );

      case GameStates.DISPLAY:
        return (
          <div 
            className="app cursor-hide"
            style={{ backgroundColor }}
          >
            <div className="fixation-symbol" style={{ color: shapeColor }}>
              <div className="fixation-circle"></div>
              <div className="fixation-circle"></div>
              <div className="fixation-circle"></div>
              <div className="fixation-circle"></div>
              <div className="fixation-circle"></div>
              <div className="fixation-circle"></div>
              <div className="fixation-circle"></div>
              <div className="fixation-circle"></div>
              {gameState === GameStates.DISPLAY && (
                <div className="fixation-shape">
                  <Shape type={fixationShape} size={12} color={shapeColor} style={shapeStyle} />
                </div>
              )}
            </div>
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
            <div className="shapes-selection">
              <div className="shape-selection-group">
                <h2 style={{ color: shapeColor }}>Kokią figūrą matėte centre?</h2>
                <div className="shapes-grid">
                  {SHAPES.map(shape => (
                    <div
                      key={`fixation-${shape}`}
                      onClick={() => handleChoice(shape, false)}
                      className={`shape-choice ${selectedFixationShape === shape ? 'selected' : ''}`}
                      style={{ backgroundColor }}
                    >
                      <Shape type={shape} isButton size={shapeSize * 0.3} color={shapeColor} style={shapeStyle} />
                    </div>
                  ))}
                  <div
                    onClick={() => handleChoice('unknown', false)}
                    className={`shape-choice unknown-choice ${selectedFixationShape === 'unknown' ? 'selected' : ''}`}
                    style={{ backgroundColor }}
                  >
                    <div className="unknown-symbol small">?</div>
                  </div>
                </div>
              </div>
              
              <div className="shape-selection-group">
                <h2 style={{ color: shapeColor }}>Kokią figūrą matėte periferijoje?</h2>
                <div className="shapes-grid">
                  {SHAPES.map(shape => (
                    <div
                      key={`peripheral-${shape}`}
                      onClick={() => handleChoice(shape, true)}
                      className={`shape-choice ${selectedPeripheralShape === shape ? 'selected' : ''}`}
                      style={{ backgroundColor }}
                    >
                      <Shape type={shape} isButton size={shapeSize} color={shapeColor} style={shapeStyle} />
                    </div>
                  ))}
                  <div
                    onClick={() => handleChoice('unknown', true)}
                    className={`shape-choice unknown-choice ${selectedPeripheralShape === 'unknown' ? 'selected' : ''}`}
                    style={{ backgroundColor }}
                  >
                    <div className="unknown-symbol">?</div>
                  </div>
                </div>
              </div>
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
                  <th>Nr.</th>
                  <th>Pozicija</th>
                  <th>Parodyta periferinė figūra</th>
                  <th>Pasirinkta periferinė figūra</th>
                  <th>Periferinė teisingai</th>
                  <th>Parodyta centrinė figūra</th>
                  <th>Pasirinkta centrinė figūra</th>
                  <th>Centrinė teisingai</th>
                  <th>Pakartotinis bandymas</th>
                  <th>Originalaus bandymo nr.</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={index} className={result.isRetry ? 'retry-row' : ''}>
                    <td>{index + 1}</td>
                    <td>{result.position}°</td>
                    <td>{translateShape(result.shownShape)}</td>
                    <td>{translateShape(result.chosenPeripheralShape)}</td>
                    <td>{result.correctPeripheral ? '1' : '0'}</td>
                    <td>{translateShape(result.fixationShape)}</td>
                    <td>{translateShape(result.chosenFixationShape)}</td>
                    <td>{result.correctFixation ? '1' : '0'}</td>
                    <td>{result.isRetry ? '1' : '0'}</td>
                    <td>{result.isRetry ? result.originalIndex + 1 : ''}</td>
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
