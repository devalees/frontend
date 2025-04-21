/**
 * Mock UserEvent
 * 
 * This provides a comprehensive mock of the userEvent functionality
 * without requiring the @testing-library/dom dependency
 */

// Create basic mock functions with implementations for user events
const userEvent = {
  // Basic form interactions
  click: jest.fn((element) => {
    if (element && typeof element.click === 'function') {
      element.click();
    }
    if (element && element.onclick) {
      element.onclick();
    }
  }),
  
  dblClick: jest.fn((element) => {
    if (element && typeof element.click === 'function') {
      element.click();
      element.click();
    }
    if (element && element.ondblclick) {
      element.ondblclick();
    }
  }),

  type: jest.fn((element, text) => {
    if (element) {
      // Update element value
      if ('value' in element) {
        element.value = text;
      }
      
      // Trigger input event
      const inputEvent = new Event('input', { bubbles: true });
      element.dispatchEvent(inputEvent);
      
      // Trigger change event
      const changeEvent = new Event('change', { bubbles: true });
      element.dispatchEvent(changeEvent);
    }
  }),

  clear: jest.fn((element) => {
    if (element && 'value' in element) {
      element.value = '';
      
      // Trigger input event
      const inputEvent = new Event('input', { bubbles: true });
      element.dispatchEvent(inputEvent);
      
      // Trigger change event
      const changeEvent = new Event('change', { bubbles: true });
      element.dispatchEvent(changeEvent);
    }
  }),

  selectOptions: jest.fn(),
  deselectOptions: jest.fn(),
  
  // Keyboard interactions
  keyboard: jest.fn((keys) => {
    // Basic implementation to simulate key presses
    if (keys === '{Tab}') {
      // Try to find the active element and move focus
      if (document.activeElement && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
        if (document.activeElement.nextElementSibling instanceof HTMLElement) {
          document.activeElement.nextElementSibling.focus();
        }
      }
    }
  }),
  
  tab: jest.fn(() => {
    // Implementation similar to keyboard('{Tab}')
    if (document.activeElement && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
      if (document.activeElement.nextElementSibling instanceof HTMLElement) {
        document.activeElement.nextElementSibling.focus();
      }
    }
  }),
  
  // Pointer interactions
  hover: jest.fn((element) => {
    if (element) {
      // Trigger mouseenter event
      const mouseEnterEvent = new Event('mouseenter', { bubbles: true });
      element.dispatchEvent(mouseEnterEvent);
      
      // Trigger mouseover event
      const mouseOverEvent = new Event('mouseover', { bubbles: true });
      element.dispatchEvent(mouseOverEvent);
    }
  }),
  
  unhover: jest.fn((element) => {
    if (element) {
      // Trigger mouseleave event
      const mouseLeaveEvent = new Event('mouseleave', { bubbles: true });
      element.dispatchEvent(mouseLeaveEvent);
      
      // Trigger mouseout event
      const mouseOutEvent = new Event('mouseout', { bubbles: true });
      element.dispatchEvent(mouseOutEvent);
    }
  }),
  
  // Form submission
  upload: jest.fn(),
  
  // Focus events
  focus: jest.fn((element) => {
    if (element && element instanceof HTMLElement && typeof element.focus === 'function') {
      element.focus();
    }
  }),
  
  blur: jest.fn((element) => {
    if (element && element instanceof HTMLElement && typeof element.blur === 'function') {
      element.blur();
    }
  }),
  
  // Setup method for configuration
  setup: () => userEvent
};

export default userEvent; 