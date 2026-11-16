import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store";
import { clearAuthError, login } from "../store/slices/authSlice";
import { ErrorBox } from "../components/Feedback";
import { Field, Input, btnPrimary } from "../components/Field";

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status, error, user } = useAppSelector((s) => s.auth);
  const [form, setForm] = useState({ email: "", password: "" });

  const from = (location.state as { from?: string } | null)?.from;

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (user) navigate(from ?? (user.role === "organizer" ? "/dashboard" : "/"), { replace: true });
  }, [user, from, navigate]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    dispatch(login(form));
  };

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
      <p className="mt-1 text-ink-soft">Log in to book seats and see your tickets.</p>

      <form onSubmit={submit} className="mt-8 space-y-4 rounded-xl border border-line bg-white p-6">
        {error && <ErrorBox message={error} />}
        <Field label="Email">
          <Input type="email" required autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </Field>
        <Field label="Password">
          <Input type="password" required autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </Field>
        <button className={`${btnPrimary} w-full`} disabled={status === "loading"}>
          {status === "loading" ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        New here? <Link to="/register" className="font-semibold text-ink underline">Create an account</Link>
      </p>
    </div>
  );
}
