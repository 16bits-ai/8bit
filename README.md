# 8-Bit Personal Portfolio Site

A retro-gaming themed personal introduction website with parallax animations and interactive pixel effects.

## Features

- **Lightweight Parallax Backgrounds**: CSS-based animated backgrounds with mouse parallax effects
- **Mac-style Dock Navigation**: Magnifying dock navigation inspired by macOS
- **8-Bit Retro Design**: Pixel-perfect design with retro gaming aesthetics
- **Multiple Pages**: Home, About, Projects, Contact, and Game pages
- **Super Mario Style Game**: Interactive side-scrolling game showcasing your journey
- **Smooth Animations**: Framer Motion powered transitions and effects
- **High Performance**: No heavy 3D libraries, optimized for smooth animations

## Tech Stack

- React 18
- TypeScript
- Vite
- React Router DOM
- Framer Motion
- Tailwind CSS
- Lucide React Icons

## Getting Started

```bash
npm install
npm run dev
```

## Project Structure

```
src/
├── components/
│   ├── ParallaxBackground.tsx    # Lightweight CSS parallax background
│   ├── Dock.tsx                  # Mac-style dock navigation
│   └── Layout.tsx                # Main layout with dock navigation
├── pages/
│   ├── Home.tsx           # Landing page
│   ├── About.tsx          # About page
│   ├── Projects.tsx       # Projects showcase
│   ├── Contact.tsx        # Contact form
│   └── Game.tsx           # Super Mario style game
├── assets/
│   ├── backgrounds/       # Game level backgrounds
│   └── characters/        # Character sprites
├── App.tsx                # Main app with routing
└── main.tsx               # Entry point
```

## Customization

Each page uses a different ParallaxBackground variant and color scheme:
- Home: Green (#00FF41) with grid pattern
- About: Orange (#FF6B35) with dots pattern
- Projects: Cyan (#4ECDC4) with squares pattern
- Contact: Yellow (#FFE66D) with lines pattern

## Navigation

The dock at the bottom provides navigation between sections:
- Home icon: Return to landing page
- User icon: About section
- Briefcase icon: Projects showcase
- Mail icon: Contact form
- Gamepad icon: Interactive game

## Game Controls

In the Game page, use keyboard controls to navigate through your journey:
- **Arrow Right** or **D**: Move character forward
- **Arrow Left** or **A**: Move character backward
- Complete each level by reaching 95% progress
- Watch your character walk through different stages of your life/career
