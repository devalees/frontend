/**
 * Form Component Tests
 * 
 * This file contains failing tests for the Form component following the test-driven development approach.
 * These tests will fail until the Form component is implemented to match the expected behavior.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import { Form, FormSection } from '../../components/forms/Form';

describe('Form Component', () => {
  // Test layout
  describe('Layout', () => {
    it('should render with default layout', () => {
      render(
        <Form onSubmit={() => {}}>
          <div>Form Content</div>
        </Form>
      );
      
      const form = screen.getByRole('form');
      expect(form).toHaveClass('space-y-4');
    });

    it('should render with custom className', () => {
      render(
        <Form onSubmit={() => {}} className="custom-form">
          <div>Form Content</div>
        </Form>
      );
      
      const form = screen.getByRole('form');
      expect(form).toHaveClass('custom-form');
      expect(form).toHaveClass('space-y-4');
    });

    it('should render with form sections', () => {
      render(
        <Form onSubmit={() => {}}>
          <FormSection title="Personal Information">
            <div>Personal Info Fields</div>
          </FormSection>
          <FormSection title="Contact Information">
            <div>Contact Info Fields</div>
          </FormSection>
        </Form>
      );
      
      const sections = screen.getAllByRole('group');
      expect(sections).toHaveLength(2);
      
      expect(screen.getByText('Personal Information')).toBeInTheDocument();
      expect(screen.getByText('Contact Information')).toBeInTheDocument();
    });
  });

  // Test validation
  describe('Validation', () => {
    it('should validate form fields on submit', async () => {
      const handleSubmit = vi.fn();
      
      render(
        <Form onSubmit={handleSubmit}>
          <div>
            <input type="text" name="username" required />
            <input type="email" name="email" required />
          </div>
        </Form>
      );
      
      await act(async () => {
        const submitButton = screen.getByRole('button');
        fireEvent.click(submitButton);
      });
      
      await waitFor(() => {
        expect(handleSubmit).not.toHaveBeenCalled();
      });
    });

    it('should show validation errors for invalid fields', async () => {
      render(
        <Form onSubmit={() => {}}>
          <div>
            <input type="email" name="email" aria-label="Email" />
          </div>
        </Form>
      );
      
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      
      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
        fireEvent.blur(emailInput);
      });
      
      const errorMessages = screen.getAllByText('Please enter a valid email address');
      expect(errorMessages.length).toBeGreaterThan(0);
      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    });

    it('should clear validation errors when field is corrected', async () => {
      render(
        <Form onSubmit={() => {}}>
          <div>
            <input type="email" name="email" aria-label="Email" />
          </div>
        </Form>
      );
      
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      
      // First, trigger validation error
      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
        fireEvent.blur(emailInput);
      });
      
      const errorMessages = screen.getAllByText('Please enter a valid email address');
      expect(errorMessages.length).toBeGreaterThan(0);
      
      // Then, correct the field
      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'valid@email.com' } });
        fireEvent.blur(emailInput);
      });
      
      expect(screen.queryByText('Please enter a valid email address')).not.toBeInTheDocument();
    });

    it('should support custom validation rules', async () => {
      const validationRules = {
        password: (value: string) => {
          if (value.length < 8) {
            return 'Password must be at least 8 characters long';
          }
          return undefined;
        }
      };
      
      render(
        <Form onSubmit={() => {}} validationRules={validationRules}>
          <div>
            <input type="password" name="password" aria-label="Password" />
          </div>
        </Form>
      );
      
      const passwordInput = screen.getByLabelText(/password/i);
      
      // Test password too short
      await act(async () => {
        fireEvent.change(passwordInput, { target: { value: 'short' } });
        fireEvent.blur(passwordInput);
      });
      
      const errorMessages = screen.getAllByText('Password must be at least 8 characters long');
      expect(errorMessages.length).toBeGreaterThan(0);
      
      // Test valid password
      await act(async () => {
        fireEvent.change(passwordInput, { target: { value: 'Password123' } });
        fireEvent.blur(passwordInput);
      });
      
      expect(screen.queryByText(/password must/i)).not.toBeInTheDocument();
    });
  });

  // Test submission
  describe('Submission', () => {
    it('should call onSubmit handler when form is valid', async () => {
      const handleSubmit = vi.fn();
      
      render(
        <Form onSubmit={handleSubmit}>
          <div>
            <input type="text" name="username" defaultValue="testuser" aria-label="Username" />
            <input type="email" name="email" defaultValue="test@example.com" aria-label="Email" />
          </div>
        </Form>
      );
      
      await act(async () => {
        const submitButton = screen.getByRole('button');
        fireEvent.click(submitButton);
      });
      
      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalled();
      });
    });

    it('should prevent default form submission', async () => {
      const handleSubmit = vi.fn();
      
      render(
        <Form onSubmit={handleSubmit}>
          <div>
            <input type="text" name="username" defaultValue="testuser" aria-label="Username" />
          </div>
        </Form>
      );
      
      const form = screen.getByRole('form');
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      const preventDefaultSpy = vi.spyOn(submitEvent, 'preventDefault');
      
      await act(async () => {
        form.dispatchEvent(submitEvent);
      });
      
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should handle async form submission', async () => {
      const handleSubmit = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );
      
      render(
        <Form onSubmit={handleSubmit}>
          <div>
            <input type="text" name="username" defaultValue="testuser" aria-label="Username" />
          </div>
        </Form>
      );
      
      await act(async () => {
        const submitButton = screen.getByRole('button');
        fireEvent.click(submitButton);
      });
      
      expect(screen.getByRole('button')).toBeDisabled();
      expect(screen.getByRole('button')).toHaveTextContent('Submitting...');
      
      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalled();
        expect(screen.getByRole('button')).not.toBeDisabled();
        expect(screen.getByRole('button')).toHaveTextContent('Submit');
      });
    });

    it('should handle submission errors', async () => {
      const error = new Error('Submission failed');
      const handleSubmit = vi.fn().mockRejectedValue(error);
      
      render(
        <Form onSubmit={handleSubmit}>
          <div>
            <input type="text" name="username" defaultValue="testuser" aria-label="Username" />
          </div>
        </Form>
      );
      
      await act(async () => {
        const submitButton = screen.getByRole('button');
        fireEvent.click(submitButton);
      });
      
      await waitFor(() => {
        const errorMessages = screen.getAllByText('Submission failed');
        expect(errorMessages.length).toBeGreaterThan(0);
      });
    });
  });

  // Test accessibility
  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <Form onSubmit={() => {}} aria-label="Login Form">
          <div>Form Content</div>
        </Form>
      );
      
      const form = screen.getByRole('form');
      expect(form).toHaveAttribute('aria-label', 'Login Form');
    });

    it('should associate error messages with form fields', async () => {
      render(
        <Form onSubmit={() => {}}>
          <div>
            <input type="email" name="email" aria-label="Email" />
          </div>
        </Form>
      );
      
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      
      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
        fireEvent.blur(emailInput);
      });
      
      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      expect(emailInput).toHaveAttribute('aria-describedby');
    });

    it('should be keyboard accessible', async () => {
      const handleSubmit = vi.fn();
      
      render(
        <Form onSubmit={handleSubmit}>
          <div>
            <input type="text" name="username" defaultValue="testuser" aria-label="Username" />
          </div>
        </Form>
      );
      
      const form = screen.getByRole('form');
      
      await act(async () => {
        fireEvent.submit(form);
      });
      
      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalled();
      });
    });

    it('should announce validation errors to screen readers', async () => {
      render(
        <Form onSubmit={() => {}}>
          <div>
            <input type="email" name="email" aria-label="Email" />
          </div>
        </Form>
      );
      
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      
      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
        fireEvent.blur(emailInput);
      });
      
      const liveRegion = screen.getByRole('status', { hidden: true });
      expect(liveRegion).toHaveTextContent('Please enter a valid email address');
    });
  });
}); 