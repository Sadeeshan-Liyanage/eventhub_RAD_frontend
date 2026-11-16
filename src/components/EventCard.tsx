import { Link } from "react-router-dom";
import { EventItem } from "../types";
import { formatPrice, formatTime } from "../utils/format";

const fallback =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450'><rect width='100%' height='100%' fill='#1b1a55'/><path d='M300 175h200v30a22 22 0 0 0 0 44v30H300v-30a22 22 0 0 0 0-44z' fill='#f5b301'/></svg>`
  );

export default function EventCard({ event }: { event: EventItem }) {
  const d = new Date(event.date);
  const soldOut = event.availableSeats === 0;
  const filled = Math.round(((event.totalSeats - event.availableSeats) / event.totalSeats) * 100);

  return (
    <Link
      to={`/events/${event._id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-line bg-white transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-video overflow-hidden bg-ink">
        <img
          src={event.imageUrl || fallback}
          alt=""
          loading="lazy"
          onError={(e) => ((e.currentTarget as HTMLImageElement).src = fallback)}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-md bg-white px-2.5 py-1 text-xs font-semibold capitalize text-ink">
          {event.category}
        </span>
        {soldOut && (
          <span className="absolute right-3 top-3 rounded-md bg-red-600 px-2.5 py-1 text-xs font-semibold text-white">Sold out</span>
        )}
      </div>

      <div className="flex flex-1 gap-4 p-4">
        <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-saffron text-ink">
          <span className="text-xl font-bold leading-none">{d.getDate()}</span>
          <span className="text-xs font-medium">{d.toLocaleString("en-GB", { month: "short" })}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold leading-snug">{event.title}</h3>
          <p className="truncate text-sm text-ink-soft">
            {event.venue} · {formatTime(event.date)}
          </p>
        </div>
      </div>

      <div className="border-t border-dashed border-line px-4 py-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">{(event.ticketTypes?.length ?? 0) > 1 && event.price > 0 ? `From ${formatPrice(event.price)}` : formatPrice(event.price)}</span>
          <span className="text-ink-soft">{soldOut ? "No seats left" : `${event.availableSeats} seats left`}</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-paper" aria-hidden="true">
          <div className="h-full rounded-full bg-ink" style={{ width: `${filled}%` }} />
        </div>
      </div>
    </Link>
  );
  
}
