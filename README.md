# Viola Frontend

Viola is an AI-powered music workspace for sync teams and music supervisors. This repository contains the frontend application with both marketing pages and a product demo.

## 🎵 Project Overview

Viola helps music professionals find, shortlist, and clear the right track in under 30 minutes. The app features:

- **AI-powered music search** with natural language queries
- **Smart curation tools** that learn user taste
- **Integrated licensing workflow**
- **Pitch builder** for creating music proposals
- **Music catalog** management

## 📁 Project Structure

```
src/
├── pages/
│   ├── Landing.tsx       # Main landing page (/)
│   ├── Waitlist.tsx      # Waitlist signup form (/waitlist)
│   ├── ThankYou.tsx      # Post-signup confirmation (/thank-you)
│   ├── Index.tsx         # Product demo interface (/demo)
│   └── NotFound.tsx      # 404 error page
│
├── components/
│   ├── Navigation.tsx     # Demo app navigation
│   ├── SearchInterface.tsx # AI search demo
│   ├── PitchBuilder.tsx   # Pitch creation tool
│   ├── MusicCatalog.tsx   # Music library browser
│   ├── MusicPlayer.tsx    # Audio player
│   ├── AnimatedVLogo.tsx  # Animated Viola logo
│   ├── Footer.tsx         # Site footer
│   └── ui/               # shadcn/ui components
│
├── App.tsx               # Main app with routing
└── index.css            # Global styles & animations
```

## Getting Started

### Prerequisites

- Node.js & npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd Viola-Frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## Tech Stack

- **Vite** - Build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **React** - UI framework
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Accessible component library
- **Lucide React** - Icon library

## Page Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Landing.tsx | Marketing homepage with hero, features, FAQ |
| `/waitlist` | Waitlist.tsx | Signup form for early access |
| `/thank-you` | ThankYou.tsx | Confirmation page with social sharing |
| `/demo` | Index.tsx | Interactive product demo |
| `/*` | NotFound.tsx | 404 error page |

## Key Features

### Marketing Flow
1. Users land on `/` (Landing page)
2. Click "Join Waitlist" → navigate to `/waitlist`
3. Submit form → redirect to `/thank-you`
4. Share with friends via social media

### Demo Experience
- Navigate to `/demo` to see the product interface
- Switch between **Search**, **Pitch Builder**, and **Catalogue** views
- Navigate back to marketing pages via navbar buttons

### Waitlist Form
- Collects: First name, last name, email, industry relation, team size, favorite song
- Generates unique user IDs (format: `VLA-YYYYMMDD-XXXXX`)
- Submits to Google Apps Script for processing
- Sends confirmation emails to users

### Social Sharing
- Pre-filled share messages for Twitter and Email
- Copy-to-clipboard functionality for waitlist URL
- LinkedIn and Facebook sharing (URL only)

## Design System

### Brand Colors
- **Primary Yellow**: `#e4ea04`
- **Orange Accent**: `#ee481f`
- **Background**: `#000000` (Black)
- **Text**: White with various opacity levels

### Animations
- **Heatwave**: Slow background gradient movement (120s loop)
- **AnimatedVLogo**: Color-shifting gradient wave (10s loop)
- **Mouse-tracking parallax**: Interactive background effects
- **Typing placeholder**: Cycling search suggestions

### Typography
- **Headings**: Zen Dots (`font-zen`)
- **Body**: DM Sans (`font-dm`)
- **Code**: DM Mono (`font-mono`)

## 📧 Email Confirmations

The waitlist form integrates with Google Apps Script to:
1. Save submissions to Google Sheets
2. Send confirmation emails to users

See `docs/EMAIL_CONFIRMATION_SETUP.md` for setup instructions.

## Development

### Build for Production
```sh
npm run build
```

### Preview Production Build
```sh
npm run preview
```

### Lint Code
```sh
npm run lint
```

## Additional Documentation

- `docs/CODE_OVERVIEW.md` - Detailed architecture guide
- `DEVELOPER_NOTES.md` - Quick start guide for developers
- `docs/EMAIL_CONFIRMATION_SETUP.md` - Email automation setup
- `docs/google-apps-script-email.js` - Backend form handler

## 📝 Contributing

1. Create a new branch for your feature
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## Future Development

The demo currently showcases UI/UX. Future updates will include:
- Backend API integration
- Real music search functionality
- User authentication
- Database integration
- License clearing workflow

## Support

For questions or issues, please check the documentation files or create an issue in this repository.

---

Built with ❤️ in DTX for music supervisors and sync professionals.