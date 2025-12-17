import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import useApi from "../hooks/useApi.js";
import { useAuth } from "../context/AuthContext.jsx";
import EventForm from "../components/EventForm.jsx";
import Spinner from "../components/Spinner.jsx";
import { formatDateInput } from "../utils/date.js";

const EditEventPage = () => {
  const { id } = useParams();
  const api = useApi();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [event, setEvent] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await api.get(`/events/${id}`);
        setEvent(data.event);
      } catch (err) {
        setError(err.message || "Unable to load event");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [api, id]);

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("dateTime", values.dateTime);
      formData.append("location", values.location);
      formData.append("capacity", values.capacity);
      if (values.category) formData.append("category", values.category);
      if (values.image) formData.append("image", values.image);

      const data = await api.putForm(`/events/${id}`, formData);
      toast.success("Event updated");
      navigate(`/events/${data.event._id}`);
    } catch (err) {
      toast.error(err.message || "Failed to update event");
    } finally {
      setSaving(false);
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

  if (user && event.createdBy && user._id !== event.createdBy._id) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        You do not have permission to edit this event.
      </div>
    );
  }

  const initialValues = {
    title: event.title || "",
    description: event.description || "",
    dateTime: formatDateInput(event.dateTime),
    location: event.location || "",
    capacity: event.capacity || 1,
    category: event.category || "",
    image: null,
    imageUrl: event.imageUrl || ""
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      <h1 className="text-2xl font-semibold">Edit event</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        Update details and replace the cover image if needed.
      </p>
      <div className="mt-6">
        <EventForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          submitLabel="Save changes"
          loading={saving}
          showImageRequired={false}
        />
      </div>
    </section>
  );
};

export default EditEventPage;
