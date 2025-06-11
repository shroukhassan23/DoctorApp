
/**
 * Utility functions for handling Arabic text search and normalization
 */

/**
 * Removes Arabic diacritics (tashkeel) from text
 */
export const removeArabicDiacritics = (text: string): string => {
  // Arabic diacritics Unicode range: \u064B-\u065F, \u0670, \u06D6-\u06ED
  return text.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '');
};

/**
 * Normalizes Arabic text for better search matching
 */
export const normalizeArabicText = (text: string): string => {
  if (!text) return '';
  
  let normalized = text.trim();
  
  // Remove diacritics
  normalized = removeArabicDiacritics(normalized);
  
  // Normalize different forms of Arabic letters
  normalized = normalized
    // Normalize Alef variants
    .replace(/[آأإٱ]/g, 'ا')
    // Normalize Teh Marbuta and Heh
    .replace(/[ة]/g, 'ه')
    // Normalize Yeh variants
    .replace(/[ى]/g, 'ي')
    // Normalize Hamza variants
    .replace(/[ؤئء]/g, 'ء');
  
  return normalized.toLowerCase();
};

/**
 * Enhanced search function that handles Arabic and English text
 */
export const searchText = (searchTerm: string, targetText: string): boolean => {
  if (!searchTerm || !targetText) return false;
  
  // Normalize both texts
  const normalizedSearch = normalizeArabicText(searchTerm);
  const normalizedTarget = normalizeArabicText(targetText);
  
  // Check if target contains search term
  if (normalizedTarget.includes(normalizedSearch)) {
    return true;
  }
  
  // For Arabic text, also try word-based matching
  const searchWords = normalizedSearch.split(/\s+/).filter(word => word.length > 0);
  const targetWords = normalizedTarget.split(/\s+/);
  
  // Check if any search word matches any target word (partial match)
  return searchWords.some(searchWord => 
    targetWords.some(targetWord => 
      targetWord.includes(searchWord) || searchWord.includes(targetWord)
    )
  );
};
