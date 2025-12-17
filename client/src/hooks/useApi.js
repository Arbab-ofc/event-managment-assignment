import { useMemo } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { apiFetch, apiFetchForm } from "../api/client.js";

const useApi = () => {
  const { token } = useAuth();

  return useMemo(
    () => ({
      get: (path) => apiFetch(path, { method: "GET" }, token),
      post: (path, body) =>
        apiFetch(path, { method: "POST", body: JSON.stringify(body) }, token),
      put: (path, body) =>
        apiFetch(path, { method: "PUT", body: JSON.stringify(body) }, token),
      del: (path) => apiFetch(path, { method: "DELETE" }, token),
      postForm: (path, formData) => apiFetchForm(path, formData, token, "POST"),
      putForm: (path, formData) => apiFetchForm(path, formData, token, "PUT")
    }),
    [token]
  );
};

export default useApi;
