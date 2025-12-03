# Abhikalpa - Design Club Website

Official landing page and web platform for **Abhikalpa**, the Design Club of IIT Dharwad.

A modern, minimalist landing page with smooth animations, lazy loading, authentication, merch pages, cart system, profile pages, and a backend-powered contact form.

---

## Overview

A modern web application featuring:

- Smooth animations and scroll reveals
- Design insights and featured works
- Interactive design challenge generator
- Cart system and merchandise section
- Contact form integrated with backend email API
- User authentication and profile management

---

## Features

### Frontend

- **Hero Section** with cursor reactive animations
- **Etymology Section** with scroll-triggered effects
- **Trivia Carousel** for design facts
- **Featured Works** grid with hover animations
- **Spirit Section** showcasing club manifesto
- **Design Challenge Generator**
- **Contact Form** with backend integration
- **User Authentication** (Login, Signup, Logout)
- **Reset Password System**
- **Merch Page + Cart System (CartContext)**
- **Responsive Layout** across all devices
- **Lazy Loading + Optimized Animations**

### Backend

- **Node.js + Express API**
- **Nodemailer email service**
- **HTML-styled email templates**
- **CORS + JSON middleware**
- **Environment variable support via `.env`**
- **Healthcheck endpoint**

---

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- JavaScript (JSX)
- Lucide Icons

### Backend
- Node.js
- Express
- Nodemailer
- dotenv

### Database (Future)
- SQL schema included in `/database/schema.sql`

---

## Requirements

- Node.js (v16 or higher)
- npm
- Git
- Gmail account with **App Password enabled**

---

## Environment Variables

Create a `.env` file at the project root:

- EMAIL_USER=yourgmail@gmail.com
- EMAIL_PASS=your-gmail-app-password
- PORT=5000


`.env` is ignored by Git for security reasons.

---

## Gmail App Password Setup

1. Go to: https://myaccount.google.com
2. Navigate to **Security**
3. Enable **2-Step Verification**
4. Open **App Passwords**
5. Select:
 - App: Mail
 - Device: Other
6. Generate password
7. Use it as `EMAIL_PASS` in `.env`

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/viswa-dom/IITDH_Design_Club_Website
cd IITDH_Design_Club_Website

```

### 2. Frotnend Setup

```bash
npm install
npm run dev
```

- Frontend available at:
```bash
http://localhost:5173
```

### 3. Backend Setup
```bash
cd backend
npm install
npm run dev
```
- Verify that backend is working:
```bash
[nodemon] starting `node emailAPI.js`
Email API server running on port 5000
Email server is ready to send messages
```
## Project Structure

```
src/
├── components/# React components
│ ├── Hero.jsx
│ ├── Navbar.jsx
│ ├── Etymology.jsx
│ ├── Trivia.jsx
│ ├── FeaturedWorks.jsx
│ ├── Spirit.jsx
│ ├── Interactive.jsx
│ ├── Contact.jsx
│ ├── Footer.jsx
│ ├── LoginModal.jsx
│ └── SignupModal.jsx
├── hooks/# Custom React hooks
│ └── useAuth.js
├── lib/# Utilities and libraries
│ └── supabase.js
├── App.jsx # Main app component
├── main.jsx# Entry point
└── index.css # Global styles
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
