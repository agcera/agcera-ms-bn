export function extractDatePart(dateString: Date, part: string): number | null {
  const date = new Date(dateString);

  switch (part) {
    case 'day':
      return date.getDate();
    case 'month':
      return date.getMonth() + 1; // Adding 1 because months are zero-based (0 - 11)
    case 'year':
      return date.getFullYear();
    default:
      return null; // Handle invalid input gracefully
  }
}
