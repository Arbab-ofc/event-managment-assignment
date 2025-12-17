import { useEffect, useState } from "react";
import useApi from "../hooks/useApi.js";
import Spinner from "../components/Spinner.jsx";
import EventCard from "../components/EventCard.jsx";

const Section = ({ title, events }) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold">{title}</h2>
    {events.length === 0 ? (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        No events to display.
      </div>
    ) : (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event._id} event={event} />
        ))}
      </div>
    )}
  </div>
);

const UserDashboardPage = () => {
  const api = useApi();
  const [loading, setLoading] = useState(true);
  const [createdEvents, setCreatedEvents] = useState([]);
  const [attendingEvents, setAttendingEvents] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await api.get("/users/me/events");
        setCreatedEvents(data.createdEvents || []);
        setAttendingEvents(data.attendingEvents || []);
      } catch (err) {
        setError(err.message || "Unable to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [api]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  return (
    <section className="space-y-10">
      <div>
        <h1 className="text-3xl font-semibold">Your dashboard</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Track events you created and those you are attending.
        </p>
      </div>
      <Section title="My events" events={createdEvents} />
      <Section title="Attending" events={attendingEvents} />
    </section>
  );
};

export default UserDashboardPage;
