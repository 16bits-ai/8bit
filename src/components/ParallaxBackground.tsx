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

  // Pattern color derives from the themed accent; the prop is the fallback so
  // this still works if the token isn't set (and keeps the param "used").
  const tint = (pct: number) => `color-mix(in srgb, var(--accent, ${color}) ${pct}%, transparent)`;

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
                linear-gradient(${tint(13)} 1px, transparent 1px),
                linear-gradient(90deg, ${tint(13)} 1px, transparent 1px)
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
              backgroundImage: `radial-gradient(circle, ${tint(25)} 2px, transparent 2px)`,
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
                ${tint(6)},
                ${tint(6)} 2px,
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
                linear-gradient(${tint(19)} 2px, transparent 2px),
                linear-gradient(90deg, ${tint(19)} 2px, transparent 2px)
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
        className="absolute inset-0 bg-[var(--paper)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />

      {renderPattern()}

      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${tint(3)}, transparent 70%)`,
          transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          boxShadow: `inset 0 0 100px ${tint(13)}`,
        }}
      />
    </div>
  );
};

export default ParallaxBackground;
