import React from 'react';
import ParallaxBackground from '../components/ParallaxBackground';
import airbnbLogo from '../assets/projects/Airbnb.png';
import NativePod from '../assets/projects/NativePod.png';
import OOTD from '../assets/projects/OOTD.png';
import patternizeLogo from '../assets/projects/Patternize.png';
import carlTechReviewsLogo from '../assets/projects/CarlTechReview.png';

const Projects: React.FC = () => {
  const projects = [
    { id: 1, logo: patternizeLogo, title: 'Patternize.io', description: 'A project that helps people visualize Computer Science concepts', url: 'https://patternize.github.io/' },
    { id: 2, logo: carlTechReviewsLogo, title: 'Carl Tech Reviews', description: 'A blog about technology and software development', url: 'https://gazcn007.github.io/' },
    { id: 3, logo: NativePod, title: 'NativePod', description: 'Translate podcasts into other languages', url: 'https://nativepod.co/' },
    { id: 4, logo: OOTD, title: 'OOTD.ai', description: 'Your outfit Stylist that gives you fashion advice', url: 'https://apps.apple.com/us/app/ootd-ai/id6504292959' },
  ];

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
          {projects.map((project) => {
            const ProjectCard = (
              <div
                className="border-4 border-[#4ECDC4] bg-black/80 p-6 hover:bg-[#4ECDC4]/10 transition-all cursor-pointer"
              >
                {project.logo && (
                  <div className="mb-4 flex justify-center">
                    <img
                      src={project.logo}
                      alt={`${project.title} logo`}
                      className="max-h-20 w-auto pixelated"
                      style={{
                        imageRendering: 'pixelated',
                        filter: 'drop-shadow(0 0 10px #4ECDC4)'
                      }}
                    />
                  </div>
                )}
                <h3
                  className="text-xl md:text-2xl mb-4"
                  style={{
                    fontFamily: '"Press Start 2P", cursive',
                    color: '#4ECDC4'
                  }}
                >
                  {project.title}
                </h3>
                <p
                  className="text-xs md:text-sm"
                  style={{
                    fontFamily: '"Press Start 2P", cursive',
                    color: '#4ECDC4',
                    lineHeight: '1.8'
                  }}
                >
                  {project.description}
                </p>
              </div>
            );

            return project.url ? (
              <a
                key={project.id}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                {ProjectCard}
              </a>
            ) : (
              <div key={project.id}>
                {ProjectCard}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Projects;
