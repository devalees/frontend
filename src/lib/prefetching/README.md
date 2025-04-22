# Prefetching System

This module provides a systematic approach to handling prefetching in the application, covering both route prefetching and data prefetching scenarios.

## Features

- **Link Prefetching**: Automatically prefetch routes when users hover over links
- **Pagination Prefetching**: Preemptively fetch the next page of data in paginated lists
- **Global Configuration**: Centralized settings for controlling prefetching behavior
- **Performance Optimization**: Reduce perceived loading times and improve user experience

## Components

### Link

Main UI component for navigation with built-in prefetching capabilities.

```tsx
import { Link } from '@/components/ui/Link';

// Basic usage
<Link href="/dashboard">Dashboard</Link>

// With styling variants
<Link 
  href="/users" 
  variant="primary"
  size="large"
  underline={true}
>
  Users
</Link>

// With custom prefetch delay (in milliseconds)
<Link href="/analytics" prefetchTimeout={200}>Analytics</Link>

// Disable prefetching for specific link
<Link href="/reports" prefetch={false}>Reports</Link>
```

### PaginatedList

Reusable component for paginated lists with built-in prefetching.

```tsx
import { PaginatedList } from '@/components/PaginatedList';

<PaginatedList
  data={users}
  totalPages={10}
  currentPage={1}
  isLoading={isLoading}
  fetchPage={fetchUserPage}
  renderItem={(user) => <UserCard user={user} />}
/>
```

### PrefetchLink

Low-level component that prefetches the target page on hover (used internally by the Link component).

```tsx
import { PrefetchLink } from '@/lib/prefetching';

<PrefetchLink href="/dashboard">Dashboard</PrefetchLink>
```

## Hooks

### usePaginationPrefetch

Hook for custom implementation of pagination prefetching logic.

```tsx
import { usePaginationPrefetch } from '@/lib/prefetching';

const { prefetchedPages, prefetchPage } = usePaginationPrefetch({
  currentData: data,
  totalPages: 10,
  currentPage: 2,
  fetchNextPage: fetchData,
  prefetchThreshold: 3
});
```

### usePrefetchSettings

Hook to access and update global prefetching settings.

```tsx
import { usePrefetchSettings } from '@/lib/prefetching';

const { settings, setEnabled } = usePrefetchSettings();

// Disable prefetching temporarily
<Button onClick={() => setEnabled(false)}>Disable Prefetching</Button>
```

## Global Configuration

The PrefetchProvider component manages prefetching settings globally. It's already integrated into the application's root layout.

You can customize default settings when needed:

```tsx
import { PrefetchProvider } from '@/lib/prefetching';

<PrefetchProvider 
  initialSettings={{
    enabled: true,
    linkHoverDelay: 150,
    paginationThreshold: 5,
    prefetchOnlyNextPage: true
  }}
>
  {children}
</PrefetchProvider>
```

## Best Practices

1. **Use Link for navigation**: Replace standard `next/link` Link or `<a>` tags with our `<Link>` component for automatic prefetching.

2. **Use PaginatedList for lists**: Leverage the built-in prefetching capabilities of the PaginatedList component.

3. **Custom threshold for large pages**: Adjust the `prefetchThreshold` based on content size and user behavior.

4. **Disable for slow connections**: Consider disabling prefetching for users on slow connections using the Network Information API.

5. **Monitor performance**: Keep track of prefetching performance metrics to ensure it's improving user experience.

## Implementation Guide

1. For navigation, replace:
   ```diff
   - import Link from 'next/link';
   - <Link href="/dashboard">Dashboard</Link>
   + import { Link } from '@/components/ui/Link';
   + <Link href="/dashboard">Dashboard</Link>
   ```

2. For data lists, replace custom pagination with:
   ```diff
   - <div>
   -   {items.map(item => <ItemComponent key={item.id} item={item} />)}
   -   <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
   - </div>
   + <PaginatedList
   +   data={items}
   +   totalPages={totalPages}
   +   currentPage={page}
   +   isLoading={isLoading}
   +   fetchPage={handlePageChange}
   +   renderItem={(item) => <ItemComponent item={item} />}
   + />
   ```

## Performance Considerations

- Prefetching consumes bandwidth, so use it judiciously
- Consider user connection speed and device capabilities
- Monitor the impact on server load and adjust thresholds accordingly 