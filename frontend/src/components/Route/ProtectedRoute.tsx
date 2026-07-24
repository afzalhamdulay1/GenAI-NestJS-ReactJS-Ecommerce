import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearErrors } from "../../features/user/userSlice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { toast } from "react-toastify";
import Loader from "../Layout/Loader/Loader";

interface ProtectedRouteProps {
  children: React.ReactNode;
  authentication?: boolean;
  admin?: boolean;
}

export default function ProtectedRoute({ children, authentication = true, admin = false }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, loading } = useAppSelector((state) => state.user);
  const [loader, setLoader] = useState(true);

  useEffect(() => {
    if (loading) return;

    if (authentication) {
      if (!isAuthenticated) {
        navigate("/login");
        toast.error("Login required", { toastId: "loginRequired" });
        dispatch(clearErrors());
        return;
      }

      if (admin && user?.role !== "admin") {
        navigate("/");
        toast.error("Admin access required", { toastId: "adminRequired" });
        dispatch(clearErrors());
        return;
      }
    } else if (!authentication && isAuthenticated) {
      navigate("/");
      dispatch(clearErrors());
    }

    setLoader(false);
  }, [isAuthenticated, user, admin, authentication, navigate, loading, dispatch]);

  if (loader) return <Loader />;
  if (admin && (user?.role !== "admin" || !isAuthenticated)) return null;

  return <>{children}</>;
}
