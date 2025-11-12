import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import beijingBg from '../assets/backgrounds/Beijing.jpg';
import stanfordBg from '../assets/backgrounds/Stanford.jpg';
import walkingGif from '../assets/characters/walking.gif';
import marioBlock from '../assets/items/mario-block.gif';
import brick from '../assets/items/brick.png';

type Event = {
  type: 'text' | 'image' | 'video';
  content: string;
  image?: string;
  video?: string;
};

type Block = {
  position: number; // characterPosition percentage
  event: Event;
};

type Level = {
  id: number;
  name: string;
  background: string;
  mission: string;
  year: string;
  blocks: Block[];
};

const levels: Level[] = [
  {
    id: 1,
    name: 'BEIJING',
    background: beijingBg,
    mission: 'I was born in Beijing, China',
    year: '1995',
    blocks: [
      {
        position: 60,
        event: {
          type: 'text',
          content: 'Welcome to Beijing! This is where my journey began.'
        }
      },
      {
        position: 180,
        event: {
          type: 'text',
          content: 'Growing up in Beijing shaped my perspective on technology and innovation.'
        }
      }
    ]
  },
  {
    id: 2,
    name: 'STANFORD',
    background: stanfordBg,
    mission: 'Mastered computer science',
    year: '2015',
    blocks: [
      {
        position: 35,
        event: {
          type: 'text',
          content: 'Stanford University - where I deepened my understanding of computer science.'
        }
      },
      {
        position: 75,
        event: {
          type: 'text',
          content: 'The knowledge gained here became the foundation of my career.'
        }
      }
    ]
  }
];

