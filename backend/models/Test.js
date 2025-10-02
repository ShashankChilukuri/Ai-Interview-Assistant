import { Schema, model } from "mongoose";

// Question schema
const questionSchema = new Schema({
  questionText: { type: String, required: true },
  type: { type: String, enum: ["easy", "medium", "hard", "General"], default: "General" }
}, { _id: false });

// Candidate response schema
const responseSchema = new Schema({
  candidateName: { type: String, required: true },
  candidateEmail: { type: String },
  candidatePhone: { type: String },
  answers: [
    {
      question: { type: String, required: true },
      answer: { type: String }
    }
  ],
  score: { type: Number }
}, { _id: false });

const testSchema = new Schema({
  name: { type: String, required: true },
  testID: { type: String, required: true, unique: true },
  numberOfQuestions: { type: Number, required: true },
  availableRoles: [{ type: String, default: "user" }],
  questions: [questionSchema],
  responses: [responseSchema],
  interviewer: {
    type: Schema.Types.ObjectId,
    ref: "Interviewer",
    required: true
  }
}, { timestamps: true });

export const Test = model("Test", testSchema);
