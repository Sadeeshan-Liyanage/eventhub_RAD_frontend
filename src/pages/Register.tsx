import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store";
import { clearAuthError, register } from "../store/slices/authSlice";
import { ErrorBox } from "../components/Feedback";
import { Field, Input, btnPrimary } from "../components/Field";
import { Role } from "../types";

const ROLES: { value: Role; title: string; text: string }[] = [
  { value: "user", title: "Attendee", text: "Browse events and book seats" },
  { value: "organizer", title: "Organizer", text: "Create events and track sales" },
];

export default function Register() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error, user } = useAppSelector((s) => s.auth);
  const [form, setForm] = useState<{ name: string; email: string; password: string; role: Role }>({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (user) navigate(user.role === "organizer" ? "/dashboard" : "/", { replace: true });
  }, [user, navigate]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    dispatch(register(form));
  };

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
      <p className="mt-1 text-ink-soft">It takes less than a minute.</p>

      <form onSubmit={submit} className="mt-8 space-y-4 rounded-xl border border-line bg-white p-6">
        {error && <ErrorBox message={error} />}

        <fieldset>
          <legend className="mb-1.5 text-sm font-medium">I want to</legend>
          <div className="grid grid-cols-2 gap-3">
            {ROLES.map((r) => (
              <label
                key={r.value}
                className={`cursor-pointer rounded-lg border p-3 text-sm transition-colors ${
                  form.role === r.value ? "border-ink bg-ink/5" : "border-line hover:border-ink/50"
                }`}
              >
                <input type="radio" name="role" className="sr-only" checked={form.role === r.value} onChange={() => setForm({ ...form, role: r.value })} />
                <span className="block font-semibold">{r.title}</span>
                <span className="text-xs text-ink-soft">{r.text}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <Field label="Full name">
          <Input required minLength={2} autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="Email">
          <Input type="email" required autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </Field>
        <Field label="Password" hint="At least 6 characters">
          <Input type="password" required minLength={6} autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </Field>
        <button className={`${btnPrimary} w-full`} disabled={status === "loading"}>
          {status === "loading" ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Already have an account? <Link to="/login" className="font-semibold text-ink underline">Log in</Link>
      </p>
    </div>
  );
}
