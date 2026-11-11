import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/slice/authSlice";

import { authApi } from "@/features/auth/service/AuthService";

const rootReducer = combineReducers({
    auth: authReducer,
  
    [authApi.reducerPath]: authApi.reducer,
});

export default rootReducer;
