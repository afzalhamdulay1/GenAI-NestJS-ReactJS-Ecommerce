import React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

interface RecentOrderRow {
  id: string;
  itemsQty: number;
  amount: string;
  status: string;
}

interface RecentOrdersTableProps {
  rows: RecentOrderRow[];
}

const columns: GridColDef[] = [
  { field: 'id', headerName: 'Order ID', minWidth: 200, flex: 1 },
  {
    field: 'status',
    headerName: 'Status',
    minWidth: 100,
    flex: 0.5,
    cellClassName: (params) => {
      return params.row.status === 'Delivered' ? 'greenColor' : 'redColor';
    },
  },
  {
    field: 'itemsQty',
    headerName: 'Items Qty',
    type: 'number',
    minWidth: 100,
    flex: 0.3,
  },
  {
    field: 'amount',
    headerName: 'Amount',
    type: 'number',
    minWidth: 150,
    flex: 0.5,
  },
];

const RecentOrdersTable: React.FC<RecentOrdersTableProps> = ({ rows }) => {
  return (
    <DataGrid
      rows={rows}
      columns={columns}
      pageSizeOptions={[5]}
      initialState={{
        pagination: { paginationModel: { pageSize: 5 } },
      }}
      disableRowSelectionOnClick
      className="myOrdersTable"
      autoHeight
    />
  );
};

export default RecentOrdersTable;
