import React, { Fragment, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
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
  Divider
} from "@mui/material";
import MetaData from "../Layout/MetaData";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import PersonIcon from "@mui/icons-material/Person";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import SideBar from "./Sidebar";
import { getUserDetails, clearErrors, updateUser, resetUserState } from "../../features/user/userSlice";
import Loader from "../Layout/Loader/Loader";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const UpdateUser = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { loading, error, userDetails, isUpdated } = useSelector((state) => state.user);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    if (!userDetails || userDetails._id !== id) {
      dispatch(getUserDetails(id));
    } else {
        setName(userDetails.name || "");
        setEmail(userDetails.email || "");
        setRole(userDetails.role || "");
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
  }, [dispatch, error, isUpdated, navigate, userDetails, id]);

  const updateUserSubmitHandler = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.set("name", name);
    formData.set("email", email);
    formData.set("role", role);
    dispatch(updateUser({ id, userData: formData }));
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
                onSubmit={updateUserSubmitHandler}
              >
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      variant="outlined"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
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
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                    <FormControl fullWidth variant="outlined">
                      <InputLabel id="role-label">Account Role</InputLabel>
                      <Select
                        labelId="role-label"
                        label="Account Role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        required
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
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      id="createProductBtn"
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={loading || role === ""}
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
