import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';
import walkingGif from '../assets/characters/walking.gif';
import marioBlock from '../assets/items/mario-block.gif';
import brick from '../assets/items/brick.png';
import { levels, getAllEventImages, type Event } from '../data/levels';

const Game: React.FC = () => {
  // Load saved level from localStorage on mount, or start at 0
  const [currentLevel, setCurrentLevel] = useState(() => {
    const savedLevel = localStorage.getItem('gameCurrentLevel');
    if (savedLevel) {
      const level = parseInt(savedLevel, 10);
      // Ensure the saved level is valid (within bounds)
      if (level >= 0 && level < levels.length) {
        return level;
      }
    }
    return 0;
  });
  const [characterPosition, setCharacterPosition] = useState(0);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [facingDirection, setFacingDirection] = useState<'left' | 'right'>('right');
  const [hitBlocks, setHitBlocks] = useState<Set<number>>(new Set());
  const [hitNPCs, setHitNPCs] = useState<Set<number>>(new Set());
  const [showEventModal, setShowEventModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const levelCompleteTriggered = useRef(false);
  const keysPressed = useRef<Set<string>>(new Set());
  const movementIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const characterPositionRef = useRef(characterPosition);
  const currentLevelRef = useRef(currentLevel);
  const [bouncingBlocks, setBouncingBlocks] = useState<Set<number>>(new Set());

  // Helper function to check if a file is a video
  const isVideoFile = (src: string): boolean => {
    const videoExtensions = ['.mp4', '.mov', '.webm', '.avi', '.mkv'];
    return videoExtensions.some(ext => src.toLowerCase().endsWith(ext));
  };

  // Detect mobile/tablet devices
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isIPad = /ipad/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const isMobileDevice = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth < 1024;
      
      // Consider it mobile if it's a touch device (iPad, mobile) OR small screen
      setIsMobile(isIPad || isMobileDevice || (isTouchDevice && isSmallScreen));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Preload all event images and videos
  useEffect(() => {
    const mediaToPreload = getAllEventImages();
    mediaToPreload.forEach((mediaSrc) => {
      if (isVideoFile(mediaSrc)) {
        const video = document.createElement('video');
        video.src = mediaSrc;
        video.preload = 'auto';
      } else {
        const img = new Image();
        img.src = mediaSrc;
      }
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
        // Check if under block using current values from refs
        const currentLevelData = levels[currentLevelRef.current];
        const isUnderBlock = currentLevelData ? currentLevelData.blocks.some((block) => {
          const characterViewportPos = characterPositionRef.current;
          const blockViewportPos = block.position - characterPositionRef.current;
          const distance = Math.abs(characterViewportPos - blockViewportPos);
          return distance <= 5;
        }) : false;
        const jumpDuration = isUnderBlock ? 300 : 600;
        setTimeout(() => {
          setIsJumping(false);
        }, jumpDuration);
      }

      // Start continuous movement if not already running
      if (!movementIntervalRef.current && (keysPressed.current.has('left') || keysPressed.current.has('right'))) {
        movementIntervalRef.current = setInterval(() => {
          if (keysPressed.current.has('right')) {
            setCharacterPosition((prev) => {
              const newPos = Math.min(prev + 0.5, 100);
              characterPositionRef.current = newPos;
              return newPos;
            });
          }
          if (keysPressed.current.has('left')) {
            setCharacterPosition((prev) => {
              const newPos = Math.max(prev - 0.5, 0);
              characterPositionRef.current = newPos;
              return newPos;
            });
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

  // Save current level to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('gameCurrentLevel', currentLevel.toString());
  }, [currentLevel]);

  // Reset level complete trigger when level changes
  useEffect(() => {
    levelCompleteTriggered.current = false;
    setShowLevelComplete(false);
    setIsJumping(false);
    setFacingDirection('right');
    setHitBlocks(new Set());
    setHitNPCs(new Set());
    setBouncingBlocks(new Set());
    setShowEventModal(false);
    setCurrentEvent(null);
    setCharacterPosition(0);
    characterPositionRef.current = 0;
    currentLevelRef.current = currentLevel;
    // Clear movement state
    keysPressed.current.clear();
    if (movementIntervalRef.current) {
      clearInterval(movementIntervalRef.current);
      movementIntervalRef.current = null;
    }
  }, [currentLevel]);

  // Play background music for the current level
  useEffect(() => {
    const currentLevelData = levels[currentLevel];
    if (!currentLevelData || !currentLevelData.audio) return;

    // Stop previous audio if it exists
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Create and play new audio
    const audio = new Audio(currentLevelData.audio);
    audio.loop = true;
    audio.volume = 0.5; // Set volume to 50%
    audioRef.current = audio;

    // Play audio (with error handling for autoplay restrictions)
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        // Autoplay was prevented, user interaction required
        console.log('Audio autoplay prevented:', error);
      });
    }

    // Cleanup on unmount or level change
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
    };
  }, [currentLevel]);

  // Level complete when all blocks and NPCs with events are discovered
  useEffect(() => {
    const currentLevelData = levels[currentLevel];
    if (!currentLevelData) return;
    
    const totalBlocks = currentLevelData.blocks.length;
    const discoveredBlocks = Array.from(hitBlocks).filter(
      (blockIndex) => Math.floor(blockIndex / 100) === currentLevel
    ).length;
    
    const npcsWithEvents = currentLevelData.npcs?.filter(npc => npc.event) || [];
    const totalNPCs = npcsWithEvents.length;
    const discoveredNPCs = Array.from(hitNPCs).filter(
      (npcIndex) => Math.floor(npcIndex / 100) === currentLevel
    ).length;
    
    const totalRequirements = totalBlocks + totalNPCs;
    const discoveredRequirements = discoveredBlocks + discoveredNPCs;
    
    if (totalRequirements > 0 && discoveredRequirements === totalRequirements && !levelCompleteTriggered.current) {
      levelCompleteTriggered.current = true;
      setShowLevelComplete(true);
      
      // If this is the last level and game is complete, clear saved progress
      if (currentLevel === levels.length - 1) {
        localStorage.removeItem('gameCurrentLevel');
      }
    }
  }, [hitBlocks, hitNPCs, currentLevel]);

  // Helper function to check if character is under a block
  const checkIsUnderBlock = (): boolean => {
    const currentLevelData = levels[currentLevel];
    if (!currentLevelData) return false;

    // Check if character is horizontally aligned with any block
    return currentLevelData.blocks.some((block) => {
      const characterViewportPos = characterPosition;
      const blockViewportPos = block.position - characterPosition;
      const distance = Math.abs(characterViewportPos - blockViewportPos);
      // Character is under block if horizontally aligned (within 5% distance)
      return distance <= 5;
    });
  };

  // Check for block collisions
  useEffect(() => {
    if (!isJumping) return;
    
    const currentLevelData = levels[currentLevel];
    if (!currentLevelData) return;

    currentLevelData.blocks.forEach((block, index) => {
      const blockIndex = currentLevel * 100 + index; // Unique index across levels
      
      // Calculate viewport positions for collision detection
      // Character viewport position: characterPosition%
      // Block viewport position: block.position - characterPosition (1:1 movement)
      const characterViewportPos = characterPosition;
      const blockViewportPos = block.position - characterPosition;
      
      // Check if character is near block position and jumping (in viewport coordinates)
      const distance = Math.abs(characterViewportPos - blockViewportPos);
      if (distance <= 5 && !hitBlocks.has(blockIndex)) {
        // Check if under block to determine jump duration
        const isUnderBlock = currentLevelData.blocks.some((b) => {
          const charPos = characterPosition;
          const blockPos = b.position - characterPosition;
          return Math.abs(charPos - blockPos) <= 5;
        });
        const jumpDuration = isUnderBlock ? 300 : 600;
        // Peak of jump is approximately at 40-50% of jump duration
        const peakDelay = jumpDuration * 0.45;
        const bounceDuration = 450; // 0.4 seconds
        const bouncePeakTime = bounceDuration * 0.3; // Peak is at 30% of bounce duration (fast ascending)
        
        // Trigger block bounce animation when Mario reaches peak of jump
        setTimeout(() => {
          setBouncingBlocks((prev) => new Set(prev).add(blockIndex));
          setTimeout(() => {
            setBouncingBlocks((prev) => {
              const newSet = new Set(prev);
              newSet.delete(blockIndex);
              return newSet;
            });
          }, bounceDuration);
          
          // Change to brick when bounce reaches its peak (top)
          setTimeout(() => {
            setHitBlocks((prev) => new Set(prev).add(blockIndex));
          }, bouncePeakTime);
        }, peakDelay);
        setCurrentEvent(block.event);
        setCurrentImageIndex(0);
        setShowEventModal(true);
      }
    });
  }, [isJumping, characterPosition, currentLevel, hitBlocks]);

  // Check for NPC collisions (triggers when character gets close, no jump required)
  useEffect(() => {
    const currentLevelData = levels[currentLevel];
    if (!currentLevelData || !currentLevelData.npcs) return;

    currentLevelData.npcs.forEach((npc, index) => {
      // Only check NPCs that have events
      if (!npc.event) return;
      
      const npcIndex = currentLevel * 100 + index; // Unique index across levels
      
      // Calculate viewport positions for collision detection
      const characterViewportPos = characterPosition;
      const npcViewportPos = npc.position - characterPosition;
      
      // Check if character is close to NPC (in viewport coordinates)
      // Using a slightly larger distance than blocks since NPCs are on the ground
      const distance = Math.abs(characterViewportPos - npcViewportPos);
      if (distance <= 8 && !hitNPCs.has(npcIndex)) {
        setHitNPCs((prev) => new Set(prev).add(npcIndex));
        setCurrentEvent(npc.event);
        setCurrentImageIndex(0);
        setShowEventModal(true);
      }
    });
  }, [characterPosition, currentLevel, hitNPCs]);

  const handleNextLevel = () => {
    if (currentLevel < levels.length - 1) {
      setCurrentLevel((prev) => {
        const newLevel = prev + 1;
        currentLevelRef.current = newLevel;
        return newLevel;
      });
      setCharacterPosition(0);
      characterPositionRef.current = 0;
      setShowLevelComplete(false);
      levelCompleteTriggered.current = false;
    } else {
      // Game completed - clear saved progress
      localStorage.removeItem('gameCurrentLevel');
      setShowLevelComplete(false);
    }
  };

  const handleCloseEventModal = () => {
    setShowEventModal(false);
    setCurrentEvent(null);
    setCurrentImageIndex(0);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentEvent?.images && currentEvent.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % currentEvent.images!.length);
    }
  };

  // Mobile button handlers
  const handleMoveLeft = () => {
    setFacingDirection('left');
    if (!keysPressed.current.has('left')) {
      keysPressed.current.add('left');
      if (!movementIntervalRef.current) {
        movementIntervalRef.current = setInterval(() => {
          if (keysPressed.current.has('right')) {
            setCharacterPosition((prev) => {
              const newPos = Math.min(prev + 0.5, 100);
              characterPositionRef.current = newPos;
              return newPos;
            });
          }
          if (keysPressed.current.has('left')) {
            setCharacterPosition((prev) => {
              const newPos = Math.max(prev - 0.5, 0);
              characterPositionRef.current = newPos;
              return newPos;
            });
          }
        }, 16);
      }
    }
  };

  const handleMoveRight = () => {
    setFacingDirection('right');
    if (!keysPressed.current.has('right')) {
      keysPressed.current.add('right');
      if (!movementIntervalRef.current) {
        movementIntervalRef.current = setInterval(() => {
          if (keysPressed.current.has('right')) {
            setCharacterPosition((prev) => {
              const newPos = Math.min(prev + 0.5, 100);
              characterPositionRef.current = newPos;
              return newPos;
            });
          }
          if (keysPressed.current.has('left')) {
            setCharacterPosition((prev) => {
              const newPos = Math.max(prev - 0.5, 0);
              characterPositionRef.current = newPos;
              return newPos;
            });
          }
        }, 16);
      }
    }
  };

  const handleStopLeft = () => {
    keysPressed.current.delete('left');
    if (keysPressed.current.size === 0 && movementIntervalRef.current) {
      clearInterval(movementIntervalRef.current);
      movementIntervalRef.current = null;
    }
  };

  const handleStopRight = () => {
    keysPressed.current.delete('right');
    if (keysPressed.current.size === 0 && movementIntervalRef.current) {
      clearInterval(movementIntervalRef.current);
      movementIntervalRef.current = null;
    }
  };

  const handleJump = () => {
    if (!isJumping) {
      setIsJumping(true);
      // Check if under block using current values from refs
      const currentLevelData = levels[currentLevelRef.current];
      const isUnderBlock = currentLevelData ? currentLevelData.blocks.some((block) => {
        const characterViewportPos = characterPositionRef.current;
        const blockViewportPos = block.position - characterPositionRef.current;
        const distance = Math.abs(characterViewportPos - blockViewportPos);
        return distance <= 5;
      }) : false;
      const jumpDuration = isUnderBlock ? 300 : 600;
      setTimeout(() => {
        setIsJumping(false);
      }, jumpDuration);
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
          <div className="text-xs mb-2">MISSING EVENTS</div>
          <div className="text-lg">
            {(() => {
              const totalBlocks = level.blocks.length;
              const discoveredBlocks = Array.from(hitBlocks).filter(
                (blockIndex) => Math.floor(blockIndex / 100) === currentLevel
              ).length;
              const npcsWithEvents = level.npcs?.filter(npc => npc.event) || [];
              const totalNPCs = npcsWithEvents.length;
              const discoveredNPCs = Array.from(hitNPCs).filter(
                (npcIndex) => Math.floor(npcIndex / 100) === currentLevel
              ).length;
              const totalRequirements = totalBlocks + totalNPCs;
              const discoveredRequirements = discoveredBlocks + discoveredNPCs;
              const requirementsLeft = totalRequirements - discoveredRequirements;
              return `${requirementsLeft}/${totalRequirements} LEFT`;
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
          y: isJumping ? (checkIsUnderBlock() ? -38 : -80) : 0,
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
        const blockIndex = currentLevel * 100 + index;
        const isHit = hitBlocks.has(blockIndex);
        const isBouncing = bouncingBlocks.has(blockIndex);
        
        // Calculate block position - blocks are fixed in world coordinates and move with background
        // Background and character move 1:1, so block viewport position = world position - character position
        const blockViewportPosition = block.position - characterPosition;
        
        return (
          <motion.div
            key={`block-${currentLevel}-${index}`}
            className="absolute z-25"
            style={{
              left: `${blockViewportPosition}%`,
              bottom: '200px', // Higher up, requires jumping to reach
              transform: 'translateX(-50%)'
            }}
            animate={{
              y: isBouncing ? [0, -20, 0] : 0,
            }}
            transition={{
              duration: 0.45,
              times: [0, 0.3, 1], // Fast ascending (30% of time to reach peak), slow descending (70% of time to return)
              ease: ['easeOut', 'easeIn'],
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
          </motion.div>
        );
      })}

      {/* Render NPCs */}
      {level.npcs && level.npcs.map((npc, index) => {
        // Calculate NPC viewport position - NPCs are fixed in world coordinates and move with background
        const npcViewportPosition = npc.position - characterPosition;
        
        return (
          <div
            key={`npc-${currentLevel}-${index}`}
            className="absolute bottom-24 z-30"
            style={{
              left: `${npcViewportPosition}%`,
              transform: 'translateX(-50%)'
            }}
          >
            <img
              src={npc.sprite}
              alt={`NPC ${index + 1}`}
              className={`${npc.size || 'h-32'} w-auto pixelated`}
              style={{
                imageRendering: 'pixelated',
                filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.5))',
                transform: (npc.facing || 'right') === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
              }}
            />
          </div>
        );
      })}

      <div className="absolute bottom-16 left-0 right-0 h-16 bg-gradient-to-t from-[#4a2c2a] to-transparent z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#4a2c2a] z-10 border-t-4 border-[#654321]" />

      {isMobile ? (
        <div className="absolute top-40 left-4 right-4 z-30 flex items-start justify-between pointer-events-none">
          {/* Left/Right Movement Buttons */}
          <div className="flex gap-4 pointer-events-auto">
            <motion.button
              onTouchStart={handleMoveLeft}
              onTouchEnd={handleStopLeft}
              onMouseDown={handleMoveLeft}
              onMouseUp={handleStopLeft}
              onMouseLeave={handleStopLeft}
              className="p-5 bg-black/70 backdrop-blur-sm rounded-full border-4 border-white/90 active:bg-black/90 touch-manipulation"
              whileTap={{ scale: 0.9 }}
              style={{
                fontFamily: '"Press Start 2P", cursive',
                color: '#FFFFFF',
                textShadow: '2px 2px 0px #000000',
                WebkitTapHighlightColor: 'transparent'
              }}
            >
              <ArrowLeft size={36} />
            </motion.button>
            <motion.button
              onTouchStart={handleMoveRight}
              onTouchEnd={handleStopRight}
              onMouseDown={handleMoveRight}
              onMouseUp={handleStopRight}
              onMouseLeave={handleStopRight}
              className="p-5 bg-black/70 backdrop-blur-sm rounded-full border-4 border-white/90 active:bg-black/90 touch-manipulation"
              whileTap={{ scale: 0.9 }}
              style={{
                fontFamily: '"Press Start 2P", cursive',
                color: '#FFFFFF',
                textShadow: '2px 2px 0px #000000',
                WebkitTapHighlightColor: 'transparent'
              }}
            >
              <ArrowRight size={36} />
            </motion.button>
          </div>

          {/* Jump Button */}
          <motion.button
            onTouchStart={handleJump}
            onMouseDown={handleJump}
            className="p-5 bg-black/70 backdrop-blur-sm rounded-full border-4 border-white/90 active:bg-black/90 pointer-events-auto touch-manipulation"
            whileTap={{ scale: 0.9 }}
            style={{
              fontFamily: '"Press Start 2P", cursive',
              color: '#FFFFFF',
              textShadow: '2px 2px 0px #000000',
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            <ArrowUp size={36} />
          </motion.button>
        </div>
      ) : (
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
            USE ARROW KEYS TO MOVE/JUMP
          </motion.div>
        </div>
      )}

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
                    <div className="mb-4 relative">
                      {currentEvent.images.length > 1 ? (
                        <>
                          {isVideoFile(currentEvent.images[currentImageIndex]) ? (
                            <motion.video
                              key={currentImageIndex}
                              src={currentEvent.images[currentImageIndex]}
                              controls
                              className="max-w-full h-auto rounded border-2 border-black shadow-lg cursor-pointer mx-auto"
                              onClick={handleNextImage}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                            />
                          ) : (
                            <motion.img 
                              key={currentImageIndex}
                              src={currentEvent.images[currentImageIndex]} 
                              alt={`Event ${currentImageIndex + 1}`} 
                              className="max-w-full h-auto rounded border-2 border-black shadow-lg cursor-pointer mx-auto" 
                              onClick={handleNextImage}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                            />
                          )}
                          <div className="text-xs mt-2 text-center opacity-70">
                            {currentImageIndex + 1} / {currentEvent.images.length} - CLICK TO NEXT
                          </div>
                        </>
                      ) : (
                        <>
                          {isVideoFile(currentEvent.images[0]) ? (
                            <video 
                              src={currentEvent.images[0]} 
                              controls
                              className="max-w-full h-auto rounded border-2 border-black shadow-lg mx-auto" 
                            />
                          ) : (
                            <img 
                              src={currentEvent.images[0]} 
                              alt="Event" 
                              className="max-w-full h-auto rounded border-2 border-black shadow-lg mx-auto" 
                            />
                          )}
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
              {currentEvent.type === 'image' && currentEvent.images && currentEvent.images.length > 0 && (
                <div>
                  <div className="mb-4 relative">
                    {currentEvent.images.length > 1 ? (
                      <>
                        {isVideoFile(currentEvent.images[currentImageIndex]) ? (
                          <motion.video
                            key={currentImageIndex}
                            src={currentEvent.images[currentImageIndex]}
                            controls
                            className="max-w-full h-auto rounded border-2 border-black shadow-lg cursor-pointer mx-auto"
                            onClick={handleNextImage}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          />
                        ) : (
                          <motion.img 
                            key={currentImageIndex}
                            src={currentEvent.images[currentImageIndex]} 
                            alt={`Event ${currentImageIndex + 1}`} 
                            className="max-w-full h-auto rounded border-2 border-black shadow-lg cursor-pointer mx-auto" 
                            onClick={handleNextImage}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          />
                        )}
                        <div className="text-xs mt-2 text-center opacity-70">
                          {currentImageIndex + 1} / {currentEvent.images.length} - CLICK TO NEXT
                        </div>
                      </>
                    ) : (
                      <>
                        {isVideoFile(currentEvent.images[0]) ? (
                          <video 
                            src={currentEvent.images[0]} 
                            controls
                            className="max-w-full h-auto rounded border-2 border-black shadow-lg mx-auto" 
                          />
                        ) : (
                          <img 
                            src={currentEvent.images[0]} 
                            alt="Event" 
                            className="max-w-full h-auto rounded border-2 border-black shadow-lg mx-auto" 
                          />
                        )}
                      </>
                    )}
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
          (blockIndex) => Math.floor(blockIndex / 100) === currentLevel
        ).length;
        const npcsWithEvents = currentLevelData.npcs?.filter(npc => npc.event) || [];
        const totalNPCs = npcsWithEvents.length;
        const discoveredNPCs = Array.from(hitNPCs).filter(
          (npcIndex) => Math.floor(npcIndex / 100) === currentLevel
        ).length;
        const totalRequirements = totalBlocks + totalNPCs;
        const discoveredRequirements = discoveredBlocks + discoveredNPCs;
        return totalRequirements > 0 && discoveredRequirements === totalRequirements;
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
