import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useApi from "../hooks/useApi.js";
import EventForm from "../components/EventForm.jsx";

const CreateEventPage = () => {
  const api = useApi();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const initialValues = {
    title: "",
    description: "",
    dateTime: "",
    location: "",
    capacity: 1,
    category: "",
    image: null,
    imageUrl: ""
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("dateTime", values.dateTime);
      formData.append("location", values.location);
      formData.append("capacity", values.capacity);
      if (values.category) formData.append("category", values.category);
      if (values.image) formData.append("image", values.image);

      const data = await api.postForm("/events", formData);
      toast.success("Event created");
      navigate(`/events/${data.event._id}`);
    } catch (err) {
      toast.error(err.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      <h1 className="text-2xl font-semibold">Create a new event</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        Share the details and upload a cover image to attract attendees.
      </p>
      <div className="mt-6">
        <EventForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          submitLabel="Create event"
          loading={loading}
        />
      </div>
    </section>
  );
};

export default CreateEventPage;
