/**
 * Encodes a string for URL usage using encodeURIComponent.
 * @param str - The input string.
 * @returns The encoded string.
 */
export const codeSpaces = (str: string): string => {
  return encodeURIComponent(str)
}

/**
 * Decodes a URL-encoded string using decodeURIComponent.
 * @param str - The input string.
 * @returns The decoded string.
 */
export const uncodeSpaces = (str: string): string => {
  return decodeURIComponent(str)
}
