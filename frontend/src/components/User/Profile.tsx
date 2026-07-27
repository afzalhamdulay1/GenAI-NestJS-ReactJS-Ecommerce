import React, { Fragment, useEffect } from "react";
import MetaData from "@/components/Layout/MetaData";
import Loader from "@/components/Layout/Loader/Loader";
import { Link, useNavigate } from "react-router-dom";
import "@/components/User/Profile.css";
import { loadUser, resetUpdateProfile } from "@/features/user/userSlice";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import dummyProfile from "@/images/Profile.png";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, loading, isUpdated } = useAppSelector((state) => state.user);

  useEffect(() => {
    if (isUpdated) {
      dispatch(loadUser());
      dispatch(resetUpdateProfile());
    }
  }, [dispatch, isUpdated]);

  return (
    <Fragment>
      {loading ? (
        <Loader />
      ) : (
        <Fragment>
          <MetaData title={`${user?.name || 'User'}'s Profile`} />
          <div className="profileContainer">
            <div className="profileCard">
              <div className="profileLeftCard">
                <h1>My Profile</h1>
                <img
                  src={user?.avatar?.url ? user.avatar.url : dummyProfile}
                  alt={user?.name || 'Profile'}
                  referrerPolicy="no-referrer"
                />
                <Link to="/me/update" className="editProfileBtn">
                  Edit Profile
                </Link>
              </div>

              <div className="profileRightCard">
                <div className="profileInfoGroup">
                  <h4>Full Name</h4>
                  <p>{user?.name}</p>
                </div>
                <div className="profileInfoGroup">
                  <h4>Email Address</h4>
                  <p>{user?.email}</p>
                </div>
                <div className="profileInfoGroup">
                  <h4>Member Since</h4>
                  <p>{user?.createdAt ? String(user.createdAt).substring(0, 10) : ''}</p>
                </div>

                <div className="profileActionBtns">
                  <Link to="/orders" className="myOrdersBtn">
                    My Orders
                  </Link>
                  <Link to="/password/update" className="changePasswordBtn">
                    Change Password
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Fragment>
      )}
    </Fragment>
  );
};

export default Profile;
