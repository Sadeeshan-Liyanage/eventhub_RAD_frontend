export const formatPrice = (price: number) =>
  price === 0 ? "Free" : `LKR ${price.toLocaleString("en-LK")}`;

export const formatMoney = (amount: number) => `LKR ${amount.toLocaleString("en-LK")}`;

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

export const formatDateTime = (iso: string) => `${formatDate(iso)}, ${formatTime(iso)}`;


export const toLocalInput = (iso: string) => {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};
