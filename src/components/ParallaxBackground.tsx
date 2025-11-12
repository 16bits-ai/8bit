import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type ParallaxBackgroundProps = {
  color?: string;
  variant?: 'grid' | 'dots' | 'lines' | 'squares';
};

const ParallaxBackground: React.FC<ParallaxBackgroundProps> = ({
  color = '#00FF41',
  variant = 'grid'
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const renderPattern = () => {
    switch (variant) {
      case 'grid':
        return (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(${color}20 1px, transparent 1px),
                linear-gradient(90deg, ${color}20 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
              transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`
            }}
          />
        );

      case 'dots':
        return (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle, ${color}40 2px, transparent 2px)`,
              backgroundSize: '40px 40px',
              transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`
            }}
          />
        );

      case 'lines':
        return (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(
                0deg,
                ${color}10,
                ${color}10 2px,
                transparent 2px,
                transparent 20px
              )`,
              transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`
            }}
          />
        );

      case 'squares':
        return (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(${color}30 2px, transparent 2px),
                linear-gradient(90deg, ${color}30 2px, transparent 2px)
              `,
              backgroundSize: '60px 60px',
              transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />

      {renderPattern()}

      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${color}05, transparent 70%)`,
          transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          boxShadow: `inset 0 0 100px ${color}20`,
        }}
      />
    </div>
  );
};

export default ParallaxBackground;
