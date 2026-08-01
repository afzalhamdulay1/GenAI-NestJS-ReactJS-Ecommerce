import React, { useEffect } from "react";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import "@/components/Layout/ErrorBoundary/ErrorBoundary.css";
import { Link, useRouteError } from "react-router-dom";

const ErrorBoundary: React.FC = () => {
  const error = useRouteError() as Error;

  useEffect(() => {
    // Auto-recovery for dev server restarts or stale bundle chunk updates
    if (
      error?.message?.includes('dynamically imported module') ||
      error?.message?.includes('Importing a module script failed') ||
      error?.message?.includes('Failed to fetch')
    ) {
      const hasReloaded = sessionStorage.getItem('chunk_reload_retry');
      if (!hasReloaded) {
        sessionStorage.setItem('chunk_reload_retry', 'true');
        window.location.reload();
      }
    }
  }, [error]);

  return (
    <div className="ErrorBoundary">
      <ErrorOutlineIcon />
      <h1>Oops! Something went wrong.</h1>
      <p>
        We're sorry, but the application has encountered an unexpected error. 
        <br /><br />
        {error?.message && <i>Details: {error.message}</i>}
      </p>
      <Link to="/" onClick={() => sessionStorage.removeItem('chunk_reload_retry')}>Return to Home</Link>
    </div>
  );
};

export default ErrorBoundary;
