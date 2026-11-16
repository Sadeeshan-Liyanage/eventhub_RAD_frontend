import { TicketType } from "../types";
import { seatRanges } from "../utils/tiers";
import { formatPrice } from "../utils/format";

interface Props {
  tiers: TicketType[];
  bookedSeats: number[];
  selected: number[];
  onToggle: (seat: number) => void;
  disabled?: boolean;
}

export default function SeatMap({ tiers, bookedSeats, selected, onToggle, disabled }: Props) {
  const booked = new Set(bookedSeats);
  const chosen = new Set(selected);

  return (
    <div>
      <div className="space-y-5">
        {seatRanges(tiers).map(({ tier, from, to }) => {
          const left = tier.seats - bookedSeats.filter((s) => s >= from && s <= to).length;
          return (
            <section key={tier.name} aria-label={`${tier.name} seats`}>
              <div className="mb-2 flex items-baseline justify-between gap-2 text-sm">
                <h3 className="font-semibold">{tier.name}</h3>
                <span className="text-ink-soft">
                  {formatPrice(tier.price)} · {left === 0 ? "sold out" : `${left} left`}
                </span>
              </div>
              <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(2.25rem, 1fr))" }}>
                {Array.from({ length: to - from + 1 }, (_, i) => from + i).map((seat) => {
                  const isBooked = booked.has(seat);
                  const isChosen = chosen.has(seat);
                  return (
                    <button
                      key={seat}
                      type="button"
                      disabled={isBooked || disabled}
                      aria-pressed={isChosen}
                      aria-label={`Seat ${seat}, ${tier.name}${isBooked ? ", taken" : isChosen ? ", selected" : ", available"}`}
                      onClick={() => onToggle(seat)}
                      className={`h-9 rounded-md text-xs font-semibold transition-colors ${
                        isBooked
                          ? "cursor-not-allowed bg-line text-ink/35 line-through"
                          : isChosen
                          ? "bg-saffron text-ink ring-2 ring-ink"
                          : "bg-white text-ink ring-1 ring-line hover:bg-saffron/30"
                      }`}
                    >
                      {seat}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <ul className="mt-4 flex flex-wrap gap-4 text-xs text-ink-soft">
        <li className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-white ring-1 ring-line" /> Available</li>
        <li className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-saffron ring-1 ring-ink" /> Selected</li>
        <li className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-line" /> Taken</li>
      </ul>
    </div>
  );
}
