export const urlFriendly = (str: string) => {
  return str
    .toLowerCase() // Convert to lowercase
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric characters with "-"
    .replace(/^-+|-+$/g, '') // Remove leading/trailing "-"
}
