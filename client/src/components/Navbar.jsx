import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import Avatar from "./Avatar.jsx";
import useTheme from "../hooks/useTheme.js";

const NavItem = ({ to, label, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `rounded px-3 py-2 text-sm font-medium transition ${
        isActive
          ? "bg-teal-600 text-white"
          : "text-slate-700 hover:bg-slate-200 dark:text-slate-200 dark:hover:bg-slate-800"
      }`
    }
  >
    {label}
  </NavLink>
);

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const handleToggle = () => setOpen((prev) => !prev);
  const handleClose = () => setOpen(false);

  return (
    <header className="border-b border-slate-200 bg-white/70 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3" onClick={handleClose}>
          <span className="inline-flex h-9 items-center rounded-full border border-teal-200 bg-teal-50 px-3 text-xs font-semibold uppercase tracking-wide text-teal-700 dark:border-teal-800 dark:bg-teal-900/40 dark:text-teal-200">
            EF
          </span>
          <span className="text-lg font-semibold">EventFlow</span>
        </Link>
        <nav className="hidden items-center gap-2 md:flex">
          <NavItem to="/" label="Events" />
          {user && <NavItem to="/dashboard" label="Dashboard" />}
          {user && <NavItem to="/events/new" label="Create" />}
          {!user && <NavItem to="/login" label="Login" />}
          {!user && <NavItem to="/register" label="Register" />}
          {user && (
            <button
              onClick={logout}
              className="rounded px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Logout
            </button>
          )}
          <button
            onClick={toggleTheme}
            className="rounded border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? "Light" : "Dark"}
          </button>
          {user && (
            <Link
              to="/profile"
              className="ml-2 rounded-full border border-slate-200 p-0.5 dark:border-slate-700"
            >
              <Avatar user={user} size={34} />
            </Link>
          )}
        </nav>
        <button
          onClick={handleToggle}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 md:hidden dark:border-slate-700 dark:text-slate-200"
          aria-label="Toggle menu"
        >
          Menu
        </button>
      </div>
      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 md:hidden">
          <div className="flex flex-col gap-2">
            <NavItem to="/" label="Events" onClick={handleClose} />
            {user && <NavItem to="/dashboard" label="Dashboard" onClick={handleClose} />}
            {user && <NavItem to="/events/new" label="Create" onClick={handleClose} />}
            {!user && <NavItem to="/login" label="Login" onClick={handleClose} />}
            {!user && <NavItem to="/register" label="Register" onClick={handleClose} />}
            {user && (
              <button
                onClick={() => {
                  logout();
                  handleClose();
                }}
                className="rounded px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-200 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Logout
              </button>
            )}
            <button
              onClick={() => {
                toggleTheme();
                handleClose();
              }}
              className="rounded border border-slate-300 px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {theme === "dark" ? "Light" : "Dark"}
            </button>
            {user && (
              <Link
                to="/profile"
                onClick={handleClose}
                className="inline-flex items-center gap-2 rounded px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Avatar user={user} size={28} />
                Profile
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
