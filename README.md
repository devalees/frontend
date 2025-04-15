# React Project

A modern React application built with TypeScript and Vite.

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── ui/            # Basic UI components
│   ├── layout/        # Layout components
│   ├── form/          # Form-related components
│   └── loading/       # Loading state components
├── lib/               # Utility functions and hooks
│   ├── utils/         # Helper functions
│   └── hooks/         # Custom React hooks
└── styles/            # Global styles and theme
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   VITE_APP_NAME=React App
   VITE_API_URL=http://localhost:3000
   NODE_ENV=development
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## Environment Variables

- `VITE_APP_NAME` - Application name
- `VITE_API_URL` - API endpoint URL
- `NODE_ENV` - Environment mode (development/production)

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

MIT 