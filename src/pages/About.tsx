import React from 'react';
import ParallaxBackground from '../components/ParallaxBackground';

const About: React.FC = () => {
  return (
    <div className="relative w-full min-h-screen bg-black">
      <ParallaxBackground color="#FF6B35" variant="dots" />

      <div className="relative z-10 container mx-auto px-4 py-20">
        <h1
          className="text-5xl md:text-7xl font-bold mb-12 text-center"
          style={{
            fontFamily: '"Press Start 2P", cursive',
            color: '#FF6B35',
            textShadow: '0 0 10px #FF6B35'
          }}
        >
          ABOUT ME
        </h1>

        <div className="max-w-4xl mx-auto space-y-8">
          <div
            className="border-4 border-[#FF6B35] bg-black/80 p-8"
            style={{
              fontFamily: '"Press Start 2P", cursive',
              color: '#FF6B35',
              lineHeight: '2'
            }}
          >
            <p className="text-sm md:text-base mb-6">
              Welcome to my digital realm! I'm a developer who loves crafting unique experiences.
            </p>
            <p className="text-sm md:text-base">
              Specializing in web development, interactive design, and all things retro gaming.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
