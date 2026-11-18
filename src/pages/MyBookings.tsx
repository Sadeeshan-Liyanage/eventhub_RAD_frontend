import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store";
import { cancelBooking, fetchMyBookings } from "../store/slices/bookingsSlice";
import { Empty, ErrorBox, Loader } from "../components/Feedback";
import { btnGhost, btnPrimary } from "../components/Field";
import { formatDateTime, formatPrice } from "../utils/format";

export default function MyBookings() {
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((s) => s.bookings);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchMyBookings());
  }, [dispatch]);

  const cancel = async (id: string) => {
    if (!window.confirm("Cancel this booking? Your seats will be released.")) return;
    setActionError(null);
    const res = await dispatch(cancelBooking(id));
    if (cancelBooking.rejected.match(res)) setActionError(res.payload ?? "Could not cancel booking");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">My tickets</h1>
      <p className="mt-1 text-ink-soft">Your booking history and digital tickets.</p>

      <div className="mt-6 space-y-4">
        {(error || actionError) && <ErrorBox message={(error || actionError) as string} />}
        {status === "loading" && <Loader />}
        {status === "idle" && !error && items.length === 0 && (
          <Empty title="No bookings yet" hint="Find an event and pick your seats to see tickets here." />
        )}

        {items.map((b) => {
          const cancelled = b.status === "cancelled";
          const past = new Date(b.event.date).getTime() <= Date.now();
          return (
            <article key={b._id} className={`flex flex-col gap-4 rounded-xl border border-line bg-white p-5 sm:flex-row sm:items-center ${cancelled ? "opacity-60" : ""}`}>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold">{b.event.title}</h2>
                  <span className={`rounded px-2 py-0.5 text-xs font-semibold ${cancelled ? "bg-red-100 text-red-800" : past ? "bg-line text-ink" : "bg-emerald-100 text-emerald-800"}`}>
                    {cancelled ? "Cancelled" : past ? "Attended" : "Confirmed"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink-soft">{formatDateTime(b.event.date)} · {b.event.venue}</p>
                <p className="mt-2 text-sm">
                  Seats <strong>{b.seatNumbers.join(", ")}</strong> · {formatPrice(b.totalAmount)} · Code <span className="font-mono">{b.ticketCode}</span>
                </p>
              </div>
              <div className="flex gap-2">
                {!cancelled && <Link to={`/tickets/${b._id}`} className={btnPrimary}>View ticket</Link>}
                {!cancelled && !past && <button className={btnGhost} onClick={() => cancel(b._id)}>Cancel</button>}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
