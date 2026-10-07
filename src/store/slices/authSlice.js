import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null, // sanitized user object from the API, or null
  status: "idle", // "idle" | "loading" | "authenticated" | "unauthenticated"
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      state.status = action.payload ? "authenticated" : "unauthenticated";
    },
    setAuthLoading(state) {
      state.status = "loading";
    },
    clearUser(state) {
      state.user = null;
      state.status = "unauthenticated";
    },
    patchUser(state, action) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { setUser, setAuthLoading, clearUser, patchUser } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectAuthStatus = (state) => state.auth.status;
