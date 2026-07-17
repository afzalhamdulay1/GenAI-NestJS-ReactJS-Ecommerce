import React, { Fragment, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import "./ProductsList.css";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { 
  Button, 
  Typography, 
  Box, 
  Chip, 
  Avatar, 
  IconButton, 
  Tooltip, 
  Paper,
  Breadcrumbs
} from "@mui/material";
import MetaData from "../Layout/MetaData";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SideBar from "./Sidebar";
import { getAllUsers, clearErrors, deleteUser, resetUserState } from "../../features/user/userSlice";
import { toast } from "react-toastify";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const UsersList = ({ history }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();


  const { error, users, isDeleted, message } = useSelector((state) => state.user);

//   const {
//     error: deleteError,
//     isDeleted,
//     message,
//   } = useSelector((state) => state.profile);

  const deleteUserHandler = (id) => {
    dispatch(deleteUser(id));
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }

    if (isDeleted) {
      toast.success("User Deleted Successfully");
      navigate("/admin/users");
      dispatch(resetUserState());
    }

    dispatch(getAllUsers());
  }, [dispatch, toast, error, clearErrors, navigate, isDeleted, message]);

  const columns = [
    { 
      field: "avatar", 
      headerName: "User", 
      minWidth: 100, 
      flex: 0.3,
      sortable: false,
      renderCell: (params) => (
        <Avatar 
          src={params.row.avatar} 
          sx={{ width: 40, height: 40, my: 1, bgcolor: '#eef2ff', color: '#6366f1' }}
        >
          <AccountCircleIcon fontSize="large" />
        </Avatar>
      )
    },
    {
      field: "name",
      headerName: "Full Name",
      minWidth: 200,
      flex: 0.8,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e293b" }}>
          {params.value}
        </Typography>
      )
    },
    {
      field: "email",
      headerName: "Email Address",
      minWidth: 250,
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: "#64748b" }}>
          {params.value}
        </Typography>
      )
    },
    {
      field: "role",
      headerName: "Permissions",
      minWidth: 150,
      flex: 0.4,
      renderCell: (params) => {
        const role = params.value;
        return (
          <Chip 
            label={role === "admin" ? "Administrator" : "User"}
            color={role === "admin" ? "secondary" : "default"}
            variant="soft"
            size="small"
            sx={{ 
                fontWeight: 700, 
                textTransform: 'uppercase', 
                fontSize: '0.65rem',
                bgcolor: role === "admin" ? "rgba(124, 58, 237, 0.1)" : "rgba(100, 116, 139, 0.1)",
                color: role === "admin" ? "#7c3aed" : "#64748b"
            }}
          />
        );
      }
    },
    {
      field: "actions",
      flex: 0.4,
      headerName: "Actions",
      minWidth: 120,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => {
        return (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', width: '100%', pr: 1 }}>
            <Tooltip title="Edit User">
                <IconButton 
                    component={Link} 
                    to={`/admin/user/${params.row.id}`}
                    size="small"
                    sx={{ color: '#6366f1', background: '#eef2ff', '&:hover': { background: '#e0e7ff' } }}
                >
                    <EditIcon fontSize="small" />
                </IconButton>
            </Tooltip>

            <Tooltip title="Delete User">
                <IconButton 
                    onClick={() => deleteUserHandler(params.row.id)}
                    size="small"
                    sx={{ color: '#ef4444', background: '#fef2f2', '&:hover': { background: '#fee2e2' } }}
                >
                    <DeleteIcon fontSize="small" />
                </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  const rows = [];
  users &&
    users.forEach((item) => {
      rows.push({
        id: item._id,
        role: item.role,
        email: item.email,
        name: item.name,
        avatar: item.avatar?.url,
      });
    });

  return (
    <Fragment>
      <MetaData title={`ALL USERS - Admin`} />

      <div className="dashboard">
        <SideBar />
        <div className="productListContainer">
          <Box className="headerSection">
            <Box>
                <Typography variant="h6" className="pageHeading">
                    User Accounts
                </Typography>
                <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
                    <Link to="/admin/dashboard" className="breadcrumbLink">Admin</Link>
                    <Typography color="text.primary" fontSize="0.875rem">Users</Typography>
                </Breadcrumbs>
            </Box>
          </Box>

          <Paper elevation={0} className="productListTableContainer">
            <DataGrid
              rows={rows}
              columns={columns}
              pageSize={10}
              disableSelectionOnClick
              className="productListTable"
              autoHeight
              rowHeight={65}
              sx={{
                "& .MuiDataGrid-columnHeaderTitle": {
                  fontSize: "1.125rem !important",
                  fontWeight: "700 !important",
                  textTransform: "capitalize !important",
                  color: "#1e293b !important",
                }
              }}
            />
          </Paper>
        </div>
      </div>
    </Fragment>
  );
};

export default UsersList;
