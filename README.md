# React Project

A modern React application built with TypeScript and Vite.

## Project Structure
frontend/
├── src/
│   ├── app/                    # Next.js 13+ app directory
│   │   ├── (auth)/            # Authentication routes
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/       # Protected routes
│   │   │   ├── projects/
│   │   │   ├── tasks/
│   │   │   ├── documents/
│   │   │   └── layout.tsx
│   │   ├── api/              # API routes
│   │   │   └── [...route]/
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   │
│   ├── components/            # All shared UI components
│   │   ├── ui/               # Base Components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── index.ts
│   │   ├── layout/           # Layout Components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Grid.tsx
│   │   │   └── index.ts
│   │   ├── forms/            # Form Components
│   │   │   ├── Form.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── DatePicker.tsx
│   │   │   └── index.ts
│   │   ├── loading/          # Loading States
│   │   │   ├── Spinner.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   └── index.ts
│   │   └── features/         # Feature-specific components
│   │       ├── projects/
│   │       ├── tasks/
│   │       └── documents/
│   │
│   ├── lib/                  # Utility functions and helpers
│   │   ├── api/             # API client setup
│   │   │   ├── axios.ts
│   │   │   └── interceptors/
│   │   ├── auth/            # Authentication utilities
│   │   │   ├── middleware.ts
│   │   │   └── session.ts
│   │   ├── components/      # Component-specific utilities
│   │   │   ├── button.ts
│   │   │   ├── input.ts
│   │   │   └── modal.ts
│   │   ├── hooks/          # Component-specific hooks
│   │   │   ├── useButton.ts
│   │   │   ├── useInput.ts
│   │   │   └── useModal.ts
│   │   └── utils/          # Helper functions
│   │
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useProjects.ts
│   │   └── useTasks.ts
│   │
│   ├── store/              # State management
│   │   ├── index.ts
│   │   └── slices/
│   │       ├── auth.ts
│   │       ├── projects.ts
│   │       └── tasks.ts
│   │
│   ├── styles/             # Global and component styles
│   │   ├── globals.css     # Global styles
│   │   ├── components/     # Component-specific styles
│   │   │   ├── button.css
│   │   │   ├── input.css
│   │   │   └── modal.css
│   │   └── themes/        # Theme-specific styles
│   │       ├── light.css
│   │       └── dark.css
│   │
│   ├── types/             # TypeScript types
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── components.ts
│   │   └── models.ts
│   │
│   └── tests/             # Test files
│       ├── components/    # Component tests
│       │   ├── Button.test.tsx
│       │   ├── Input.test.tsx
│       │   └── Modal.test.tsx
│       ├── hooks/        # Hook tests
│       │   ├── useAuth.test.ts
│       │   └── useProjects.test.ts
│       └── utils/        # Test utilities
│           ├── render.tsx
│           └── test-utils.ts

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