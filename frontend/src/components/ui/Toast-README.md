# Universal Toast System

A comprehensive, modern toast notification system built with React, Framer Motion, and Tailwind CSS. This system provides beautiful, accessible, and highly customizable toast notifications with support for different types, positions, actions, and promise-based operations.

## Features

- 🎨 **Beautiful Design**: Modern UI with smooth animations and glassmorphism effects
- 🔄 **Multiple Types**: Success, Error, Warning, Info, and Loading toasts
- 📍 **Flexible Positioning**: 6 different position options
- ⚡ **Promise Support**: Built-in promise handling for async operations
- 🎭 **Rich Animations**: Smooth enter/exit animations with Framer Motion
- 🎯 **Action Support**: Add interactive buttons to toasts
- ♿ **Accessible**: ARIA labels and keyboard navigation support
- 🎛️ **Highly Customizable**: Extensive theming and styling options
- 📱 **Responsive**: Works perfectly on all screen sizes

## Installation & Setup

1. **Install Dependencies**:
```bash
npm install framer-motion lucide-react
```

2. **Add Toast Provider to your App**:
```jsx
import { ToastProvider } from '@/components/ui/Toast';

function App() {
  return (
    <ToastProvider>
      {/* Your app content */}
    </ToastProvider>
  );
}
```

## Basic Usage

```jsx
import { useToast } from '@/components/ui/Toast';

function MyComponent() {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success('Operation completed successfully!');
  };

  const handleError = () => {
    toast.error('Something went wrong!');
  };

  return (
    <div>
      <button onClick={handleSuccess}>Success</button>
      <button onClick={handleError}>Error</button>
    </div>
  );
}
```

## Toast Types

### Success Toast
```jsx
toast.success('Challenge completed successfully!', {
  title: 'Well Done!',
  action: {
    label: 'View Details',
    onClick: () => console.log('Action clicked')
  }
});
```

### Error Toast
```jsx
toast.error('Failed to submit solution. Please try again.', {
  title: 'Submission Failed'
});
```

### Warning Toast
```jsx
toast.warning('Your session will expire in 5 minutes.', {
  title: 'Session Warning'
});
```

### Info Toast
```jsx
toast.info('New daily challenge is available!', {
  title: 'Daily Challenge'
});
```

### Loading Toast
```jsx
const loadingId = toast.loading('Processing your request...');

// Later, remove the loading toast
toast.removeToast(loadingId);
```

## Advanced Features

### Promise-based Operations
```jsx
const syncData = async () => {
  const promise = fetch('/api/sync');
  
  return toast.promise(promise, {
    loading: 'Syncing with LeetCode...',
    success: 'Sync completed successfully!',
    error: 'Failed to sync. Please try again.'
  });
};
```

### Custom Actions
```jsx
toast.success('File uploaded successfully!', {
  title: 'Upload Complete',
  action: {
    label: 'Open File',
    onClick: () => {
      // Handle action
      window.open('/files/uploaded-file.pdf');
    }
  }
});
```

### Custom Duration
```jsx
toast.info('This message will stay for 10 seconds', {
  duration: 10000 // 10 seconds
});

// Permanent toast (manual dismissal only)
toast.info('This stays until manually closed', {
  duration: null
});
```

### Non-dismissible Toasts
```jsx
toast.loading('Critical operation in progress...', {
  dismissible: false
});
```

## Toast Positions

Change the global toast position:

```jsx
<ToastProvider defaultPosition="top-left">
  <App />
</ToastProvider>
```

Available positions:
- `top-right` (default)
- `top-left`
- `top-center`
- `bottom-right`
- `bottom-left`
- `bottom-center`

Or change position dynamically:
```jsx
const { setPosition } = useToast();
setPosition('bottom-center');
```

## API Reference

### useToast Hook

```jsx
const {
  // Basic methods
  success,
  error,
  warning,
  info,
  loading,
  
  // Advanced methods
  toast,          // Generic toast method
  promise,        // Promise-based toast
  removeToast,    // Remove specific toast
  clearAll,       // Clear all toasts
  setPosition     // Change position
} = useToast();
```

### Toast Options

```jsx
interface ToastOptions {
  title?: string;           // Toast title
  duration?: number | null; // Auto-dismiss duration (ms)
  dismissible?: boolean;    // Can be manually dismissed
  action?: {               // Action button
    label: string;
    onClick: () => void;
  };
}
```

