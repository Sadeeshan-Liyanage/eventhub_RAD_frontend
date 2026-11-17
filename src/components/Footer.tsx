import { Link } from "react-router-dom";
import { useAppSelector } from "../store";

export default function Footer() {
  const user = useAppSelector((s) => s.auth.user);

  const linkClass = "text-white/70 transition-colors hover:text-white";



  return (
    <footer className="no-print mt-16 bg-ink text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
              <path d="M3 8h26v5a3 3 0 0 0 0 6v5H3v-5a3 3 0 0 0 0-6z" fill="#f5b301" />
            </svg>
            EventHub
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">
            Discover workshops, concerts and tech meetups, pick your exact seat and keep every ticket in one place.
          </p>
        </div>

        <nav aria-label="Explore">
          <h2 className="text-sm font-semibold text-saffron">Explore</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/" className={linkClass}>All events</Link></li>
            <li><Link to="/?category=concert" className={linkClass}>Concerts</Link></li>
            <li><Link to="/?category=workshop" className={linkClass}>Workshops</Link></li>
            <li><Link to="/?category=meetup" className={linkClass}>Meetups</Link></li>
          </ul>
        </nav>

        <nav aria-label="Account">
          <h2 className="text-sm font-semibold text-saffron">Account</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {!user && (
              <>
                <li><Link to="/login" className={linkClass}>Log in</Link></li>
                <li><Link to="/register" className={linkClass}>Sign up</Link></li>
              </>
            )}
            {user?.role === "user" && <li><Link to="/my-bookings" className={linkClass}>My tickets</Link></li>}
            {user?.role === "organizer" && (
              <>
                <li><Link to="/dashboard" className={linkClass}>Dashboard</Link></li>
                <li><Link to="/dashboard/events/new" className={linkClass}>Create an event</Link></li>
              </>
            )}
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} EventHub. All rights reserved.</p>
          <p>Built with React, TypeScript, Node.js and MongoDB</p>
        </div>
      </div>
    </footer>
  );
}


