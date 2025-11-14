import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ParallaxBackground from '../components/ParallaxBackground';
import { motion } from 'framer-motion';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <ParallaxBackground color="#00FF41" variant="grid" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-center"
        >
          <motion.h1
            className="text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-bold mb-4 md:mb-6 tracking-wider"
            style={{
              fontFamily: '"Press Start 2P", cursive',
              textShadow: '0 0 10px #00FF41, 0 0 20px #00FF41, 0 0 30px #00FF41',
              color: '#00FF41'
            }}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.5,
              type: 'spring',
              stiffness: 200
            }}
          >
            PLAYER 1
          </motion.h1>

          <motion.p
            className="text-sm sm:text-base md:text-xl lg:text-2xl mb-6 md:mb-8 tracking-wide"
            style={{
              fontFamily: '"Press Start 2P", cursive',
              color: '#00FF41',
              textShadow: '0 0 5px #00FF41'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            START YOUR ADVENTURE
          </motion.p>

          {isMobile ? (
            <motion.div
              className="px-4 py-6 border-4 border-[#00FF41] bg-black/80 backdrop-blur-sm max-w-md mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              <motion.p
                className="text-xs sm:text-sm text-center leading-relaxed"
                style={{
                  fontFamily: '"Press Start 2P", cursive',
                  color: '#00FF41',
                  textShadow: '0 0 5px #00FF41',
                  lineHeight: '1.8'
                }}
              >
                THIS GAME REQUIRES A COMPUTER TO PLAY. PLEASE USE A DESKTOP OR LAPTOP TO START YOUR ADVENTURE.
              </motion.p>
            </motion.div>
          ) : (
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              <motion.button
                className="px-8 py-4 border-4 border-[#00FF41] bg-black text-[#00FF41] font-bold text-lg tracking-wider"
                style={{ fontFamily: '"Press Start 2P", cursive' }}
                whileHover={{
                  scale: 1.05,
                  backgroundColor: '#00FF41',
                  color: '#000000',
                  boxShadow: '0 0 20px #00FF41'
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  localStorage.removeItem('gameCurrentLevel');
                  navigate('/game');
                }}
              >
                PRESS START
              </motion.button>

              <motion.button
                className="px-8 py-4 border-4 border-[#00FF41] bg-transparent text-[#00FF41] font-bold text-lg tracking-wider"
                style={{ fontFamily: '"Press Start 2P", cursive' }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 0 20px #00FF41'
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/game')}
              >
                CONTINUE
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {!isMobile && (
          <motion.div
            className="absolute bottom-32 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.5 }}
            style={{
              fontFamily: '"Press Start 2P", cursive',
              color: '#00FF41',
              fontSize: '14px'
            }}
          >
            MOVE MOUSE TO EXPLORE
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Home;
