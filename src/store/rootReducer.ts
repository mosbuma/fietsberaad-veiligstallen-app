import { combineReducers } from "redux";
import { authSlice } from "./authSlice";
import { filterSlice } from "./filterSlice";
import { filterArticlesSlice } from "./filterArticlesSlice";
import { mapSlice } from "./mapSlice";
import { geoSlice } from "./geoSlice";
import { appSlice } from "./appSlice";

const rootReducer = combineReducers({
  [authSlice.name]: authSlice.reducer,
  [filterSlice.name]: filterSlice.reducer,
  [filterArticlesSlice.name]: filterArticlesSlice.reducer,
  [mapSlice.name]: mapSlice.reducer,
  [appSlice.name]: appSlice.reducer,
  [geoSlice.name]: geoSlice.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
