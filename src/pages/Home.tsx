import { FormEvent, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store";
import { fetchEvents } from "../store/slices/eventsSlice";
import EventCard from "../components/EventCard";
import { Empty, ErrorBox, Loader } from "../components/Feedback";
import { Input, Select, btnGhost, btnPrimary } from "../components/Field";

const CATEGORIES = ["all", "workshop", "concert", "meetup", "conference", "other"];

export default function Home() {
  const dispatch = useAppDispatch();
  const { items, status, error, page, pages, total } = useAppSelector((s) => s.events);
  const [params, setParams] = useSearchParams();

  const q = params.get("q") ?? "";
  const category = params.get("category") ?? "all";
  const sort = params.get("sort") ?? "date";
  const maxPrice = params.get("maxPrice") ?? "";
  const currentPage = Number(params.get("page") ?? 1);

  const [search, setSearch] = useState(q);
  const [price, setPrice] = useState(maxPrice);
  const appliedPrice = useRef(maxPrice);



  useEffect(() => {
    setSearch(q);
  }, [q]);
  useEffect(() => {
    if (maxPrice === appliedPrice.current) return;
    appliedPrice.current = maxPrice;
    setPrice(maxPrice);
  }, [maxPrice]);

  useEffect(() => {
    dispatch(fetchEvents({ q, category, sort, maxPrice, page: currentPage, limit: 9 }));
  }, [dispatch, q, category, sort, maxPrice, currentPage]);

  const update = (next: Record<string, string>) => {
    const p = new URLSearchParams(params);
    Object.entries(next).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)));
    if (!("page" in next)) p.delete("page");
    setParams(p);
  };



  useEffect(() => {
    if (price === maxPrice) return;
    const timer = setTimeout(() => {
      appliedPrice.current = price;
      update({ maxPrice: price });
    }, 500);
    return () => clearTimeout(timer);

  }, [price]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    appliedPrice.current = price;
    update({ q: search.trim(), maxPrice: price });
  };

  return (
    <div>
            <section className="relative isolate overflow-hidden bg-ink text-white">
        
        
        <img src="/images/hero.jpg" alt="" aria-hidden="true" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        
        
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/85 via-ink/65 to-ink/80" />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-44 backdrop-blur-lg [mask-image:linear-gradient(to_bottom,transparent,black)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-44 bg-gradient-to-b from-transparent to-paper" />

        <div className="mx-auto max-w-6xl px-4 pb-40 pt-14 sm:pb-48 sm:pt-20">
          <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Workshops, concerts and meetups. Pick your seat and go.
          </h1>
          <p className="mt-4 max-w-xl text-white/75">
            Browse upcoming events, see exactly which seats are free, and keep every ticket in one place.
          </p>

          <form onSubmit={submit} className="mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row">
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, venue or topic"
              aria-label="Search events"
              className="border-transparent sm:flex-1"
            />
            <button className="rounded-lg bg-saffron px-6 py-2.5 text-sm font-semibold text-ink hover:bg-yellow-400">Search</button>
          </form>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Category">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => update({ category: c === "all" ? "" : c })}
                aria-pressed={category === c}
                className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                  category === c ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-line hover:ring-ink"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <label className="text-sm">
              <span className="sr-only">Maximum price</span>
              <Input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="Max price (LKR)"
                value={price}
                onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    appliedPrice.current = price;
                    update({ maxPrice: price });
                  }
                }}
                className="w-44"
              />
            </label>
            <label>
              <span className="sr-only">Sort by</span>
              <Select value={sort} onChange={(e) => update({ sort: e.target.value === "date" ? "" : e.target.value })}>
                <option value="date">Soonest first</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="newest">Recently added</option>
              </Select>
            </label>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3 text-sm text-ink-soft">
          <p>{status === "idle" && !error ? `${total} event${total === 1 ? "" : "s"} found` : ""}</p>
          {(q || maxPrice || category !== "all" || sort !== "date") && (
            <button type="button" onClick={() => setParams({})} className="font-semibold text-ink underline">
              Clear filters
            </button>
          )}
        </div>

        <div className="mt-3">
          {error && <ErrorBox message={error} />}
          {status === "loading" && <Loader label="Finding events…" />}
          {status === "idle" && !error && items.length === 0 && (
            <Empty title="No events match your filters" hint="Try a different category or clear the search." />
          )}
          {status === "idle" && items.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((e) => (
                <EventCard key={e._id} event={e} />
              ))}
            </div>
          )}
        </div>

        {pages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-3">
            <button className={btnGhost} disabled={page <= 1} onClick={() => update({ page: String(page - 1) })}>
              Previous
            </button>
            <span className="text-sm text-ink-soft">
              Page {page} of {pages}
            </span>
            <button className={btnPrimary} disabled={page >= pages} onClick={() => update({ page: String(page + 1) })}>
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


