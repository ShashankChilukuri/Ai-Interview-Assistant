import React, { useState } from "react";
import { Container, TextInput, Select, Textarea, Button, Paper, Title, Group, Loader } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function CreateTest() {
  const [title, setTitle] = useState("");
  const [numberOfQuestions, setNumberOfQuestions] = useState(6);
  const [availableRoles, setAvailableRoles] = useState("");
  const [questions, setQuestions] = useState([{ question: "", type: "General" }]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const navigate = useNavigate();

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: "", type: "General" }]);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleGenerateQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const token = localStorage.getItem("token");
      const rolesArr = availableRoles.split(",").map((r) => r.trim()).filter(Boolean);
      if (!rolesArr.length) {
        alert("Please enter at least one role before generating questions.");
        setLoadingQuestions(false);
        return;
      }
      const res = await axios.post(
        "http://localhost:3000/api/generate",
        {
          roles: rolesArr,
          numberOfQuestions: numberOfQuestions,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.success && Array.isArray(res.data.questions)) {
        setQuestions(
          res.data.questions.map((q) => ({
            question: q.questionText,
            type: q.type,
          }))
        );
      } else {
        alert("Failed to generate questions.");
      }
    } catch (error) {
      console.error("Error generating questions:", error.response?.data || error);
      alert("Failed to generate questions");
    }
    setLoadingQuestions(false);
  };

  const handleCreate = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:3000/api/create",
        {
          name: title,
          numberOfQuestions: Math.min(numberOfQuestions, questions.length),
          availableRoles: availableRoles.split(",").map((r) => r.trim()).filter(Boolean),
          questions,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Test created successfully!");
      setTitle("");
      setNumberOfQuestions(6);
      setAvailableRoles("");
      setQuestions([{ question: "", type: "General" }]);
    } catch (error) {
      console.error("Error creating test:", error.response?.data || error);
      alert("Failed to create test");
    }
  };

  return (
    <Container size="sm">
      <Paper shadow="md" radius="md" p="lg">
        <Group position="apart" mb="md">
          <Title order={3} align="center">
            Create New Test
          </Title>
          <Button
            variant="outline"
            color="gray"
            onClick={() => navigate("/my-tests")}
          >
            Back to My Tests
          </Button>
        </Group>

        <TextInput
          label="Test Title"
          placeholder="Enter test name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          mb="md"
        />

        <TextInput
          label="Available Roles (comma-separated)"
          placeholder="e.g., Developer, Tester"
          value={availableRoles}
          onChange={(e) => setAvailableRoles(e.target.value)}
          mb="md"
        />

        <TextInput
          label="Number of Questions"
          type="number"
          value={numberOfQuestions}
          onChange={(e) => setNumberOfQuestions(Number(e.target.value))}
          mb="md"
        />

        <Group mb="md" position="right">
          <Button
            variant="gradient"
            gradient={{ from: "teal", to: "cyan" }}
            onClick={handleGenerateQuestions}
            loading={loadingQuestions}
            disabled={loadingQuestions}
          >
            {loadingQuestions ? <Loader size="xs" color="white" /> : "Generate Questions"}
          </Button>
        </Group>

        <Title order={5} mb="sm">
          Questions
        </Title>
        {questions.map((q, index) => (
          <Group key={index} mb="sm">
            <Textarea
              placeholder={`Question ${index + 1}`}
              value={q.question}
              onChange={(e) => handleQuestionChange(index, "question", e.target.value)}
              style={{ flex: 1 }}
            />
            <Select
              data={["General", "easy", "medium", "hard"]}
              value={q.type}
              onChange={(value) => handleQuestionChange(index, "type", value)}
              style={{ width: 120 }}
            />
            <Button color="red" onClick={() => removeQuestion(index)}>
              Remove
            </Button>
          </Group>
        ))}

        <Button variant="outline" onClick={addQuestion} mb="md">
          Add Question
        </Button>
        <Button fullWidth mt="md" onClick={handleCreate}>
          Create Test
        </Button>
      </Paper>
    </Container>
  );
}
