import sanitizeHtml from 'sanitize-html';

export const s = (text: string | undefined | null) => {
  // It sanitizes text that contains HTML tags to prevent XSS attacks
  return text && sanitizeHtml(text, { disallowedTagsMode: 'recursiveEscape' });
};
