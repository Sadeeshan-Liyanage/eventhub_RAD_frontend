import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { useAppDispatch } from "./store";
import { fetchMe, sessionExpired } from "./store/slices/authSlice";
import { getAccessToken } from "./utils/storage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ChatWidget from "./components/ChatWidget";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import EventDetails from "./pages/EventDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyBookings from "./pages/MyBookings";
import TicketPage from "./pages/TicketPage";
import Dashboard from "./pages/Dashboard";
import EventForm from "./pages/EventForm";
import Participants from "./pages/Participants";
import CheckIn from "./pages/CheckIn";
import NotFound from "./pages/NotFound";

export default function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (getAccessToken()) dispatch(fetchMe());
    const onLogout = () => dispatch(sessionExpired());
    window.addEventListener("auth:logout", onLogout);
    return () => window.removeEventListener("auth:logout", onLogout);
  }, [dispatch]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/tickets/:id" element={<TicketPage />} />
          </Route>

          <Route element={<ProtectedRoute roles={["user"]} />}>
            <Route path="/my-bookings" element={<MyBookings />} />
          </Route>

          <Route element={<ProtectedRoute roles={["organizer"]} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/events/new" element={<EventForm />} />
            <Route path="/dashboard/events/:id/edit" element={<EventForm />} />
            <Route path="/dashboard/events/:id/participants" element={<Participants />} />
            <Route path="/dashboard/events/:id/check-in" element={<CheckIn />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
