import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store";
import { fetchParticipants } from "../store/slices/analyticsSlice";
import { Empty, ErrorBox, Loader } from "../components/Feedback";
import { formatDateTime, formatMoney } from "../utils/format";

export default function Participants() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { participants: data, status, error } = useAppSelector((s) => s.analytics);

  useEffect(() => {
    if (id) dispatch(fetchParticipants(id));
  }, [dispatch, id]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link to="/dashboard" className="text-sm font-medium text-ink-soft hover:text-ink">‹ Dashboard</Link>
      {error && <div className="mt-4"><ErrorBox message={error} /></div>}
      {status === "loading" && <Loader />}

      {data && (
        <>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">{data.event.title}</h1>
          <p className="mt-1 text-ink-soft">{data.event.sold} of {data.event.capacity} seats sold · {data.participants.length} booking{data.participants.length === 1 ? "" : "s"}</p>

          <div className="mt-6 overflow-x-auto rounded-xl border border-line bg-white">
            {data.participants.length === 0 ? (
              <div className="p-6"><Empty title="No attendees yet" hint="Bookings will show up here as they come in." /></div>
            ) : (
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-line bg-paper text-ink-soft">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Seats</th>
                    <th className="px-4 py-3 font-medium">Paid</th>
                    <th className="px-4 py-3 font-medium">Ticket</th>
                    <th className="px-4 py-3 font-medium">Booked</th>
                  </tr>
                </thead>
                <tbody>
                  {data.participants.map((p) => (
                    <tr key={p.bookingId} className="border-b border-line last:border-0">
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3">{p.email}</td>
                      <td className="px-4 py-3">{p.seatLabels.join(", ")}</td>
                      <td className="px-4 py-3">{formatMoney(p.amount)}</td>
                      <td className="px-4 py-3 font-mono text-xs">{p.ticketCode}</td>
                      <td className="px-4 py-3">{formatDateTime(p.bookedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      
    </div>
  );
}


