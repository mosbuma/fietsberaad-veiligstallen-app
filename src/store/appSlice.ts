import { createSlice } from "@reduxjs/toolkit";
import { HYDRATE } from "next-redux-wrapper";

export interface AppState {
  isParkingListVisible: boolean;
  isFilterBoxVisible: boolean;
  isMobileNavigationVisible: boolean;
  activeArticleMunicipality: string | undefined;
  activeArticleTitle: string | undefined;
}

// Initial state
const initialState: AppState = {
  isParkingListVisible: false,
  isFilterBoxVisible: false,
  isMobileNavigationVisible: false,
  activeArticleMunicipality: undefined,
  activeArticleTitle: undefined
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
    setIsMobileNavigationVisible(state, action) {
      state.isMobileNavigationVisible = action.payload;
    },
    setActiveArticle(state, action) {
      state.activeArticleTitle = action.payload.articleTitle;
      state.activeArticleMunicipality = action.payload.municipality;
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
  setIsFilterBoxVisible,
  setIsMobileNavigationVisible,
  setActiveArticle,
} = appSlice.actions;
