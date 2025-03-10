import { createSlice } from "@reduxjs/toolkit";

interface FileState {
  dictionaryHistory: DictionaryItem[];
  currentlyDisplayedEpub: fileMetaData | null;
}

const initialState: FileState = {
  dictionaryHistory: [],
  currentlyDisplayedEpub: null,
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
    setCurrentlyDisplayedEpub: (state, action) => {
      state.currentlyDisplayedEpub = action.payload;
    },
  },
});

// Action
export const {
  addDictionaryHistory,
  deleteDictionaryHistory,
  setCurrentlyDisplayedEpub,
} = fileSlice.actions;
export default fileSlice.reducer;

//Selectors
export const selectDictionaryHistory = (state: {
  fileHistory: { dictionaryHistory: DictionaryItem[] };
}) => state.fileHistory.dictionaryHistory;

export const selectCurrentlyDisplayedEpub = (state: {
  fileHistory: { currentlyDisplayedEpub: fileMetaData };
}) => state.fileHistory.currentlyDisplayedEpub;
