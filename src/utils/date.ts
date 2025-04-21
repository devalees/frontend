/**
 * Date utility functions
 */

/**
 * Formats a date string or Date object into a human-readable format
 * @param date - Date string or Date object to format
 * @param format - Optional format string (default: 'MMM d, yyyy')
 * @returns Formatted date string
 */
export const formatDate = (date: string | Date, format: string = 'MMM d, yyyy'): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  // Simple formatting for now - can be expanded with more options
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = dateObj.getDate();
  const month = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  
  return `${month} ${day}, ${year}`;
};

/**
 * Formats a date string or Date object into a time string
 * @param date - Date string or Date object to format
 * @returns Formatted time string (HH:MM AM/PM)
 */
export const formatTime = (date: string | Date): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Formats a date string or Date object into a date and time string
 * @param date - Date string or Date object to format
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: string | Date): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  return `${formatDate(dateObj)} ${formatTime(dateObj)}`;
}; 