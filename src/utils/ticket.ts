export const extractTicketCode = (raw: string): string => {
  const text = raw.trim();
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed.code === "string") return parsed.code.trim().toUpperCase();
  } catch {

    
  }
  return text.toUpperCase();
};
