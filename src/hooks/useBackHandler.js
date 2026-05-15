import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Global Android hardware back button handler.
 * Intercepts the `popstate` event triggered by Android WebView back gesture
 * and maps it to React Router navigation.
 */
export function useBackHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    // Push a dummy state so there's always something to pop back to
    window.history.pushState(null, "", window.location.href);

    const handlePopState = (e) => {
      e.preventDefault();
      navigate(-1);
      // Re-push so the handler stays active
      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [navigate]);
}