const Game: React.FC = () => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [characterPosition, setCharacterPosition] = useState(0);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [facingDirection, setFacingDirection] = useState<'left' | 'right'>('right');
  const [hitBlocks, setHitBlocks] = useState<Set<number>>(new Set());
  const [showEventModal, setShowEventModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const levelCompleteTriggered = useRef(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setFacingDirection('right');
        setCharacterPosition((prev) => Math.min(prev + 3, 100));
      }
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setFacingDirection('left');
        setCharacterPosition((prev) => Math.max(prev - 3, 0));
      }
      if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') && !isJumping) {
        setIsJumping(true);
        setTimeout(() => {
          setIsJumping(false);
        }, 600);
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isJumping]);

  // Reset level complete trigger when level changes
  useEffect(() => {
    levelCompleteTriggered.current = false;
    setShowLevelComplete(false);
    setIsJumping(false);
    setFacingDirection('right');
    setHitBlocks(new Set());
    setShowEventModal(false);
    setCurrentEvent(null);
  }, [currentLevel]);

  useEffect(() => {
    if (characterPosition >= 95 && !levelCompleteTriggered.current) {
      levelCompleteTriggered.current = true;
      setShowLevelComplete(true);
    }
  }, [characterPosition, currentLevel]);

  // Check for block collisions
  useEffect(() => {
    if (!isJumping) return;
    
    const currentLevelData = levels[currentLevel];
    if (!currentLevelData) return;

    currentLevelData.blocks.forEach((block, index) => {
      const blockIndex = currentLevel * 10 + index; // Unique index across levels
      
      // Calculate viewport positions for collision detection
      // Character viewport position: characterPosition%
      // Block viewport position: block.position - (characterPosition * 2)%
      const characterViewportPos = characterPosition;
      const blockViewportPos = block.position - (characterPosition * 2);
      
      // Check if character is near block position and jumping (in viewport coordinates)
      const distance = Math.abs(characterViewportPos - blockViewportPos);
      if (distance <= 5 && !hitBlocks.has(blockIndex)) {
        setHitBlocks((prev) => new Set(prev).add(blockIndex));
        setCurrentEvent(block.event);
        setShowEventModal(true);
      }
    });
  }, [isJumping, characterPosition, currentLevel, hitBlocks]);

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

  const handleCloseEventModal = () => {
    setShowEventModal(false);
    setCurrentEvent(null);
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
          className="px-6 py-3 bg-black/30 backdrop-blur-sm rounded"
          style={{
            fontFamily: '"Press Start 2P", cursive',
            color: '#FFFFFF',
            textShadow: '2px 2px 0px #000000, -2px -2px 0px #000000, 2px -2px 0px #000000, -2px 2px 0px #000000'
          }}
        >
          <div className="text-sm mb-2">LEVEL {level.id}</div>
          <div className="text-2xl">{level.name}</div>
          <div className="text-xs mt-2 opacity-80">{level.year}</div>
        </div>

        <div
          className="px-6 py-4 text-center bg-black/30 backdrop-blur-sm rounded"
          style={{
            fontFamily: '"Press Start 2P", cursive',
            color: '#FFFFFF',
            textShadow: '2px 2px 0px #000000, -2px -2px 0px #000000, 2px -2px 0px #000000, -2px 2px 0px #000000'
          }}
        >
          <div className="text-xs mb-2">MISSION:</div>
          <div className="text-sm">{level.mission}</div>
        </div>

        <div
          className="px-6 py-3 text-right bg-black/30 backdrop-blur-sm rounded"
          style={{
            fontFamily: '"Press Start 2P", cursive',
            color: '#FFFFFF',
            textShadow: '2px 2px 0px #000000, -2px -2px 0px #000000, 2px -2px 0px #000000, -2px 2px 0px #000000'
          }}
        >
          <div className="text-xs mb-2">PROGRESS</div>
          <div className="text-lg">{Math.round(characterPosition)}%</div>
        </div>
      </div>

      <motion.div
        className="absolute bottom-24 z-30"
        style={{
          left: `${Math.min(characterPosition, 80)}%`,
        }}
        animate={{
          y: isJumping ? -80 : 0,
          x: '-50%',
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30,
        }}
      >
        <img
          src={walkingGif}
          alt="Walking character"
          className="h-32 w-auto pixelated"
          style={{
            imageRendering: 'pixelated',
            filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.5))',
            transform: facingDirection === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
          }}
        />
      </motion.div>

      {/* Render blocks */}
      {level.blocks.map((block, index) => {
        const blockIndex = currentLevel * 10 + index;
        const isHit = hitBlocks.has(blockIndex);
        
        // Calculate block position accounting for background parallax
        // Background moves at -characterPosition * 2%, so blocks should move at the same rate
        // Block's viewport position = world position - parallax offset
        const blockViewportPosition = block.position - (characterPosition * 2);
        
        return (
          <div
            key={`block-${currentLevel}-${index}`}
            className="absolute z-25"
            style={{
              left: `${blockViewportPosition}%`,
              bottom: '200px', // Higher up, requires jumping to reach
              transform: 'translateX(-50%)'
            }}
          >
            <img
              src={isHit ? brick : marioBlock}
              alt={isHit ? 'Brick block' : 'Mario block'}
              className="h-16 w-16 pixelated"
              style={{
                imageRendering: 'pixelated',
                filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.5))'
              }}
            />
          </div>
        );
      })}

      <div className="absolute bottom-16 left-0 right-0 h-16 bg-gradient-to-t from-[#4a2c2a] to-transparent z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#4a2c2a] z-10 border-t-4 border-[#654321]" />

      <div
        className="absolute top-32 right-8 z-20 text-right bg-black/30 backdrop-blur-sm rounded px-4 py-2"
        style={{
          fontFamily: '"Press Start 2P", cursive',
          color: '#FFFFFF',
          fontSize: '12px',
          textShadow: '2px 2px 0px #000000, -2px -2px 0px #000000, 2px -2px 0px #000000, -2px 2px 0px #000000'
        }}
      >
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          USE ARROW KEYS OR WASD TO MOVE/JUMP
        </motion.div>
      </div>

      <AnimatePresence>
        {showEventModal && currentEvent && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/60 z-50 cursor-pointer"
            onClick={handleCloseEventModal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white/95 backdrop-blur-md px-12 py-8 max-w-2xl mx-4 cursor-pointer rounded-lg border-4 border-black shadow-2xl"
              style={{
                fontFamily: '"Press Start 2P", cursive',
                color: '#000000',
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
            >
              {currentEvent.type === 'text' && (
                <div className="text-sm leading-relaxed mb-4">{currentEvent.content}</div>
              )}
              {currentEvent.type === 'image' && currentEvent.image && (
                <div>
                  <img src={currentEvent.image} alt="Event" className="max-w-full h-auto mb-4 rounded" />
                  {currentEvent.content && (
                    <div className="text-sm leading-relaxed">{currentEvent.content}</div>
                  )}
                </div>
              )}
              {currentEvent.type === 'video' && currentEvent.video && (
                <div>
                  <video src={currentEvent.video} controls className="max-w-full mb-4 rounded" />
                  {currentEvent.content && (
                    <div className="text-sm leading-relaxed">{currentEvent.content}</div>
                  )}
                </div>
              )}
              <div 
                className="text-xs mt-4 opacity-70 cursor-pointer hover:opacity-100 transition-opacity"
                onClick={handleCloseEventModal}
              >
                CLICK TO CLOSE
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLevelComplete && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/60 z-40 cursor-pointer"
            onClick={handleNextLevel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white/95 backdrop-blur-md px-12 py-8 text-center cursor-pointer rounded-lg border-4 border-black shadow-2xl hover:scale-105 transition-transform"
              style={{
                fontFamily: '"Press Start 2P", cursive',
                color: '#000000',
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
          className="absolute inset-0 flex items-center justify-center bg-black/70 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div
            className="bg-yellow-400/95 backdrop-blur-md px-16 py-12 text-center rounded-lg border-4 border-black shadow-2xl"
            style={{
              fontFamily: '"Press Start 2P", cursive',
              color: '#000000',
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
