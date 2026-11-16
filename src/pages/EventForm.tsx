import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store";
import { createEvent, fetchMyEvents, updateEvent } from "../store/slices/eventsSlice";
import { ErrorBox, Loader } from "../components/Feedback";
import { Field, Input, Select, Textarea, btnGhost, btnPrimary } from "../components/Field";
import { EventCategory } from "../types";
import { formatMoney, toLocalInput } from "../utils/format";
import { getTiers } from "../utils/tiers";

const CATEGORIES: EventCategory[] = ["workshop", "concert", "meetup", "conference", "other"];
const MAX_TIERS = 5;

interface TierRow {
  name: string;
  price: string;
  seats: string;
}

interface FormState {
  title: string;
  description: string;
  category: EventCategory;
  venue: string;
  date: string;
  imageUrl: string;
}

const emptyForm: FormState = { title: "", description: "", category: "workshop", venue: "", date: "", imageUrl: "" };
const emptyTiers: TierRow[] = [{ name: "General", price: "0", seats: "50" }];

export default function EventForm() {
  const { id } = useParams<{ id: string }>();
  const editing = Boolean(id);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const mine = useAppSelector((s) => s.events.mine);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [tiers, setTiers] = useState<TierRow[]>(emptyTiers);
  const [loaded, setLoaded] = useState(!editing);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing && mine.length === 0) dispatch(fetchMyEvents());
  }, [dispatch, editing, mine.length]);

  useEffect(() => {
    if (!editing) return;
    const ev = mine.find((e) => e._id === id);
    if (ev) {
      setForm({
        title: ev.title,
        description: ev.description,
        category: ev.category,
        venue: ev.venue,
        date: toLocalInput(ev.date),
        imageUrl: ev.imageUrl ?? "",
      });
      setTiers(getTiers(ev).map((t) => ({ name: t.name, price: String(t.price), seats: String(t.seats) })));
      setLoaded(true);
    }
  }, [editing, id, mine]);

  const locked = editing && (mine.find((e) => e._id === id)?.bookedSeats.length ?? 0) > 0;

  const set = (k: keyof FormState) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value });
  const setTier = (i: number, k: keyof TierRow, v: string) =>
    setTiers((cur) => cur.map((t, idx) => (idx === i ? { ...t, [k]: v } : t)));
  const addTier = () => setTiers((cur) => [...cur, { name: "", price: "0", seats: "10" }]);
  const removeTier = (i: number) => setTiers((cur) => cur.filter((_, idx) => idx !== i));

  const totalSeats = tiers.reduce((sum, t) => sum + (Number(t.seats) || 0), 0);
  const potential = tiers.reduce((sum, t) => sum + (Number(t.seats) || 0) * (Number(t.price) || 0), 0);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const body = {
      title: form.title,
      description: form.description,
      category: form.category,
      venue: form.venue,
      date: new Date(form.date).toISOString(),
      imageUrl: form.imageUrl,
      ticketTypes: tiers.map((t) => ({ name: t.name.trim(), price: Number(t.price), seats: Number(t.seats) })),
    };
    const res = editing ? await dispatch(updateEvent({ id: id!, body })) : await dispatch(createEvent(body));
    setSaving(false);
    if (res.type.endsWith("/fulfilled")) navigate("/dashboard");
    else setError((res as { payload?: string }).payload ?? "Could not save event");
  };

  if (!loaded) return <Loader />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link to="/dashboard" className="text-sm font-medium text-ink-soft hover:text-ink">‹ Dashboard</Link>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">{editing ? "Edit event" : "Create event"}</h1>

      <form onSubmit={submit} className="mt-6 space-y-4 rounded-xl border border-line bg-white p-6">
        {error && <ErrorBox message={error} />}
        <Field label="Title"><Input required minLength={3} maxLength={120} value={form.title} onChange={set("title")} /></Field>
        <Field label="Description"><Textarea required minLength={10} rows={5} value={form.description} onChange={set("description")} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Category">
            <Select value={form.category} onChange={set("category")}>
              {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
            </Select>
          </Field>
          <Field label="Date and time"><Input type="datetime-local" required value={form.date} onChange={set("date")} /></Field>
        </div>
        <Field label="Venue"><Input required value={form.venue} onChange={set("venue")} /></Field>

        <fieldset className="rounded-lg border border-line p-4">
          <legend className="px-1 text-sm font-medium">Ticket types</legend>
          <p className="mb-3 text-xs text-ink-soft">
            Set your own ticket types, price and number of seats for each (for example VIP, General, Student). Enter 0 as the price for free tickets.
          </p>
          {locked && (
            <p className="mb-3 rounded-lg bg-saffron/20 px-3 py-2 text-xs">
              Tickets have already been sold, so ticket types and prices can no longer be changed.
            </p>
          )}

          <div className="space-y-3">
            {tiers.map((t, i) => (
              <div key={i} className="grid grid-cols-[1fr_auto] items-end gap-3 sm:grid-cols-[1.4fr_1fr_0.8fr_auto]">
                <Field label="Name"><Input required maxLength={40} disabled={locked} placeholder="e.g. VIP" value={t.name} onChange={(e) => setTier(i, "name", e.target.value)} /></Field>
                <Field label="Price (LKR)"><Input type="number" min={0} required disabled={locked} value={t.price} onChange={(e) => setTier(i, "price", e.target.value)} /></Field>
                <Field label="Seats"><Input type="number" min={1} max={1000} required disabled={locked} value={t.seats} onChange={(e) => setTier(i, "seats", e.target.value)} /></Field>
                <button
                  type="button"
                  className={btnGhost}
                  disabled={locked || tiers.length === 1}
                  onClick={() => removeTier(i)}
                  aria-label={`Remove ticket type ${i + 1}`}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <button type="button" className={btnGhost} disabled={locked || tiers.length >= MAX_TIERS} onClick={addTier}>
              + Add ticket type
            </button>
            <p className="text-sm text-ink-soft">
              {totalSeats} seats · up to {formatMoney(potential)} if sold out
            </p>
          </div>
        </fieldset>

        <Field label="Cover image URL" hint="Optional"><Input type="text" placeholder="https://… or /images/photo.jpg" value={form.imageUrl} onChange={set("imageUrl")} /></Field>
        <div className="flex gap-3 pt-2">
          <button className={btnPrimary} disabled={saving}>{saving ? "Saving…" : editing ? "Save changes" : "Publish event"}</button>
          <Link to="/dashboard" className={btnGhost}>Cancel</Link>
        </div>
      </form>
    </div>
  );
}
