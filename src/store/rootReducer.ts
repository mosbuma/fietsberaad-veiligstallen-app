import { combineReducers } from "redux";
import { authSlice } from "./authSlice";
import { filterSlice } from "./filterSlice";

const rootReducer = combineReducers({
  [authSlice.name]: authSlice.reducer,
  [filterSlice.name]: filterSlice.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
