/**
 * Utility functions for the Modal component
 */

/**
 * Prevents scrolling of the body when modal is open
 * @param isOpen - Whether the modal is open
 */
export const toggleBodyScroll = (isOpen: boolean): void => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
};

/**
 * Gets all focusable elements within a container
 * @param container - The container element
 * @returns Array of focusable elements
 */
export const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  return Array.from(focusableElements) as HTMLElement[];
};

/**
 * Traps focus within a container
 * @param container - The container element
 * @param event - The keyboard event
 */
export const trapFocus = (container: HTMLElement, event: KeyboardEvent): void => {
  const focusableElements = getFocusableElements(container);
  
  if (focusableElements.length === 0) return;
  
  const firstFocusableElement = focusableElements[0];
  const lastFocusableElement = focusableElements[focusableElements.length - 1];
  
  if (event.key === 'Tab') {
    if (event.shiftKey) {
      if (document.activeElement === firstFocusableElement) {
        event.preventDefault();
        lastFocusableElement.focus();
      }
    } else {
      if (document.activeElement === lastFocusableElement) {
        event.preventDefault();
        firstFocusableElement.focus();
      }
    }
  }
};
