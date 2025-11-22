import beijingBg from '../assets/backgrounds/Beijing.png';
import stanfordBg from '../assets/backgrounds/Stanford.jpg';
import montrealBg from '../assets/backgrounds/Montreal.jpg';
import vancouverBg from '../assets/backgrounds/Vancouver.jpg';

// Level 1
import kidImage from '../assets/pic/kid.jpg';
import kidImage2 from '../assets/pic/kid2.jpg';
import kidImage3 from '../assets/pic/kid3.jpg';
import kidImage4 from '../assets/pic/kid4.jpg';
import kidViolin from '../assets/pic/kid-violin.jpg';
import kidViolin2 from '../assets/pic/kid-violin2.jpg';
import kidUSA from '../assets/pic/kid-usa.jpg';
import kidUSA2 from '../assets/pic/kid-usa2.png';
import Cousin from '../assets/pic/Cousins.jpg';
import Cousin2 from '../assets/pic/Cousins2.jpg';

// Level 2
import Canada from '../assets/pic/Canada.jpg';
import Canada2 from '../assets/pic/Canada2.jpg';
import Guitar from '../assets/pic/Guitar.jpg';
import Guitar2 from '../assets/pic/Guitar2.jpg';
import Guitar3 from '../assets/pic/Guitar3.jpg';
import guitarVideo from '../assets/video/guitar.mov';
import guitarVideo2 from '../assets/video/guitar2.mov';
import OpenSource from '../assets/pic/Opensource.jpg';
import OpenSource2 from '../assets/pic/Opensource2.jpg';
import OpenSource3 from '../assets/pic/Opensource3.jpg';

// Level 3
import TableauPat from '../assets/pic/TableauPat.jpg';
import TableauPublic from '../assets/pic/TableauPublic.jpg';
import TableauTeam from '../assets/pic/TableauTeam.jpeg';
import Marriage from '../assets/pic/Marriage.jpg';
import Marriage2 from '../assets/pic/Marriage2.jpg';
import AirbnbLottie from '../assets/pic/AirbnbLottie.gif';

// level 4
import Stanford from '../assets/pic/Stanford.jpg';
import Stanford2 from '../assets/pic/Stanford2.jpg';
import Stanford3 from '../assets/pic/Stanford3.jpeg';
import Stanford4 from '../assets/pic/Stanford4.jpeg';
import StanfordCenter from '../assets/pic/StanfordCenter.jpg';
import StanfordCenter2 from '../assets/pic/StanfordCenter2.jpg';
import StanfordCenter3 from '../assets/pic/StanfordCenter3.jpg';

// Audio files
import audio1 from '../assets/audio/01underwater.mp3';
import audio2 from '../assets/audio/02underground.mp3';
import audio3 from '../assets/audio/03saveprincess.mp3';
import audio4 from '../assets/audio/04theme.mp3';

// npcs
import solaire from '../assets/characters/npcs/solaire.gif';
import luigi from '../assets/characters/npcs/luigi.gif';
import yoda from '../assets/characters/npcs/yoda.gif';
import gandolf from '../assets/characters/npcs/gandolf.gif';
import loco from '../assets/characters/npcs/loco.gif';
import loco2 from '../assets/characters/npcs/loco2.gif';
import kirby from '../assets/characters/npcs/kirby.gif';
import tsuny from '../assets/characters/npcs/tsuny.gif';
import pikachu from '../assets/characters/npcs/pikachu.gif';
import pyro from '../assets/characters/npcs/pyro.gif';
import peach from '../assets/characters/peach.gif';
import ninja from '../assets/characters/npcs/ninja.gif';
import ironman from '../assets/characters/npcs/ironman.gif';
import guitar from '../assets/characters/npcs/guitar.gif';

export type Event = {
  type: 'text' | 'image' | 'video';
  content: string;
  images?: string[];
  video?: string;
};

export type Block = {
  position: number; // characterPosition percentage
  event: Event;
};

export type NPC = {
  position: number; // characterPosition percentage
  sprite: string; // path to NPC sprite/gif
  facing?: 'left' | 'right'; // direction NPC is facing (default: 'right')
  size?: string; // Tailwind height class (e.g., 'h-24', 'h-32', 'h-40') - default: 'h-32'
  event?: Event; // optional event that triggers when character gets close
};

export type Level = {
  id: number;
  name: string;
  background: string;
  mission: string;
  year: string;
  blocks: Block[];
  npcs?: NPC[];
  audio?: string; // Background music for the level
};

// Collect all images for preloading
export const getAllEventImages = (): string[] => {
  const images: string[] = [];
  levels.forEach((level) => {
    level.blocks.forEach((block) => {
      if (block.event.images) {
        images.push(...block.event.images);
      }
    });
    if (level.npcs) {
      level.npcs.forEach((npc) => {
        if (npc.event?.images) {
          images.push(...npc.event.images);
        }
      });
    }
  });
  return images;
};

