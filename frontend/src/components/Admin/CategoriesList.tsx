import React, { Fragment, useEffect, useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import '@/components/Admin/ProductsList.css';
import MetaData from '@/components/Layout/MetaData';
import SideBar from '@/components/Admin/Sidebar';
import AdminPageHeader from '@/components/Admin/AdminPageHeader';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Paper, Box, IconButton, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import CategoryIcon from '@mui/icons-material/Category';
import { Link } from 'react-router-dom';
import { api } from '@/services/api';
import { toast } from 'react-toastify';

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  productsCount?: number;
  createdAt: string;
}

const CategoriesList: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/categories');
      setCategories(data.categories || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const deleteCategoryHandler = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) return;

    try {
      await api.delete(`/admin/category/${id}`);
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const openEditDialog = (category: CategoryItem) => {
    setSelectedCategory(category);
    setEditName(category.name);
    setEditDescription(category.description || '');
    setEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedCategory(null);
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;

    setEditLoading(true);
    try {
      await api.put(`/admin/category/${selectedCategory._id}`, {
        name: editName,
        description: editDescription,
      });
      toast.success('Category updated successfully');
      closeEditDialog();
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update category');
    } finally {
      setEditLoading(false);
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'Category ID',
      minWidth: 220,
      flex: 0.8,
    },
    {
      field: 'name',
      headerName: 'Category Name',
      minWidth: 180,
      flex: 1,
      renderCell: (params) => (
        <div style={{ fontWeight: 600, color: '#1e293b' }}>{params.value}</div>
      ),
    },
    {
      field: 'slug',
      headerName: 'Slug',
      minWidth: 160,
      flex: 0.8,
    },
    {
      field: 'description',
      headerName: 'Description',
      minWidth: 220,
      flex: 1.2,
    },
    {
      field: 'productsCount',
      headerName: 'Products',
      type: 'number',
      minWidth: 120,
      flex: 0.5,
      renderCell: (params) => (
        <div style={{ fontWeight: 600, color: '#334155' }}>
          {params.value || 0}
        </div>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      minWidth: 140,
      flex: 0.6,
      sortable: false,
      renderCell: (params) => {
        const cat = params.row as CategoryItem & { id: string };
        return (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', width: '100%', pr: 1 }}>
            <Tooltip title="Edit Category">
              <IconButton
                onClick={() =>
                  openEditDialog({
                    _id: cat.id,
                    name: cat.name,
                    slug: cat.slug,
                    description: cat.description,
                    productsCount: cat.productsCount,
                    createdAt: cat.createdAt,
                  })
                }
                size="small"
                sx={{ color: '#6366f1', background: '#eef2ff', '&:hover': { background: '#e0e7ff' } }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete Category">
              <IconButton
                onClick={() => deleteCategoryHandler(cat.id, cat.name)}
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

  const rows = categories.map((item) => ({
    id: item._id,
    name: item.name,
    slug: item.slug,
    description: item.description || '-',
    productsCount: item.productsCount || 0,
    createdAt: new Date(item.createdAt).toLocaleDateString(),
  }));

  return (
    <Fragment>
      <MetaData title="All Categories - Admin" />

      <div className="dashboard">
        <SideBar />
        <div className="productListContainer">
          <AdminPageHeader
            title="PRODUCT CATEGORIES"
            breadcrumbText="Categories"
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <Link to="/admin/category/new">
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  backgroundColor: '#1e293b',
                  '&:hover': { backgroundColor: '#0f172a' },
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                }}
              >
                Create Category
              </Button>
            </Link>
          </div>

          <Paper elevation={0} className="productListTableContainer">
            <DataGrid
              rows={rows}
              columns={columns}
              loading={loading}
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 10, page: 0 },
                },
              }}
              disableRowSelectionOnClick
              className="productListTable"
              autoHeight
              rowHeight={60}
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

          {/* Edit Dialog */}
          <Dialog open={editDialogOpen} onClose={closeEditDialog} fullWidth maxWidth="sm">
            <form onSubmit={handleUpdateCategory}>
              <DialogTitle sx={{ fontWeight: 700, color: '#1e293b' }}>
                Edit Category
              </DialogTitle>
              <DialogContent dividers>
                <TextField
                  fullWidth
                  label="Category Name"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  sx={{ mb: 2.5, mt: 1 }}
                />
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
              </DialogContent>
              <DialogActions sx={{ p: 2 }}>
                <Button onClick={closeEditDialog} color="inherit">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={editLoading}
                  sx={{
                    backgroundColor: '#1e293b',
                    '&:hover': { backgroundColor: '#0f172a' },
                  }}
                >
                  {editLoading ? 'Updating...' : 'Save Changes'}
                </Button>
              </DialogActions>
            </form>
          </Dialog>
        </div>
      </div>
    </Fragment>
  );
};

export default CategoriesList;
