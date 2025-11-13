import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import walkingGif from '../assets/characters/walking.gif';
import marioBlock from '../assets/items/mario-block.gif';
import brick from '../assets/items/brick.png';
import { levels, getAllEventImages, type Event } from '../data/levels';

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
  const keysPressed = useRef<Set<string>>(new Set());
  const movementIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Preload all event images
  useEffect(() => {
    const imagesToPreload = getAllEventImages();
    imagesToPreload.forEach((imageSrc) => {
      const img = new Image();
      img.src = imageSrc;
    });
  }, []);

  useEffect(() => {

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        setFacingDirection('right');
        keysPressed.current.add('right');
      }
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        setFacingDirection('left');
        keysPressed.current.add('left');
      }
      if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') && !isJumping) {
        e.preventDefault();
        setIsJumping(true);
        setTimeout(() => {
          setIsJumping(false);
        }, 600);
      }

      // Start continuous movement if not already running
      if (!movementIntervalRef.current && (keysPressed.current.has('left') || keysPressed.current.has('right'))) {
        movementIntervalRef.current = setInterval(() => {
          if (keysPressed.current.has('right')) {
            setCharacterPosition((prev) => Math.min(prev + 0.5, 100));
          }
          if (keysPressed.current.has('left')) {
            setCharacterPosition((prev) => Math.max(prev - 0.5, 0));
          }
        }, 16); // ~60fps for smooth movement
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysPressed.current.delete('right');
      }
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysPressed.current.delete('left');
      }

      // Stop movement interval if no movement keys are pressed
      if (movementIntervalRef.current && keysPressed.current.size === 0) {
        clearInterval(movementIntervalRef.current);
        movementIntervalRef.current = null;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (movementIntervalRef.current) {
        clearInterval(movementIntervalRef.current);
        movementIntervalRef.current = null;
      }
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
    // Clear movement state
    keysPressed.current.clear();
    if (movementIntervalRef.current) {
      clearInterval(movementIntervalRef.current);
      movementIntervalRef.current = null;
    }
  }, [currentLevel]);

  // Level complete when all blocks are discovered
  useEffect(() => {
    const currentLevelData = levels[currentLevel];
    if (!currentLevelData) return;
    
    const totalBlocks = currentLevelData.blocks.length;
    const discoveredBlocks = Array.from(hitBlocks).filter(
      (blockIndex) => Math.floor(blockIndex / 10) === currentLevel
    ).length;
    
    if (totalBlocks > 0 && discoveredBlocks === totalBlocks && !levelCompleteTriggered.current) {
      levelCompleteTriggered.current = true;
      setShowLevelComplete(true);
    }
  }, [hitBlocks, currentLevel]);

  // Check for block collisions
  useEffect(() => {
    if (!isJumping) return;
    
    const currentLevelData = levels[currentLevel];
    if (!currentLevelData) return;

    currentLevelData.blocks.forEach((block, index) => {
      const blockIndex = currentLevel * 10 + index; // Unique index across levels
      
      // Calculate viewport positions for collision detection
      // Character viewport position: characterPosition%
      // Block viewport position: block.position - characterPosition (1:1 movement)
      const characterViewportPos = characterPosition;
      const blockViewportPos = block.position - characterPosition;
      
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
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'auto 100%',
          backgroundPosition: `${characterPosition}% center`,
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
          <div className="text-xs mb-2">BLOCKS</div>
          <div className="text-lg">
            {(() => {
              const totalBlocks = level.blocks.length;
              const discoveredBlocks = Array.from(hitBlocks).filter(
                (blockIndex) => Math.floor(blockIndex / 10) === currentLevel
              ).length;
              const blocksLeft = totalBlocks - discoveredBlocks;
              return `${blocksLeft}/${totalBlocks} LEFT`;
            })()}
          </div>
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
        
        // Calculate block position - blocks are fixed in world coordinates and move with background
        // Background and character move 1:1, so block viewport position = world position - character position
        const blockViewportPosition = block.position - characterPosition;
        
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
              className="bg-white/95 backdrop-blur-md px-12 py-8 max-w-4xl max-h-[90vh] mx-4 cursor-pointer rounded-lg border-4 border-black shadow-2xl overflow-y-auto"
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
                <>
                  {currentEvent.content && (
                    <div className="text-sm leading-relaxed mb-4">{currentEvent.content}</div>
                  )}
                  {currentEvent.images && currentEvent.images.length > 0 && (
                    <div className={`grid gap-4 mb-4 ${currentEvent.images.length === 1 ? 'grid-cols-1' : currentEvent.images.length === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
                      {currentEvent.images.map((imageSrc, index) => (
                        <img 
                          key={index}
                          src={imageSrc} 
                          alt={`Event ${index + 1}`} 
                          className="max-w-full h-auto rounded border-2 border-black shadow-lg" 
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
              {currentEvent.type === 'image' && currentEvent.images && currentEvent.images.length > 0 && (
                <div>
                  <div className={`grid gap-4 mb-4 ${currentEvent.images.length === 1 ? 'grid-cols-1' : currentEvent.images.length === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
                    {currentEvent.images.map((imageSrc, index) => (
                      <img 
                        key={index}
                        src={imageSrc} 
                        alt={`Event ${index + 1}`} 
                        className="max-w-full h-auto rounded border-2 border-black shadow-lg" 
                      />
                    ))}
                  </div>
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

      {(() => {
        const isLastLevel = currentLevel === levels.length - 1;
        if (!isLastLevel) return false;
        const currentLevelData = levels[currentLevel];
        if (!currentLevelData) return false;
        const totalBlocks = currentLevelData.blocks.length;
        const discoveredBlocks = Array.from(hitBlocks).filter(
          (blockIndex) => Math.floor(blockIndex / 10) === currentLevel
        ).length;
        return totalBlocks > 0 && discoveredBlocks === totalBlocks;
      })() && (
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
