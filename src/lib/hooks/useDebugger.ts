import { useStore } from '../store';
import { createDebugTools, DebugLevel, DebugState } from '../store/middleware/debugger';
import { useCallback, useEffect } from 'react';

/**
 * Custom hook to expose debug tools for the application state
 * 
 * In production, this can be toggled via the returned controls
 * or through a special key combination or URL parameter
 * 
 * @example
 * ```tsx
 * // In a debug panel component
 * const debugger = useDebugger();
 * 
 * return (
 *   <div className="debug-panel">
 *     <h3>Debug Controls</h3>
 *     <button onClick={() => debugger.toggleDebug()}>
 *       {debugger.isEnabled ? 'Disable' : 'Enable'} Debug Mode
 *     </button>
 *     <button onClick={debugger.clearHistory}>Clear History</button>
 *     
 *     <h4>Debug Levels</h4>
 *     {Object.values(DebugLevel).map(level => (
 *       <label key={level}>
 *         <input
 *           type="checkbox"
 *           checked={debugger.levels.includes(level)}
 *           onChange={() => debugger.toggleLevel(level)}
 *         />
 *         {level}
 *       </label>
 *     ))}
 *     
 *     <h4>Action History</h4>
 *     <ul>
 *       {debugger.actionHistory.map((action, i) => (
 *         <li key={i}>
 *           {new Date(action.timestamp).toLocaleTimeString()}: {action.action}
 *         </li>
 *       ))}
 *     </ul>
 *   </div>
 * );
 * ```
 */
export const useDebugger = () => {
  // Store must implement DebugState
  const store = useStore as any;
  
  // Create debug tools
  const debugTools = createDebugTools(store);
  
  // Get current debug state
  const isEnabled = debugTools.isDebugEnabled();
  const levels = debugTools.getDebugLevels();
  const actionHistory = debugTools.getActionHistory();
  const stateHistory = debugTools.getStateHistory();
  
  // Helper to toggle a specific debug level
  const toggleLevel = useCallback((level: DebugLevel) => {
    const currentLevels = debugTools.getDebugLevels();
    
    if (currentLevels.includes(level)) {
      // Remove the level if it exists
      debugTools.setDebugLevels(currentLevels.filter(l => l !== level));
    } else {
      // Add the level if it doesn't exist
      debugTools.setDebugLevels([...currentLevels, level]);
    }
  }, [debugTools]);
  
  // Effect to check for debug activation key combinations
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Enable debug with Ctrl+Shift+D
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        debugTools.toggleDebug(true);
        console.log('Debug mode enabled via keyboard shortcut');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // Check for URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('debug')) {
      debugTools.toggleDebug(true);
      console.log('Debug mode enabled via URL parameter');
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [debugTools]);
  
  return {
    // Current state
    isEnabled,
    levels,
    actionHistory,
    stateHistory,
    
    // Actions
    toggleDebug: debugTools.toggleDebug,
    setLevels: debugTools.setDebugLevels,
    toggleLevel,
    clearHistory: debugTools.clearDebugHistory,
    
    // Raw debug tools (for advanced usage)
    debugTools
  };
}; 