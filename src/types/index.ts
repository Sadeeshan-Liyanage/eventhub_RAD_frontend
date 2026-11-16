export type Role = "user" | "organizer";
export type EventCategory = "workshop" | "concert" | "meetup" | "conference" | "other";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface OrganizerRef {
  _id: string;
  name: string;
  email?: string;
}

export interface TicketType {
  name: string;
  price: number;
  seats: number;
}

export interface EventItem {
  _id: string;
  title: string;
  description: string;
  category: EventCategory;
  venue: string;
  date: string;
  price: number; 
  totalSeats: number;
  ticketTypes?: TicketType[];
  bookedSeats: number[];
  availableSeats: number;
  imageUrl?: string;
  organizer: OrganizerRef | string;
  status: "published" | "cancelled";
}

export interface EventInput {
  title: string;
  description: string;
  category: EventCategory;
  venue: string;
  date: string;
  ticketTypes: TicketType[];
  imageUrl?: string;
}

export interface BookingEventRef {
  _id: string;
  title: string;
  date: string;
  venue: string;
  imageUrl?: string;
  category: EventCategory;
  status?: "published" | "cancelled";
}

export interface Booking {
  _id: string;
  event: BookingEventRef;
  user: string | { _id: string; name: string; email: string };
  seatNumbers: number[];
  seatDetails?: { seatNumber: number; tier: string; price: number }[];
  quantity: number;
  totalAmount: number;
  status: "confirmed" | "cancelled";
  ticketCode: string;
  paymentRef: string;
  cardLast4: string;
  createdAt: string;
}

export interface PaymentInput {
  cardHolder: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
}

export interface EventFilters {
  q?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface AnalyticsOverview {
  totals: {
    revenue: number;
    ticketsSold: number;
    bookings: number;
    uniqueParticipants: number;
    events: number;
    averageOccupancy: number;
  };
  perEvent: {
    eventId: string;
    title: string;
    date: string;
    status: "published" | "cancelled";
    price: number;
    tiers: { name: string; price: number; seats: number; sold: number; revenue: number }[];
    capacity: number;
    ticketsSold: number;
    revenue: number;
    bookings: number;
    occupancy: number;
  }[];
  daily: { date: string; revenue: number; tickets: number }[];
}

export interface ParticipantsData {
  event: { id: string; title: string; capacity: number; sold: number };
  participants: {
    bookingId: string;
    name: string;
    email: string;
    seats: number[];
    seatLabels: string[];
    amount: number;
    ticketCode: string;
    bookedAt: string;
  }[];
}
