import { Schema, model } from "mongoose";

const interviewerSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    testIDs: [{ type: Schema.Types.ObjectId, ref: "Test" }],
    role: { type: String, enum: ["interviewer", "admin"], default: "interviewer" }
  },
  { timestamps: true }
);

export const Interviewer = model("Interviewer", interviewerSchema);