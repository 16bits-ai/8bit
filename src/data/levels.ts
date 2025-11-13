import beijingBg from '../assets/backgrounds/Beijing.png';
import stanfordBg from '../assets/backgrounds/Stanford.jpg';
import kidImage from '../assets/pic/kid.jpg';
import kidImage1 from '../assets/pic/kid1.jpg';
import kidViolin from '../assets/pic/kid-violin.jpg';

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

export type Level = {
  id: number;
  name: string;
  background: string;
  mission: string;
  year: string;
  blocks: Block[];
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
  });
  return images;
};

export const levels: Level[] = [
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
          content: 'Beijing, China -This is where my journey began.',
          images: [kidImage, kidImage1],
        },
      },
      {
        position: 130,
        event: {
          type: 'text',
          content:
            'I was the only child in my family, my parents devoted all their love and resources to me and my education.',
          images: [kidViolin],
        },
      },
    ],
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
          content:
            'Stanford University - where I deepened my understanding of computer science.',
        },
      },
      {
        position: 120,
        event: {
          type: 'text',
          content:
            'The knowledge gained here became the foundation of my career.',
        },
      },
    ],
  },
];
