import { Interviewer } from "../models/Interviewer.js";
import { Test } from "../models/Test.js";
import jwt from "jsonwebtoken";


// Signup
export const createInterviewer = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required" });
    }

    const existing = await Interviewer.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "Interviewer already exists" });
    }

    const newInterviewer = await Interviewer.create({ name, email, password });

    // generate token here
    const token = jwt.sign({ id: newInterviewer._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    const { password: pw, ...rest } = newInterviewer._doc;
    res.status(201).json({ success: true, token, interviewer: rest });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// Login
export const loginInterviewer = async (req, res) => {
  try {
    const { email, password } = req.body;

    const interviewer = await Interviewer.findOne({ email });
    if (!interviewer) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    if (password !== interviewer.password) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: interviewer._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    const { password: pw, ...rest } = interviewer._doc;
    res.json({ success: true, token, interviewer: rest });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// 3️⃣ Create Test (protected route)
export const createTest = async (req, res) => {
  try {
    const { name, numberOfQuestions, availableRoles, questions } = req.body;

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    // Map frontend 'question' field to 'questionText' to match schema
    const formattedQuestions = questions.map(q => ({
      questionText: q.question || "",  // <-- map question -> questionText
      type: q.type || "General"
    }));

    // Ensure testID uniqueness
    let testID;
    do {
      testID = Math.floor(10000000 + Math.random() * 90000000).toString();
    } while (await Test.findOne({ testID }));

    const newTest = await Test.create({
      name,
      testID,
      numberOfQuestions,
      availableRoles,
      questions: formattedQuestions, // ✅ now matches schema
      interviewer: req.user._id
    });

    // Add test ID to interviewer
    await Interviewer.findByIdAndUpdate(req.user._id, { $push: { testIDs: newTest._id } });

    res.status(201).json({ success: true, test: newTest });
  } catch (error) {
    console.error("createTest error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


// 4️⃣ Get all tests of interviewer
export const getInterviewerTests = async (req, res) => {
  try {
    const interviewer = await Interviewer.findById(req.user._id).populate("testIDs");
    res.json({ success: true, tests: interviewer.testIDs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 5️⃣ Start test for candidate by testID
export const getTestByTestID = async (req, res) => {
  try {
    const { testID } = req.params;
    const test = await Test.findOne({ testID });
    if (!test) return res.status(404).json({ success: false, message: "Test not found" });

    const randomizedQuestions = test.questions
      .sort(() => 0.5 - Math.random())
      .slice(0, test.numberOfQuestions);

    res.json({ success: true, test: { ...test._doc, questions: randomizedQuestions } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};



import { scoreWithGemini } from "./ScoreWithGemini.js";

export const submitResponses = async (req, res) => {
  try {
    const { testID, candidateName, candidateEmail, candidatePhone, responses } = req.body;

    const test = await Test.findOne({ testID });
    if (!test)
      return res.status(404).json({ success: false, message: "Test not found" });

    // Get total score from Gemini
    const totalScore = await scoreWithGemini(test.questions, responses);

    // Save to DB (answers as-is, only total score)
    test.responses.push({
      candidateName,
      candidateEmail,
      candidatePhone,
      answers: responses.map(r => ({
        question: r.question,
        answer: r.answer
      })),
      score: totalScore,
    });

    await test.save();

    res.json({
      success: true,
      message: "Responses submitted",
      score: totalScore,
    });
  } catch (error) {
    console.error("submitResponses error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decoded)
      req.user = await Interviewer.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "Not authorized, user not found" });
      }

      next();
    } catch (err) {
      console.error("Token error:", err);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};
