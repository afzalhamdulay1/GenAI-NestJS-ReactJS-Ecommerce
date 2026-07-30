import React, { Fragment, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MetaData from '@/components/Layout/MetaData';
import SideBar from '@/components/Admin/Sidebar';
import AdminPageHeader from '@/components/Admin/AdminPageHeader';
import {
  Button,
  TextField,
  Paper,
  Typography,
  Grid,
  Box,
} from '@mui/material';
import CategoryIcon from '@mui/icons-material/Category';
import { api } from '@/services/api';
import { toast } from 'react-toastify';

const NewCategory: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Category name is required');
      return;
    }

    setLoading(true);
    try {
      await api.post('/admin/category/new', {
        name: name.trim(),
        description: description.trim(),
      });

      toast.success('Category Created Successfully');
      navigate('/admin/categories');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fragment>
      <MetaData title="Create Category - Admin" />
      <div className="dashboard">
        <SideBar />
        <div className="newProductContainer" style={{ padding: '20px 40px' }}>
          <AdminPageHeader
            title="CREATE CATEGORY"
            breadcrumbText="New Category"
          />

          <Paper
            elevation={3}
            sx={{
              p: 4,
              maxWidth: 550,
              mx: 'auto',
              mt: 3,
              borderRadius: 3,
              backgroundColor: '#ffffff',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 3 }}>
              <CategoryIcon sx={{ color: '#0284c7', fontSize: 28 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
                New Product Category
              </Typography>
            </Box>

            <form onSubmit={submitHandler}>
              <Grid container spacing={2.5}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Category Name"
                    placeholder="e.g. Audio & Headphones"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    helperText="Unique category display name"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Description"
                    placeholder="Optional category description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sx={{ mt: 1 }}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      py: 1.5,
                      backgroundColor: '#1e293b',
                      '&:hover': { backgroundColor: '#0f172a' },
                      fontWeight: 700,
                      textTransform: 'none',
                      borderRadius: 2,
                    }}
                  >
                    {loading ? 'Creating...' : 'Create Category'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </div>
      </div>
    </Fragment>
  );
};

export default NewCategory;
