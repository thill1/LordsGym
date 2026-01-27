# Lord's Gym Auburn - Website

A modern, responsive website for Lord's Gym Auburn featuring membership information, online shop, calendar, training programs, and admin dashboard.

## Features

- 🏋️ Membership information and pricing
- 🛒 Online shop with Shopify integration
- 📅 Event calendar with booking
- 👨‍💼 Admin dashboard for content management
- 📱 Fully responsive design
- 🌙 Dark mode support
- ⚡ Service worker for offline support

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Supabase** for backend (database, auth, storage)
- **GitHub Pages** for hosting

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account (for production)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/thill1/LordsGym.git
   cd LordsGym
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `env.example` to `.env.local`
   - Fill in your Supabase credentials:
     ```env
     VITE_SUPABASE_URL=your_supabase_project_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Supabase Setup

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions on:
- Creating a Supabase project
- Running database migrations
- Setting up storage buckets
- Configuring authentication

## Building for Production

```bash
npm run build
```

The build output will be in the `dist/` directory, ready for deployment.

## Deployment

This project is configured for GitHub Pages deployment. See `.github/workflows/pages.yml` for the deployment workflow.

### Environment Variables for Production

Make sure to set the following environment variables in your deployment platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SHOPIFY_STORE_URL` (optional)
- `VITE_MINDBODY_SITE_ID` (optional)

## Project Structure

```
├── components/          # React components
│   ├── admin/          # Admin dashboard components
│   └── ...
├── context/            # React context providers
├── lib/                # Utility functions
├── pages/              # Page components
├── public/             # Static assets
├── supabase/           # Database migrations
└── ...
```

## Launch Readiness

See [LAUNCH_READINESS_REVIEW.md](./LAUNCH_READINESS_REVIEW.md) for a comprehensive review of the codebase and launch checklist.

## License

All rights reserved © 2026 Lord's Gym Auburn, CA
