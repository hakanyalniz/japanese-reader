import { configureStore } from "@reduxjs/toolkit";
import fileReducer from "./slices/fileSlices";

const store = configureStore({
  reducer: {
    fileHistory: fileReducer,
  },
});

export default store;
