// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import { clearErrors } from '../../features/user/userSlice'
// import { toast } from 'react-toastify';
// import Loader from '../Layout/Loader/Loader';

// export default function ProtectedRoute({ children, authentication = true, admin = false }) {
//     const navigate = useNavigate();
//     const dispatch = useDispatch();
//     const { isAuthenticated, user, loading } = useSelector((state) => state.user);
//     const [loader, setLoader] = useState(true)

//     useEffect(() => {

//         if(loading) return
//         if (authentication) {
//             if (!isAuthenticated) {
//                 navigate("/login");
//                 toast.error("Login required");
//                 dispatch(clearErrors())
//             } else if (admin && user?.role !== "admin") {
//                 navigate("/");
//                 toast.error("Admin access required");
//                 dispatch(clearErrors())
//             }
//         } else if (!authentication && isAuthenticated) {
//             navigate("/");  
//             dispatch(clearErrors())
//         }

//         // Mark as checked after the logic runs
//         setLoader(false)
//     }, [isAuthenticated, user, admin, authentication, navigate, loading, loader]);

    
    

//     return loader ? <Loader/> : <>{children}</>
// }


// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import { clearErrors } from '../../features/user/userSlice'
// import { toast } from 'react-toastify';
// import Loader from '../Layout/Loader/Loader';

// export default function ProtectedRoute({ children, authentication = true, admin = false }) {
//     const navigate = useNavigate();
//     const dispatch = useDispatch();
//     const { isAuthenticated, user, loading } = useSelector((state) => state.user);
//     const [loader, setLoader] = useState(true);

//     useEffect(() => {
//         if (loading) return;

//         if (authentication) {
//             if (!isAuthenticated) {
//                 navigate("/login");
//                 toast.error("Login required", { toastId: "loginRequired" }); // Add unique toastId
//                 dispatch(clearErrors());
//             } else if (admin && user?.role !== "admin") {
//                 navigate("/");
//                 toast.error("Admin access required", { toastId: "adminRequired" }); // Add unique toastId
//                 dispatch(clearErrors());
//             }
//         } else if (!authentication && isAuthenticated) {
//             navigate("/");  
//             dispatch(clearErrors());
//         }

//         // Mark as checked after the logic runs
//         setLoader(false);
//     }, [isAuthenticated, user, admin, authentication, navigate, loading, dispatch]);

//     return loader ? <Loader/> : <>{children}</>;
// }


import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearErrors } from "../../features/user/userSlice";
import { toast } from "react-toastify";
import Loader from "../Layout/Loader/Loader";

// The ProtectedRoute component is used to wrap the admin routes
export default function ProtectedRoute({ children, authentication = true, admin = false }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading } = useSelector((state) => state.user);
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

      // If the user is authenticated and has the admin role, allow access to the admin routes
    } else if (!authentication && isAuthenticated) {
      navigate("/");
      dispatch(clearErrors());
    }

    setLoader(false);
  }, [isAuthenticated, user, admin, authentication, navigate, loading, dispatch]);

  // Don't render the component or make the API request if not authenticated or not an admin
  if (loader) return <Loader />;
  if (admin && (user?.role !== "admin" || !isAuthenticated)) return null;

  return <>{children}</>;
}



