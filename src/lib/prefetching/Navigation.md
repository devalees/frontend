# Navigation Components with Prefetching

This documentation explains the navigation components available in the application and how to use them for optimal performance with prefetching.

## Overview

The application provides two specialized components for navigation with prefetching capabilities:

1. **Link**: For text links and link-styled navigation
2. **NavButton**: For button-styled navigation

Both components share the same core functionality:
- They navigate to the specified route when clicked
- They prefetch the destination page on hover after a short delay
- They provide visual feedback during prefetching via the `is-prefetching` CSS class
- They respect global prefetch settings from the PrefetchProvider

## When to Use Each Component

### Use Link when:
- The element is semantically a link
- You want link-styled navigation (text links, breadcrumbs, etc.)
- SEO and proper anchor tags are important

### Use NavButton when:
- The element is visually a button but navigates to a new page
- You want button-styled navigation (call-to-action buttons, navigation buttons)
- You previously used `<Button onClick={() => router.push('/route')}>`

## Basic Usage

```tsx
import { Link } from '@/components/ui/Link';
import { NavButton } from '@/components/ui/NavButton';

// Link-styled navigation
<Link href="/dashboard">Dashboard</Link>

// Button-styled navigation
<NavButton href="/settings">Settings</NavButton>
```

## Advanced Options

Both components accept the following common props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `href` | string | (required) | The destination URL |
| `prefetch` | boolean | true | Whether to enable prefetching on hover |
| `prefetchTimeout` | number | from settings | Delay in ms before prefetching starts on hover |
| `className` | string | '' | CSS class names |

### Link Specific Props

Link accepts all props that a standard Next.js Link component accepts.

```tsx
<Link 
  href="/dashboard" 
  prefetch={false} // Disable prefetching
  prefetchTimeout={300} // Wait 300ms before prefetching
  className="text-blue-500 hover:underline"
>
  Dashboard
</Link>
```

### NavButton Specific Props

NavButton accepts all props that the Button component accepts (except `href` which is handled specially).

```tsx
<NavButton 
  href="/settings" 
  variant="outline" // Button variant
  size="small" // Button size
  prefetch={true} 
  prefetchTimeout={200}
  disabled={!isLoggedIn} // Disable the button conditionally
>
  Settings
</NavButton>
```

## Global Prefetch Settings

Both components respect the global prefetch settings from the PrefetchProvider:

```tsx
import { PrefetchProvider } from '@/lib/prefetching';

// Wrap your application with the provider
<PrefetchProvider
  initialSettings={{
    enabled: true, // Enable/disable all prefetching
    linkHoverDelay: 100, // Default hover delay in ms
    paginationThreshold: 3, // For pagination prefetching
    prefetchOnlyNextPage: true, // For pagination prefetching
  }}
>
  <YourApp />
</PrefetchProvider>
```

You can also update settings dynamically:

```tsx
import { usePrefetchSettings } from '@/lib/prefetching';

function SettingsPanel() {
  const { settings, setEnabled, setLinkHoverDelay } = usePrefetchSettings();
  
  return (
    <div>
      <Checkbox 
        checked={settings.enabled}
        onChange={e => setEnabled(e.target.checked)}
      >
        Enable prefetching
      </Checkbox>
      
      <Slider 
        value={settings.linkHoverDelay}
        onChange={value => setLinkHoverDelay(value)}
        min={0}
        max={500}
      >
        Hover delay: {settings.linkHoverDelay}ms
      </Slider>
    </div>
  );
}
```

## Working with onClick Handlers

Both components allow you to provide custom onClick handlers while still managing navigation.

```tsx
<NavButton 
  href="/profile" 
  onClick={(e) => {
    // Track navigation event
    analytics.trackEvent('profile_visit');
    
    // If you call e.preventDefault(), navigation won't happen
    // This is useful for confirmation dialogs
    if (!confirmNavigation()) {
      e.preventDefault();
    }
  }}
>
  Profile
</NavButton>
```

## Implementation Examples

### Converting Regular Links to our Link component

Before:
```tsx
import Link from 'next/link';

<Link href="/dashboard">Dashboard</Link>
```

After:
```tsx
import { Link } from '@/components/ui/Link';

<Link href="/dashboard">Dashboard</Link>
```

### Converting Button Navigation to NavButton

Before:
```tsx
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

const router = useRouter();

<Button onClick={() => router.push('/settings')}>Settings</Button>
```

After:
```tsx
import { NavButton } from '@/components/ui/NavButton';

<NavButton href="/settings">Settings</NavButton>
```

## Styling

Both components apply the CSS class `is-prefetching` when prefetching is active. You can use this to provide visual feedback to the user.

```css
/* Example styles for prefetching state */
.is-prefetching {
  transition: all 0.2s ease;
}

a.is-prefetching {
  color: #0070f3;
}

button.is-prefetching {
  box-shadow: 0 0 0 2px rgba(0, 112, 243, 0.3);
}
```

## Performance Considerations

- Both components use React's `useState` to track prefetching state
- Prefetching is delayed by default (using the global setting) to avoid unnecessary prefetching
- Components clean up timeouts when unmounted or when the mouse leaves
- Prefetching uses Next.js router's `prefetch` method for optimal performance
- Both components can be disabled globally via the PrefetchProvider 