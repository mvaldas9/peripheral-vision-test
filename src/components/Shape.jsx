import React from 'react';

const DEFAULT_SIZE = 60;

const Shape = ({ type, position = 0, isButton = false, size = DEFAULT_SIZE, color = '#000000' }) => {
  const getShapePath = () => {
    const half = size / 2;
    
    switch (type) {
      case 'circle':
        return <circle cx={half} cy={half} r={half} />;
      case 'square':
        return <rect x="0" y="0" width={size} height={size} />;
      case 'triangle':
        return <polygon points={`${half},0 ${size},${size} 0,${size}`} />;
      case 'star': {
        const points = [];
        for (let i = 0; i < 5; i++) {
          const angle = (i * 72 - 90) * Math.PI / 180;
          points.push(`${half + half * Math.cos(angle)},${half + half * Math.sin(angle)}`);
          const innerAngle = ((i * 72 + 36) - 90) * Math.PI / 180;
          points.push(`${half + half * 0.4 * Math.cos(innerAngle)},${half + half * 0.4 * Math.sin(innerAngle)}`);
        }
        return <polygon points={points.join(' ')} />;
      }
      case 'cross': {
        const thickness = size / 10;
        const offset = thickness / Math.SQRT2; // Adjust for 45-degree rotation
        return (
          <path
            transform={`rotate(45, ${half}, ${half})`}
            d={`
              M${half - thickness} 0 
              h${thickness * 2} v${half - thickness} 
              h${half - thickness} v${thickness * 2} 
              h-${half - thickness} v${half - thickness} 
              h-${thickness * 2} v-${half - thickness} 
              h-${half - thickness} v-${thickness * 2} 
              h${half - thickness}z
            `}
          />
        );
      }
      default:
        return null;
    }
  };

  const style = isButton ? {
    cursor: 'pointer',
    margin: '10px',
    transition: 'transform 0.1s',
  } : {};

  return (
    <svg 
      width={size} 
      height={size} 
      style={style}
      className={isButton ? 'shape-button' : ''}
      fill={color}
    >
      {getShapePath()}
    </svg>
  );
};

export default Shape; 