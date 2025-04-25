// Game shapes
export const SHAPES = ['circle', 'square', 'triangle', 'star', 'cross'];

// Game positions in degrees and their coordinates on a circle
export const POSITIONS = [0, 45, 90, 135, 180, 225, 270, 315];

// Circle radius in pixels (7.37cm ≈ 278.5px at 96 DPI)
export const CIRCLE_RADIUS = 278;

// Shape size in pixels (1.57cm ≈ 59.3px at 96 DPI)
export const SHAPE_SIZE = 59;

// Timing constants (in milliseconds)
export const BLANK_SCREEN_DURATION = 2000;
export const SHAPE_DISPLAY_DURATION = 100;

// Generate all possible combinations of shapes and positions
export const generateGameSequence = () => {
  const sequence = [];
  SHAPES.forEach(shape => {
    POSITIONS.forEach(position => {
      sequence.push({ shape, position });
    });
  });
  
  // Shuffle the sequence
  for (let i = sequence.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [sequence[i], sequence[j]] = [sequence[j], sequence[i]];
  }
  
  return sequence;
}; 