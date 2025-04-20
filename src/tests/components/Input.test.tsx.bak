import React from 'react';
import { render, screen, fireEvent, describe, it, expect, vi } from '../../tests/utils';
import { Input } from '../../components/ui/Input';

describe('Input Component', () => {
  describe('Types', () => {
    it('should render text input by default', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'text');
    });

    it('should render number input when type is number', () => {
      render(<Input type="number" />);
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('type', 'number');
    });

    it('should render email input when type is email', () => {
      render(<Input type="email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('should render password input when type is password', () => {
      render(<Input type="password" aria-label="Password" />);
      const input = screen.getByLabelText('Password');
      expect(input).toHaveAttribute('type', 'password');
    });

    it('should render search input when type is search', () => {
      render(<Input type="search" />);
      const input = screen.getByRole('searchbox');
      expect(input).toHaveAttribute('type', 'search');
    });

    it('should render tel input when type is tel', () => {
      render(<Input type="tel" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'tel');
    });

    it('should render url input when type is url', () => {
      render(<Input type="url" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'url');
    });

    it('should render date input when type is date', () => {
      render(<Input type="date" />);
      const input = screen.getByDisplayValue('');
      expect(input).toHaveAttribute('type', 'date');
    });

    it('should render time input when type is time', () => {
      render(<Input type="time" />);
      const input = screen.getByDisplayValue('');
      expect(input).toHaveAttribute('type', 'time');
    });

    it('should render datetime-local input when type is datetime-local', () => {
      render(<Input type="datetime-local" />);
      const input = screen.getByDisplayValue('');
      expect(input).toHaveAttribute('type', 'datetime-local');
    });
  });

  describe('States', () => {
    it('should show focus state when focused', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      expect(input).toHaveClass('focus:ring-2');
    });

    it('should show error state when error prop is true', () => {
      render(<Input error />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-red-500');
    });

    it('should show success state when success prop is true', () => {
      render(<Input success />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-green-500');
    });
  });

  describe('Validation', () => {
    it('should show error message when validation fails', () => {
      render(<Input error errorMessage="Invalid input" />);
      expect(screen.getByText('Invalid input')).toBeInTheDocument();
    });

    it('should call onChange handler when value changes', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test' } });
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label when provided', () => {
      render(<Input aria-label="Username" />);
      const input = screen.getByLabelText('Username');
      expect(input).toBeInTheDocument();
    });

    it('should have proper aria-invalid when error is true', () => {
      render(<Input error />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have proper aria-describedby when error message is present', () => {
      render(<Input error errorMessage="Invalid input" />);
      const input = screen.getByRole('textbox');
      const errorMessage = screen.getByText('Invalid input');
      expect(input).toHaveAttribute('aria-describedby', errorMessage.id);
    });
  });
}); 