import { EventItem, TicketType } from "../types";



export const getTiers = (e: Pick<EventItem, "ticketTypes" | "price" | "totalSeats">): TicketType[] =>
  e.ticketTypes && e.ticketTypes.length > 0 ? e.ticketTypes : [{ name: "General", price: e.price, seats: e.totalSeats }];



export const tierForSeat = (tiers: TicketType[], seat: number): TicketType | null => {
  let start = 0;
  for (const t of tiers) {
    if (seat <= start + t.seats) return t;
    start += t.seats;
  }
  return null;
};

export const seatRanges = (tiers: TicketType[]) => {
  let start = 0;
  return tiers.map((tier) => {
    const range = { tier, from: start + 1, to: start + tier.seats };
    start += tier.seats;
    return range;
  });
};
