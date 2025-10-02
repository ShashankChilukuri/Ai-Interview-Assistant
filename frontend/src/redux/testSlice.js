import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  sessions: {},       // all test sessions keyed by testID
  activeTestID: null, // currently active test
};

const testSlice = createSlice({
  name: "test",
  initialState,
  reducers: {
    startTest: (state, action) => {
      const { testID, email } = action.payload;
      if (!testID || !email) return;
      const sessionKey = getSessionKey(testID, email);
      state.activeTestID = sessionKey;
      if (!state.sessions[sessionKey]) {
        state.sessions[sessionKey] = {
          messages: [],
          questions: [],
          currentIndex: 0,
          timeLeft: null,
          profile: { name: "", email, phone: "" },
          resumeUploaded: false,
          chatStarted: false,
          completed: false,
        };
      }
    },

    // Messages
    setMessages: (state, action) => {
      const { testID, email, messages } = action.payload;
      const sessionKey = getSessionKey(testID, email);
      if (state.sessions[sessionKey]) state.sessions[sessionKey].messages = messages;
    },
    addMessage: (state, action) => {
      const { testID, email, message } = action.payload;
      const sessionKey = getSessionKey(testID, email);
      if (state.sessions[sessionKey]) state.sessions[sessionKey].messages.push(message);
    },

    // Questions
    setQuestions: (state, action) => {
      const { testID, email, questions } = action.payload;
      const sessionKey = getSessionKey(testID, email);
      if (state.sessions[sessionKey]) state.sessions[sessionKey].questions = questions;
    },
    updateQuestion: (state, action) => {
      const { testID, email, index, answer } = action.payload;
      const sessionKey = getSessionKey(testID, email);
      if (state.sessions[sessionKey]?.questions[index]) {
        state.sessions[sessionKey].questions[index].Answer = answer;
      }
    },

    // Index & Timer
    setCurrentIndex: (state, action) => {
      const { testID, email, index } = action.payload;
      const sessionKey = getSessionKey(testID, email);
      if (state.sessions[sessionKey]) state.sessions[sessionKey].currentIndex = index;
    },
    setTimeLeft: (state, action) => {
      const { testID, email, time } = action.payload;
      const sessionKey = getSessionKey(testID, email);
      if (!state.sessions[sessionKey]) return;

      if (time === "decrement") {
        if (state.sessions[sessionKey].timeLeft > 0) {
          state.sessions[sessionKey].timeLeft -= 1;
        }
      } else {
        state.sessions[sessionKey].timeLeft = time;
      }
    },

    // Profile & Resume
    setProfile: (state, action) => {
      const { testID, email, profile } = action.payload;
      const sessionKey = getSessionKey(testID, email);
      if (state.sessions[sessionKey]) state.sessions[sessionKey].profile = profile;
    },
    setResumeUploaded: (state, action) => {
      const { testID, email, uploaded } = action.payload;
      const sessionKey = getSessionKey(testID, email);
      if (state.sessions[sessionKey]) state.sessions[sessionKey].resumeUploaded = uploaded;
    },
    setChatStarted: (state, action) => {
      const { testID, email, started } = action.payload;
      const sessionKey = getSessionKey(testID, email);
      if (state.sessions[sessionKey]) state.sessions[sessionKey].chatStarted = started;
    },

    // ✅ Mark test completed
    markCompleted: (state, action) => {
      const { testID, email } = action.payload;
      const sessionKey = getSessionKey(testID, email);
      if (state.sessions[sessionKey]) {
        state.sessions[sessionKey].completed = true;
      }
    },

    // Clear session
    clearSession: (state, action) => {
      const { testID, email } = action.payload;
      const sessionKey = getSessionKey(testID, email);
      delete state.sessions[sessionKey];
      if (state.activeTestID === sessionKey) state.activeTestID = null;
    },

    // Reset everything
    resetAll: () => initialState,
  },
});

const getSessionKey = (testID, email) => `${testID}_${email || ""}`;

export const {
  startTest,
  setMessages,
  addMessage,
  setQuestions,
  updateQuestion,
  setCurrentIndex,
  setTimeLeft,
  setProfile,
  setResumeUploaded,
  setChatStarted,
  markCompleted,   // ✅ new
  clearSession,
  resetAll,
} = testSlice.actions;

export default testSlice.reducer;
