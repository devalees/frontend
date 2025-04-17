import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { Modal } from '../../components/ui/Modal';

// Mock createPortal to render directly in the document
vi.mock('react-dom', () => ({
  createPortal: (children: React.ReactNode) => children,
}));

describe('Modal Component', () => {
  // Clean up after each test
  afterEach(() => {
    document.body.innerHTML = '';
  });

  // Test variants
  describe('Variants', () => {
    test('should render with default variant', () => {
      render(
        <Modal isOpen={true} onClose={() => {}}>
          <div>Modal Content</div>
        </Modal>
      );
      
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveClass('modal-default');
    });

    test('should render with small variant', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} variant="small">
          <div>Modal Content</div>
        </Modal>
      );
      
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveClass('modal-small');
    });

    test('should render with large variant', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} variant="large">
          <div>Modal Content</div>
        </Modal>
      );
      
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveClass('modal-large');
    });
  });

  // Test interactions
  describe('Interactions', () => {
    test('should call onClose when close button is clicked', () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose}>
          <div>Modal Content</div>
        </Modal>
      );
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);
      
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    test('should call onClose when clicking outside the modal', () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose}>
          <div>Modal Content</div>
        </Modal>
      );
      
      const backdrop = screen.getByTestId('modal-backdrop');
      fireEvent.click(backdrop);
      
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    test('should not call onClose when clicking inside the modal content', () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose}>
          <div>Modal Content</div>
        </Modal>
      );
      
      const modalContent = screen.getByText('Modal Content');
      fireEvent.click(modalContent);
      
      expect(handleClose).not.toHaveBeenCalled();
    });

    test('should close when Escape key is pressed', () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose}>
          <div>Modal Content</div>
        </Modal>
      );
      
      fireEvent.keyDown(document.body, { key: 'Escape' });
      
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  // Test accessibility
  describe('Accessibility', () => {
    test('should have correct ARIA attributes', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} aria-labelledby="modal-title">
          <h2 id="modal-title">Modal Title</h2>
          <div>Modal Content</div>
        </Modal>
      );
      
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');
      expect(modal).toHaveAttribute('aria-modal', 'true');
    });

    test('should trap focus within the modal when open', async () => {
      render(
        <Modal isOpen={true} onClose={() => {}}>
          <div>
            <button>First Button</button>
            <button>Second Button</button>
          </div>
        </Modal>
      );
      
      // Get all focusable elements
      const buttons = screen.getAllByRole('button');
      const closeButton = buttons[0];
      const firstButton = buttons[1];
      const secondButton = buttons[2];
      
      // Focus should move to first content button initially
      await waitFor(() => {
        expect(document.activeElement).toBe(firstButton);
      });
      
      // Tab from last element should loop back to close button
      secondButton.focus();
      fireEvent.keyDown(secondButton, { key: 'Tab' });
      
      await waitFor(() => {
        expect(document.activeElement).toBe(closeButton);
      });
    });

    test('should restore focus to the element that opened the modal when closed', async () => {
      // Create and append trigger button
      const triggerButton = document.createElement('button');
      triggerButton.id = 'trigger-button';
      document.body.appendChild(triggerButton);
      triggerButton.focus();
      
      const { unmount } = render(
        <Modal isOpen={true} onClose={() => {}}>
          <div>Modal Content</div>
        </Modal>
      );
      
      unmount();
      
      await waitFor(() => {
        expect(document.activeElement?.id).toBe('trigger-button');
      });
      
      // Clean up
      document.body.removeChild(triggerButton);
    });
  });

  // Test animations
  describe('Animations', () => {
    test('should apply enter animation when opening', async () => {
      const { rerender } = render(
        <Modal isOpen={false} onClose={() => {}}>
          <div>Modal Content</div>
        </Modal>
      );
      
      // Modal should not be visible initially
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      
      // Open the modal
      rerender(
        <Modal isOpen={true} onClose={() => {}}>
          <div>Modal Content</div>
        </Modal>
      );
      
      const modal = await screen.findByRole('dialog');
      expect(modal).toHaveClass('modal-enter');
      
      // Wait for animation to complete
      await waitFor(() => {
        expect(modal).toHaveClass('modal-enter-active');
      });
    });

    test('should apply exit animation when closing', async () => {
      const { rerender } = render(
        <Modal isOpen={true} onClose={() => {}}>
          <div>Modal Content</div>
        </Modal>
      );
      
      const modal = screen.getByRole('dialog');
      
      // Close the modal
      rerender(
        <Modal isOpen={false} onClose={() => {}}>
          <div>Modal Content</div>
        </Modal>
      );
      
      // Wait for exit animation to start
      await waitFor(() => {
        expect(modal).toHaveClass('modal-exit');
      });
      
      // Wait for exit animation to complete
      await waitFor(() => {
        expect(modal).toHaveClass('modal-exit-active');
      });
    });
  });
}); 