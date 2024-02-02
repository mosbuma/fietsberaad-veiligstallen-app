import { createSlice } from "@reduxjs/toolkit";
import { HYDRATE } from "next-redux-wrapper";

// Type for our state
export interface FilterState {
  activeTypes: string[];
  query: string;
}

// Initial state
const initialState: FilterState = {
  activeTypes: [
    "bewaakt",
    "geautomatiseerd",
    "toezicht"
  ],
  query: "",
};

const allowedTypes = [
  'bewaakt',
  'geautomatiseerd',
  'toezicht',
  'onbewaakt',
  'buurtstalling',
  'fietstrommel',
  'fietskluizen'
];

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
    // Action to toggle the type
    setTypes(state, action) {
      const typesToSet = action.payload;
      // Check if given types are valid
      let isInvalidInput = false;
      if (!typesToSet) {
        isInvalidInput = true;
      }
      for (let key in typesToSet) {
        const typeToSet = typesToSet[key];
        if (allowedTypes.indexOf(typeToSet) <= -1) {
          isInvalidInput = true;
        }
      }
      if (isInvalidInput) {
        return;
      }

      state.activeTypes = typesToSet;
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

export const {
  toggleType,
  setQuery,
  setTypes
} = filterSlice.actions;
