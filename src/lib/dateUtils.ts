
import { format, parse, isValid } from 'date-fns';

export const formatDateToDDMMYYYY = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  
  try {
    let dateObj: Date;
    
    if (typeof date === 'string') {
      // Try to parse various date formats
      dateObj = new Date(date);
      if (!isValid(dateObj)) {
        // Try parsing as ISO date
        dateObj = parse(date, 'yyyy-MM-dd', new Date());
      }
    } else {
      dateObj = date;
    }
    
    if (!isValid(dateObj)) {
      return '';
    }
    
    return format(dateObj, 'dd/MM/yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

export const formatDateToISO = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  
  try {
    let dateObj: Date;
    
    if (typeof date === 'string') {
      // If it's in dd/MM/yyyy format, parse it correctly
      if (date.includes('/')) {
        dateObj = parse(date, 'dd/MM/yyyy', new Date());
      } else {
        dateObj = new Date(date);
      }
    } else {
      dateObj = date;
    }
    
    if (!isValid(dateObj)) {
      return '';
    }
    
    return format(dateObj, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Error converting date to ISO:', error);
    return '';
  }
};

// Helper function to format dates consistently throughout the app (dd/mm/yyyy)
export const formatDisplayDate = (date: Date | string | null | undefined): string => {
  return formatDateToDDMMYYYY(date);
};

// Helper to parse dd/mm/yyyy format to Date object
export const parseDDMMYYYY = (dateString: string): Date | null => {
  if (!dateString) return null;
  
  try {
    const parsed = parse(dateString, 'dd/MM/yyyy', new Date());
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
};
