import React from "react";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import "@/components/Layout/ErrorBoundary/ErrorBoundary.css";
import { Link, useRouteError } from "react-router-dom";

const ErrorBoundary: React.FC = () => {
  const error = useRouteError() as Error;

  return (
    <div className="ErrorBoundary">
      <ErrorOutlineIcon />
      <h1>Oops! Something went wrong.</h1>
      <p>
        We're sorry, but the application has encountered an unexpected error. 
        <br /><br />
        {error?.message && <i>Details: {error.message}</i>}
      </p>
      <Link to="/">Return to Home</Link>
    </div>
  );
};

export default ErrorBoundary;
