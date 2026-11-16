import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAppDispatch, useAppSelector } from "../store";
import { fetchOverview } from "../store/slices/analyticsSlice";
import { cancelEvent, deleteEvent, fetchMyEvents } from "../store/slices/eventsSlice";
import { Empty, ErrorBox, Loader } from "../components/Feedback";
import { btnAccent, btnGhost } from "../components/Field";
import { formatDate, formatMoney, formatPrice } from "../utils/format";

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-line bg-white p-5">
      <p className="text-sm text-ink-soft">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { overview, status, error } = useAppSelector((s) => s.analytics);
  const mine = useAppSelector((s) => s.events.mine);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = () => {
    dispatch(fetchOverview());
    dispatch(fetchMyEvents());
  };

  useEffect(load, [dispatch]);

  const handleCancel = async (id: string) => {
    if (!window.confirm("Cancel this event? All confirmed bookings will be cancelled.")) return;
    setActionError(null);
    const res = await dispatch(cancelEvent(id));
    if (cancelEvent.rejected.match(res)) setActionError(res.payload ?? "Could not cancel event");
    else dispatch(fetchOverview());
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this event permanently?")) return;
    setActionError(null);
    const res = await dispatch(deleteEvent(id));
    if (deleteEvent.rejected.match(res)) setActionError(res.payload ?? "Could not delete event");
    else dispatch(fetchOverview());
  };

  const t = overview?.totals;
  const perEventById = new Map(overview?.perEvent.map((p) => [p.eventId, p]));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organizer dashboard</h1>
          <p className="mt-1 text-ink-soft">Sales, revenue and attendance across your events.</p>
        </div>
        <Link to="/dashboard/events/new" className={btnAccent}>Create event</Link>
      </div>

      <div className="mt-6 space-y-3">
        {error && <ErrorBox message={error} />}
        {actionError && <ErrorBox message={actionError} />}
      </div>

      {status === "loading" && !overview && <Loader label="Crunching numbers…" />}

      {overview && t && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Total revenue" value={formatMoney(t.revenue)} />
            <Stat label="Tickets sold" value={t.ticketsSold} />
            <Stat label="Unique attendees" value={t.uniqueParticipants} />
            <Stat label="Average occupancy" value={`${t.averageOccupancy}%`} />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-line bg-white p-5">
              <h2 className="font-semibold">Revenue, last 30 days</h2>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={overview.daily} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                    <CartesianGrid stroke="#dcdeee" strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(d: string) => d.slice(5)} fontSize={12} interval={4} />
                    <YAxis fontSize={12} width={48} />
                    <Tooltip formatter={(v) => formatMoney(Number(v))} labelFormatter={(l) => String(l)} />
                    <Line type="monotone" dataKey="revenue" stroke="#1b1a55" strokeWidth={2.5} dot={false} name="Revenue" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="rounded-xl border border-line bg-white p-5">
              <h2 className="font-semibold">Tickets sold per event</h2>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={overview.perEvent} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                    <CartesianGrid stroke="#dcdeee" strokeDasharray="3 3" />
                    <XAxis dataKey="title" fontSize={12} tickFormatter={(s: string) => (s.length > 12 ? `${s.slice(0, 11)}…` : s)} />
                    <YAxis fontSize={12} width={32} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="ticketsSold" fill="#f5b301" name="Tickets sold" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="capacity" fill="#dcdeee" name="Capacity" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>
        </>
      )}

      <h2 className="mt-10 text-xl font-semibold">Your events</h2>
      <div className="mt-4 overflow-x-auto rounded-xl border border-line bg-white">
        {mine.length === 0 ? (
          <div className="p-6"><Empty title="You haven't created any events" hint="Create your first event to start selling tickets." /></div>
        ) : (
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-line bg-paper text-ink-soft">
              <tr>
                <th className="px-4 py-3 font-medium">Event</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Sold</th>
                <th className="px-4 py-3 font-medium">Revenue</th>
                <th className="px-4 py-3 font-medium">Occupancy</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mine.map((e) => {
                const s = perEventById.get(e._id);
                const cancelled = e.status === "cancelled";
                return (
                  <tr key={e._id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3">
                      <Link to={`/events/${e._id}`} className="font-semibold hover:underline">{e.title}</Link>
                      {cancelled && <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-xs font-semibold text-red-800">Cancelled</span>}
                      {s && (
                        <ul className="mt-1 space-y-0.5 text-xs text-ink-soft">
                          {s.tiers.map((t) => (
                            <li key={t.name}>
                              {t.name} · {formatPrice(t.price)} · {t.sold}/{t.seats} sold
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                    <td className="px-4 py-3">{formatDate(e.date)}</td>
                    <td className="px-4 py-3">{e.bookedSeats.length} / {e.totalSeats}</td>
                    <td className="px-4 py-3">{formatMoney(s?.revenue ?? 0)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-paper"><div className="h-full bg-ink" style={{ width: `${s?.occupancy ?? 0}%` }} /></div>
                        {s?.occupancy ?? 0}%
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link to={`/dashboard/events/${e._id}/participants`} className={btnGhost}>Attendees</Link>
                        {!cancelled && <Link to={`/dashboard/events/${e._id}/edit`} className={btnGhost}>Edit</Link>}
                        {!cancelled && <button className={btnGhost} onClick={() => handleCancel(e._id)}>Cancel</button>}
                        <button className={`${btnGhost} text-red-700`} onClick={() => handleDelete(e._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
