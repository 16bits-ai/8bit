import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import beijingBg from '../assets/backgrounds/Beijing.jpg';
import stanfordBg from '../assets/backgrounds/Stanford.jpg';
import walkingGif from '../assets/characters/walking.gif';

type Level = {
  id: number;
  name: string;
  background: string;
  mission: string;
  year: string;
};

const levels: Level[] = [
  {
    id: 1,
    name: 'BEIJING',
    background: beijingBg,
    mission: 'I was born in Beijing, China',
    year: '1995'
  },
  {
    id: 2,
    name: 'STANFORD',
    background: stanfordBg,
    mission: 'Mastered computer science',
    year: '2015'
  }
];

const Game: React.FC = () => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [characterPosition, setCharacterPosition] = useState(0);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const levelCompleteTriggered = useRef(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setCharacterPosition((prev) => Math.min(prev + 3, 100));
      }
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setCharacterPosition((prev) => Math.max(prev - 3, 0));
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  // Reset level complete trigger when level changes
  useEffect(() => {
    levelCompleteTriggered.current = false;
    setShowLevelComplete(false);
  }, [currentLevel]);

  useEffect(() => {
    if (characterPosition >= 95 && !levelCompleteTriggered.current) {
      levelCompleteTriggered.current = true;
      setShowLevelComplete(true);
    }
  }, [characterPosition, currentLevel]);

  const handleNextLevel = () => {
    if (currentLevel < levels.length - 1) {
      setCurrentLevel((prev) => prev + 1);
      setCharacterPosition(0);
      setShowLevelComplete(false);
      levelCompleteTriggered.current = false;
    } else {
      setShowLevelComplete(false);
    }
  };

  const level = levels[currentLevel];
  
  // Safety check to prevent crash
  if (!level) {
    return null;
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <motion.div
        key={level.id}
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${level.background})`,
          backgroundRepeat: 'repeat-x',
          backgroundSize: 'auto 100%',
          backgroundPosition: `${-characterPosition * 2}% center`,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />

      <div className="absolute top-8 left-8 right-8 flex justify-between items-start z-20">
        <div
          className="border-4 border-[#00FF41] bg-black/80 px-6 py-3"
          style={{
            fontFamily: '"Press Start 2P", cursive',
            color: '#00FF41'
          }}
        >
          <div className="text-sm mb-2">LEVEL {level.id}</div>
          <div className="text-2xl">{level.name}</div>
          <div className="text-xs mt-2 text-[#00FF41]/70">{level.year}</div>
        </div>

        <div
          className="border-4 border-[#00FF41] bg-black/90 px-6 py-4 text-center"
          style={{
            fontFamily: '"Press Start 2P", cursive',
            color: '#00FF41'
          }}
        >
          <div className="text-xs mb-2">MISSION:</div>
          <div className="text-sm">{level.mission}</div>
        </div>

        <div
          className="border-4 border-[#00FF41] bg-black/80 px-6 py-3 text-right"
          style={{
            fontFamily: '"Press Start 2P", cursive',
            color: '#00FF41'
          }}
        >
          <div className="text-xs mb-2">PROGRESS</div>
          <div className="text-lg">{Math.round(characterPosition)}%</div>
        </div>
      </div>

      <div
        className="absolute bottom-24 transition-all duration-100 z-30"
        style={{
          left: `${Math.min(characterPosition, 80)}%`,
          transform: 'translateX(-50%)'
        }}
      >
        <img
          src={walkingGif}
          alt="Walking character"
          className="h-32 w-auto pixelated"
          style={{
            imageRendering: 'pixelated',
            filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.5))'
          }}
        />
      </div>

      <div className="absolute bottom-16 left-0 right-0 h-16 bg-gradient-to-t from-[#4a2c2a] to-transparent z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#4a2c2a] z-10 border-t-4 border-[#654321]" />

      <div
        className="absolute top-32 right-8 z-20 text-right"
        style={{
          fontFamily: '"Press Start 2P", cursive',
          color: '#00FF41',
          fontSize: '12px',
          textShadow: '0 0 10px #00FF41'
        }}
      >
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          USE ARROW KEYS OR A/D TO MOVE
        </motion.div>
      </div>

      <AnimatePresence>
        {showLevelComplete && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/80 z-40 cursor-pointer"
            onClick={handleNextLevel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="border-8 border-[#00FF41] bg-black px-12 py-8 text-center cursor-pointer hover:border-[#00FF88] transition-colors"
              style={{
                fontFamily: '"Press Start 2P", cursive',
                color: '#00FF41',
                boxShadow: '0 0 30px #00FF41'
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <div className="text-4xl mb-4">LEVEL COMPLETE!</div>
              {currentLevel < levels.length - 1 ? (
                <div className="text-xl">CLICK TO CONTINUE</div>
              ) : (
                <div className="text-xl">GAME COMPLETE!</div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {currentLevel === levels.length - 1 && characterPosition >= 95 && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-black/90 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div
            className="border-8 border-[#FFD700] bg-black px-16 py-12 text-center"
            style={{
              fontFamily: '"Press Start 2P", cursive',
              color: '#FFD700',
              boxShadow: '0 0 50px #FFD700'
            }}
          >
            <motion.div
              className="text-6xl mb-6"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              YOU WIN!
            </motion.div>
            <div className="text-2xl mb-4">CONGRATULATIONS</div>
            <div className="text-sm mt-6">JOURNEY COMPLETED</div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Game;
