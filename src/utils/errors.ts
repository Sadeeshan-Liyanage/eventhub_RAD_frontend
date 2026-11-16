import axios from "axios";

export const getErrorMessage = (err: unknown): string => {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string; errors?: { field: string; message: string }[] } | undefined;
    if (data?.errors?.length) return data.errors.map((e) => e.message).join(". ");
    if (data?.message) return data.message;
    if (err.code === "ERR_NETWORK") return "Cannot reach the server. Check your connection.";
  }
  return "Something went wrong. Please try again.";
};
