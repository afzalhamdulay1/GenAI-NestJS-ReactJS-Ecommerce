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
import FormInput from "@/components/Form/FormInput";

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
                <FormInput
                  type="password"
                  label="Old Password"
                  icon={<VpnKeyIcon />}
                  register={register("oldPassword")}
                  error={errors.oldPassword}
                />

                <FormInput
                  type="password"
                  label="New Password"
                  icon={<LockOpenIcon />}
                  register={register("newPassword")}
                  error={errors.newPassword}
                />

                <FormInput
                  type="password"
                  label="Confirm Password"
                  icon={<LockIcon />}
                  register={register("confirmPassword")}
                  error={errors.confirmPassword}
                />

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
