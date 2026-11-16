import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store";
import { clearCurrent, fetchEvent } from "../store/slices/eventsSlice";
import { createBooking } from "../store/slices/bookingsSlice";
import SeatMap from "../components/SeatMap";
import { ErrorBox, Loader } from "../components/Feedback";
import { Field, Input, btnAccent, btnGhost, btnPrimary } from "../components/Field";
import { formatDateTime, formatMoney, formatPrice } from "../utils/format";
import { getTiers, seatRanges, tierForSeat } from "../utils/tiers";
import { getErrorMessage } from "../utils/errors";

const MAX_SEATS = 8;

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { current: event, status, error } = useAppSelector((s) => s.events);
  const user = useAppSelector((s) => s.auth.user);

  const [selected, setSelected] = useState<number[]>([]);
  const [step, setStep] = useState<"seats" | "payment">("seats");
  const [formError, setFormError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [card, setCard] = useState({ cardHolder: "", cardNumber: "", expiry: "", cvv: "" });

  useEffect(() => {
    if (id) dispatch(fetchEvent(id));
    return () => {
      dispatch(clearCurrent());
    };
  }, [dispatch, id]);

  if (status === "loading" || (!event && !error)) return <Loader />;
  if (error || !event) return <div className="mx-auto max-w-3xl px-4 py-10"><ErrorBox message={error ?? "Event not found"} /></div>;

  const organizerName = typeof event.organizer === "string" ? "" : event.organizer.name;
  const isPast = new Date(event.date).getTime() <= Date.now();
  const unavailable = event.status === "cancelled" || isPast || event.availableSeats === 0;
  const tiers = getTiers(event);
  const total = selected.reduce((sum, seat) => sum + (tierForSeat(tiers, seat)?.price ?? 0), 0);
  const selectedLabel = selected.map((seat) => `${seat} (${tierForSeat(tiers, seat)?.name ?? ""})`).join(", ");

  const toggle = (seat: number) => {
    setFormError(null);
    setSelected((cur) => {
      if (cur.includes(seat)) return cur.filter((s) => s !== seat);
      if (cur.length >= MAX_SEATS) {
        setFormError(`You can select up to ${MAX_SEATS} seats at a time.`);
        return cur;
      }
      return [...cur, seat].sort((a, b) => a - b);
    });
  };

  const proceed = () => {
    if (!user) return navigate("/login", { state: { from: location.pathname } });
    setStep("payment");
  };

  const pay = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setPaying(true);
    const result = await dispatch(createBooking({ eventId: event._id, seatNumbers: selected, payment: card }));
    setPaying(false);
    if (createBooking.fulfilled.match(result)) {
      navigate(`/tickets/${result.payload._id}`, { state: { justBooked: true } });
    } else {
      setFormError(result.payload ?? getErrorMessage(result.error));
      // seats may have been taken meanwhile – refresh the map
      dispatch(fetchEvent(event._id));
      setSelected([]);
      setStep("seats");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link to="/" className="text-sm font-medium text-ink-soft hover:text-ink">‹ All events</Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div>
          <div className="aspect-video overflow-hidden rounded-xl bg-ink">
            {event.imageUrl && <img src={event.imageUrl} alt="" onError={(e) => (e.currentTarget.style.display = "none")} className="h-full w-full object-cover" />}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="rounded-md bg-saffron px-2.5 py-1 text-xs font-semibold capitalize">{event.category}</span>
            {event.status === "cancelled" && <span className="rounded-md bg-red-600 px-2.5 py-1 text-xs font-semibold text-white">Cancelled</span>}
            {isPast && event.status !== "cancelled" && <span className="rounded-md bg-ink/80 px-2.5 py-1 text-xs font-semibold text-white">Ended</span>}
          </div>

          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{event.title}</h1>

          <dl className="mt-5 grid gap-4 rounded-xl border border-line bg-white p-5 sm:grid-cols-2">
            <div><dt className="text-xs text-ink-soft">When</dt><dd className="font-medium">{formatDateTime(event.date)}</dd></div>
            <div><dt className="text-xs text-ink-soft">Where</dt><dd className="font-medium">{event.venue}</dd></div>
            <div><dt className="text-xs text-ink-soft">{tiers.length > 1 ? "Prices from" : "Price per seat"}</dt><dd className="font-medium">{formatPrice(event.price)}</dd></div>
            <div><dt className="text-xs text-ink-soft">Seats left</dt><dd className="font-medium">{event.availableSeats} of {event.totalSeats}</dd></div>
            {organizerName && <div><dt className="text-xs text-ink-soft">Organised by</dt><dd className="font-medium">{organizerName}</dd></div>}
          </dl>

          <h2 className="mt-8 text-xl font-semibold">Tickets</h2>
          <ul className="mt-3 divide-y divide-line rounded-xl border border-line bg-white">
            {seatRanges(tiers).map(({ tier, from, to }) => {
              const left = tier.seats - event.bookedSeats.filter((n) => n >= from && n <= to).length;
              return (
                <li key={tier.name} className="flex items-center justify-between gap-4 px-5 py-3">
                  <div>
                    <p className="font-semibold">{tier.name}</p>
                    <p className="text-xs text-ink-soft">Seats {from}–{to}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatPrice(tier.price)}</p>
                    <p className={`text-xs ${left === 0 ? "font-semibold text-red-700" : "text-ink-soft"}`}>{left === 0 ? "Sold out" : `${left} left`}</p>
                  </div>
                </li>
              );
            })}
          </ul>

          <h2 className="mt-8 text-xl font-semibold">About this event</h2>
          <p className="mt-2 max-w-prose whitespace-pre-line leading-relaxed text-ink/85">{event.description}</p>
        </div>

        {/* booking panel */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="stub rounded-2xl" style={{ ["--notch-y" as string]: "72px" }}>
            <div className="rounded-2xl p-5">
              <h2 className="text-lg font-semibold">{step === "seats" ? "Choose your seats" : "Payment"}</h2>

              {unavailable ? (
                <p className="mt-3 text-sm text-ink-soft">
                  {event.status === "cancelled" ? "This event was cancelled." : isPast ? "This event has already taken place." : "All seats are taken."}
                </p>
              ) : user?.role === "organizer" ? (
                <p className="mt-3 text-sm text-ink-soft">Organizer accounts can't book tickets. Use a regular account to book seats.</p>
              ) : step === "seats" ? (
                <div className="mt-4">
                  <SeatMap tiers={tiers} bookedSeats={event.bookedSeats} selected={selected} onToggle={toggle} />
                  {formError && <div className="mt-4"><ErrorBox message={formError} /></div>}
                  <div className="tear mt-5 pt-4">
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="text-ink-soft">{selected.length ? `Seats ${selectedLabel}` : "No seats selected"}</span>
                      <span className="text-xl font-bold">{formatMoney(total)}</span>
                    </div>
                    <button className={`${btnAccent} mt-4 w-full`} disabled={selected.length === 0} onClick={proceed}>
                      {user ? "Continue to payment" : "Log in to book"}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={pay} className="mt-4 space-y-4">
                  <p className="rounded-lg bg-paper px-3 py-2 text-sm">
                    {selected.length} seat{selected.length > 1 ? "s" : ""} ({selectedLabel}) ·{" "}
                    <strong>{formatMoney(total)}</strong>
                  </p>
                  <Field label="Name on card">
                    <Input required autoComplete="cc-name" value={card.cardHolder} onChange={(e) => setCard({ ...card, cardHolder: e.target.value })} />
                  </Field>
                  <Field label="Card number" hint="Demo checkout: use any 16 digits. Numbers ending in 0000 are declined.">
                    <Input required inputMode="numeric" autoComplete="cc-number" placeholder="4242 4242 4242 4242" maxLength={19} value={card.cardNumber} onChange={(e) => setCard({ ...card, cardNumber: e.target.value })} />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Expiry">
                      <Input required placeholder="MM/YY" autoComplete="cc-exp" maxLength={5} value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} />
                    </Field>
                    <Field label="CVV">
                      <Input required inputMode="numeric" autoComplete="cc-csc" maxLength={4} value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })} />
                    </Field>
                  </div>
                  {formError && <ErrorBox message={formError} />}
                  <div className="flex gap-3">
                    <button type="button" className={btnGhost} onClick={() => setStep("seats")} disabled={paying}>Back</button>
                    <button className={`${btnPrimary} flex-1`} disabled={paying}>{paying ? "Processing…" : `Pay ${formatMoney(total)}`}</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
