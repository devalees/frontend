import { useState, useCallback, useEffect, useRef } from 'react';
import { toggleBodyScroll } from '../components/modal';

interface UseModalOptions {
  initialOpen?: boolean;
  closeOnEscape?: boolean;
  closeOnBackdropClick?: boolean;
  preventScroll?: boolean;
}

interface UseModalResult {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

/**
 * Custom hook for managing modal state and behavior
 * @param options - Configuration options for the modal
 * @returns Modal state and control functions
 */
export const useModal = (options: UseModalOptions = {}): UseModalResult => {
  const {
    initialOpen = false,
    closeOnEscape = true,
    closeOnBackdropClick = true,
    preventScroll = true,
  } = options;

  const [isOpen, setIsOpen] = useState(initialOpen);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle opening the modal
  const open = useCallback(() => {
    setIsOpen(true);
    if (preventScroll) {
      toggleBodyScroll(true);
    }
    // Store the element that had focus before the modal opened
    previousActiveElement.current = document.activeElement as HTMLElement;
  }, [preventScroll]);

  // Handle closing the modal
  const close = useCallback(() => {
    setIsOpen(false);
    if (preventScroll) {
      toggleBodyScroll(false);
    }
    // Restore focus to the element that had focus before the modal opened
    if (previousActiveElement.current) {
      previousActiveElement.current.focus();
    }
  }, [preventScroll]);

  // Toggle the modal state
  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, closeOnEscape, close]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (preventScroll) {
        toggleBodyScroll(false);
      }
    };
  }, [preventScroll]);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
};
