import React, { useState, useRef, useEffect } from 'react';
import { format, parse, isValid } from 'date-fns';

interface DatePickerProps {
  value?: string;
  onChange?: (value: string | { startDate: string; endDate: string }) => void;
  format?: string;
  range?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value = '',
  onChange = () => {},
  format: dateFormat = 'yyyy-MM-dd',
  range = false,
}) => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [announcement, setAnnouncement] = useState<string>('');
  const calendarRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize with value if provided
  useEffect(() => {
    if (value && !range) {
      setStartDate(value);
    }
  }, [value, range]);

  // Format date for display
  const formatDate = (dateString: string, targetFormat: string) => {
    if (!dateString) return '';
    
    try {
      const dateObj = new Date(dateString);
      if (!isValid(dateObj)) return dateString;

      // Convert format tokens to match date-fns format
      const convertedFormat = targetFormat
        .replace(/YYYY/g, 'yyyy')
        .replace(/DD/g, 'dd')
        .replace(/D/g, 'd');
      
      return format(dateObj, convertedFormat);
    } catch (error) {
      return dateString;
    }
  };

  // Parse input date string to ISO format
  const parseInputDate = (inputDate: string, inputFormat: string) => {
    try {
      // Convert format tokens to match date-fns format
      const convertedFormat = inputFormat
        .replace(/YYYY/g, 'yyyy')
        .replace(/MM/g, 'MM')
        .replace(/DD/g, 'dd')
        .replace(/D/g, 'd');
      
      // Try parsing with the specified format first
      let parsedDate = parse(inputDate, convertedFormat, new Date());
      
      // If that fails, try common formats
      if (!isValid(parsedDate)) {
        const commonFormats = ['dd/MM/yyyy', 'yyyy-MM-dd', 'MM/dd/yyyy'];
        for (const format of commonFormats) {
          try {
            parsedDate = parse(inputDate, format, new Date());
            if (isValid(parsedDate)) break;
          } catch (error) {
            // Continue trying other formats
          }
        }
      }
      
      if (isValid(parsedDate)) {
        return format(parsedDate, 'yyyy-MM-dd');
      }
      
      return inputDate;
    } catch (error) {
      return inputDate;
    }
  };

  // Handle date selection for single date
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setStartDate(newDate);
    
    // Convert input date to ISO format based on the specified format
    const standardizedDate = parseInputDate(newDate, dateFormat);
    
    // Only call onChange if we have a valid date
    try {
      const parsedDate = new Date(standardizedDate);
      if (isValid(parsedDate)) {
        // Call onChange with the standardized date
        onChange(standardizedDate);
        
        // Format date for announcement
        const formattedDate = format(parsedDate, 'MMMM d, yyyy');
        setAnnouncement(`Date selected: ${formattedDate}`);
        setError('');
      }
    } catch (error) {
      // If parsing fails, just keep the current state
    }
  };

  // Handle start date change for range
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);
    
    // Validate range
    if (endDate && newStartDate > endDate) {
      setError('End date must be after start date');
    } else {
      setError('');
      onChange({ startDate: newStartDate, endDate });
    }
  };

  // Handle end date change for range
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value;
    setEndDate(newEndDate);
    
    // Validate range
    if (startDate && newEndDate < startDate) {
      setError('End date must be after start date');
    } else {
      setError('');
      onChange({ startDate, endDate: newEndDate });
    }
  };

  // Toggle calendar popup
  const toggleCalendar = () => {
    setIsOpen(!isOpen);
  };

  // Handle click outside to close calendar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle escape key to close calendar
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.focus();
    }
  };

  // Render single date picker
  if (!range) {
    return (
      <div className="date-picker-container">
        <div className="date-picker-input-container">
          <input
            ref={inputRef}
            type="text"
            value={formatDate(startDate, dateFormat)}
            onChange={handleDateChange}
            placeholder={dateFormat}
            data-testid="date-picker-input"
            aria-label="Select date"
            role="textbox"
          />
          <button 
            onClick={toggleCalendar}
            data-testid="calendar-button"
            aria-label="Open calendar"
          >
            📅
          </button>
        </div>
        
        {announcement && (
          <div 
            data-testid="date-announcement" 
            className="sr-only"
            aria-live="polite"
          >
            {announcement}
          </div>
        )}
        
        {isOpen && (
          <div 
            ref={calendarRef}
            className="calendar-popup"
            data-testid="calendar-popup"
            onKeyDown={handleKeyDown}
          >
            <div className="calendar-header">
              <button data-testid="calendar-date-1">1</button>
              <button data-testid="calendar-date-2">2</button>
              {/* More calendar days would be rendered here */}
            </div>
          </div>
        )}
        
        <div data-testid="formatted-date" className="formatted-date">
          {formatDate(startDate, dateFormat)}
        </div>
      </div>
    );
  }

  // Render date range picker
  return (
    <div className="date-range-picker-container">
      <div className="date-range-inputs">
        <div className="date-input-group">
          <label htmlFor="start-date">Start Date</label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            data-testid="date-picker-start-input"
            aria-label="Select start date"
          />
        </div>
        
        <div className="date-input-group">
          <label htmlFor="end-date">End Date</label>
          <input
            id="end-date"
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            data-testid="date-picker-end-input"
            aria-label="Select end date"
          />
        </div>
      </div>
      
      {error && (
        <div data-testid="date-range-error" className="date-range-error">
          {error}
        </div>
      )}
    </div>
  );
};
