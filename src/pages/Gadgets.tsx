import React, { useState, useEffect, useRef } from 'react';
import ParallaxBackground from '../components/ParallaxBackground';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Calculator from '../assets/gadgets/Calculator.png';
import Camera from '../assets/gadgets/Camera.png';
import Keyboard from '../assets/gadgets/Keyboard.png';
import Soda from '../assets/gadgets/Soda.png';
import OpenSource from '../assets/gadgets/OpenSource.png';
import Computer from '../assets/gadgets/Computer.png';

// Placeholder data structure for gadgets
// You can replace these with actual image paths when you generate them
type Gadget = {
  id: number;
  name: string;
  image: string;
  description: string;
};

const Gadgets: React.FC = () => {
  const [selectedGadget, setSelectedGadget] = useState<Gadget | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const themeColor = '#9B59B6'; // Purple to match dock icon

  // Placeholder gadgets - replace with your actual images
  const gadgets: Gadget[] = [
    { id: 6, name: 'Computer', image: Computer, description: 'I love to code' },
    { id: 3, name: 'Keyboard', image: Keyboard, description: 'I love to play music' },

    { id: 1, name: 'Calculator', image: Calculator, description: 'I use this calculator to do a lot of math.' },
    { id: 2, name: 'Camera', image: Camera, description: 'I enjoy doing photography.' },
    { id: 4, name: 'Blue Soda Can', image: Soda, description: 'I love to make all sorts of drinks' },
    { id: 5, name: 'Open Source', image: OpenSource, description: 'I love to contribute to open source projects' },
  ];


  useEffect(() => {
    // Set first gadget as selected by default
    if (gadgets.length > 0 && !selectedGadget) {
      setSelectedGadget(gadgets[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Navigation functions for mobile
  const goToPrevious = () => {
    if (!selectedGadget) return;
    const currentIndex = gadgets.findIndex(g => g.id === selectedGadget.id);
    const previousIndex = currentIndex > 0 ? currentIndex - 1 : gadgets.length - 1;
    setSelectedGadget(gadgets[previousIndex]);
  };

  const goToNext = () => {
    if (!selectedGadget) return;
    const currentIndex = gadgets.findIndex(g => g.id === selectedGadget.id);
    const nextIndex = currentIndex < gadgets.length - 1 ? currentIndex + 1 : 0;
    setSelectedGadget(gadgets[nextIndex]);
  };

  // Removed automatic scrolling - user can manually scroll

  return (
    <div className="relative w-full min-h-screen bg-black overflow-hidden">
      <ParallaxBackground color={themeColor} variant="grid" />

      <div className="relative z-10 w-full h-screen flex">
        {/* Left Side - Infinite Scroll (hidden on mobile) */}
        <div className="hidden md:block w-1/4 border-r-4 overflow-hidden" style={{ borderColor: themeColor }}>
          <div
            ref={scrollContainerRef}
            className="h-full overflow-y-auto scrollbar-hide"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            <div className="py-4 space-y-3">
              {gadgets.map((gadget) => (
                <motion.div
                  key={gadget.id}
                  className={`mx-4 p-3 cursor-pointer transition-all ${
                    selectedGadget?.id === gadget.id
                      ? 'bg-[#9B59B6]/20'
                      : 'bg-black/50'
                  }`}
                  onClick={() => setSelectedGadget(gadget)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-black flex items-center justify-center">
                      <img
                        src={gadget.image}
                        alt={gadget.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          // Placeholder if image doesn't exist
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = `<div class="text-[#9B59B6] text-xs text-center p-2" style="font-family: 'Press Start 2P', cursive;">${gadget.name}</div>`;
                        }}
                      />
                    </div>
                    <h3
                      className="text-xs flex-1"
                      style={{
                        fontFamily: '"Press Start 2P", cursive',
                        color: themeColor,
                        lineHeight: '1.6'
                      }}
                    >
                      {gadget.name}
                    </h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Big Picture with Description */}
        <div className="flex-1 md:flex-1 w-full flex flex-col items-center justify-center p-4 md:p-8 relative">
          {/* Mobile Navigation Buttons */}
          <div className="md:hidden absolute left-2 right-2 top-1/2 -translate-y-1/2 flex justify-between z-20 pointer-events-none">
            <motion.button
              onClick={goToPrevious}
              className="pointer-events-auto p-3 rounded-full border-4 bg-black/80 backdrop-blur-sm"
              style={{ borderColor: themeColor, color: themeColor }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Previous gadget"
            >
              <ChevronLeft size={24} />
            </motion.button>
            <motion.button
              onClick={goToNext}
              className="pointer-events-auto p-3 rounded-full border-4 bg-black/80 backdrop-blur-sm"
              style={{ borderColor: themeColor, color: themeColor }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Next gadget"
            >
              <ChevronRight size={24} />
            </motion.button>
          </div>
          {selectedGadget ? (
            <motion.div
              className="flex flex-col items-center max-w-2xl"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.p
                className="text-center px-4 mb-6"
                style={{
                  fontFamily: '"Press Start 2P", cursive',
                  color: themeColor,
                  fontSize: '12px',
                  lineHeight: '2',
                  textShadow: `0 0 10px ${themeColor}`
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {selectedGadget.description}
              </motion.p>

              <motion.div
                className="bg-black/80 p-6"
                animate={{
                  y: [0, -30, 0],
                  rotate: [0, 2, -2, 0],
                }}
                transition={{
                  y: {
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  },
                  rotate: {
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
              >
                <img
                  src={selectedGadget.image}
                  alt={selectedGadget.name}
                  className="max-w-full max-h-[600px] object-contain"
                  style={{
                    filter: `drop-shadow(0 0 20px ${themeColor})`
                  }}
                  onError={(e) => {
                    // Placeholder if image doesn't exist
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const placeholder = document.createElement('div');
                    placeholder.className = 'w-96 h-96 border-2 bg-black flex items-center justify-center';
                    placeholder.style.borderColor = themeColor;
                    placeholder.innerHTML = `<div class="text-center p-4" style="font-family: 'Press Start 2P', cursive; color: ${themeColor};">${selectedGadget.name}<br/><br/>Image Coming Soon</div>`;
                    target.parentElement?.appendChild(placeholder);
                  }}
                />
              </motion.div>
            </motion.div>
          ) : (
            <div
              className="text-center"
              style={{
                fontFamily: '"Press Start 2P", cursive',
                color: themeColor,
                fontSize: '16px'
              }}
            >
              Select a gadget to view
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Gadgets;
