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
      // If an item is already in the notebook, do not add it
      // confirm this via checking id
      if (
        state.dictionaryHistory.some(
          (item) => Reflect.get(item, "id") === action.payload.id
        )
      ) {
        return;
      }
      state.dictionaryHistory.push(action.payload);
    },
    deleteDictionaryHistory: (state, action) => {
      state.dictionaryHistory = state.dictionaryHistory.filter((row) => {
        return row.id !== action.payload;
      });
    },
  },
});

// Action
export const { addDictionaryHistory, deleteDictionaryHistory } =
  fileSlice.actions;
export default fileSlice.reducer;

//Selectors
export const selectDictionaryHistory = (state: {
  fileHistory: { dictionaryHistory: DictionaryItem[] };
}) => state.fileHistory.dictionaryHistory;
