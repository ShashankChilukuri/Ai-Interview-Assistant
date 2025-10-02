import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  file: null,
  extracted: { name: "", email: "", phone: "" },
};

const resumeSlice = createSlice({
  name: "resume",
  initialState,
  reducers: {
    setResumeData: (state, action) => {
      state.file = action.payload.file;
      state.extracted = action.payload.extracted;
    },
    clearResumeData: (state) => {
      state.file = null;
      state.extracted = { name: "", email: "", phone: "" };
    },
  },
});

export const { setResumeData, clearResumeData } = resumeSlice.actions;
export default resumeSlice.reducer;