export const levels: Level[] = [
  {
    id: 1,
    name: 'BEIJING',
    background: beijingBg,
    mission: 'I was born in Beijing, China',
    year: '1994',
    audio: audio1,
    blocks: [
      {
        position: 60,
        event: {
          type: 'text',
          content:
            'Beijing, China, December 22, 1994 - this is where my journey began.',
          images: [kidImage2, kidImage, kidImage3, kidImage4],
        },
      },
      {
        position: 130,
        event: {
          type: 'text',
          content:
            'As an only child, my parents put a strong focus on supporting my education and development.',
          images: [kidViolin, kidViolin2, kidUSA, kidUSA2],
        },
      },
      {
        position: 160,
        event: {
          type: 'text',
          content: 'I have a close relationship with my cousins growing up.',
          images: [Cousin, Cousin2],
        },
      },
    ],
  },
  {
    id: 2,
    name: 'MONTREAL',
    background: montrealBg,
    mission: 'I moved to Canada with my family in 2008',
    year: '2008',
    audio: audio2,
    blocks: [
      {
        position: 60,
        event: {
          type: 'text',
          content:
            'It was a big change for me to move to Canada, especially the weather.',
          images: [Canada, Canada2],
        },
      },
      {
        position: 120,
        event: {
          type: 'text',
          content:
            'Starting college, my passion was mostly focused on music, I started with a Music Major. However, my love for engineering started when I wanted to build my own guitar.',
          images: [guitarVideo2],
        },
      },
      {
        position: 160,
        event: {
          type: 'text',
          content:
            'During college, I have been interested in the opensource community and the power of community.',
          images: [OpenSource, OpenSource2, OpenSource3],
        },
      },
    ],
    npcs: [
      {
        position: 100,
        sprite: guitar,
        facing: 'right',
        size: 'h-24',
        event: {
          type: 'text',
          content:
            'Music was my escape from the loneliness and language barrier. I rebuilt my confidence through music.',
          images: [Guitar, Guitar2, Guitar3, guitarVideo],
        },
      },
    ],
  },
  {
    id: 3,
    name: 'Pacific Northwest',
    background: vancouverBg,
    mission: 'Career Journey',
    year: '2017',
    audio: audio3,
    blocks: [
      {
        position: 115,
        event: {
          type: 'text',
          content:
            'My first job was at Tableau Software, a data analytics company founded by Stanford Professor, now Turing award winner, Pat Hanrahan. I was the main developer for the Tableau Public.',
          images: [TableauPat, TableauPublic, TableauTeam],
        },
      },
      {
        position: 160,
        event: {
          type: 'text',
          content:
            'Later I joined Airbnb, to work on Frontend technologies such as Lottie animations and VISX',
          images: [AirbnbLottie],
        },
      },
    ],
    npcs: [
      {
        position: 140,
        sprite: peach,
        facing: 'right',
        size: 'h-24',
        event: {
          type: 'text',
          content: 'I got married to my wife, Alice, in 2022.',
          images: [Marriage2, Marriage],
        },
      },
    ],
  },
  {
    id: 4,
    name: 'STANFORD',
    background: stanfordBg,
    mission: 'Masters in Learning, Design, and Technology',
    year: '2025',
    audio: audio4,
    blocks: [
      {
        position: 32,
        event: {
          type: 'text',
          content: 'I have been enjoying my first 2 months here at Stanford.',
          images: [
            StanfordCenter,
            StanfordCenter2,
            StanfordCenter3,
            Stanford,
            Stanford2,
          ],
        },
      },
      {
        position: 120,
        event: {
          type: 'text',
          content:
            'I love my LDT cohort, you folks are like my own Avengers team',
          images: [Stanford3, Stanford4],
        },
      },
    ],
    npcs: [
      {
        position: 90,
        sprite: kirby,

        facing: 'left',
        size: 'h-24',
      },
      {
        position: 95,
        sprite: luigi,
        facing: 'left',
        size: 'h-32',
      },
      {
        position: 100,
        sprite: ninja,
        facing: 'left',
        size: 'h-24',
      },
      {
        position: 105,
        sprite: yoda,
        facing: 'right',
        size: 'h-24',
      },
      {
        position: 110,
        sprite: tsuny,
        facing: 'right',
        size: 'h-24',
      },
      {
        position: 115,
        sprite: loco,
        facing: 'left',
        size: 'h-16',
      },
      {
        position: 120,
        facing: 'right',
        sprite: solaire,
        size: 'h-28',
      },
      {
        position: 125,
        sprite: pyro,
        facing: 'right',
        size: 'h-32',
      },
      {
        position: 130,
        sprite: loco2,
        facing: 'right',
        size: 'h-16',
      },
      {
        position: 135,
        sprite: gandolf,
        facing: 'right',
        size: 'h-24',
      },
      {
        position: 140,
        sprite: pikachu,
        facing: 'right',
        size: 'h-20',
      },
      {
        position: 145,
        sprite: ironman,
        facing: 'right',
        size: 'h-28',
        event: {
          type: 'text',
          content: 'I would love to see what comes out of this journey.',
        },
      },
    ],
  },
];
