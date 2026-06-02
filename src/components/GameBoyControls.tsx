import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ArrowBigUp, Home as HomeIcon } from 'lucide-react';

interface GameBoyControlsProps {
  onLeftStart: () => void;
  onLeftEnd: () => void;
  onRightStart: () => void;
  onRightEnd: () => void;
  onJump: () => void;
  onHome: () => void;
}

const NEON = '#00FF41';

// On-screen Game Boy style controls for touch devices:
// a directional pad on the left and A/B action buttons on the right.
const GameBoyControls: React.FC<GameBoyControlsProps> = ({
  onLeftStart,
  onLeftEnd,
  onRightStart,
  onRightEnd,
  onJump,
  onHome,
}) => {
  const deckRef = useRef<HTMLDivElement>(null);

  // iOS Safari still pops the text-selection / callout (magnifier) on long-press
  // even with user-select:none, so we cancel the native touchstart. React's
  // onTouchStart is registered as a passive listener (preventDefault is ignored
  // there), hence the manual non-passive listener. The HOME button is exempt
  // because it relies on the synthesized click event.
  useEffect(() => {
    const deck = deckRef.current;
    if (!deck) return;
    const cancelTouch = (e: TouchEvent) => {
      const target = e.target as Element | null;
      if (target && target.closest('[data-gb-home]')) return;
      e.preventDefault();
    };
    deck.addEventListener('touchstart', cancelTouch, { passive: false });
    return () => deck.removeEventListener('touchstart', cancelTouch);
  }, []);

  // Press-and-hold buttons (move left/right): fire start on press, end on release.
  const holdHandlers = (start: () => void, end: () => void) => ({
    onTouchStart: start,
    onTouchEnd: end,
    onMouseDown: start,
    onMouseUp: end,
    onMouseLeave: end,
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  });

  // Tap buttons (jump): fire once on press.
  const tapHandlers = (press: () => void) => ({
    onTouchStart: press,
    onMouseDown: press,
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  });

  const dpadCell =
    'flex items-center justify-center bg-black/80 border-2 border-[#00FF41] text-[#00FF41] backdrop-blur-sm';

  return (
    <div
      ref={deckRef}
      className="gb-controls absolute inset-x-0 bottom-0 z-40 flex items-end justify-between px-5 pointer-events-none"
      style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}
    >
      {/* Directional pad */}
      <div className="pointer-events-auto">
        <div className="grid grid-cols-3 grid-rows-3 w-[150px] h-[150px] gap-1">
          <motion.button
            aria-label="Jump"
            whileTap={{ scale: 0.88 }}
            className={`${dpadCell} col-start-2 row-start-1 rounded-t-lg`}
            style={{ boxShadow: `0 0 8px ${NEON}` }}
            {...tapHandlers(onJump)}
          >
            <ChevronUp size={28} strokeWidth={3} />
          </motion.button>

          <motion.button
            aria-label="Move left"
            whileTap={{ scale: 0.88 }}
            className={`${dpadCell} col-start-1 row-start-2 rounded-l-lg`}
            style={{ boxShadow: `0 0 8px ${NEON}` }}
            {...holdHandlers(onLeftStart, onLeftEnd)}
          >
            <ChevronLeft size={28} strokeWidth={3} />
          </motion.button>

          {/* Center hub */}
          <div className="col-start-2 row-start-2 flex items-center justify-center bg-black/80 border-2 border-[#00FF41]/40 backdrop-blur-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: NEON, opacity: 0.5 }} />
          </div>

          <motion.button
            aria-label="Move right"
            whileTap={{ scale: 0.88 }}
            className={`${dpadCell} col-start-3 row-start-2 rounded-r-lg`}
            style={{ boxShadow: `0 0 8px ${NEON}` }}
            {...holdHandlers(onRightStart, onRightEnd)}
          >
            <ChevronRight size={28} strokeWidth={3} />
          </motion.button>

          {/* Down has no in-game action, but completes the D-pad look */}
          <motion.button
            aria-label="Down"
            whileTap={{ scale: 0.88 }}
            className={`${dpadCell} col-start-2 row-start-3 rounded-b-lg opacity-60`}
            onContextMenu={(e) => e.preventDefault()}
          >
            <ChevronDown size={28} strokeWidth={3} />
          </motion.button>
        </div>
      </div>

      {/* Action buttons: home + jump */}
      <div className="pointer-events-auto flex items-end gap-4">
        <motion.button
          aria-label="Home"
          data-gb-home
          whileTap={{ scale: 0.88 }}
          onClick={onHome}
          onContextMenu={(e) => e.preventDefault()}
          className="flex items-center justify-center w-16 h-16 rounded-full bg-black/80 border-4 border-[#00FF41] text-[#00FF41] backdrop-blur-sm"
          style={{ boxShadow: `0 0 10px ${NEON}` }}
        >
          <HomeIcon size={26} strokeWidth={2.5} />
        </motion.button>

        <motion.button
          aria-label="Jump"
          whileTap={{ scale: 0.88 }}
          className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-black/80 border-4 border-[#00FF41] text-[#00FF41] backdrop-blur-sm"
          style={{ boxShadow: `0 0 10px ${NEON}` }}
          {...tapHandlers(onJump)}
        >
          <ArrowBigUp size={32} strokeWidth={2.5} />
        </motion.button>
      </div>
    </div>
  );
};

export default GameBoyControls;
