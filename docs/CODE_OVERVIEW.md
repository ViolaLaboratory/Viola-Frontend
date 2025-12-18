# Viola Frontend - Code Overview

This document provides a high-level overview of the codebase structure and key components for developers joining the project.

## Project Structure

```
src/
├── components/          # Reusable React components
│   ├── AnimatedVLogo.tsx   # Animated logo with gradient wave effect
│   ├── Footer.tsx          # Site-wide footer with CTA and social links
│   └── ui/                 # Shadcn UI components (Button, Input, etc.)
├── pages/              # Route-level page components
│   ├── Landing.tsx         # Main landing page with all sections
│   ├── Waitlist.tsx        # Waitlist signup form
│   ├── ThankYou.tsx        # Post-signup confirmation page
│   └── NotFound.tsx        # 404 error page
├── index.css           # Global styles and design system
└── App.tsx             # Root component with routing

docs/
├── CODE_OVERVIEW.md              # This file
├── EMAIL_CONFIRMATION_SETUP.md   # Guide for setting up email confirmations
└── google-apps-script-email.js   # Google Apps Script for form handling
```

## Design System

### Colors
All colors are defined in `src/index.css` using HSL format:
- **Primary Yellow**: `#E4EA04` - Used for CTAs and highlights
- **Primary Orange**: `#EE481F` - Accent color
- **Primary Purple**: `#4b0db5` - Secondary accent
- **Background**: Black with subtle gradients

### Fonts
- **Zen Dots**: Headings and display text
- **DM Sans**: Body text and UI elements
- **Inter**: Base font family

### Animations
1. **heatwave**: Slow background position shift (120s loop)
   - Used for viola-glow-bg elements
   - Creates ambient, flowing effect

2. **fade-in-up**: Element entrance animation
   - Defined in Tailwind config
   - Used throughout for page elements

3. **gradient-wave**: Vertical color wave (10s loop)
   - Used in AnimatedVLogo
   - Synchronized with glow-pulse

## Key Components

### AnimatedVLogo
**Location**: `src/components/AnimatedVLogo.tsx`

Displays the Viola logo with animated color gradient and glow effects.

**Features**:
- Vertical gradient wave animation
- Pulsing glow effect
- SVG-based for scalability
- 10-second animation loop

**Usage**:
```tsx
import AnimatedVLogo from "@/components/AnimatedVLogo";

<AnimatedVLogo />
```

### Footer
**Location**: `src/components/Footer.tsx`

Site-wide footer with CTA section and social media links.

**Features**:
- Early access CTA button
- Social links (Instagram, LinkedIn, Email)
- Interactive button hover effects
- Copyright information

**Usage**:
```tsx
import Footer from "@/components/Footer";

<Footer />
```

## Pages

### Landing Page
**Location**: `src/pages/Landing.tsx`

Main marketing page with multiple sections showcasing Viola's features.

**Sections**:
1. **Hero**: Video background with value proposition
2. **Credibility**: Testimonial from industry professional
3. **Problem**: Pain points with interactive background
4. **Callout**: Value proposition highlight
5. **Features**: Three main features (Locate, Listen, License)
6. **Outcomes**: Before/After comparison
7. **Who It's For**: Target audience with canvas spotlight
8. **Why/Trust**: Search demo with animated placeholder
9. **CTA Block**: Final call-to-action
10. **FAQ**: Accordion with common questions

**Interactive Elements**:
- Mouse-tracking background in Problem section
- Canvas spotlight effect in "Who It's For"
- Typing placeholder animation in search bar
- Intersection Observer for card animations

### Waitlist Page
**Location**: `src/pages/Waitlist.tsx`

Form for collecting waitlist signups.

**Features**:
- Staggered form field animations
- Form validation
- Google Apps Script integration
- Email confirmation (via Apps Script)
- Navigates to Thank You page on success

