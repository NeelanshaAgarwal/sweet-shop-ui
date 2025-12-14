export type UserPayload = {
  id: number;
  role: string;
};

export const getUserFromToken = (): UserPayload | null => {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    console.log("Decoding payload:", payload);
    return payload;
  } catch {
    return null;
  }
};
