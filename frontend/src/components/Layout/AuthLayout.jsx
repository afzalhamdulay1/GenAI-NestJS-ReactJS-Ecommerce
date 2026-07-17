import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function Protected({ children, authentication = true, admin = false }) {
    const navigate = useNavigate();
    const { isAuthenticated, user, loading } = useSelector(state => state.user);
    const [loader, setLoader] = useState(true);

    useEffect(() => {
        if (loading) return; // Avoid navigation while loading

        if (authentication) {
            if (!isAuthenticated) {
                navigate("/login");
            } else if (admin && user?.role !== "admin") {
                navigate("/"); // Redirect non-admin users
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
