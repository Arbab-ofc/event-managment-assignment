import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";
import useApi from "../hooks/useApi.js";
import { validatePasswordStrong } from "../utils/validators.js";
import Avatar from "../components/Avatar.jsx";
import Spinner from "../components/Spinner.jsx";

const ProfilePage = () => {
  const { user, setUser, loading } = useAuth();
  const api = useApi();
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState({ name: "", password: "", confirm: "", avatar: null });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (user) {
      setValues((prev) => ({ ...prev, name: user.name || "" }));
      setPreviewUrl(user.avatarUrl || "");
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (values.avatar instanceof File && previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, values.avatar]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const handleChange = (event) => {
    const { name, value, files } = event.target;
    if (files && files[0]) {
      const file = files[0];
      setValues((prev) => ({ ...prev, avatar: file }));
      setPreviewUrl(URL.createObjectURL(file));
      return;
    }
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!values.name.trim()) {
      nextErrors.name = "Name is required";
    }
    if (values.password || values.confirm) {
      const passwordCheck = validatePasswordStrong(values.password);
      if (!passwordCheck.isValid) {
        nextErrors.password = passwordCheck.message;
      }
      if (values.password !== values.confirm) {
        nextErrors.confirm = "Passwords do not match";
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      if (values.password) {
        formData.append("password", values.password);
      }
      if (values.avatar) {
        formData.append("avatar", values.avatar);
      }

      const data = await api.putForm("/users/me", formData);
      setUser(data.user);
      toast.success("Profile updated");
      setValues((prev) => ({ ...prev, password: "", confirm: "", avatar: null }));
    } catch (err) {
      toast.error(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex flex-wrap items-center gap-4">
        <Avatar user={user} size={56} />
        <div>
          <h1 className="text-2xl font-semibold">Profile</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">Update your details and security.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Name</label>
          <input
            name="name"
            value={values.name}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
          {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium">New password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={values.password}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-10 text-sm text-slate-900 focus:border-teal-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-2 flex items-center text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <path d="M3 3l18 18" />
                    <path d="M10.5 10.5a2.5 2.5 0 003.5 3.5" />
                    <path d="M6.7 6.7C4.5 8.2 3 10.5 3 12c0 2.3 4.1 6 9 6 1.8 0 3.4-.5 4.7-1.3" />
                    <path d="M9.9 5.1c.7-.2 1.4-.3 2.1-.3 4.9 0 9 3.7 9 7.2 0 1.2-.5 2.6-1.5 3.8" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <path d="M3 12s4.1-6.8 9-6.8 9 6.8 9 6.8-4.1 6.8-9 6.8-9-6.8-9-6.8Z" />
                    <circle cx="12" cy="12" r="3.2" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Confirm password</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                name="confirm"
                value={values.confirm}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-10 text-sm text-slate-900 focus:border-teal-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((prev) => !prev)}
                className="absolute inset-y-0 right-2 flex items-center text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirm ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <path d="M3 3l18 18" />
                    <path d="M10.5 10.5a2.5 2.5 0 003.5 3.5" />
                    <path d="M6.7 6.7C4.5 8.2 3 10.5 3 12c0 2.3 4.1 6 9 6 1.8 0 3.4-.5 4.7-1.3" />
                    <path d="M9.9 5.1c.7-.2 1.4-.3 2.1-.3 4.9 0 9 3.7 9 7.2 0 1.2-.5 2.6-1.5 3.8" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <path d="M3 12s4.1-6.8 9-6.8 9 6.8 9 6.8-4.1 6.8-9 6.8-9-6.8-9-6.8Z" />
                    <circle cx="12" cy="12" r="3.2" />
                  </svg>
                )}
              </button>
            </div>
            {errors.confirm && <p className="text-xs text-red-600">{errors.confirm}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Profile photo</label>
          <input
            type="file"
            accept="image/*"
            name="avatar"
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Profile preview"
              className="mt-3 h-24 w-24 rounded-full object-cover"
            />
          )}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? (
            <>
              <Spinner className="h-4 w-4 border-white border-t-transparent" />
              Saving...
            </>
          ) : (
            "Save changes"
          )}
        </button>
      </form>
    </section>
  );
};

export default ProfilePage;
