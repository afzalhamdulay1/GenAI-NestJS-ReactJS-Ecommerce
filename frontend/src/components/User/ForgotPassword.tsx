import React, { Fragment, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import "@/components/User/ForgotPassword.css";
import Loader from "@/components/Layout/Loader/Loader";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import { forgotPassword, clearErrors, clearMessage } from "@/features/user/userSlice";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { toast } from "react-toastify";
import MetaData from "@/components/Layout/MetaData";
import FormInput from "@/components/Form/FormInput";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword: React.FC = () => {
  const dispatch = useAppDispatch();

  const { error, message, loading } = useAppSelector((state) => state.user);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onForgotPasswordSubmit = (data: ForgotPasswordFormValues) => {
    dispatch(forgotPassword(data.email));
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }

    if (message) {
      toast.success(message);
      dispatch(clearMessage());
    }
  }, [dispatch, error, message]);

  return (
    <Fragment>
      {loading ? (
        <Loader />
      ) : (
        <Fragment>
          <MetaData title="Forgot Password" />
          <div className="forgotPasswordContainer">
            <div className="forgotPasswordBox">
              <h2 className="forgotPasswordHeading">Forgot Password</h2>

              <form
                className="forgotPasswordForm"
                onSubmit={handleSubmit(onForgotPasswordSubmit)}
              >
                <FormInput
                  icon={<MailOutlineIcon />}
                  type="email"
                  label="Email"
                  register={register("email")}
                  error={errors.email}
                />

                <input
                  type="submit"
                  value="Send"
                  className="forgotPasswordBtn"
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

export default ForgotPassword;
