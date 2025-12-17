import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import useApi from "../hooks/useApi.js";
import { useAuth } from "../context/AuthContext.jsx";
import { formatDateTime } from "../utils/date.js";
import Spinner from "../components/Spinner.jsx";

const EventDetailPage = () => {
  const { id } = useParams();
  const api = useApi();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [isRsvped, setIsRsvped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await api.get(`/events/${id}`);
        setEvent(data.event);
        setIsRsvped(Boolean(data.isRsvped));
      } catch (err) {
        setError(err.message || "Unable to load event");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [api, id]);

  const handleRsvp = async () => {
    setActionLoading(true);
    try {
      if (isRsvped) {
        await api.del(`/events/${id}/rsvp`);
        toast.success("RSVP removed");
        setIsRsvped(false);
        setEvent((prev) => ({ ...prev, rsvpCount: Math.max(prev.rsvpCount - 1, 0) }));
      } else {
        await api.post(`/events/${id}/rsvp`);
        toast.success("RSVP confirmed");
        setIsRsvped(true);
        setEvent((prev) => ({ ...prev, rsvpCount: prev.rsvpCount + 1 }));
      }
    } catch (err) {
      toast.error(err.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this event? This action cannot be undone.")) {
      return;
    }
    setActionLoading(true);
    try {
      await api.del(`/events/${id}`);
      toast.success("Event deleted");
      navigate("/");
    } catch (err) {
      toast.error(err.message || "Delete failed");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error || "Event not found"}
      </div>
    );
  }

  const remaining = Math.max(event.capacity - event.rsvpCount, 0);
  const isCreator = user && event.createdBy && user._id === event.createdBy._id;
  const isFull = remaining <= 0;

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <img src={event.imageUrl} alt={event.title} className="h-64 w-full object-cover" />
        <div className="space-y-4 p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-400">
              {event.category || "General"}
            </p>
            <h1 className="text-3xl font-semibold">{event.title}</h1>
          </div>
          <div className="grid gap-4 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-2">
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-200">Date and time</p>
              <p>{formatDateTime(event.dateTime)}</p>
            </div>
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-200">Location</p>
              <p>{event.location}</p>
            </div>
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-200">Organizer</p>
              <p>{event.createdBy?.name || "Unknown"}</p>
            </div>
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-200">Remaining spots</p>
              <p>{remaining}</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            {event.description}
          </p>
          <div className="flex flex-wrap gap-3">
            {!user && (
              <Link
                to="/login"
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Login to RSVP
              </Link>
            )}
            {user && !isCreator && (
              <button
                onClick={handleRsvp}
                disabled={actionLoading || (!isRsvped && isFull)}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  isRsvped
                    ? "border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    : "bg-teal-600 text-white hover:bg-teal-500"
                } ${
                  actionLoading || (!isRsvped && isFull)
                    ? "cursor-not-allowed opacity-60"
                    : ""
                }`}
              >
                {actionLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Processing...
                  </>
                ) : isRsvped ? (
                  "Leave event"
                ) : isFull ? (
                  "Event full"
                ) : (
                  "Join event"
                )}
              </button>
            )}
            {isCreator && (
              <div className="flex flex-wrap gap-3">
                <Link
                  to={`/events/${event._id}/edit`}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventDetailPage;
