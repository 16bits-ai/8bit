import React from 'react';
import ParallaxBackground from '../components/ParallaxBackground';

const Projects: React.FC = () => {
  return (
    <div className="relative w-full min-h-screen bg-black">
      <ParallaxBackground color="#4ECDC4" variant="squares" />

      <div className="relative z-10 container mx-auto px-4 py-20">
        <h1
          className="text-5xl md:text-7xl font-bold mb-12 text-center"
          style={{
            fontFamily: '"Press Start 2P", cursive',
            color: '#4ECDC4',
            textShadow: '0 0 10px #4ECDC4'
          }}
        >
          PROJECTS
        </h1>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="border-4 border-[#4ECDC4] bg-black/80 p-6 hover:bg-[#4ECDC4]/10 transition-all cursor-pointer"
            >
              <h3
                className="text-xl md:text-2xl mb-4"
                style={{
                  fontFamily: '"Press Start 2P", cursive',
                  color: '#4ECDC4'
                }}
              >
                PROJECT {item}
              </h3>
              <p
                className="text-xs md:text-sm"
                style={{
                  fontFamily: '"Press Start 2P", cursive',
                  color: '#4ECDC4',
                  lineHeight: '1.8'
                }}
              >
                An amazing project description goes here...
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;
