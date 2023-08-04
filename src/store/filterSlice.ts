import { createSlice } from "@reduxjs/toolkit";
import { AppState } from "./store";
import { HYDRATE } from "next-redux-wrapper";

// Type for our state
export interface FilterState {
  activeTypes: String[];
  query: String;
}

// Initial state
const initialState: FilterState = {
  activeTypes: [
    "bewaakt",
    "geautomatiseerd",
    "onbewaakt",
    "toezicht",
    "buurtstalling",
    "fietstrommel",
    "fietskluizen",
  ],
  query: "",
};

// Actual Slice
export const filterSlice = createSlice({
  name: "filter",
  initialState,
  reducers: {
    // Action to toggle the type
    toggleType(state, action) {
      const pfType = action.payload.pfType;
      const index = state.activeTypes.indexOf(pfType);
      if (index === -1) {
        // Add the type to the array if it's not present
        state.activeTypes.push(pfType);
      } else {
        // Remove the type from the array if it's present
        state.activeTypes.splice(index, 1);
      }
    },
    setQuery(state, action) {
      state.query = action.payload;
    },
  },

  // Special reducer for hydrating the state. Special case for next-redux-wrapper
  extraReducers: {
    [HYDRATE]: (state, action) => {
      return {
        ...state,
        ...action.payload.filter,
      };
    },
  },
});

export const { toggleType, setQuery } = filterSlice.actions;
