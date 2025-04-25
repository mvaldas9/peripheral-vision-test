// Game shapes
export const SHAPES = ['circle', 'square', 'triangle', 'star', 'cross'];

// Game positions in degrees and their coordinates on a circle
export const POSITIONS = [0, 45, 90, 135, 180, 225, 270, 315];

// Default calibration values
export const DEFAULT_PX_PER_10CM = 505;
export const DEFAULT_SHAPE_SIZE_CM = 1.57;
export const DEFAULT_CIRCLE_RADIUS_CM = 7.37;

// Helper function to calculate sizes based on pixels per 10cm
export const calculateSizes = (pxPer10cm, shapeSizeCm, circleRadiusCm) => {
  const pxPerCm = pxPer10cm / 10;
  return {
    circleRadius: Math.round(circleRadiusCm * pxPerCm),
    shapeSize: Math.round(shapeSizeCm * pxPerCm)
  };
};

// Timing constants (in milliseconds)
export const BLANK_SCREEN_DURATION = 10;
export const SHAPE_DISPLAY_DURATION = 10;

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