import { createSlice } from '@reduxjs/toolkit';

const orderSlice = createSlice({
  name: 'order',
  initialState: {
    customerOrders: [],
    vendorSalesOrders: [],
    loading: false,
    error: null,
  },
  reducers: {
    setCustomerOrders: (state, action) => {
      state.customerOrders = action.payload;
    },
    setVendorSalesOrders: (state, action) => {
      state.vendorSalesOrders = action.payload;
    },
    setOrderLoading: (state, action) => {
      state.loading = action.payload;
    },
    setOrderError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setCustomerOrders, setVendorSalesOrders, setOrderLoading, setOrderError } = orderSlice.actions;
export default orderSlice.reducer;