### Toast Types

```jsx
const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  LOADING: 'loading'
};
```

### Toast Positions

```jsx
const TOAST_POSITIONS = {
  TOP_RIGHT: 'top-right',
  TOP_LEFT: 'top-left',
  TOP_CENTER: 'top-center',
  BOTTOM_RIGHT: 'bottom-right',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_CENTER: 'bottom-center'
};
```

## Best Practices

### 1. Use Appropriate Types
- **Success**: For completed actions (submissions, saves, syncs)
- **Error**: For failed operations that need user attention
- **Warning**: For important notices that aren't errors
- **Info**: For general information and updates
- **Loading**: For ongoing operations

### 2. Write Clear Messages
```jsx
// ❌ Bad
toast.error('Error');

// ✅ Good
toast.error('Failed to save your changes. Please check your connection and try again.');
```

### 3. Use Titles for Context
```jsx
toast.success('Your solution has been submitted successfully!', {
  title: 'Submission Complete'
});
```

### 4. Add Actions When Relevant
```jsx
toast.error('Your session has expired.', {
  title: 'Authentication Required',
  action: {
    label: 'Login Again',
    onClick: () => redirectToLogin()
  }
});
```

### 5. Handle Promises Properly
```jsx
const handleSubmit = async () => {
  try {
    await toast.promise(submitSolution(), {
      loading: 'Submitting your solution...',
      success: 'Solution submitted successfully!',
      error: 'Failed to submit. Please try again.'
    });
  } catch (error) {
    // Handle error if needed
  }
};
```

### 6. Clean Up Loading Toasts
```jsx
const handleOperation = async () => {
  const loadingId = toast.loading('Processing...');
  
  try {
    await someOperation();
    toast.removeToast(loadingId);
    toast.success('Operation completed!');
  } catch (error) {
    toast.removeToast(loadingId);
    toast.error('Operation failed!');
  }
};
```

## Styling & Theming

The toast system uses Tailwind CSS classes and can be customized by modifying the component styles. Key areas for customization:

- **Colors**: Modify the `getToastStyles` function
- **Animations**: Adjust Framer Motion configurations
- **Typography**: Change font families and sizes
- **Spacing**: Modify padding and margins
- **Shadows**: Customize shadow styles

## CodeBattle Integration Examples

### LeetCode Sync
```jsx
const handleLeetCodeSync = async () => {
  const syncPromise = syncWithLeetCode();
  
  const result = await toast.promise(syncPromise, {
    loading: 'Syncing with LeetCode...',
    success: data => `Synced ${data.problems} problems! Earned ${data.points} points.`,
    error: 'Failed to sync. Please check your LeetCode username.'
  });
};
```

### Challenge Completion
```jsx
const handleChallengeComplete = (challenge) => {
  toast.success(`Challenge "${challenge.title}" completed successfully!`, {
    title: 'Well Done! 🎉',
    action: {
      label: 'View Stats',
      onClick: () => openStatsModal()
    }
  });
};
```

### Team Operations
```jsx
const handleTeamJoin = (teamName) => {
  toast.success(`Successfully joined ${teamName}! Welcome to the squad.`, {
    title: 'Team Joined 👥',
    action: {
      label: 'View Team',
      onClick: () => navigateToTeam()
    }
  });
};
```

## Accessibility

The toast system includes several accessibility features:

- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: Escape key to dismiss
- **Focus Management**: Proper focus handling
- **Color Contrast**: High contrast for readability
- **Motion Preferences**: Respects user motion preferences

## Performance

The toast system is optimized for performance:

- **Lazy Rendering**: Only renders visible toasts
- **Memory Management**: Automatic cleanup of dismissed toasts
- **Animation Optimization**: Hardware-accelerated animations
- **Bundle Size**: Minimal impact on bundle size

## Browser Support

- **Modern Browsers**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **Mobile**: iOS Safari 12+, Chrome Mobile 60+
- **Legacy Support**: Graceful degradation for older browsers

## Contributing

When contributing to the toast system:

1. Follow the existing code style
2. Add proper TypeScript types
3. Include unit tests for new features
4. Update documentation
5. Test across different browsers and devices

## License

This toast system is part of the CodeBattle project and follows the same license terms.
