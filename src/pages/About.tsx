import React, { useState, useEffect } from 'react';
import ParallaxBackground from '../components/ParallaxBackground';
import airbnbLogo from '../assets/projects/Airbnb.png';
import mcgillLogo from '../assets/projects/McGill.png';
import tableauLogo from '../assets/projects/Tableau.png';
import stanfordLogo from '../assets/projects/Stanford.png';
import presenceLogo from '../assets/projects/Presence.png';
import NativePod from '../assets/projects/NativePod.png';
import OOTD from '../assets/projects/OOTD.png';
import patternizeLogo from '../assets/projects/Patternize.png';
import carlTechReviewsLogo from '../assets/projects/CarlTechReview.png';

const About: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    
    const checkSafari = () => {
      const isSafariBrowser = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      setIsSafari(isSafariBrowser);
    };
    
    checkMobile();
    checkSafari();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-black">
      <ParallaxBackground color="#FF6B35" variant="dots" />

      <div className="relative z-10 container mx-auto px-4 py-20">
        <h1
          className="text-5xl md:text-7xl font-bold mb-12 text-center"
          style={{
            fontFamily: '"Press Start 2P", cursive',
            color: '#FF6B35',
            textShadow: (isMobile || isSafari) ? '0 0 3px #FF6B35' : '0 0 10px #FF6B35',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale'
          }}
        >
          ABOUT ME
        </h1>

        <div className="max-w-4xl mx-auto space-y-12">
          {/* Projects Section */}
          <div>
            <h2
              className="text-3xl md:text-4xl font-bold mb-8"
              style={{
                fontFamily: '"Press Start 2P", cursive',
                color: '#FF6B35',
                textShadow: (isMobile || isSafari) ? '0 0 3px #FF6B35' : '0 0 10px #FF6B35',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale'
              }}
            >
              PROJECTS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { id: 1, logo: patternizeLogo, title: 'Patternize.io', description: 'Helps people visualize Computer Science concepts', url: 'https://patternize.github.io/' },
                { id: 2, logo: carlTechReviewsLogo, title: 'Carl Tech Reviews', description: 'A blog about technology and software development', url: 'https://gazcn007.github.io/' },
                { id: 3, logo: NativePod, title: 'NativePod', description: 'Translate podcasts into other languages', url: 'https://nativepod.co/' },
                { id: 4, logo: OOTD, title: 'OOTD.ai', description: 'Your outfit Stylist that gives you fashion advice', url: 'https://apps.apple.com/us/app/ootd-ai/id6504292959' },
              ].map((project) => {
                const ProjectCard = (
                  <div
                    className="border-4 border-[#FF6B35] bg-black/80 p-6 hover:bg-[#FF6B35]/10 transition-all cursor-pointer"
                    style={{
                      fontFamily: '"Press Start 2P", cursive',
                      color: '#FF6B35',
                      lineHeight: '1.8'
                    }}
                  >
                    {project.logo && (
                      <div className="mb-4 flex justify-center">
                        <img
                          src={project.logo}
                          alt={`${project.title} logo`}
                          className="max-h-20 w-auto pixelated"
                          style={{
                            imageRendering: 'pixelated',
                            filter: 'drop-shadow(0 0 10px #FF6B35)'
                          }}
                        />
                      </div>
                    )}
                    <h3
                      className="text-lg md:text-xl mb-4"
                      style={{
                        fontFamily: '"Press Start 2P", cursive',
                        color: '#FF6B35'
                      }}
                    >
                      {project.title}
                    </h3>
                    <p
                      className="text-xs md:text-sm"
                      style={{
                        fontFamily: '"Press Start 2P", cursive',
                        color: '#FF6B35',
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

          {/* Experience Section */}
          <div>
            <h2
              className="text-3xl md:text-4xl font-bold mb-8"
              style={{
                fontFamily: '"Press Start 2P", cursive',
                color: '#FF6B35',
                textShadow: (isMobile || isSafari) ? '0 0 3px #FF6B35' : '0 0 10px #FF6B35',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale'
              }}
            >
              EXPERIENCE
            </h2>
            <div className="space-y-6">
              {/* Presence */}
              <div
                className="border-4 border-[#FF6B35] bg-black/80 p-6"
                style={{
                  fontFamily: '"Press Start 2P", cursive',
                  color: '#FF6B35',
                  lineHeight: '1.8'
                }}
              >
                <div className="flex items-start gap-4 mb-3">
                <img
                  src={presenceLogo}
                  alt="Presence logo"
                  className="pixelated flex-shrink-0"
                  width={72}
                  height={60}
                  style={{
                    imageRendering: 'pixelated',
                    filter: 'drop-shadow(0 0 5px #FF6B35)',
                  }}
                />
                  <div className="flex-1">
                    <h3 className="text-lg md:text-xl mb-1">HEAD OF PRODUCT</h3>
                    <p className="text-xs opacity-80">Presence (VC-backed startup)</p>
                    <p className="text-xs opacity-80">San Francisco, USA • 2022-2025</p>
                  </div>
                </div>
                <ul className="text-xs md:text-sm space-y-2 mt-4 list-none">
                  <li>• Led 20-person eng team. Shipped PMF, scaled to $M+ ARR, raised $10M+.</li>
                  <li>• Built cross-platform apps (Web/Mobile/CV) with modern stack.</li>
                </ul>
              </div>

              {/* Airbnb */}
              <div
                className="border-4 border-[#FF6B35] bg-black/80 p-6"
                style={{
                  fontFamily: '"Press Start 2P", cursive',
                  color: '#FF6B35',
                  lineHeight: '1.8'
                }}
              >
                <div className="flex items-start gap-4 mb-3">
                  <img
                    src={airbnbLogo}
                    alt="Airbnb logo"
                    className="h-12 w-auto pixelated flex-shrink-0"
                    style={{
                      imageRendering: 'pixelated',
                      filter: 'drop-shadow(0 0 5px #FF6B35)'
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="text-lg md:text-xl mb-1">SOFTWARE ENGINEER II</h3>
                    <p className="text-xs opacity-80">Airbnb</p>
                    <p className="text-xs opacity-80">Remote • 2020-2022</p>
                  </div>
                </div>
                <ul className="text-xs md:text-sm space-y-2 mt-4 list-none">
                  <li>• Built agent tools + chatbot. BERT model for classification.</li>
                  <li>• Maintained airbnb/visx (20k+ ⭐). React 18/19 migration.</li>
                  <li>• 2021 Hackathon Winner : 3D Earth.</li>
                </ul>
              </div>

              {/* Tableau */}
              <div
                className="border-4 border-[#FF6B35] bg-black/80 p-6"
                style={{
                  fontFamily: '"Press Start 2P", cursive',
                  color: '#FF6B35',
                  lineHeight: '1.8'
                }}
              >
                <div className="flex items-start gap-4 mb-3">
                  <img
                    src={tableauLogo}
                    alt="Tableau logo"
                    className="h-12 w-auto pixelated flex-shrink-0"
                    style={{
                      imageRendering: 'pixelated',
                      filter: 'drop-shadow(0 0 5px #FF6B35)'
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="text-lg md:text-xl mb-1">SOFTWARE ENGINEER</h3>
                    <p className="text-xs opacity-80">Tableau Software</p>
                    <p className="text-xs opacity-80">Seattle, USA and Vancouver, Canada • 2017-2020</p>
                  </div>
                </div>
                <ul className="text-xs md:text-sm space-y-2 mt-4 list-none">
                  <li>• Built Tableau Public (millions of users). Feature lead: hashtags, search, serverless image gen. Migrated to TS/React/Redux. Set up CI/CD. DX++</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Education Section */}
          <div>
            <h2
              className="text-3xl md:text-4xl font-bold mb-8"
              style={{
                fontFamily: '"Press Start 2P", cursive',
                color: '#FF6B35',
                textShadow: (isMobile || isSafari) ? '0 0 3px #FF6B35' : '0 0 10px #FF6B35',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale'
              }}
            >
              EDUCATION
            </h2>
            <div className="space-y-6">
              {/* Stanford */}
              <div
                className="border-4 border-[#FF6B35] bg-black/80 p-6"
                style={{
                  fontFamily: '"Press Start 2P", cursive',
                  color: '#FF6B35',
                  lineHeight: '1.8'
                }}
              >
                <div className="flex items-start gap-4">
                  <img
                    src={stanfordLogo}
                    alt="Stanford logo"
                    className="h-12 w-auto pixelated flex-shrink-0"
                    style={{
                      imageRendering: 'pixelated',
                      filter: 'drop-shadow(0 0 5px #FF6B35)'
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="text-lg md:text-xl mb-1">M.S. LEARNING, DESIGN, TECHNOLOGY</h3>
                    <p className="text-xs opacity-80">Stanford • Dec 2025 - Aug 2026</p>
                  </div>
                </div>
              </div>

              {/* McGill */}
              <div
                className="border-4 border-[#FF6B35] bg-black/80 p-6"
                style={{
                  fontFamily: '"Press Start 2P", cursive',
                  color: '#FF6B35',
                  lineHeight: '1.8'
                }}
              >
                <div className="flex items-start gap-4">
                  <img
                    src={mcgillLogo}
                    alt="McGill logo"
                    className="h-12 w-auto pixelated flex-shrink-0"
                    style={{
                      imageRendering: 'pixelated',
                      filter: 'drop-shadow(0 0 5px #FF6B35)'
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="text-lg md:text-xl mb-1">B.A. Computer Science, Music</h3>
                    <p className="text-xs opacity-80">McGill • Sep 2013 - Apr 2018</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
