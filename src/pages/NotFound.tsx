import { Link } from "react-router-dom";
import { btnPrimary } from "../components/Field";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-4xl font-bold">Page not found</h1>
      <p className="mt-2 text-ink-soft">The page you're looking for doesn't exist or was moved.</p>
      <Link to="/" className={`${btnPrimary} mt-6`}>Browse events</Link>
    </div>
  );
}
