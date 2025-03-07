import { createSlice } from "@reduxjs/toolkit";

interface FileState {
  dictionaryHistory: {
    kanji: string;
    kana: string;
    meaning: string;
  }[];
}

const initialState: FileState = {
  dictionaryHistory: [],
};

// Slice, Reducers
const fileSlice = createSlice({
  name: "fileHistory",
  initialState,
  reducers: {
    addDictionaryHistory: (state, action) => {
      state.dictionaryHistory.push(action.payload);
    },
  },
});

// Action
export const { addDictionaryHistory } = fileSlice.actions;
export default fileSlice.reducer;

//Selectors
export const selectDictionaryHistory = (state: {
  fileHistory: { dictionaryHistory: unknown };
}) => state.fileHistory.dictionaryHistory;
