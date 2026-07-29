import React, { ReactNode } from 'react';
import { Box, Typography, Breadcrumbs } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Link } from 'react-router-dom';

interface AdminPageHeaderProps {
  title: string;
  breadcrumbText: string;
  children?: ReactNode;
}

const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  title,
  breadcrumbText,
  children,
}) => {
  return (
    <Box className="headerSection">
      <Box>
        <Typography variant="h6" className="pageHeading">
          {title}
        </Typography>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          <Link to="/admin/dashboard" className="breadcrumbLink">
            Admin
          </Link>
          <Typography color="text.primary" fontSize="0.875rem">
            {breadcrumbText}
          </Typography>
        </Breadcrumbs>
      </Box>
      {children}
    </Box>
  );
};

export default AdminPageHeader;