**Form Fields**:
- First Name (required)
- Last Name (required)
- Email (required)
- Relation to Music Industry (required)
- Favorite Song (required)

**Backend Integration**:
See `docs/EMAIL_CONFIRMATION_SETUP.md` for setup instructions.

### Thank You Page
**Location**: `src/pages/ThankYou.tsx`

Confirmation page after waitlist signup.

**Features**:
- Animated check badge
- Copyable waitlist URL
- Social sharing buttons (Twitter, LinkedIn, Facebook)
- Animated background with heatwave effect

### 404 Not Found
**Location**: `src/pages/NotFound.tsx`

Error page for non-existent routes.

**Features**:
- Eye-catching gradient background
- Viola-themed copy
- Back to home CTA
- Console error logging

## Common Patterns

### Button Hover Effects
Many buttons use a radial gradient effect that follows the mouse cursor:

```tsx
const handleMouseMove = (e: MouseEvent<HTMLButtonElement>, index: number) => {
  const button = buttonRefs.current[index];
  if (!button) return;

  const rect = button.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  button.style.setProperty('--mouse-x', `${x}px`);
  button.style.setProperty('--mouse-y', `${y}px`);
};
```

The CSS uses these custom properties:
```css
before:bg-[radial-gradient(circle_100px_at_var(--mouse-x)_var(--mouse-y),rgba(255,255,255,0.2),transparent)]
```

### Viola Glow Background
Reusable animated background pattern:

```tsx
<div className="viola-glow-bg animate-heatwave" />
```

This displays the viola.jpg image with blur, saturation, and slow animation.

### Navigation
All pages use React Router for navigation:

```tsx
import { useNavigate } from "react-router-dom";

const navigate = useNavigate();
navigate("/waitlist");
```

## 🔧 Development Tips

### Adding New Pages
1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Import and use shared components (Footer, LogoMark)
4. Follow existing animation patterns

### Modifying Animations
- Global animations: `src/index.css`
- Component-specific: `<style>` tags in component files
- Keep durations consistent with existing animations

### Color Changes
- Update CSS custom properties in `src/index.css`
- Follow HSL format for all colors
- Test in both light and dark contexts

### Form Submissions
- Currently uses Google Apps Script
- See `docs/EMAIL_CONFIRMATION_SETUP.md`
- Mode: "no-cors" (can't read response status)

## Code Style

### Comments
- Use JSDoc-style comments for components and functions
- Explain "why" not "what" in inline comments
- Document complex animations and interactions

### TypeScript
- Use explicit types for props
- Avoid `any` type
- Define interfaces for complex objects

### CSS
- Use Tailwind utility classes
- Keep custom CSS in `index.css` when shared
- Use `<style>` tags for component-specific styles

## Performance Considerations

### Animations
- Use CSS transforms (not position/width/height)
- Prefer GPU-accelerated properties
- Intersection Observer for scroll-based animations

### Images
- Use WebP format when possible
- Lazy load below-the-fold images
- Optimize SVGs (remove unnecessary attributes)

### Code Splitting
- Pages are automatically code-split by React Router
- Consider lazy loading for large components

## Common Issues

### Email Confirmations Not Sending
Check Google Apps Script permissions and deployment settings.
See `docs/EMAIL_CONFIRMATION_SETUP.md`.

### Animations Not Playing
- Verify class names are correct
- Check if animation is defined in `index.css`
- Ensure no conflicting styles

### Routing Issues
- All routes must be defined in `App.tsx`
- Use absolute paths from root
- 404 page catches all undefined routes

## Additional Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Router Documentation](https://reactrouter.com)
- [Shadcn UI Documentation](https://ui.shadcn.com)
- [Lucide Icons](https://lucide.dev)

## Contributing

When adding new features:
1. Follow existing code patterns
2. Add comprehensive comments
3. Test responsive behavior
4. Verify animations are smooth
5. Update this documentation if needed

---

**Questions?** Check the inline comments in the code - every major component and function is documented.
