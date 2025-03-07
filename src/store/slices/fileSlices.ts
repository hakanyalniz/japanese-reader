import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  dictionaryHistory: [],
};

// Slice, Reducers
const fileSlice = createSlice({
  name: "fileHistory",
  initialState,
  reducers: {
    setDictionaryHistory: (state, action) => {
      state.dictionaryHistory += action.payload;
    },
  },
});

// Action
export const { setDictionaryHistory } = fileSlice.actions;
export default fileSlice.reducer;

//Selectors
export const selectDictionaryHistory = (state: {
  fileHistory: { dictionaryHistory: unknown };
}) => state.fileHistory.dictionaryHistory;
