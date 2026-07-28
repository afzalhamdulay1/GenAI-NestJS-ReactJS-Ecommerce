import React, { Fragment, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import "@/components/User/ResetPassword.css";
import Loader from "@/components/Layout/Loader/Loader";
import { resetPassword, clearErrors, clearSuccess } from "@/features/user/userSlice";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { toast } from "react-toastify";
import MetaData from "@/components/Layout/MetaData";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import LockIcon from "@mui/icons-material/Lock";
import { useParams, useNavigate } from "react-router-dom";

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters long"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const ResetPassword: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();

  const { error, success, loading } = useAppSelector((state) => state.user);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onResetPasswordSubmit = (data: ResetPasswordFormValues) => {
    if (token) {
      dispatch(resetPassword({ token, resetData: { password: data.password, confirmPassword: data.confirmPassword } }));
    }
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }

    if (success) {
      toast.success("Password Updated Successfully");
      dispatch(clearSuccess());
      navigate("/login");
    }
  }, [dispatch, error, success, navigate]);

  return (
    <Fragment>
      {loading ? (
        <Loader />
      ) : (
        <Fragment>
          <MetaData title="Change Password" />
          <div className="resetPasswordContainer">
            <div className="resetPasswordBox">
              <h2 className="resetPasswordHeading">Reset Password</h2>

              <form
                className="resetPasswordForm"
                onSubmit={handleSubmit(onResetPasswordSubmit)}
              >
                <div>
                  <LockOpenIcon />
                  <input
                    type="password"
                    placeholder="New Password"
                    {...register("password")}
                  />
                </div>
                {errors.password && <span className="text-red-500 text-xs mt-1 ml-10">{errors.password.message}</span>}

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
                  value="Update"
                  className="resetPasswordBtn"
                  disabled={loading}
                />
              </form>
            </div>
          </div>
        </Fragment>
      )}
    </Fragment>
  );
};

export default ResetPassword;
