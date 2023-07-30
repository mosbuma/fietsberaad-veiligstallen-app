import { createSlice } from "@reduxjs/toolkit";
import { AppState } from "./store";
import { HYDRATE } from "next-redux-wrapper";

// Type for our state
export interface GeoState {
  municipalities: any[];
}

// Initial state
const initialState: GeoState = {
  municipalities: []
};

// Actual Slice
export const geoSlice = createSlice({
  name: "geo",
  initialState,
  reducers: {
    setMunicipalities(state, action) {
      state.municipalities = action.payload;
    }
  },

  // Special reducer for hydrating the state. Special case for next-redux-wrapper
  extraReducers: {
    [HYDRATE]: (state, action) => {
      return {
        ...state,
        ...action.payload.geo,
      };
    },
  },
});

export const {
  setMunicipalities
} = geoSlice.actions;
