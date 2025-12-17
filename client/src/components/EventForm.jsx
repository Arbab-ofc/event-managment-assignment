import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import useApi from "../hooks/useApi.js";
import Modal from "./Modal.jsx";
import Spinner from "./Spinner.jsx";
import { isFutureDate } from "../utils/validators.js";

const categories = [
  "General",
  "Workshop",
  "Meetup",
  "Conference",
  "Networking",
  "Social"
];

const EventForm = ({
  initialValues,
  onSubmit,
  submitLabel,
  loading,
  showImageRequired = true
}) => {
  const api = useApi();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [previewUrl, setPreviewUrl] = useState(initialValues.imageUrl || "");
  const [aiOpen, setAiOpen] = useState(false);
  const [aiNotes, setAiNotes] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(true);

  useEffect(() => {
    setValues(initialValues);
    setPreviewUrl(initialValues.imageUrl || "");
  }, [initialValues]);

  useEffect(() => {
    return () => {
      if (values.image instanceof File && previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, values.image]);

  const handleChange = (event) => {
    const { name, value, files } = event.target;
    if (files && files[0]) {
      const file = files[0];
      setValues((prev) => ({ ...prev, image: file }));
      setPreviewUrl(URL.createObjectURL(file));
      return;
    }
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!values.title || values.title.trim().length < 3) {
      nextErrors.title = "Title must be at least 3 characters";
    }
    if (!values.description || values.description.trim().length === 0) {
      nextErrors.description = "Description is required";
    }
    if (values.description && values.description.length > 2000) {
      nextErrors.description = "Description must be under 2000 characters";
    }
    if (!values.dateTime || !isFutureDate(values.dateTime)) {
      nextErrors.dateTime = "Date must be in the future";
    }
    if (!values.location || values.location.trim().length === 0) {
      nextErrors.location = "Location is required";
    }
    if (!values.capacity || Number(values.capacity) < 1) {
      nextErrors.capacity = "Capacity must be at least 1";
    }
    if (showImageRequired && !values.image && !values.imageUrl) {
      nextErrors.image = "Image is required";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    await onSubmit(values);
  };

  const handleAiGenerate = async () => {
    if (!aiNotes.trim() || !values.title.trim()) {
      toast.error("Provide a title and notes for the AI prompt");
      return;
    }

    setAiLoading(true);
    try {
      const data = await api.post("/ai/enhance-description", {
        title: values.title,
        notes: aiNotes
      });
      setValues((prev) => ({ ...prev, description: data.description }));
      setAiOpen(false);
      setAiNotes("");
      toast.success("Description updated");
    } catch (err) {
      if (err.message === "AI feature not configured") {
        setAiAvailable(false);
      }
      toast.error(err.message || "AI request failed");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Title</label>
          <input
            name="title"
            value={values.title}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
          {errors.title && <p className="text-xs text-red-600">{errors.title}</p>}
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Category</label>
          <select
            name="category"
            value={values.category}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Date and time</label>
          <input
            type="datetime-local"
            name="dateTime"
            value={values.dateTime}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
          {errors.dateTime && <p className="text-xs text-red-600">{errors.dateTime}</p>}
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Location</label>
          <input
            name="location"
            value={values.location}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
          {errors.location && <p className="text-xs text-red-600">{errors.location}</p>}
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Capacity</label>
          <input
            type="number"
            name="capacity"
            value={values.capacity}
            onChange={handleChange}
            min="1"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
          {errors.capacity && <p className="text-xs text-red-600">{errors.capacity}</p>}
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Image</label>
          <input
            type="file"
            accept="image/*"
            name="image"
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
          {errors.image && <p className="text-xs text-red-600">{errors.image}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="block text-sm font-medium">Description</label>
          {aiAvailable && (
            <button
              type="button"
              onClick={() => setAiOpen(true)}
              className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Enhance with AI
            </button>
          )}
          {!aiAvailable && (
            <span className="text-xs text-slate-400">AI not available</span>
          )}
        </div>
        <textarea
          name="description"
          value={values.description}
          onChange={handleChange}
          rows="6"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
        {errors.description && <p className="text-xs text-red-600">{errors.description}</p>}
      </div>

      {previewUrl && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-medium">Image preview</p>
          <img src={previewUrl} alt="Event preview" className="mt-3 h-48 w-full rounded-xl object-cover" />
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? (
          <>
            <Spinner className="h-4 w-4 border-white border-t-transparent" />
            Saving...
          </>
        ) : (
          submitLabel
        )}
      </button>

      {aiOpen && (
        <Modal title="Enhance description" onClose={() => setAiOpen(false)}>
          <div className="space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Provide bullet notes or raw ideas. The AI will produce a polished description.
            </p>
            <textarea
              value={aiNotes}
              onChange={(event) => setAiNotes(event.target.value)}
              rows="5"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
            <button
              type="button"
              onClick={handleAiGenerate}
              disabled={aiLoading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {aiLoading ? (
                <>
                  <Spinner className="h-4 w-4 border-white border-t-transparent" />
                  Generating...
                </>
              ) : (
                "Generate"
              )}
            </button>
          </div>
        </Modal>
      )}
    </form>
  );
};

export default EventForm;
