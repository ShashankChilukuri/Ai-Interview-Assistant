// ChatInterface.jsx
import React, { useEffect, useState, useRef } from "react";
import {
  Container,
  Textarea,
  Button,
  Paper,
  ScrollArea,
  Text,
  Box,
  Modal,
  Stack,
} from "@mantine/core";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useParams } from "react-router-dom";

import ResumeUpload from "./ResumeUpload";
import {
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
  clearSession,
  markCompleted,
} from "../redux/testSlice";

export default function ChatInterface() {
  const { testID } = useParams();
  const dispatch = useDispatch();
  const sessions = useSelector((state) => state.test.sessions);
  const activeTestID = useSelector((state) => state.test.activeTestID);

  const scrollRef = useRef();

  // Local state
  const [input, setInput] = useState("");
  const [welcomeBackOpen, setWelcomeBackOpen] = useState(false);
  const [email, setEmail] = useState(""); // Will be set after resume upload

  // Get session key
  const sessionKey = testID && email ? `${testID}_${email}` : null;
  const session = sessionKey ? sessions[sessionKey] : null;

  const messages = session?.messages || [];
  const questions = session?.questions || [];
  const currentIndex = session?.currentIndex || 0;
  const timeLeft = session?.timeLeft ?? null;
  const profile = session?.profile || { name: "", email: "", phone: "" };
  const resumeUploaded = session?.resumeUploaded || false;
  const chatStarted = session?.chatStarted || false;

  const getTimer = (type) => ({ easy: 20, medium: 30, hard: 40 }[type] ?? null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // Handle resume upload
  const handleFileUpload = ({ file, extracted }) => {
    setEmail(extracted.email); // Set email for session key
    dispatch(startTest({ testID, email: extracted.email }));
    dispatch(
      setMessages({
        testID,
        email: extracted.email,
        messages: [{ sender: "bot", text: `👋 Resume received: ${file.name}` }],
      })
    );
    dispatch(setProfile({ testID, email: extracted.email, profile: extracted }));
    dispatch(setResumeUploaded({ testID, email: extracted.email, uploaded: true }));
  };

  // Fetch questions after resume uploaded
  useEffect(() => {
    if (resumeUploaded && questions.length === 0 && email) fetchTestQuestions();
    // eslint-disable-next-line
  }, [resumeUploaded, email]);

  // Fetch questions from backend
  const fetchTestQuestions = async () => {
    try {
      const res = await axios.get(`/api/start/${testID}`);
      if (res.data.success && res.data.test) {
        const test = res.data.test;
        const dynamicQuestions = [
          { Question: "Name?", Answer: profile.name || "", type: "General" },
          { Question: "Email?", Answer: profile.email || "", type: "General" },
          { Question: "Phone?", Answer: profile.phone || "", type: "General" },
          ...test.questions.map((q) => ({
            Question: q.questionText,
            Answer: "",
            type: q.type,
          })),
        ];
        dispatch(
          setQuestions({ testID, email, questions: dynamicQuestions })
        );
        dispatch(setChatStarted({ testID, email, started: true }));
      }
    } catch (err) {
      console.error(err);
      dispatch(
        addMessage({
          testID,
          email,
          message: { sender: "bot", text: "❌ Failed to load test." },
        })
      );
    }
  };

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const interval = setInterval(() => {
      dispatch(setTimeLeft({ testID, email, time: "decrement" }));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, testID, email, dispatch]);

  // Push next question
  const pushNextQuestion = () => {
    if (!chatStarted) return;
    const nextIndex = questions.findIndex((q) => !q.Answer);
    if (nextIndex === -1) {
      dispatch(
        addMessage({
          testID,
          email,
          message: { sender: "bot", text: "✅ All questions answered." },
        })
      );
      submitTest();
      return;
    }
    dispatch(setCurrentIndex({ testID, email, index: nextIndex }));
    const nextQ = questions[nextIndex];
    if (!nextQ.Answer || nextQ.Answer === "(No answer)") {
      dispatch(
        addMessage({
          testID,
          email,
          message: { sender: "bot", text: nextQ.Question },
        })
      );
      dispatch(
        setTimeLeft({ testID, email, time: getTimer(nextQ.type) })
      );
    } else {
      setTimeout(pushNextQuestion, 300);
    }
  };

  // Add answer
  const addAnswer = (answer) => {
    dispatch(
      addMessage({
        testID,
        email,
        message: { sender: "user", text: answer },
      })
    );
    dispatch(
      updateQuestion({ testID, email, index: currentIndex, answer })
    );
    setInput("");
    dispatch(setTimeLeft({ testID, email, time: null }));
    setTimeout(pushNextQuestion, 500);
  };

  const handleSend = () => {
    if (input.trim()) addAnswer(input);
  };

  // Submit test
  const submitTest = async () => {
    try {
      const payload = {
        testID,
        candidateName: profile.name,
        candidateEmail: profile.email,
        responses: questions.map((q) => ({
          question: q.Question,
          answer: q.Answer,
        })),
      };
      const res = await axios.post("/api/submit", payload);
      if (res.data.success) {
        dispatch(
          addMessage({
            testID,
            email,
            message: {
              sender: "bot",
              text: `✅ Test submitted! Score: ${res.data.score || 0}`,
            },
          })
        );
      }
      dispatch(markCompleted({ testID, email }));
    } catch (err) {
      console.error(err);
    }
  };

  // Welcome back modal
  useEffect(() => {
    if (resumeUploaded && !chatStarted && messages.length > 0) {
      setWelcomeBackOpen(true);
    }
  }, [resumeUploaded, chatStarted, messages.length]);

  // Push the first question only when chat is started and there are questions, and no answers yet
  useEffect(() => {
    if (
      chatStarted &&
      questions.length > 0 &&
      questions.filter((q) => q.Answer).length === 0 &&
      messages.length === 1 // Only the resume received message
    ) {
      pushNextQuestion();
    }
    // eslint-disable-next-line
  }, [chatStarted, questions.length]);

  // If no resume uploaded, show upload
  if (!resumeUploaded) return <ResumeUpload onUpload={handleFileUpload} />;

  return (
    <Container
      size="sm"
      mt="md"
      style={{
        height: "98vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Modal opened={welcomeBackOpen} onClose={() => {}} withCloseButton={false}>
        <Stack>
          <Text size="lg" weight={600}>
            Welcome Back! 🎉
          </Text>
          <Text>Unfinished test session found. Continue or restart?</Text>
          <Stack spacing="xs" direction="row">
            <Button
              onClick={() => {
                dispatch(setChatStarted({ testID, email, started: true }));
                setWelcomeBackOpen(false);
              }}
            >
              Continue
            </Button>
            <Button
              color="red"
              onClick={() => {
                dispatch(clearSession({ testID, email }));
                dispatch(startTest({ testID, email }));
                fetchTestQuestions();
                setWelcomeBackOpen(false);
              }}
            >
              Restart
            </Button>
          </Stack>
        </Stack>
      </Modal>

      <ScrollArea
        viewportRef={scrollRef}
        style={{
          flex: 1,
          border: "1px solid #ddd",
          borderRadius: "8px",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          padding: "1rem",
        }}
      >
        {messages.map((msg, i) => (
          <Box
            key={i}
            style={{
              display: "flex",
              justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
            }}
          >
            <Paper
              shadow="sm"
              p="sm"
              radius="md"
              style={{
                backgroundColor: msg.sender === "user" ? "#4dabf7" : "#f1f3f5",
                color: msg.sender === "user" ? "white" : "black",
                maxWidth: "70%",
              }}
            >
              <Text size="sm">{msg.text}</Text>
            </Paper>
          </Box>
        ))}
        {timeLeft !== null && (
          <Text color="red" weight={700} mt="sm">
            ⏳ Time left: {timeLeft}s
          </Text>
        )}
      </ScrollArea>
      <Box mt="md" mb="lg" style={{ display: "flex", gap: "0.5rem" }}>
        <Textarea
          placeholder="Type your answer..."
          autosize
          minRows={1}
          maxRows={4}
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
          style={{ flex: 1 }}
          disabled={currentIndex >= questions.length}
        />
        <Button
          onClick={handleSend}
          disabled={currentIndex >= questions.length || timeLeft === 0}
        >
          Send
        </Button>
      </Box>
    </Container>
  );
}
