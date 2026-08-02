import { createSlice } from '@reduxjs/toolkit';

const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    categories: [],
    selectedProduct: null,
    reviews: [],
    loading: false,
    error: null,
    searchKeyword: '',
    selectedCategory: '',
    minPrice: '',
    maxPrice: '',
  },
  reducers: {
    setProducts: (state, action) => {
      state.products = action.payload;
    },
    setCategories: (state, action) => {
      state.categories = action.payload;
    },
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },
    setReviews: (state, action) => {
      state.reviews = action.payload;
    },
    setFilters: (state, action) => {
      if (action.payload.search !== undefined) state.searchKeyword = action.payload.search;
      if (action.payload.category !== undefined) state.selectedCategory = action.payload.category;
      if (action.payload.minPrice !== undefined) state.minPrice = action.payload.minPrice;
      if (action.payload.maxPrice !== undefined) state.maxPrice = action.payload.maxPrice;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setProducts,
  setCategories,
  setSelectedProduct,
  setReviews,
  setFilters,
  setLoading,
  setError,
} = productSlice.actions;

export default productSlice.reducer;
