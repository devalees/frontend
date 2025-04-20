import React from 'react';
import { render, screen, fireEvent  } from '../../tests/utils';
import { jest } from "@jest/globals";
import { DebugPanel } from '../../components/debug/DebugPanel';
import { useDebugger } from '../../lib/hooks/useDebugger';

// Mock the useDebugger hook
jest.mock('../../lib/hooks/useDebugger', () => ({
  useDebugger: jest.fn(),
}));

describe('DebugPanel', () => {
  // Default mock implementation for useDebugger
  const defaultMockDebugger = {
    isEnabled: true,
    levels: ['error', 'state', 'action'],
    actionHistory: [],
    stateHistory: [],
    toggleDebug: jest.fn(),
    setLevels: jest.fn(),
    toggleLevel: jest.fn(),
    clearHistory: jest.fn(),
    debugTools: {},
  };

  beforeEach(() => {
    jest.resetAllMocks();
    // Setup the default mock implementation
    (useDebugger as any).mockReturnValue(defaultMockDebugger);
  });

  it('should not render if debug is disabled in production', () => {
    // Mock process.env
    const originalEnv = process.env.NODE_ENV;
    (process.env as any).NODE_ENV = 'production';
    
    // Mock debug to be disabled
    (useDebugger as any).mockReturnValue({
      ...defaultMockDebugger,
      isEnabled: false,
    });
    
    const { container } = render(<DebugPanel />);
    
    // Should not render anything
    expect(container.firstChild).toBeNull();
    
    // Restore env
    (process.env as any).NODE_ENV = originalEnv;
  });

  it('should render minimized button by default', () => {
    render(<DebugPanel />);
    
    // Check for the debug button
    const debugButton = screen.getByText('Debug');
    expect(debugButton).toBeInTheDocument();
    
    // Panel should not be expanded yet
    expect(screen.queryByText('Debug Panel')).not.toBeInTheDocument();
  });

  it('should expand panel when button is clicked', () => {
    render(<DebugPanel />);
    
    // Click the debug button
    const debugButton = screen.getByText('Debug');
    fireEvent.click(debugButton);
    
    // Panel should now be expanded
    expect(screen.getByText('Debug Panel')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
    expect(screen.getByText('State')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should toggle debug when toggle button is clicked', () => {
    render(<DebugPanel />);
    
    // Expand the panel
    const debugButton = screen.getByText('Debug');
    fireEvent.click(debugButton);
    
    // Find the toggle button (based on enabled state)
    const toggleButton = screen.getByText('Enabled');
    fireEvent.click(toggleButton);
    
    // Check that toggle was called
    expect(defaultMockDebugger.toggleDebug).toHaveBeenCalled();
  });

  it('should switch tabs when clicked', () => {
    render(<DebugPanel />);
    
    // Expand the panel
    const debugButton = screen.getByText('Debug');
    fireEvent.click(debugButton);
    
    // Default tab should be Actions
    expect(screen.getByText('Action History')).toBeInTheDocument();
    
    // Click State tab
    const stateTab = screen.getByText('State');
    fireEvent.click(stateTab);
    
    // Should now show State History
    expect(screen.getByText('State History')).toBeInTheDocument();
    
    // Click Settings tab
    const settingsTab = screen.getByText('Settings');
    fireEvent.click(settingsTab);
    
    // Should now show Debug Levels
    expect(screen.getByText('Debug Levels')).toBeInTheDocument();
  });

  it('should show empty state when no history', () => {
    render(<DebugPanel />);
    
    // Expand the panel
    const debugButton = screen.getByText('Debug');
    fireEvent.click(debugButton);
    
    // Should show empty state
    expect(screen.getByText('No actions recorded yet')).toBeInTheDocument();
    
    // Switch to state tab
    const stateTab = screen.getByText('State');
    fireEvent.click(stateTab);
    
    // Should show empty state
    expect(screen.getByText('No state changes recorded yet')).toBeInTheDocument();
  });

  it('should display action history items', () => {
    // Set some action history
    (useDebugger as any).mockReturnValue({
      ...defaultMockDebugger,
      actionHistory: [
        { action: 'increment', timestamp: Date.now(), payload: { count: 1 } },
        { action: 'addTodo', timestamp: Date.now() - 1000, payload: { text: 'Test' } }
      ]
    });
    
    render(<DebugPanel />);
    
    // Expand the panel
    const debugButton = screen.getByText('Debug');
    fireEvent.click(debugButton);
    
    // Should show action names
    expect(screen.getByText('increment')).toBeInTheDocument();
    expect(screen.getByText('addTodo')).toBeInTheDocument();
  });

  it('should display state history items', () => {
    // Set some state history
    const mockState = { count: 1, todos: [] };
    (useDebugger as any).mockReturnValue({
      ...defaultMockDebugger,
      stateHistory: [
        { timestamp: Date.now(), state: mockState },
      ]
    });
    
    render(<DebugPanel />);
    
    // Expand the panel
    const debugButton = screen.getByText('Debug');
    fireEvent.click(debugButton);
    
    // Switch to state tab
    const stateTab = screen.getByText('State');
    fireEvent.click(stateTab);
    
    // Should find the Log to Console button
    const logButton = screen.getByText('Log to Console');
    expect(logButton).toBeInTheDocument();
    
    // Check state is displayed using a different approach
    // Since pre doesn't have a presentation role, we target the element directly
    const preElement = screen.getByText((content) => 
      content.includes('"count": 1') && content.includes('"todos": []')
    );
    expect(preElement).toBeInTheDocument();
  });

  it('should handle debug level toggling', () => {
    render(<DebugPanel />);
    
    // Expand the panel
    const debugButton = screen.getByText('Debug');
    fireEvent.click(debugButton);
    
    // Go to settings tab
    const settingsTab = screen.getByText('Settings');
    fireEvent.click(settingsTab);
    
    // Find first checkbox and click it
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    
    // Check toggle was called
    expect(defaultMockDebugger.toggleLevel).toHaveBeenCalled();
  });

  it('should minimize when minimize button is clicked', () => {
    render(<DebugPanel />);
    
    // Expand the panel
    const debugButton = screen.getByText('Debug');
    fireEvent.click(debugButton);
    
    // Panel should be expanded
    expect(screen.getByText('Debug Panel')).toBeInTheDocument();
    
    // Click minimize button
    const minimizeButton = screen.getAllByRole('button').find(
      button => button.getAttribute('title') === 'Minimize Debug Panel'
    );
    if (minimizeButton) {
      fireEvent.click(minimizeButton);
    }
    
    // Panel should be minimized
    expect(screen.queryByText('Debug Panel')).not.toBeInTheDocument();
    expect(screen.getByText('Debug')).toBeInTheDocument();
  });
}); 