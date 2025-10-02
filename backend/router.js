import express from "express";
import {
  createInterviewer,
  loginInterviewer,
  createTest,
  getInterviewerTests,
  getTestByTestID,
  protect,
  submitResponses,
} from "./controller/InterviewerController.js";
import { generateQuestionsWithGemini } from "./controller/ScoreWithGemini.js";

const router = express.Router();

// Auth Routes
router.post("/signup", createInterviewer); // create interviewer (signup)
router.post("/login", loginInterviewer);   // login interviewer

// Interviewer routes (require login)
router.post("/create", protect, createTest);
router.get("/my-tests", protect, getInterviewerTests);

// Candidate routes
router.get("/start/:testID", getTestByTestID);
router.post("/submit", submitResponses);

// Generate questions with Gemini (protected route)
router.post("/generate", protect, async (req, res) => {
  try {
    const { roles, numberOfQuestions } = req.body;
    if (!roles || !Array.isArray(roles) || !roles.length) {
      return res.status(400).json({ success: false, message: "Roles are required" });
    }
    const num = Number(numberOfQuestions) || 6;
    const questions = await generateQuestionsWithGemini(roles, num);
    res.json({ success: true, questions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
