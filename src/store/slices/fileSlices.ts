import { createSlice } from "@reduxjs/toolkit";
import { DictionaryItem } from "../../pages/Home/Home";

interface FileState {
  dictionaryHistory: DictionaryItem[];
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
  fileHistory: { dictionaryHistory: DictionaryItem[] };
}) => state.fileHistory.dictionaryHistory;
