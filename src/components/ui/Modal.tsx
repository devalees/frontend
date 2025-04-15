import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { getFocusableElements, trapFocus, toggleBodyScroll } from '../../lib/components/modal';

export type ModalVariant = 'default' | 'small' | 'large';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  variant?: ModalVariant;
  'aria-labelledby'?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  variant = 'default',
  'aria-labelledby': ariaLabelledby,
}) => {
  const [isEntering, setIsEntering] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isVisible, setIsVisible] = useState(isOpen);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Store the element that had focus before the modal opened
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      toggleBodyScroll(true);
      setIsVisible(true);
    } else {
      toggleBodyScroll(false);
    }

    return () => {
      toggleBodyScroll(false);
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  // Handle focus trapping
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const focusableElements = getFocusableElements(modalRef.current);
    if (focusableElements.length === 0) return;

    const handleTabKey = (e: KeyboardEvent) => {
      trapFocus(modalRef.current!, e);
    };

    modalRef.current.addEventListener('keydown', handleTabKey);

    // Focus the first focusable element after the close button
    if (focusableElements.length > 1) {
      requestAnimationFrame(() => {
        focusableElements[1].focus();
      });
    }

    return () => {
      modalRef.current?.removeEventListener('keydown', handleTabKey);
    };
  }, [isOpen]);

  // Restore focus when modal closes
  useEffect(() => {
    if (!isOpen && previousActiveElement.current) {
      requestAnimationFrame(() => {
        previousActiveElement.current?.focus();
      });
    }
  }, [isOpen]);

  // Handle animations
  useEffect(() => {
    if (isOpen) {
      setIsEntering(true);
      setIsExiting(false);
      
      const timer = setTimeout(() => {
        setIsEntering(false);
      }, 50); // Short delay to trigger animation
      
      return () => clearTimeout(timer);
    } else {
      setIsExiting(true);
      
      const timer = setTimeout(() => {
        setIsExiting(false);
        setIsVisible(false);
      }, 300); // Animation duration
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Don't render anything if the modal is not visible
  if (!isVisible) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalClasses = [
    'modal',
    `modal-${variant}`,
    isEntering ? 'modal-enter' : '',
    isEntering ? 'modal-enter-active' : '',
    isExiting ? 'modal-exit' : '',
    isExiting ? 'modal-exit-active' : '',
  ].filter(Boolean).join(' ');

  const modalContent = (
    <div 
      className="modal-backdrop" 
      onClick={handleBackdropClick}
      data-testid="modal-backdrop"
    >
      <div
        ref={modalRef}
        className={modalClasses}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledby}
      >
        <button 
          className="modal-close-button" 
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}; 