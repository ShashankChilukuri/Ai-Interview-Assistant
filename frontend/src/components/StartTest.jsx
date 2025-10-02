import React, { useState, useEffect } from "react";
import axios from "axios";
import ResumeUpload from "./ResumeUpload";
import ChatInterface from "./ChatInterface";

export default function StartTest() {
  const [testID, setTestID] = useState("");
  const [test, setTest] = useState(null);
  const [resumeUploaded, setResumeUploaded] = useState(false);

  const handleStartTest = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/start/${testID}`);
      if (res.data.success) {
        setTest(res.data.test);
      }
    } catch (err) {
      console.error("Failed to start test:", err.response?.data || err);
      alert("Invalid Test ID");
    }
  };

  if (!test) {
    return (
      <div style={{ padding: "2rem" }}>
        <input
          placeholder="Enter Test ID"
          value={testID}
          onChange={(e) => setTestID(e.target.value)}
          style={{ padding: "0.5rem", fontSize: "1rem" }}
        />
        <button onClick={handleStartTest} style={{ marginLeft: "1rem", padding: "0.5rem 1rem" }}>
          Start Test
        </button>
      </div>
    );
  }

  if (!resumeUploaded) {
    return <ResumeUpload onUpload={() => setResumeUploaded(true)} />;
  }

  return <ChatInterface test={test} />;
}
