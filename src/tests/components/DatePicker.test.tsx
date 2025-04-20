import { render, screen, fireEvent, waitFor, act, describe, it, expect, beforeEach, vi } from '../../tests/utils';
import userEvent from '@testing-library/user-event';
import { DatePicker } from '../../components/forms/DatePicker';

describe('DatePicker Component', () => {
  // Selection Tests
  describe('Date Selection', () => {
    it('should render with default value', () => {
      const defaultDate = '2023-01-15';
      render(<DatePicker value={defaultDate} onChange={() => {}} />);
      const dateInput = screen.getByTestId('date-picker-input');
      expect(dateInput).toHaveValue(defaultDate);
    });

    it('should call onChange when a date is selected', async () => {
      const handleChange = jest.fn();
      render(<DatePicker onChange={handleChange} />);
      const dateInput = screen.getByTestId('date-picker-input');
      
      await act(async () => {
        fireEvent.change(dateInput, { target: { value: '2023-05-20' } });
      });
      
      expect(handleChange).toHaveBeenCalledWith('2023-05-20');
    });

    it('should display selected date in the correct format', () => {
      const selectedDate = '2023-03-10';
      render(<DatePicker value={selectedDate} onChange={() => {}} />);
      const dateInput = screen.getByTestId('date-picker-input');
      expect(dateInput).toHaveValue(selectedDate);
    });
  });

  // Date Range Selection Tests
  describe('Date Range Selection', () => {
    it('should validate that end date is after start date', async () => {
      const handleChange = jest.fn();
      render(<DatePicker range onChange={handleChange} />);
      
      const startDateInput = screen.getByTestId('date-picker-start-input');
      const endDateInput = screen.getByTestId('date-picker-end-input');
      
      await act(async () => {
        fireEvent.change(startDateInput, { target: { value: '2023-05-20' } });
      });
      
      // First onChange call with just start date
      expect(handleChange).toHaveBeenCalledWith({ startDate: '2023-05-20', endDate: '' });
      
      await act(async () => {
        fireEvent.change(endDateInput, { target: { value: '2023-05-19' } });
      });
      
      expect(screen.getByText('End date must be after start date')).toBeInTheDocument();
      
      await act(async () => {
        fireEvent.change(endDateInput, { target: { value: '2023-05-21' } });
      });
      
      expect(screen.queryByText('End date must be after start date')).not.toBeInTheDocument();
      expect(handleChange).toHaveBeenLastCalledWith({ startDate: '2023-05-20', endDate: '2023-05-21' });
    });

    it('should call onChange with both start and end dates when range is selected', async () => {
      const handleChange = jest.fn();
      render(<DatePicker range onChange={handleChange} />);
      
      const startDateInput = screen.getByTestId('date-picker-start-input');
      const endDateInput = screen.getByTestId('date-picker-end-input');
      
      await act(async () => {
        fireEvent.change(startDateInput, { target: { value: '2023-05-20' } });
      });
      
      // First onChange call with just start date
      expect(handleChange).toHaveBeenCalledWith({ startDate: '2023-05-20', endDate: '' });
      
      await act(async () => {
        fireEvent.change(endDateInput, { target: { value: '2023-05-21' } });
      });
      
      // Second onChange call with both dates
      expect(handleChange).toHaveBeenLastCalledWith({ startDate: '2023-05-20', endDate: '2023-05-21' });
    });
  });

  // Format Tests
  describe('Date Format Handling', () => {
    it('should display date in the specified format', () => {
      const date = '2023-06-15';
      render(<DatePicker value={date} format="MM/DD/YYYY" onChange={() => {}} />);
      const formattedDate = screen.getByTestId('formatted-date');
      expect(formattedDate).toHaveTextContent('06/15/2023');
    });

    it('should accept input in the specified format', async () => {
      const handleChange = jest.fn();
      render(<DatePicker format="DD/MM/YYYY" onChange={handleChange} />);
      const dateInput = screen.getByTestId('date-picker-input');
      
      await act(async () => {
        fireEvent.change(dateInput, { target: { value: '15/06/2023' } });
      });
      
      expect(handleChange).toHaveBeenCalledWith('2023-06-15');
    });

    it('should handle different date formats correctly', () => {
      const date = '2023-07-20';
      const formats = [
        { format: 'YYYY-MM-DD', expected: '2023-07-20' },
        { format: 'MM/DD/YYYY', expected: '07/20/2023' },
        { format: 'DD/MM/YYYY', expected: '20/07/2023' },
        { format: 'MMMM D, YYYY', expected: 'July 20, 2023' }
      ];
      
      formats.forEach(({ format, expected }) => {
        const { unmount } = render(
          <DatePicker value={date} format={format} onChange={() => {}} />
        );
        const formattedDate = screen.getByTestId('formatted-date');
        expect(formattedDate).toHaveTextContent(expected);
        unmount();
      });
    });
  });

  // Accessibility Tests
  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<DatePicker onChange={() => {}} />);
      const dateInput = screen.getByTestId('date-picker-input');
      
      expect(dateInput).toHaveAttribute('aria-label', 'Select date');
      expect(dateInput).toHaveAttribute('role', 'textbox');
    });

    it('should be keyboard navigable', async () => {
      render(<DatePicker onChange={() => {}} />);
      const dateInput = screen.getByTestId('date-picker-input');
      
      dateInput.focus();
      expect(dateInput).toHaveFocus();
      
      await userEvent.keyboard('{Tab}');
      expect(dateInput).not.toHaveFocus();
    });

    it('should announce changes to screen readers', () => {
      render(<DatePicker onChange={() => {}} />);
      const dateInput = screen.getByTestId('date-picker-input');
      
      fireEvent.change(dateInput, { target: { value: '2023-08-15' } });
      
      const announcement = screen.getByTestId('date-announcement');
      expect(announcement).toHaveTextContent('Date selected: August 15, 2023');
    });

    it('should have proper focus management', () => {
      render(<DatePicker onChange={() => {}} />);
      const dateInput = screen.getByTestId('date-picker-input');
      const calendarButton = screen.getByTestId('calendar-button');
      
      fireEvent.click(calendarButton);
      
      const calendar = screen.getByTestId('calendar-popup');
      expect(calendar).toBeInTheDocument();
      
      const firstDateButton = screen.getByTestId('calendar-date-1');
      firstDateButton.focus();
      expect(firstDateButton).toHaveFocus();
      
      fireEvent.keyDown(firstDateButton, { key: 'Escape' });
      expect(calendar).not.toBeInTheDocument();
      expect(dateInput).toHaveFocus();
    });
  });
}); 