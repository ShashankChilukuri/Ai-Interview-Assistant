import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  TextInput,
  Tabs,
  Text,
  Button,
  Title,
  Stack,
  Center,
  Group,
  Modal,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { startTest, clearSession } from "./redux/testSlice";

export default function Home() {
  const [testID, setTestID] = useState("");
  const [interviewerEmail, setInterviewerEmail] = useState("");
  const [interviewerPassword, setInterviewerPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ✅ check if session already exists
  const existingSession = useSelector(
    (state) => testID && state.test.sessions[testID]
  );

  useEffect(() => {
    const lastRoute = localStorage.getItem("lastRoute");
    // Only redirect if lastRoute exists and is not "/" or "/signup"
    if (lastRoute && lastRoute !== "/" && lastRoute !== "/signup") {
      navigate(lastRoute, { replace: true });
    }
  }, [navigate]);

  // ---- Student Submit ----
  const handleStudentSubmit = () => {
    if (!testID.trim()) {
      return alert("Please enter a valid Test ID."); // you can replace with notifications
    }

    if (existingSession && !existingSession.completed) {
      // unfinished session → show resume/restart modal
      setShowModal(true);
    } else {
      // start fresh
      dispatch(startTest(testID.trim()));
      navigate(`/start-test/${testID.trim()}`);
    }
  };

  const handleResume = () => {
    setShowModal(false);
    navigate(`/start-test/${testID.trim()}`);
  };

  const handleRestart = () => {
    setShowModal(false);
    dispatch(clearSession(testID.trim()));
    dispatch(startTest(testID.trim()));
    navigate(`/start-test/${testID.trim()}`);
  };

  // ---- Interviewer Login ----
  const handleInterviewerLogin = async () => {
    if (!interviewerEmail || !interviewerPassword) {
      return setMessage("Enter email and password");
    }

    try {
      const res = await axios.post("http://localhost:3000/api/login", {
        email: interviewerEmail,
        password: interviewerPassword,
      });

      localStorage.setItem("token", res.data.token);
      setMessage("Login Successful!");
      navigate("/my-tests");
    } catch (err) {
      setMessage(err.response?.data?.message || "Error logging in");
    }
  };

  return (
    <Container size="sm" mt="xl">
      <Paper shadow="xl" radius="md" p="lg">
        <Center mb="lg">
          <Title order={2}>AI Interview Assistant</Title>
        </Center>

        <Tabs defaultValue="student" variant="outline" radius="md">
          <Tabs.List grow>
            <Tabs.Tab value="student">Student</Tabs.Tab>
            <Tabs.Tab value="interviewer">Interviewer</Tabs.Tab>
          </Tabs.List>

          {/* ---- Student Tab ---- */}
          <Tabs.Panel value="student" pt="md">
            <Stack spacing="sm">
              <Text size="sm" color="dimmed">
                Enter your Test ID to start the test. You’ll see questions in a
                chat interface.
              </Text>
              <TextInput
                placeholder="Enter Test ID"
                value={testID}
                onChange={(e) => setTestID(e.target.value)}
              />
              <Button
                fullWidth
                size="md"
                color="blue"
                onClick={handleStudentSubmit}
                disabled={!testID}
              >
                Start Test
              </Button>
            </Stack>
          </Tabs.Panel>

          {/* ---- Interviewer Tab ---- */}
          <Tabs.Panel value="interviewer" pt="md">
            <Stack spacing="sm">
              <Text size="sm" color="dimmed">
                Login to manage your tests and view results.
              </Text>
              <TextInput
                placeholder="Email"
                value={interviewerEmail}
                onChange={(e) => setInterviewerEmail(e.target.value)}
              />
              <TextInput
                placeholder="Password"
                type="password"
                value={interviewerPassword}
                onChange={(e) => setInterviewerPassword(e.target.value)}
              />
              <Group grow>
                <Button
                  size="md"
                  color="green"
                  onClick={handleInterviewerLogin}
                  disabled={!interviewerEmail || !interviewerPassword}
                >
                  Login
                </Button>
                <Button
                  size="md"
                  color="blue"
                  variant="outline"
                  onClick={() => navigate("/signup")}
                >
                  Sign Up
                </Button>
              </Group>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Paper>
      {message && (
        <Center mt="md">
          <Text color="red">{message}</Text>
        </Center>
      )}

      {/* ✅ Resume/Restart Modal */}
      <Modal
        opened={showModal}
        onClose={() => setShowModal(false)}
        title="Unfinished Test"
        centered
      >
        <Text mb="md">
          You have an unfinished test for ID <b>{testID}</b>. What would you
          like to do?
        </Text>
        <Group grow>
          <Button color="blue" onClick={handleResume}>
            Resume
          </Button>
          <Button color="red" variant="outline" onClick={handleRestart}>
            Restart
          </Button>
        </Group>
      </Modal>
    </Container>
  );
}
