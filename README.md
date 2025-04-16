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
│   ├── api/           # API clients and utilities
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
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/
   NEXT_PUBLIC_API_TIMEOUT=10000
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

### General Configuration
- `VITE_APP_NAME` - Application name
- `NODE_ENV` - Environment mode (development/test/production)

### API Configuration
- `NEXT_PUBLIC_API_URL` - Base URL for API requests
- `NEXT_PUBLIC_API_TIMEOUT` - Request timeout in milliseconds

## API Infrastructure

### Environment-Based Configuration

The application uses an environment-based configuration system for API requests that automatically adapts based on the current environment:

- **Development Environment**: 
  - Debug logging enabled
  - Relaxed validation status
  - Detailed error reporting

- **Test Environment**:
  - Debug logging enabled
  - Default timeout settings
  - Consistent configuration for testing

- **Production Environment**:
  - Debug logging disabled
  - Request retry functionality
  - Optimized error handling

For more details, see the [API Environment Configuration Documentation](./@docs/architecture/03-api/environment-config.md).

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

MIT 