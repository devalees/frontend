import React, { useEffect, useState } from 'react';
import {
  registerComponent,
  loadComponent,
  preloadComponent,
  getComponent,
  debugComponentLoading,
  ComponentMetadata,
  FallbackProps
} from '../../lib/components/componentLoader';
import { observePerformance, logPerformanceData, clearPerformanceData } from '../../lib/components/debugPerformance';

// Define some test components
const TEST_COMPONENTS: ComponentMetadata[] = [
  {
    id: 'button',
    displayName: 'Button',
    path: '/components/Button',
    size: 1024,
    dependencies: []
  },
  {
    id: 'card',
    displayName: 'Card',
    path: '/components/Card',
    size: 2048,
    dependencies: ['button']
  },
  {
    id: 'modal',
    displayName: 'Modal',
    path: '/components/Modal',
    size: 4096,
    dependencies: ['button', 'card']
  },
  {
    id: 'error-component',
    displayName: 'Error Component',
    path: '/components/error',
    size: 512,
    dependencies: []
  }
];

// Create a fallback component for errors
const ErrorFallback = ({ error, retry }: FallbackProps) => (
  <div style={{ border: '2px solid red', padding: '10px', margin: '10px 0', borderRadius: '4px' }}>
    <h3>Error Loading Component</h3>
    <p>{error.message}</p>
    {error.componentId && <p>Component ID: {error.componentId}</p>}
    <button onClick={retry}>Retry</button>
  </div>
);

// Create the test component
const ComponentLoaderTest: React.FC = () => {
  const [initialized, setInitialized] = useState(false);
  const [observer, setObserver] = useState<PerformanceObserver | null>(null);
  const [activeComponents, setActiveComponents] = useState<string[]>([]);
  
  // Initialize the test environment
  useEffect(() => {
    console.log('Initializing component loader test');
    
    // Register all test components
    TEST_COMPONENTS.forEach(component => {
      registerComponent(component);
      console.log(`Registered component: ${component.id}`);
    });
    
    // Start observing performance
    const perfObserver = observePerformance();
    setObserver(perfObserver);
    
    setInitialized(true);
    
    // Clean up on unmount
    return () => {
      if (perfObserver) {
        perfObserver.disconnect();
      }
      clearPerformanceData();
    };
  }, []);
  
  // Preload a component
  const handlePreload = async (componentId: string) => {
    console.log(`Preloading component: ${componentId}`);
    try {
      await preloadComponent(componentId);
      console.log(`Successfully preloaded component: ${componentId}`);
    } catch (error) {
      console.error(`Error preloading component: ${componentId}`, error);
    }
  };
  
  // Load a component directly
  const handleLoad = async (componentId: string) => {
    console.log(`Loading component: ${componentId}`);
    try {
      await loadComponent(componentId);
      console.log(`Successfully loaded component: ${componentId}`);
    } catch (error) {
      console.error(`Error loading component: ${componentId}`, error);
    }
  };
  
  // Show a component
  const handleShowComponent = (componentId: string) => {
    console.log(`Showing component: ${componentId}`);
    if (!activeComponents.includes(componentId)) {
      setActiveComponents([...activeComponents, componentId]);
    }
  };
  
  // Hide a component
  const handleHideComponent = (componentId: string) => {
    console.log(`Hiding component: ${componentId}`);
    setActiveComponents(activeComponents.filter(id => id !== componentId));
  };
  
  // Log performance data
  const handleShowPerformance = () => {
    logPerformanceData();
    debugComponentLoading();
  };
  
  // Clear performance data
  const handleClearPerformance = () => {
    clearPerformanceData();
  };
  
  // Create components
  const ButtonComponent = getComponent('button', ErrorFallback);
  const CardComponent = getComponent('card', ErrorFallback);
  const ModalComponent = getComponent('modal', ErrorFallback);
  const ErrorComponent = getComponent('error-component', ErrorFallback);
  
  if (!initialized) {
    return <div>Initializing...</div>;
  }
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>Component Loader Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Actions</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {TEST_COMPONENTS.map(component => (
            <div key={component.id} style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '4px' }}>
              <h3>{component.displayName}</h3>
              <div style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                <button onClick={() => handlePreload(component.id)}>Preload</button>
                <button onClick={() => handleLoad(component.id)}>Load</button>
              </div>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button 
                  onClick={() => handleShowComponent(component.id)}
                  disabled={activeComponents.includes(component.id)}
                >
                  Show
                </button>
                <button 
                  onClick={() => handleHideComponent(component.id)}
                  disabled={!activeComponents.includes(component.id)}
                >
                  Hide
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div style={{ marginTop: '20px' }}>
          <button onClick={handleShowPerformance}>Show Performance Data</button>
          <button onClick={handleClearPerformance} style={{ marginLeft: '10px' }}>Clear Performance Data</button>
        </div>
      </div>
      
      <div>
        <h2>Components</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {activeComponents.includes('button') && (
            <div>
              <h3>Button Component</h3>
              <ButtonComponent label="Test Button" onClick={() => alert('Button clicked')} />
            </div>
          )}
          
          {activeComponents.includes('card') && (
            <div>
              <h3>Card Component</h3>
              <CardComponent title="Test Card" content="This is a test card component" />
            </div>
          )}
          
          {activeComponents.includes('modal') && (
            <div>
              <h3>Modal Component</h3>
              <ModalComponent title="Test Modal" isOpen={true} onClose={() => handleHideComponent('modal')}>
                <p>This is a test modal component</p>
              </ModalComponent>
            </div>
          )}
          
          {activeComponents.includes('error-component') && (
            <div>
              <h3>Error Component</h3>
              <ErrorComponent />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComponentLoaderTest; 