import shortid from 'shortid';

export function generateShortCode(): string {
  return shortid.generate();
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}