import { useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { useAppDispatch, useAppSelector } from "../store";
import { fetchBooking } from "../store/slices/bookingsSlice";
import { ErrorBox, Loader, SuccessBox } from "../components/Feedback";
import { btnGhost, btnPrimary } from "../components/Field";
import { formatDate, formatPrice, formatTime } from "../utils/format";

export default function TicketPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { current: b, status, error } = useAppSelector((s) => s.bookings);
  const justBooked = (location.state as { justBooked?: boolean } | null)?.justBooked;

  useEffect(() => {
    if (id) dispatch(fetchBooking(id));
  }, [dispatch, id]);

  if (status === "loading" || (!b && !error)) return <Loader label="Loading ticket…" />;
  if (error || !b) return <div className="mx-auto max-w-xl px-4 py-10"><ErrorBox message={error ?? "Ticket not found"} /></div>;

  const holder = typeof b.user === "string" ? "" : b.user.name;
  const qrValue = JSON.stringify({ code: b.ticketCode, booking: b._id });

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      {justBooked && <div className="no-print mb-6"><SuccessBox message="Payment successful. Your seats are booked." /></div>}

      <div className="stub rounded-2xl" style={{ ["--notch-y" as string]: "62%" }}>
        <div className="rounded-2xl">
          <div className="rounded-t-2xl bg-ink p-6 text-white">
            <p className="text-sm capitalize text-saffron">{b.event.category}</p>
            <h1 className="mt-1 text-2xl font-bold leading-tight">{b.event.title}</h1>
            <p className="mt-2 text-white/75">{b.event.venue}</p>
          </div>

          <dl className="grid grid-cols-3 gap-4 p-6">
            <div><dt className="text-xs text-ink-soft">Date</dt><dd className="font-semibold">{formatDate(b.event.date)}</dd></div>
            <div><dt className="text-xs text-ink-soft">Time</dt><dd className="font-semibold">{formatTime(b.event.date)}</dd></div>
            <div><dt className="text-xs text-ink-soft">{b.totalAmount === 0 ? "Price" : "Paid"}</dt><dd className="font-semibold">{formatPrice(b.totalAmount)}</dd></div>
            <div className="col-span-2"><dt className="text-xs text-ink-soft">Seats</dt><dd className="font-semibold">
              {b.seatDetails && b.seatDetails.length > 0
                ? b.seatDetails.map((d) => `${d.seatNumber} (${d.tier})`).join(", ")
                : b.seatNumbers.join(", ")}
            </dd></div>
            {holder && <div><dt className="text-xs text-ink-soft">Holder</dt><dd className="font-semibold">{holder}</dd></div>}
          </dl>

          <div className="tear mx-6" />

          <div className="flex flex-col items-center gap-3 p-6">
            <QRCodeSVG value={qrValue} size={168} level="M" aria-label="Ticket QR code" />
            <p className="font-mono text-lg font-bold tracking-widest">{b.ticketCode}</p>
            <p className="text-xs text-ink-soft">Show this code at the entrance · Ref {b.paymentRef}</p>
            {b.checkedInAt && b.status !== "cancelled" && <p className="rounded bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">Checked in at the event</p>}
            {b.status === "cancelled" && <p className="rounded bg-red-100 px-3 py-1 text-sm font-semibold text-red-800">This ticket is cancelled</p>}
          </div>
        </div>
      </div>

      <div className="no-print mt-6 flex justify-center gap-3">
        <button className={btnPrimary} onClick={() => window.print()}>Print ticket</button>
        <Link to="/my-bookings" className={btnGhost}>All my tickets</Link>
      </div>
    </div>
  );
}
