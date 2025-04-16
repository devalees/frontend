import React, { useState } from 'react';
import { useDebugger } from '../../lib/hooks/useDebugger';
import { DebugLevel } from '../../lib/store/middleware/debugger';

interface DebugPanelProps {
  /**
   * Position of the debug panel
   * @default 'bottom-right'
   */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /**
   * Custom CSS class for the debug panel
   */
  className?: string;
}

/**
 * Debug panel component that provides access to debugger tools
 * 
 * This component is only active in non-production environments by default,
 * but can be enabled in production using keyboard shortcuts or URL parameters.
 * 
 * Keyboard shortcut: Ctrl+Shift+D
 * URL parameter: ?debug
 */
export const DebugPanel: React.FC<DebugPanelProps> = ({ 
  position = 'bottom-right',
  className = '',
}) => {
  const debugTools = useDebugger();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'actions' | 'state' | 'settings'>('actions');
  
  // Don't render if debug is disabled and not in development
  if (!debugTools.isEnabled && process.env.NODE_ENV === 'production') {
    return null;
  }
  
  // Determine position classes
  const positionClasses = {
    'top-left': 'top-2 left-2',
    'top-right': 'top-2 right-2',
    'bottom-left': 'bottom-2 left-2',
    'bottom-right': 'bottom-2 right-2',
  }[position];
  
  // Base style for minimized/maximized states
  const baseClasses = `fixed z-50 bg-slate-800 text-white rounded-lg shadow-lg transition-all ${positionClasses} ${className}`;
  
  // Collapsed state: just show debug button
  if (!isExpanded) {
    return (
      <button 
        className={`${baseClasses} p-2 opacity-80 hover:opacity-100`}
        onClick={() => setIsExpanded(true)}
        title="Expand Debug Panel"
      >
        <span className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 13.5V3.75m0 9.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 010 3m0-3a1.5 1.5 0 000 3m0 9.75V10.5" />
          </svg>
          Debug
        </span>
      </button>
    );
  }
  
  // Render the expanded debug panel
  return (
    <div className={`${baseClasses} w-96 max-h-[80vh] overflow-auto p-4 opacity-90 hover:opacity-100 flex flex-col`}>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">Debug Panel</h2>
        <div className="flex space-x-2">
          <button 
            className={`p-1 px-2 text-xs rounded ${debugTools.isEnabled ? 'bg-green-600' : 'bg-red-600'}`} 
            onClick={() => debugTools.toggleDebug()}
          >
            {debugTools.isEnabled ? 'Enabled' : 'Disabled'}
          </button>
          <button 
            className="text-slate-400 hover:text-white"
            onClick={() => setIsExpanded(false)}
            title="Minimize Debug Panel"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Tab navigation */}
      <div className="flex border-b border-slate-700 mb-3">
        <button 
          className={`px-3 py-1 text-sm ${activeTab === 'actions' ? 'border-b-2 border-blue-500' : 'text-slate-400'}`}
          onClick={() => setActiveTab('actions')}
        >
          Actions
        </button>
        <button 
          className={`px-3 py-1 text-sm ${activeTab === 'state' ? 'border-b-2 border-blue-500' : 'text-slate-400'}`}
          onClick={() => setActiveTab('state')}
        >
          State
        </button>
        <button 
          className={`px-3 py-1 text-sm ${activeTab === 'settings' ? 'border-b-2 border-blue-500' : 'text-slate-400'}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>
      
      {/* Actions Tab */}
      {activeTab === 'actions' && (
        <div className="flex-1 overflow-auto">
          <div className="flex justify-between mb-2">
            <h3 className="text-sm font-medium">Action History</h3>
            <button 
              className="text-xs text-slate-400 hover:text-white"
              onClick={debugTools.clearHistory}
            >
              Clear
            </button>
          </div>
          
          {debugTools.actionHistory.length === 0 ? (
            <p className="text-slate-500 text-sm">No actions recorded yet</p>
          ) : (
            <ul className="text-sm space-y-1">
              {debugTools.actionHistory.map((action, index) => (
                <li key={index} className="border-b border-slate-700 pb-1">
                  <div className="flex justify-between">
                    <span className="font-medium">{action.action}</span>
                    <span className="text-slate-400 text-xs">
                      {new Date(action.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  {action.payload && (
                    <pre className="text-xs mt-1 bg-slate-900 p-1 rounded overflow-auto">
                      {JSON.stringify(action.payload, null, 2)}
                    </pre>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      
      {/* State Tab */}
      {activeTab === 'state' && (
        <div className="flex-1 overflow-auto">
          <div className="flex justify-between mb-2">
            <h3 className="text-sm font-medium">State History</h3>
            <button 
              className="text-xs text-slate-400 hover:text-white"
              onClick={debugTools.clearHistory}
            >
              Clear
            </button>
          </div>
          
          {debugTools.stateHistory.length === 0 ? (
            <p className="text-slate-500 text-sm">No state changes recorded yet</p>
          ) : (
            <ul className="text-sm space-y-1">
              {debugTools.stateHistory.map((state, index) => (
                <li key={index} className="border-b border-slate-700 pb-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-xs">
                      {new Date(state.timestamp).toLocaleTimeString()}
                    </span>
                    <button
                      className="text-xs text-blue-400 hover:text-blue-300"
                      onClick={() => {
                        console.log('State snapshot:', state.state);
                      }}
                    >
                      Log to Console
                    </button>
                  </div>
                  <div className="mt-1">
                    <pre className="text-xs bg-slate-900 p-1 rounded overflow-auto max-h-32">
                      {JSON.stringify(state.state, null, 2)}
                    </pre>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      
      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="flex-1">
          <h3 className="text-sm font-medium mb-2">Debug Levels</h3>
          <div className="space-y-1">
            {Object.values(DebugLevel).map((level) => (
              <label key={level} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={debugTools.levels.includes(level)}
                  onChange={() => debugTools.toggleLevel(level)}
                  className="rounded text-blue-500 focus:ring-blue-500"
                />
                <span>{level}</span>
              </label>
            ))}
          </div>
          
          <h3 className="text-sm font-medium mt-4 mb-2">Keyboard Shortcuts</h3>
          <div className="text-xs space-y-1">
            <p><span className="bg-slate-700 px-1 rounded">Ctrl</span> + <span className="bg-slate-700 px-1 rounded">Shift</span> + <span className="bg-slate-700 px-1 rounded">D</span> - Toggle debug mode</p>
          </div>
          
          <h3 className="text-sm font-medium mt-4 mb-2">URL Parameters</h3>
          <div className="text-xs">
            <p>Add <code className="bg-slate-700 px-1 rounded">?debug</code> to the URL to enable debug mode</p>
          </div>
        </div>
      )}
    </div>
  );
}; 