import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store";
import { checkInTicket, fetchParticipants, undoCheckIn } from "../store/slices/analyticsSlice";
import QrScanner from "../components/QrScanner";
import { Empty, ErrorBox, Loader } from "../components/Feedback";
import { Input, btnAccent, btnGhost, btnPrimary } from "../components/Field";
import { CheckInResult } from "../types";
import { extractTicketCode } from "../utils/ticket";
import { formatDateTime, formatTime } from "../utils/format";

const TONE: Record<CheckInResult["status"], { box: string; title: string }> = {
  admitted: { box: "border-emerald-300 bg-emerald-50 text-emerald-900", title: "ADMIT" },
  already_used: { box: "border-amber-300 bg-amber-50 text-amber-900", title: "ALREADY USED" },
  cancelled: { box: "border-red-300 bg-red-50 text-red-900", title: "CANCELLED" },
  wrong_event: { box: "border-red-300 bg-red-50 text-red-900", title: "WRONG EVENT" },
  not_found: { box: "border-red-300 bg-red-50 text-red-900", title: "NOT FOUND" },
};

export default function CheckIn() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { participants: data, status, error } = useAppSelector((s) => s.analytics);

  const [code, setCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const lastScan = useRef({ code: "", time: 0 });
  const busyRef = useRef(false);

  useEffect(() => {
    if (id) dispatch(fetchParticipants(id));
  }, [dispatch, id]);

  const submit = useCallback(
    async (raw: string) => {
      const ticketCode = extractTicketCode(raw);
      if (!id || !ticketCode || busyRef.current) return;
      busyRef.current = true;
      setBusy(true);
      setRequestError(null);
      const res = await dispatch(checkInTicket({ eventId: id, ticketCode }));
      if (checkInTicket.fulfilled.match(res)) {
        setResult(res.payload);
        setCode("");
      } else {
        setResult(null);
        setRequestError(res.payload ?? "Check-in failed");
      }
      busyRef.current = false;
      setBusy(false);
    },
    [dispatch, id]
  );



  const handleScan = useCallback(
    (text: string) => {
      const ticketCode = extractTicketCode(text);
      const now = Date.now();
      if (ticketCode === lastScan.current.code && now - lastScan.current.time < 4000) return;
      lastScan.current = { code: ticketCode, time: now };
      submit(text);
    },
    [submit]
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit(code);
  };

  const handleUndo = async (bookingId: string) => {
    if (!window.confirm("Undo this check-in?")) return;
    const res = await dispatch(undoCheckIn(bookingId));
    if (undoCheckIn.rejected.match(res)) setRequestError(res.payload ?? "Could not undo");
  };

  if (status === "loading" && !data) return <Loader />;
  if (error && !data) return <div className="mx-auto max-w-3xl px-4 py-10"><ErrorBox message={error} /></div>;
  if (!data) return null;

  const rows = data.participants.filter((p) => {
    const q = filter.trim().toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || p.ticketCode.toLowerCase().includes(q);
  });
  const totalGuests = data.participants.reduce((sum, p) => sum + p.quantity, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link to="/dashboard" className="text-sm font-medium text-ink-soft hover:text-ink">‹ Dashboard</Link>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">Check-in</h1>
      <p className="mt-1 text-ink-soft">{data.event.title} · {formatDateTime(data.event.date)}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-white p-5">
          <p className="text-sm text-ink-soft">Checked in</p>
          <p className="mt-1 text-3xl font-bold">{data.event.checkedIn} <span className="text-lg font-medium text-ink-soft">/ {totalGuests}</span></p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-paper" aria-hidden="true">
            <div className="h-full bg-emerald-600" style={{ width: `${totalGuests ? Math.round((data.event.checkedIn / totalGuests) * 100) : 0}%` }} />
          </div>
        </div>

        <form onSubmit={onSubmit} className="rounded-xl border border-line bg-white p-5 sm:col-span-2">
          <label htmlFor="ticket-code" className="text-sm font-medium">Ticket code</label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Input id="ticket-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="TKT-XXXXXXXXXX" autoComplete="off" className="font-mono uppercase" />
            <button className={btnPrimary} disabled={busy || !code.trim()}>Check in</button>
          </div>
          <button type="button" className={`${scanning ? btnGhost : btnAccent} mt-3 w-full`} onClick={() => setScanning((v) => !v)}>
            {scanning ? "Stop camera" : "Scan QR code with camera"}
          </button>
        </form>
      </div>

      {scanning && <div className="mt-4"><QrScanner onScan={handleScan} /></div>}

      <div className="mt-4 space-y-3" aria-live="polite">
        {requestError && <ErrorBox message={requestError} />}
        {busy && <Loader label="Checking ticket…" />}
        {result && !busy && (
          <section role="status" className={`rounded-xl border-2 p-5 ${TONE[result.status].box}`}>
            <p className="text-2xl font-extrabold tracking-wide">{TONE[result.status].title}</p>
            <p className="mt-1 text-sm">{result.message}</p>
            {result.ticket && (
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-4">
                <div><dt className="opacity-70">Name</dt><dd className="font-semibold">{result.ticket.name}</dd></div>
                <div><dt className="opacity-70">People</dt><dd className="text-lg font-bold">{result.ticket.quantity}</dd></div>
                <div className="sm:col-span-2"><dt className="opacity-70">Seats</dt><dd className="font-semibold">{result.ticket.seats.join(", ")}</dd></div>
                {result.status === "already_used" && result.ticket.checkedInAt && (
                  <div className="sm:col-span-4"><dt className="opacity-70">Entered at</dt><dd className="font-semibold">{formatDateTime(result.ticket.checkedInAt)}</dd></div>
                )}
              </dl>
            )}
          </section>
        )}
      </div>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-xl font-semibold">Attendees</h2>
        <Input type="search" placeholder="Search name, email or code" aria-label="Search attendees" value={filter} onChange={(e) => setFilter(e.target.value)} className="max-w-xs" />
      </div>

      <div className="mt-3 overflow-x-auto rounded-xl border border-line bg-white">
        {rows.length === 0 ? (
          <div className="p-6"><Empty title={data.participants.length ? "No attendee matches your search" : "No bookings yet"} /></div>
        ) : (
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-line bg-paper text-ink-soft">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Seats</th>
                <th className="px-4 py-3 font-medium">Ticket</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.bookingId} className="border-b border-line last:border-0">
                  <td className="px-4 py-3"><p className="font-medium">{p.name}</p><p className="text-xs text-ink-soft">{p.email}</p></td>
                  <td className="px-4 py-3">{p.seatLabels.join(", ")}</td>
                  <td className="px-4 py-3 font-mono text-xs">{p.ticketCode}</td>
                  <td className="px-4 py-3">
                    {p.checkedInAt ? (
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">In · {formatTime(p.checkedInAt)}</span>
                    ) : (
                      <span className="rounded bg-line px-2 py-0.5 text-xs font-semibold">Not yet</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {p.checkedInAt ? (
                      <button className={btnGhost} onClick={() => handleUndo(p.bookingId)}>Undo</button>
                    ) : (
                      <button className={btnGhost} disabled={busy} onClick={() => submit(p.ticketCode)}>Check in</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
