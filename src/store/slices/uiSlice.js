import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  composerOpen: false,
  mobileNavOpen: false,
  onlineUserIds: [], // populated from socket "user:online" / "user:offline"
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setComposerOpen(state, action) {
      state.composerOpen = action.payload;
    },
    setMobileNavOpen(state, action) {
      state.mobileNavOpen = action.payload;
    },
    userCameOnline(state, action) {
      if (!state.onlineUserIds.includes(action.payload)) {
        state.onlineUserIds.push(action.payload);
      }
    },
    userWentOffline(state, action) {
      state.onlineUserIds = state.onlineUserIds.filter((id) => id !== action.payload);
    },
  },
});

export const { setComposerOpen, setMobileNavOpen, userCameOnline, userWentOffline } =
  uiSlice.actions;
export default uiSlice.reducer;

export const selectOnlineUserIds = (state) => state.ui.onlineUserIds;
