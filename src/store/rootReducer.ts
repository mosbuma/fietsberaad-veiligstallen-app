import { combineReducers } from "redux";
import { authSlice } from "./authSlice";
import { filterSlice } from "./filterSlice";
import { mapSlice } from "./mapSlice";
import { geoSlice } from "./geoSlice";

const rootReducer = combineReducers({
  [authSlice.name]: authSlice.reducer,
  [filterSlice.name]: filterSlice.reducer,
  [mapSlice.name]: mapSlice.reducer,
  [geoSlice.name]: geoSlice.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
