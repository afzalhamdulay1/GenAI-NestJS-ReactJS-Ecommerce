import React from "react";
import "./Sidebar.css";
import logo from "../../images/logo.png";
import { Link, NavLink } from "react-router-dom";
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PostAddIcon from "@mui/icons-material/PostAdd";
import AddIcon from "@mui/icons-material/Add";
import ImportExportIcon from "@mui/icons-material/ImportExport";
import ListAltIcon from "@mui/icons-material/ListAlt";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import RateReviewIcon from "@mui/icons-material/RateReview";
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="logoContainer">
        <Link to="/">
          <img src={logo} alt="Ecommerce" />
        </Link>
      </div>

      <nav className="navLinks">
        <NavLink 
          to="/admin/dashboard" 
          className={({ isActive }) => isActive ? "navLink active" : "navLink"}
        >
          <DashboardIcon className="navIcon" /> 
          <span>Dashboard</span>
        </NavLink>

        <SimpleTreeView
          className="treeView"
          slots={{
            expandIcon: KeyboardArrowRightIcon,
            collapseIcon: ExpandMoreIcon,
          }}
        >
          <TreeItem 
            itemId="products-grid" 
            label={
              <div className="treeLabel">
                <ImportExportIcon className="navIcon" />
                <span>Products</span>
              </div>
            }
          >
            <NavLink 
              to="/admin/products" 
              className={({ isActive }) => isActive ? "subNavLink active" : "subNavLink"}
            >
              <PostAddIcon className="navIcon subIcon" />
              <span>All Products</span>
            </NavLink>
            <NavLink 
              to="/admin/product" 
              className={({ isActive }) => isActive ? "subNavLink active" : "subNavLink"}
            >
              <AddIcon className="navIcon subIcon" />
              <span>Create New</span>
            </NavLink>
          </TreeItem>
        </SimpleTreeView>

        <NavLink 
          to="/admin/orders" 
          className={({ isActive }) => isActive ? "navLink active" : "navLink"}
        >
          <ListAltIcon className="navIcon" />
          <span>Orders</span>
        </NavLink>

        <NavLink 
          to="/admin/users" 
          className={({ isActive }) => isActive ? "navLink active" : "navLink"}
        >
          <PeopleIcon className="navIcon" />
          <span>Users</span>
        </NavLink>

        <NavLink 
          to="/admin/reviews" 
          className={({ isActive }) => isActive ? "navLink active" : "navLink"}
        >
          <RateReviewIcon className="navIcon" />
          <span>Reviews</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;
