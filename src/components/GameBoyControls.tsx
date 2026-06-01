import React from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Home as HomeIcon } from 'lucide-react';

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
  // Prevent text selection / long-press callouts / scroll-on-drag on the controls.
  const noSelect: React.CSSProperties = {
    WebkitTapHighlightColor: 'transparent',
    WebkitTouchCallout: 'none',
    WebkitUserSelect: 'none',
    userSelect: 'none',
    touchAction: 'none',
  };

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
      className="absolute inset-x-0 bottom-0 z-40 flex items-end justify-between px-5 pointer-events-none"
      style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}
    >
      {/* Directional pad */}
      <div className="pointer-events-auto" style={noSelect}>
        <div className="grid grid-cols-3 grid-rows-3 w-[150px] h-[150px] gap-1">
          <motion.button
            aria-label="Jump"
            whileTap={{ scale: 0.88 }}
            className={`${dpadCell} col-start-2 row-start-1 rounded-t-lg`}
            style={{ ...noSelect, boxShadow: `0 0 8px ${NEON}` }}
            {...tapHandlers(onJump)}
          >
            <ChevronUp size={28} strokeWidth={3} />
          </motion.button>

          <motion.button
            aria-label="Move left"
            whileTap={{ scale: 0.88 }}
            className={`${dpadCell} col-start-1 row-start-2 rounded-l-lg`}
            style={{ ...noSelect, boxShadow: `0 0 8px ${NEON}` }}
            {...holdHandlers(onLeftStart, onLeftEnd)}
          >
            <ChevronLeft size={28} strokeWidth={3} />
          </motion.button>

          {/* Center hub */}
          <div
            className="col-start-2 row-start-2 flex items-center justify-center bg-black/80 border-2 border-[#00FF41]/40 backdrop-blur-sm"
            style={noSelect}
          >
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: NEON, opacity: 0.5 }} />
          </div>

          <motion.button
            aria-label="Move right"
            whileTap={{ scale: 0.88 }}
            className={`${dpadCell} col-start-3 row-start-2 rounded-r-lg`}
            style={{ ...noSelect, boxShadow: `0 0 8px ${NEON}` }}
            {...holdHandlers(onRightStart, onRightEnd)}
          >
            <ChevronRight size={28} strokeWidth={3} />
          </motion.button>

          {/* Down has no in-game action, but completes the D-pad look */}
          <motion.button
            aria-label="Down"
            whileTap={{ scale: 0.88 }}
            className={`${dpadCell} col-start-2 row-start-3 rounded-b-lg opacity-60`}
            style={noSelect}
            onContextMenu={(e) => e.preventDefault()}
          >
            <ChevronDown size={28} strokeWidth={3} />
          </motion.button>
        </div>
      </div>

      {/* Center HOME button (sits where Start/Select would be on a Game Boy) */}
      <div className="pointer-events-auto flex items-end pb-1" style={noSelect}>
        <motion.button
          aria-label="Home"
          whileTap={{ scale: 0.9 }}
          onClick={onHome}
          onContextMenu={(e) => e.preventDefault()}
          className="flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-full bg-black/80 border-2 border-[#00FF41]/80 text-[#00FF41] backdrop-blur-sm"
          style={{ ...noSelect, fontFamily: '"Press Start 2P", cursive' }}
        >
          <HomeIcon size={16} strokeWidth={2.5} />
          <span className="text-[7px] leading-none">HOME</span>
        </motion.button>
      </div>

      {/* A / B action buttons (both jump) */}
      <div className="pointer-events-auto flex items-end gap-4" style={noSelect}>
        <motion.button
          aria-label="Jump (B)"
          whileTap={{ scale: 0.88 }}
          className="flex items-center justify-center w-16 h-16 rounded-full bg-black/80 border-4 border-[#00FF41] text-[#00FF41] backdrop-blur-sm"
          style={{
            ...noSelect,
            boxShadow: `0 0 10px ${NEON}`,
            fontFamily: '"Press Start 2P", cursive',
          }}
          {...tapHandlers(onJump)}
        >
          <span className="text-lg leading-none">B</span>
        </motion.button>

        <motion.button
          aria-label="Jump (A)"
          whileTap={{ scale: 0.88 }}
          className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-black/80 border-4 border-[#00FF41] text-[#00FF41] backdrop-blur-sm"
          style={{
            ...noSelect,
            boxShadow: `0 0 10px ${NEON}`,
            fontFamily: '"Press Start 2P", cursive',
          }}
          {...tapHandlers(onJump)}
        >
          <span className="text-lg leading-none">A</span>
        </motion.button>
      </div>
    </div>
  );
};

export default GameBoyControls;
