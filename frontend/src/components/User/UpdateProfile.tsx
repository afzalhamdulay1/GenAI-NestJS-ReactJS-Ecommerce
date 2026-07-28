import React, { Fragment, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import "@/components/User/UpdateProfile.css";
import Loader from "@/components/Layout/Loader/Loader";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import FaceIcon from "@mui/icons-material/Face";
import { clearErrors, updateProfile } from "@/features/user/userSlice";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import MetaData from "@/components/Layout/MetaData";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import dummyProfile from '@/images/Profile.png';

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
});

type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;

const UpdateProfile: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, error, isUpdated, loading } = useAppSelector((state) => state.user);

  const [avatar, setAvatar] = useState<string | ArrayBuffer | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(dummyProfile);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
  });

  const onUpdateProfileSubmit = (data: UpdateProfileFormValues) => {
    const myForm = new FormData();
    myForm.set("name", data.name);
    myForm.set("email", data.email);
    if (avatar && typeof avatar === "string") {
      myForm.set("avatar", avatar);
    }

    dispatch(updateProfile(myForm));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const reader = new FileReader();

      reader.onload = () => {
        if (reader.readyState === 2 && reader.result) {
          setAvatarPreview(reader.result as string);
          setAvatar(reader.result);
        }
      };

      reader.readAsDataURL(files[0]);
    }
  };

  useEffect(() => {
    if (user) {
      setValue("name", user.name || "");
      setValue("email", user.email || "");
      setAvatarPreview(user.avatar?.url || dummyProfile);
    }

    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }

    if (isUpdated) {
      toast.success("Profile Updated Successfully");
      navigate("/account");
    }
  }, [dispatch, error, user, isUpdated, navigate, setValue]);

  return (
    <Fragment>
      {loading ? (
        <Loader />
      ) : (
        <Fragment>
          <MetaData title="Update Profile" />
          <div className="updateProfileContainer">
            <div className="updateProfileBox">
              <h2 className="updateProfileHeading">Update Profile</h2>

              <form
                className="updateProfileForm"
                encType="multipart/form-data"
                onSubmit={handleSubmit(onUpdateProfileSubmit)}
              >
                <div className="updateProfileName">
                  <FaceIcon />
                  <input
                    type="text"
                    placeholder="Name"
                    {...register("name")}
                  />
                </div>
                {errors.name && <span className="text-red-500 text-xs mt-1 ml-10">{errors.name.message}</span>}

                <div className="updateProfileEmail">
                  <MailOutlineIcon />
                  <input
                    type="email"
                    placeholder="Email"
                    {...register("email")}
                  />
                </div>
                {errors.email && <span className="text-red-500 text-xs mt-1 ml-10">{errors.email.message}</span>}

                <div id="updateProfileImage">
                  <img src={avatarPreview} alt="Avatar Preview" />
                  <label htmlFor="avatarFileInput">📷 Change Photo</label>
                  <p>JPG, PNG or GIF · Max 2MB</p>
                  <input
                    id="avatarFileInput"
                    type="file"
                    name="avatar"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </div>
                <input
                  type="submit"
                  value="Update"
                  className="updateProfileBtn"
                />
              </form>
            </div>
          </div>
        </Fragment>
      )}
    </Fragment>
  );
};

export default UpdateProfile;
