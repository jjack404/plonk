export const isMobileDevice = (): boolean => {
  return /Mobi|Android|iPhone/i.test(navigator.userAgent);
}; 