import React from 'react';
import { SHAPE_SIZE } from '../constants';

const Shape = ({ type, position = 0, isButton = false }) => {
  const getShapePath = () => {
    const size = SHAPE_SIZE;
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
      case 'cross':
        const thickness = size / 6;
        return (
          <path d={`
            M${half - thickness} 0 
            h${thickness * 2} v${half - thickness} 
            h${half - thickness} v${thickness * 2} 
            h-${half - thickness} v${half - thickness} 
            h-${thickness * 2} v-${half - thickness} 
            h-${half - thickness} v-${thickness * 2} 
            h${half - thickness}z
          `} />
        );
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
      width={SHAPE_SIZE} 
      height={SHAPE_SIZE} 
      style={style}
      className={isButton ? 'shape-button' : ''}
    >
      {getShapePath()}
    </svg>
  );
};

export default Shape; 