# Abhikalpa - Design Club Website

Official landing page for Abhikalpa, the Design Club of IIT Dharwad.

## Overview

A modern, minimalist landing page featuring smooth animations, lazy loading, and user authentication. The site showcases the club's philosophy, design insights, featured works, and provides an interactive design challenge generator.

## Features

- **Hero Section** - Bold entrance with interactive cursor effects
- **Etymology Section** - Beautiful explanation of "Abhikalpa" with scroll animations
- **Interactive Trivia** - Carousel of design facts and insights
- **Featured Works** - Grid showcase with hover effects
- **Spirit Section** - Club manifesto with atmospheric effects
- **Design Challenge** - Random design prompt generator
- **Contact Form** - Get in touch with the club
- **User Authentication** - Sign up and login functionality
- **Responsive Design** - Optimized for all screen sizes

## Tech Stack

- **React** - UI framework
- **JavaScript** - Project converted to plain JavaScript (JSX)
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Supabase** - Authentication and database
- **Lucide React** - Icons

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd project
```

2. Install dependencies:
```bash
npm install
```

3. The environment variables are already configured in `.env`:
```
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

## Running the Site

### Development Mode

Start the development server:
```bash
npm run dev
```

The site will be available at `http://localhost:5173`

### Production Build

Build the site for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/        # React components
│   ├── Hero.jsx
│   ├── Navbar.jsx
│   ├── Etymology.jsx
│   ├── Trivia.jsx
│   ├── FeaturedWorks.jsx
│   ├── Spirit.jsx
│   ├── Interactive.jsx
│   ├── Contact.jsx
│   ├── Footer.jsx
│   ├── LoginModal.jsx
│   └── SignupModal.jsx
├── hooks/            # Custom React hooks
│   └── useAuth.js
├── lib/              # Utilities and libraries
│   └── supabase.js
├── App.jsx           # Main app component
├── main.jsx          # Entry point
└── index.css         # Global styles
```

## Authentication

The site uses Supabase for authentication:

- Users can sign up with email and password
- Login persists across sessions
- Minimum password length: 6 characters
- Email confirmation is disabled by default

## Design Features

- **Lazy Loading** - All sections load on demand for optimal performance
- **Smooth Animations** - Intersection Observer triggers animations on scroll
- **Interactive Effects** - Mouse tracking and hover interactions
- **Custom Scrollbar** - Styled scrollbar matching the design
- **Mobile Responsive** - Hamburger menu and touch-friendly interface

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Lazy loaded components for faster initial load
- Optimized animations with CSS transforms
- Minimal dependencies
- Production build size: ~85KB gzipped

## Contributing

This is the official website for Abhikalpa, IIT Dharwad. For contributions or suggestions, please contact the design club.

## Contact

- Email: designclub@iitdh.ac.in
- Instagram: @abhikalpa.iitdh

## License

© 2024 Abhikalpa, IIT Dharwad. All rights reserved.

---

Made with care by the Abhikalpa design team.
