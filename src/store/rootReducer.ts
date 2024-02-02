import { combineReducers } from "redux";
import { authSlice, type AuthState } from "./authSlice";
import { filterSlice, type FilterState } from "./filterSlice";
import { mapSlice, type MapState } from "./mapSlice";
import { geoSlice, type GeoState } from "./geoSlice";
import { appSlice, type AppState } from "./appSlice";

export interface VeiligstallenRootState {
  [authSlice.name]: AuthState,
  [filterSlice.name]: FilterState,
  [mapSlice.name]: MapState,
  [appSlice.name]: AppState,
  [geoSlice.name]: GeoState,
}

const rootReducer = combineReducers<VeiligstallenRootState>({
  [authSlice.name]: authSlice.reducer,
  [filterSlice.name]: filterSlice.reducer,
  [mapSlice.name]: mapSlice.reducer,
  [appSlice.name]: appSlice.reducer,
  [geoSlice.name]: geoSlice.reducer,
});

export type RootState = VeiligstallenRootState; // ReturnType<typeof rootReducer>;

export default rootReducer;
