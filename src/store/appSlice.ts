import { createSlice } from "@reduxjs/toolkit";
import { HYDRATE } from "next-redux-wrapper";

// Initial state
const initialState: AuthState = {
};

// Actual Slice
export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setIsParkingListVisible(state, action) {
      state.isParkingListVisible = action.payload;
    },
    setIsFilterBoxVisible(state, action) {
      state.isFilterBoxVisible = action.payload;
    },
  },

  // Special reducer for hydrating the state. Special case for next-redux-wrapper
  extraReducers: {
    [HYDRATE]: (state, action) => {
      return {
        ...state,
        ...action.payload.app,
      };
    },
  },
});

export const {
  setIsParkingListVisible,
  setIsFilterBoxVisible
} = appSlice.actions;
