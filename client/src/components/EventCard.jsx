import { Link } from "react-router-dom";
import { formatDateTime } from "../utils/date.js";

const EventCard = ({ event }) => {
  const remaining = Math.max(event.capacity - event.rsvpCount, 0);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <img src={event.imageUrl} alt={event.title} className="h-44 w-full object-cover" />
      <div className="space-y-3 p-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-400">
            {event.category || "General"}
          </p>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {event.title}
          </h3>
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-300">
          <p>{formatDateTime(event.dateTime)}</p>
          <p>{event.location}</p>
          <p>{remaining} spots remaining</p>
        </div>
        <Link
          to={`/events/${event._id}`}
          className="inline-flex items-center text-sm font-semibold text-teal-700 hover:text-teal-600 dark:text-teal-400"
        >
          View details
        </Link>
      </div>
    </div>
  );
};

export default EventCard;
