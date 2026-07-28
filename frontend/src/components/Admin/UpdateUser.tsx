import React, { Fragment, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Button, 
  Box, 
  Typography, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  InputAdornment, 
  Paper,
  Grid,
  Avatar,
  Divider,
  FormHelperText
} from "@mui/material";
import MetaData from "@/components/Layout/MetaData";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import PersonIcon from "@mui/icons-material/Person";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import SideBar from "@/components/Admin/Sidebar";
import { getUserDetails, clearErrors, updateUser, resetUserState } from "@/features/user/userSlice";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import Loader from "@/components/Layout/Loader/Loader";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  role: z.string().min(1, "Role is required"),
});

type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

const UpdateUser: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { loading, error, userDetails, isUpdated } = useAppSelector((state) => state.user);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema) as any,
    defaultValues: {
      name: "",
      email: "",
      role: "",
    },
  });

  const selectedRole = watch("role");

  useEffect(() => {
    if (!id) return;
    if (!userDetails || userDetails._id !== id) {
      dispatch(getUserDetails(id));
    } else {
      setValue("name", userDetails.name || "");
      setValue("email", userDetails.email || "");
      setValue("role", userDetails.role || "");
    }

    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }

    if (isUpdated) {
      toast.success("User Updated Successfully");
      navigate("/admin/users");
      dispatch(resetUserState());
    }
  }, [dispatch, error, isUpdated, navigate, userDetails, id, setValue]);

  const onUpdateUserSubmit = (data: UpdateUserFormValues) => {
    dispatch(updateUser({ id, userData: data }));
  };

  return (
    <Fragment>
      <MetaData title="Update User - Admin Panel" />
      <div className="dashboard">
        <SideBar />
        <div className="newProductContainer">
          {loading ? (
            <Loader />
          ) : (
            <Paper elevation={0} className="newProductCard">
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                <Avatar 
                  src={userDetails?.avatar?.url} 
                  sx={{ width: 100, height: 100, mb: 2, bgcolor: '#eef2ff', color: '#6366f1', border: '4px solid #fff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                >
                  <AccountCircleIcon sx={{ fontSize: 80 }} />
                </Avatar>
                <Typography component="h1" variant="h4" className="formTitle" sx={{ textAlign: 'center' }}>
                  Update User Profile
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Modifying Account: {userDetails?._id}
                </Typography>
              </Box>

              <Divider sx={{ mb: 4 }} />

              <form
                className="createProductForm"
                onSubmit={handleSubmit(onUpdateUserSubmit)}
              >
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      variant="outlined"
                      {...register("name")}
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="email"
                      label="Email Address"
                      variant="outlined"
                      {...register("email")}
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <MailOutlineIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth variant="outlined" error={!!errors.role}>
                      <InputLabel id="role-label">Account Role</InputLabel>
                      <Select
                        labelId="role-label"
                        label="Account Role"
                        defaultValue=""
                        {...register("role")}
                        startAdornment={
                          <InputAdornment position="start">
                            <VerifiedUserIcon />
                          </InputAdornment>
                        }
                      >
                        <MenuItem value="">Choose Role</MenuItem>
                        <MenuItem value="admin">Administrator</MenuItem>
                        <MenuItem value="user">Standard User</MenuItem>
                      </Select>
                      {errors.role && <FormHelperText>{errors.role.message}</FormHelperText>}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      id="createProductBtn"
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={loading || !selectedRole}
                      size="large"
                      sx={{ mt: 2 }}
                    >
                      {loading ? "Updating..." : "Update User Permissions"}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          )}
        </div>
      </div>
    </Fragment>
  );
};

export default UpdateUser;
