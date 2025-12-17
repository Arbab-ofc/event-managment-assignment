const Avatar = ({ user, size = 36 }) => {
  const initial = user?.name ? user.name.trim().charAt(0).toUpperCase() : "?";
  const dimension = `${size}px`;

  if (user?.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.name || "User"}
        style={{ width: dimension, height: dimension }}
        className="rounded-full object-cover"
      />
    );
  }

  return (
    <div
      style={{ width: dimension, height: dimension }}
      className="flex items-center justify-center rounded-full bg-teal-600 text-sm font-semibold text-white"
    >
      {initial}
    </div>
  );
};

export default Avatar;
