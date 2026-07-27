import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';

interface ProtectedProps {
  children: React.ReactNode;
  authentication?: boolean;
  admin?: boolean;
}

export default function Protected({ children, authentication = true, admin = false }: ProtectedProps) {
  const navigate = useNavigate();
  const { isAuthenticated, user, loading } = useAppSelector((state) => state.user);
  const [loader, setLoader] = useState(true);

  useEffect(() => {
    if (loading) return;

    if (authentication) {
      if (!isAuthenticated) {
        navigate("/login");
      } else if (admin && user?.role !== "admin") {
        navigate("/");
      }
    } else if (!authentication && isAuthenticated) {
      navigate("/");
    }
    setLoader(false);
  }, [isAuthenticated, user, admin, authentication, navigate, loading]);

  if (loader || loading) {
    return <h1>Loading...</h1>;
  }

  return <>{children}</>;
}
