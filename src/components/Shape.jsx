import React from 'react';

const DEFAULT_SIZE = 60;

export const ShapeStyles = {
  FILLED: 'filled',
  THICK_BORDER: 'thick-border',
  THIN_BORDER: 'thin-border',
  THIN_BORDER_DASHED: 'thin-border-dashed',
  DOTTED: 'dotted'
};

const Shape = ({ 
  type, 
  position = 0, 
  isButton = false, 
  size = DEFAULT_SIZE, 
  color = '#000000',
  style = ShapeStyles.FILLED 
}) => {
  const getShapePath = () => {
    const half = size / 2;
    
    switch (type) {
      case 'circle':
        return <circle cx={half} cy={half} r={half - (style !== ShapeStyles.FILLED ? 1 : 0)} />;
      case 'square':
        const padding = style !== ShapeStyles.FILLED ? 1 : 0;
        return <rect x={padding} y={padding} width={size - padding * 2} height={size - padding * 2} />;
      case 'triangle':
        const tPadding = style !== ShapeStyles.FILLED ? 2 : 0;
        return <polygon points={`${half},${tPadding} ${size - tPadding},${size - tPadding} ${tPadding},${size - tPadding}`} />;
      case 'star': {
        const points = [];
        const starPadding = style !== ShapeStyles.FILLED ? 2 : 0;
        const adjustedHalf = half - starPadding;
        for (let i = 0; i < 5; i++) {
          const angle = (i * 72 - 90) * Math.PI / 180;
          points.push(`${half + adjustedHalf * Math.cos(angle)},${half + adjustedHalf * Math.sin(angle)}`);
          const innerAngle = ((i * 72 + 36) - 90) * Math.PI / 180;
          points.push(`${half + adjustedHalf * 0.4 * Math.cos(innerAngle)},${half + adjustedHalf * 0.4 * Math.sin(innerAngle)}`);
        }
        return <polygon points={points.join(' ')} />;
      }
      case 'cross': {
        const thickness = size / (style === ShapeStyles.FILLED ? 10 : 
          (style === ShapeStyles.THICK_BORDER ? 8 : 15));
        const offset = thickness / Math.SQRT2;
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

  const svgStyle = isButton ? {
    cursor: 'pointer',
    margin: '10px',
    transition: 'transform 0.1s',
  } : {};

  const getStrokeWidth = () => {
    switch (style) {
      case ShapeStyles.THICK_BORDER:
        return 3;
      case ShapeStyles.THIN_BORDER:
      case ShapeStyles.THIN_BORDER_DASHED:
      case ShapeStyles.DOTTED:
        return 1;
      default:
        return 0;
    }
  };

  const getStrokeDasharray = () => {
    switch (style) {
      case ShapeStyles.THIN_BORDER_DASHED:
        return '4 2';
      case ShapeStyles.DOTTED:
        return '1 3';
      default:
        return 'none';
    }
  };

  return (
    <svg 
      width={size} 
      height={size} 
      style={svgStyle}
      className={isButton ? 'shape-button' : ''}
      fill={style === ShapeStyles.FILLED ? color : 'none'}
      stroke={style !== ShapeStyles.FILLED ? color : 'none'}
      strokeWidth={getStrokeWidth()}
      strokeDasharray={getStrokeDasharray()}
      strokeLinecap={style === ShapeStyles.DOTTED ? 'round' : 'butt'}
    >
      {getShapePath()}
    </svg>
  );
};

export default Shape; 