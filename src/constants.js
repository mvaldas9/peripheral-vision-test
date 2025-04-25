// Game shapes
export const SHAPES = ['circle', 'square', 'triangle', 'star', 'cross'];

// Game positions in degrees and their coordinates on a circle
export const POSITIONS = [0, 45, 90, 135, 180, 225, 270, 315];

// Conversion ratio: 50.5px = 1cm
const PX_PER_CM = 50.5;

// Circle radius in pixels (7.37cm * 50.5px/cm ≈ 372px)
export const CIRCLE_RADIUS = Math.round(7.37 * PX_PER_CM);

// Shape size in pixels (1.57cm * 50.5px/cm ≈ 79px)
export const SHAPE_SIZE = Math.round(1.57 * PX_PER_CM);

// Timing constants (in milliseconds)
export const BLANK_SCREEN_DURATION = 3000;
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