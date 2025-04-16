# Example Test Refactoring

This document provides a detailed example of refactoring an existing component test to use our new centralized testing utilities.

## Component Test Refactoring Example: Button Component

Let's walk through the process of refactoring a Button component test.

### Original Test File

```tsx
// src/tests/components/Button.test.tsx (before refactoring)
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { Button } from '../../components/ui/Button';

describe('Button Component', () => {
  test('should render with default variant', () => {
    render(<Button>Click me</Button>);
    
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toHaveClass('btn-default');
  });

  test('should render with primary variant', () => {
    render(<Button variant="primary">Click me</Button>);
    
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toHaveClass('btn-primary');
  });

  test('should render with secondary variant', () => {
    render(<Button variant="secondary">Click me</Button>);
    
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toHaveClass('btn-secondary');
  });

  test('should handle click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button', { name: 'Click me' });
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeDisabled();
  });

  test('should show loading state', () => {
    render(<Button loading>Click me</Button>);
    
    const spinner = screen.getByTestId('button-spinner');
    expect(spinner).toBeInTheDocument();
    
    const buttonText = screen.queryByText('Click me');
    expect(buttonText).not.toBeInTheDocument();
  });
});
```

### Step 1: Update Imports

Replace the direct imports from testing libraries with imports from our utilities:

```tsx
// src/tests/components/Button.test.tsx (after step 1)
import React from 'react';
import { render, screen, fireEvent } from '../../tests/utils';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { Button } from '../../components/ui/Button';
```

### Step 2: Create Fixtures

Create test fixtures for common button properties:

```tsx
// src/tests/components/Button.test.tsx (after step 2)
import React from 'react';
import { render, screen, fireEvent } from '../../tests/utils';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { Button } from '../../components/ui/Button';

// Define fixtures for button props
const createButtonProps = (overrides = {}) => ({
  children: 'Click me',
  variant: 'default',
  disabled: false,
  loading: false,
  onClick: vi.fn(),
  ...overrides
});
```

### Step 3: Refactor Tests to Use Render Utility and Fixtures

```tsx
// src/tests/components/Button.test.tsx (after step 3)
import React from 'react';
import { render, screen, fireEvent } from '../../tests/utils';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { Button } from '../../components/ui/Button';

// Define fixtures for button props
const createButtonProps = (overrides = {}) => ({
  children: 'Click me',
  variant: 'default',
  disabled: false,
  loading: false,
  onClick: vi.fn(),
  ...overrides
});

describe('Button Component', () => {
  test('should render with default variant', () => {
    const props = createButtonProps();
    render(<Button {...props} />);
    
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toHaveClass('btn-default');
  });

  test('should render with primary variant', () => {
    const props = createButtonProps({ variant: 'primary' });
    render(<Button {...props} />);
    
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toHaveClass('btn-primary');
  });

  test('should render with secondary variant', () => {
    const props = createButtonProps({ variant: 'secondary' });
    render(<Button {...props} />);
    
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toHaveClass('btn-secondary');
  });

  test('should handle click events', () => {
    const handleClick = vi.fn();
    const props = createButtonProps({ onClick: handleClick });
    render(<Button {...props} />);
    
    const button = screen.getByRole('button', { name: 'Click me' });
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('should be disabled when disabled prop is true', () => {
    const props = createButtonProps({ disabled: true });
    render(<Button {...props} />);
    
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeDisabled();
  });

  test('should show loading state', () => {
    const props = createButtonProps({ loading: true });
    render(<Button {...props} />);
    
    const spinner = screen.getByTestId('button-spinner');
    expect(spinner).toBeInTheDocument();
    
    const buttonText = screen.queryByText('Click me');
    expect(buttonText).not.toBeInTheDocument();
  });
});
```

### Final Refactored Test

Let's refine the test further to maximize the benefits of our utilities:

```tsx
// src/tests/components/Button.test.tsx (final version)
import React from 'react';
import { render, screen, fireEvent } from '../../tests/utils';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { Button } from '../../components/ui/Button';

// Define button fixture
const createButtonProps = (overrides = {}) => ({
  children: 'Click me',
  variant: 'default',
  disabled: false,
  loading: false,
  onClick: vi.fn(),
  ...overrides
});

describe('Button Component', () => {
  // Test variants
  describe('Variants', () => {
    test.each([
      ['default', 'btn-default'],
      ['primary', 'btn-primary'],
      ['secondary', 'btn-secondary'],
    ])('should render with %s variant', (variant, expectedClass) => {
      const props = createButtonProps({ variant });
      render(<Button {...props} />);
      
      const button = screen.getByRole('button', { name: 'Click me' });
      expect(button).toHaveClass(expectedClass);
    });
  });
  
  // Test interactions
  describe('Interactions', () => {
    test('should handle click events', () => {
      const handleClick = vi.fn();
      const props = createButtonProps({ onClick: handleClick });
      render(<Button {...props} />);
      
      const button = screen.getByRole('button', { name: 'Click me' });
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
  
  // Test states
  describe('States', () => {
    test('should be disabled when disabled prop is true', () => {
      const props = createButtonProps({ disabled: true });
      render(<Button {...props} />);
      
      const button = screen.getByRole('button', { name: 'Click me' });
      expect(button).toBeDisabled();
    });
    
    test('should show loading state', () => {
      const props = createButtonProps({ loading: true });
      render(<Button {...props} />);
      
      const spinner = screen.getByTestId('button-spinner');
      expect(spinner).toBeInTheDocument();
      
      const buttonText = screen.queryByText('Click me');
      expect(buttonText).not.toBeInTheDocument();
    });
  });
});
```

## Benefits of the Refactoring

1. **Simplified Imports**: Using centralized testing utilities makes imports cleaner and more consistent.

2. **Reduced Duplication**: The fixture approach eliminates repeated test data setup.

3. **Better Test Organization**: Using nested describe blocks improves test organization.

4. **Parameterized Tests**: Using test.each reduces duplication for similar test cases.

5. **More Maintainable**: If the component changes, fewer places need to be updated.

6. **Consistent Patterns**: The same approach can be used across all component tests.

7. **Better Provider Integration**: Our custom render function ensures components are tested in an environment that mimics the actual application.

## Next Steps for Component Refactoring

After refactoring the Button component test:

1. Apply the same pattern to other simple component tests
2. Move to more complex components that use context or have complex state
3. Refactor components that interact with the API using our mockApi utilities
4. Update the README to document any additional patterns discovered

This approach ensures gradual improvement of the test suite while maintaining test coverage. 