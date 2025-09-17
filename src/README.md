# Coaction Connect

A white-label client portal application built with React and Tailwind CSS, designed as a 

- **React** with TypeScript
- **Tailwind CSS v4** for styling
- **Shadcn/ui** components
- **Lucide React** icons
- **Local storage** for data persistence
- **Supabase** backend integration (optional)

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm start`
4. Log in with the pre-configured credentials

## Customization

The application is designed to be white-labeled. You can customize:
- Company name and logo
- Color palette (5 custom colors)
- Admin and advisor credentials
- Content across all sections

## Project Structure

```
├── App.tsx                 # Main application component
├── components/            # React components
│   ├── Dashboard.tsx      # Main dashboard
│   ├── BrandingAssets.tsx # Branding management
│   ├── SocialMedia.tsx    # Social media content
│   ├── Website.tsx        # Website management
│   ├── KnowledgeHub.tsx   # Knowledge base
│   ├── Contact.tsx        # Contact forms
│   ├── Community.tsx      # Community features
│   └── ui/               # Shadcn/ui components
├── styles/
│   └── globals.css       # Global styles and theme
└── utils/               # Utility functions
```

## License

This project is configured for client use with customizable branding and settings.