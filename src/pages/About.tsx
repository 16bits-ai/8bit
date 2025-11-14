import React from 'react';
import ParallaxBackground from '../components/ParallaxBackground';
import airbnbLogo from '../assets/projects/Airbnb.png';
import mcgillLogo from '../assets/projects/McGill.png';
import tableauLogo from '../assets/projects/Tableau.png';
import stanfordLogo from '../assets/projects/Stanford.png';
import presenceLogo from '../assets/projects/Presence.png';

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

        <div className="max-w-4xl mx-auto space-y-12">
          {/* Experience Section */}
          <div>
            <h2
              className="text-3xl md:text-4xl font-bold mb-8"
              style={{
                fontFamily: '"Press Start 2P", cursive',
                color: '#FF6B35',
                textShadow: '0 0 10px #FF6B35'
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
                textShadow: '0 0 10px #FF6B35'
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
                    <p className="text-xs opacity-80">Stanford • Dec 2024 - Apr 2026</p>
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
                    <h3 className="text-lg md:text-xl mb-1">B.A. CS + MUSIC THEORY</h3>
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
