export const isFutureDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return date.getTime() > Date.now();
};

export const validateEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).toLowerCase());

export const validatePasswordStrong = (value) => {
  const password = String(value || "");
  const rules = [
    password.length >= 8,
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password)
  ];
  const isValid = rules.every(Boolean);
  return {
    isValid,
    message: isValid
      ? ""
      : "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol."
  };
};
