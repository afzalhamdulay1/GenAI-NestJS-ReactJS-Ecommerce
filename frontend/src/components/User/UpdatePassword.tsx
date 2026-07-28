import React, { Fragment, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import "@/components/User/UpdatePassword.css";
import Loader from "@/components/Layout/Loader/Loader";
import { toast } from "react-toastify";
import { updatePassword, clearErrors, resetUpdateProfile } from "@/features/user/userSlice";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import MetaData from "@/components/Layout/MetaData";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import LockIcon from "@mui/icons-material/Lock";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import { useNavigate } from "react-router-dom";

const updatePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Old password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters long"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type UpdatePasswordFormValues = z.infer<typeof updatePasswordSchema>;

const UpdatePassword: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { error, isUpdated, loading } = useAppSelector((state) => state.user);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(updatePasswordSchema),
  });

  const onUpdatePasswordSubmit = (data: UpdatePasswordFormValues) => {
    dispatch(
      updatePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      })
    );
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }

    if (isUpdated) {
      toast.success("Password Updated Successfully");
      navigate("/account");
      dispatch(resetUpdateProfile());
    }
  }, [dispatch, error, isUpdated, navigate]);

  return (
    <Fragment>
      {loading ? (
        <Loader />
      ) : (
        <Fragment>
          <MetaData title="Change Password" />
          <div className="updatePasswordContainer">
            <div className="updatePasswordBox">
              <h2 className="updatePasswordHeading">Change Password</h2>

              <form className="updatePasswordForm" onSubmit={handleSubmit(onUpdatePasswordSubmit)}>
                <div className="loginPassword">
                  <VpnKeyIcon />
                  <input
                    type="password"
                    placeholder="Old Password"
                    {...register("oldPassword")}
                  />
                </div>
                {errors.oldPassword && <span className="text-red-500 text-xs mt-1 ml-10">{errors.oldPassword.message}</span>}

                <div className="loginPassword">
                  <LockOpenIcon />
                  <input
                    type="password"
                    placeholder="New Password"
                    {...register("newPassword")}
                  />
                </div>
                {errors.newPassword && <span className="text-red-500 text-xs mt-1 ml-10">{errors.newPassword.message}</span>}

                <div className="loginPassword">
                  <LockIcon />
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    {...register("confirmPassword")}
                  />
                </div>
                {errors.confirmPassword && <span className="text-red-500 text-xs mt-1 ml-10">{errors.confirmPassword.message}</span>}

                <input
                  type="submit"
                  value="Change"
                  className="updatePasswordBtn"
                />
              </form>
            </div>
          </div>
        </Fragment>
      )}
    </Fragment>
  );
};

export default UpdatePassword;
