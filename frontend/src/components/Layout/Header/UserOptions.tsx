import React, { Fragment, useState } from "react";
import "@/components/Layout/Header/UserOptions.css";
import { SpeedDial, SpeedDialAction, Backdrop } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import ListAltIcon from "@mui/icons-material/ListAlt";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { logout } from "@/features/user/userSlice";
import { User } from "@/types";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import dummyProfile from "@/images/Profile.png";

interface UserOptionsProps {
  user: User | null;
}

interface SpeedDialOption {
  icon: React.ReactNode;
  name: string;
  func: () => void;
}

const UserOptions: React.FC<UserOptionsProps> = ({ user }) => {
  const { cartItems } = useAppSelector((state) => state.cart);
  const { wishlist } = useAppSelector((state) => state.user);

  const [open, setOpen] = useState(false);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  function dashboard() {
    navigate("/admin/dashboard");
  }

  function orders() {
    navigate("/orders");
  }
  function account() {
    navigate("/account");
  }
  function cart() {
    navigate("/cart");
  }
  function wishlistFunc() {
    navigate("/wishlist");
  }
  function logoutUser() {
    navigate("/");
    dispatch(logout());
    toast.success("Logged out Successfully");
  }

  const options: SpeedDialOption[] = [
    { icon: <ListAltIcon />, name: "Orders", func: orders },
    { icon: <PersonIcon />, name: "Profile", func: account },
    {
      icon: (
        <ShoppingCartIcon
          style={{ color: cartItems.length > 0 ? "rgb(248 113 113)" : "unset" }}
        />
      ),
      name: `Cart(${cartItems.length})`,
      func: cart,
    },
    {
      icon: (
        <FavoriteIcon
          style={{ color: wishlist && wishlist.length > 0 ? "#ef4444" : "unset" }}
        />
      ),
      name: `Wishlist(${wishlist ? wishlist.length : 0})`,
      func: wishlistFunc,
    },
    { icon: <ExitToAppIcon />, name: "Logout", func: logoutUser },
  ];

  if (user && user.role === "admin") {
    options.unshift({
      icon: <DashboardIcon />,
      name: "Dashboard",
      func: dashboard,
    });
  }

  return (
    <Fragment>
      <Backdrop open={open} style={{ zIndex: 10 }} />
      <SpeedDial
        ariaLabel="User Profile Options"
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        open={open}
        direction="down"
        className="speedDial"
        style={{ zIndex: 11 }}
        icon={
          <img
            className="speedDialIcon"
            src={user?.avatar?.url ? user?.avatar?.url : dummyProfile}
            alt="Profile"
            referrerPolicy="no-referrer"
          />
        }
      >
        {options.map((item) => (
          <SpeedDialAction
            key={item.name}
            icon={item.icon}
            tooltipTitle={item.name}
            onClick={item.func}
            tooltipOpen={window.innerWidth <= 600}
          />
        ))}
      </SpeedDial>
    </Fragment>
  );
};

export default UserOptions;
