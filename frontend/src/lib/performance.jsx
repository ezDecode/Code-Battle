// Performance Optimization Utilities
// Provides lazy loading, code splitting, and performance monitoring

import { lazy, Suspense, memo, useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

// Lazy Loading Wrapper
export const withLazyLoading = (importFunc, fallback = null) => {
  const LazyComponent = lazy(importFunc);
  
  return memo((props) => (
    <ErrorBoundary
      fallback={
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Failed to load component</p>
          </div>
        </div>
      }
    >
      <Suspense
        fallback={
          fallback || (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )
        }
      >
        <LazyComponent {...props} />
      </Suspense>
    </ErrorBoundary>
  ));
};

// Virtual List Component for Large Lists
export const VirtualList = memo(({ 
  items, 
  itemHeight = 60, 
  containerHeight = 400, 
  renderItem, 
  className = "",
  overscan = 3 
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length
    );
    
    return items.slice(Math.max(0, startIndex - overscan), endIndex);
  }, [items, scrollTop, itemHeight, containerHeight, overscan]);
  
  const totalHeight = items.length * itemHeight;
  const offsetY = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan) * itemHeight;
  
  return (
    <div
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={(e) => setScrollTop(e.target.scrollTop)}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={item.id || index} style={{ height: itemHeight }}>
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

// Performance Monitor Hook
export const usePerformanceMonitor = (componentName) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 100) { // Log slow renders
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
      
      // Send to analytics if available
      if (window.gtag) {
        window.gtag('event', 'performance_timing', {
          custom_parameter: componentName,
          value: Math.round(renderTime)
        });
      }
    };
  }, [componentName]);
};

// Memoized Component Wrapper
export const withMemoization = (Component, areEqual) => {
  return memo(Component, areEqual);
};

// Debounced Value Hook
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttled Function Hook
export const useThrottle = (func, delay) => {
  const [lastRan, setLastRan] = useState(Date.now());

  return useCallback(
    (...args) => {
      if (Date.now() - lastRan >= delay) {
        func(...args);
        setLastRan(Date.now());
      }
    },
    [func, delay, lastRan]
  );
};

// Image Lazy Loading Component
export const LazyImage = memo(({ 
  src, 
  alt, 
  className = "", 
  placeholder = null,
  onLoad = () => {},
  onError = () => {} 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad();
  };

  const handleError = () => {
    setIsError(true);
    onError();
  };

  return (
    <div ref={imgRef} className={className}>
      {isInView && (
        <>
          {!isLoaded && !isError && (
            placeholder || (
              <div className="bg-gray-200 animate-pulse w-full h-full rounded" />
            )
          )}
          <img
            src={src}
            alt={alt}
            className={`transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            } ${className}`}
            onLoad={handleLoad}
            onError={handleError}
            style={{ display: isError ? 'none' : 'block' }}
          />
          {isError && (
            <div className="bg-gray-100 flex items-center justify-center w-full h-full rounded">
              <span className="text-gray-400 text-sm">Failed to load</span>
            </div>
          )}
        </>
      )}
    </div>
  );
});

// Bundle Size Analyzer (Development only)
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    const chunks = [];
    
    // Analyze webpack chunks
    if (window.__webpack_require__) {
      const webpackJsonp = window.webpackJsonp || [];
      chunks.push(...webpackJsonp.map(chunk => ({
        id: chunk[0],
        size: chunk[1] ? Object.keys(chunk[1]).length : 0
      })));
    }
    
    console.group('Bundle Analysis');
    console.table(chunks);
    console.groupEnd();
  }
};

// Memory Usage Monitor
export const useMemoryMonitor = (interval = 5000) => {
  const [memoryInfo, setMemoryInfo] = useState(null);

  useEffect(() => {
    if (!performance.memory) return;

    const updateMemoryInfo = () => {
      setMemoryInfo({
        used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(performance.memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) // MB
      });
    };

    updateMemoryInfo();
    const intervalId = setInterval(updateMemoryInfo, interval);

    return () => clearInterval(intervalId);
  }, [interval]);

  return memoryInfo;
};

// Component Performance Profiler
export const withPerformanceProfiler = (Component, componentName) => {
  return memo((props) => {
    usePerformanceMonitor(componentName);
    
    const startRender = performance.now();
    
    useEffect(() => {
      const endRender = performance.now();
      const renderTime = endRender - startRender;
      
      if (process.env.NODE_ENV === 'development' && renderTime > 50) {
        console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
      }
    });
    
    return <Component {...props} />;
  });
};

// Resource Preloader
export const preloadResource = (href, as = 'script') => {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    link.onload = resolve;
    link.onerror = reject;
    document.head.appendChild(link);
  });
};

// Critical CSS Inliner (for above-the-fold content)
export const inlineCriticalCSS = (css) => {
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.innerHTML = css;
    document.head.appendChild(style);
  }
};

// Performance Metrics Reporter
export const reportPerformanceMetrics = () => {
  if ('performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');
    
    const metrics = {
      // Core Web Vitals
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
      
      // Additional metrics
      ttfb: navigation.responseStart - navigation.requestStart,
      domInteractive: navigation.domInteractive - navigation.navigationStart,
      
      // Memory (if available)
      memoryUsed: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null
    };
    
    console.group('Performance Metrics');
    console.table(metrics);
    console.groupEnd();
    
    // Send to analytics
    if (window.gtag) {
      Object.entries(metrics).forEach(([key, value]) => {
        if (value !== null) {
          window.gtag('event', 'performance_metric', {
            metric_name: key,
            value: Math.round(value)
          });
        }
      });
    }
    
    return metrics;
  }
  
  return null;
};
