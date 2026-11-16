import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store";
import { logout } from "../store/slices/authSlice";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10 hover:text-white"
  }`;

export default function Navbar() {
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logout());
    setOpen(false);
    navigate("/");
  };

  const links = (
    <>
      <NavLink to="/" end className={linkClass} onClick={() => setOpen(false)}>
        Events
      </NavLink>
      {user?.role === "user" && (
        <NavLink to="/my-bookings" className={linkClass} onClick={() => setOpen(false)}>
          My tickets
        </NavLink>
      )}
      {user?.role === "organizer" && (
        <NavLink to="/dashboard" className={linkClass} onClick={() => setOpen(false)}>
          Dashboard
        </NavLink>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-30 bg-ink text-white shadow-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
            <path d="M3 8h26v5a3 3 0 0 0 0 6v5H3v-5a3 3 0 0 0 0-6z" fill="#f5b301" />
          </svg>
          EventHub
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {links}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <span className="text-sm text-white/80">{user.name}</span>
              <button onClick={handleLogout} className="rounded-md bg-white/10 px-3 py-2 text-sm font-medium hover:bg-white/20">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-3 py-2 text-sm font-medium text-white/85 hover:text-white">
                Log in
              </Link>
              <Link to="/register" className="rounded-md bg-saffron px-4 py-2 text-sm font-semibold text-ink hover:bg-yellow-400">
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          className="rounded-md p-2 hover:bg-white/10 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <div className="space-y-1 border-t border-white/10 px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-1">{links}</div>
          <div className="mt-3 flex gap-2">
            {user ? (
              <button onClick={handleLogout} className="rounded-md bg-white/10 px-3 py-2 text-sm font-medium">
                Log out ({user.name})
              </button>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="rounded-md bg-white/10 px-3 py-2 text-sm font-medium">
                  Log in
                </Link>
                <Link to="/register" onClick={() => setOpen(false)} className="rounded-md bg-saffron px-3 py-2 text-sm font-semibold text-ink">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
