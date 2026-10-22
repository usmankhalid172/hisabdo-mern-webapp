export function getFriendlyError(error: unknown): string {
  const message = error instanceof Error
    ? error.message
    : String(error ?? "");

  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes("name") &&
    (normalizedMessage.includes("already exists") ||
      normalizedMessage.includes("duplicate"))
  ) {
    return "A customer with this name already exists.";
  }

  if (
    normalizedMessage.includes("phone") &&
    (normalizedMessage.includes("already exists") ||
      normalizedMessage.includes("duplicate"))
  ) {
    return "A customer with this phone number already exists.";
  }

  if (normalizedMessage.includes("invalid phone")) {
    return "Please enter a valid phone number.";
  }

  return message || "Failed to save customer. Please try again.";
}