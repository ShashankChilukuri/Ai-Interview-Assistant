import React, { useState } from "react";
import { TextInput, PasswordInput, Button, Paper, Title, Text, Stack, Anchor } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/signup", form);
      setMessage("Signup successful! Now login.");
      // Optionally redirect after signup
      // navigate("/");
    } catch (err) {
      setMessage(err.response?.data?.message || "Error signing up");
    }
  };

  return (
    <Paper shadow="md" padding="xl" radius="md" style={{ maxWidth: 400, margin: "50px auto" }}>
      <Title order={2} align="center" mb="lg">
        Signup
      </Title>
      <form onSubmit={handleSubmit}>
        <Stack spacing="md">
          <TextInput
            label="Name"
            placeholder="Your name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <TextInput
            label="Email"
            placeholder="you@example.com"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <Button type="submit" fullWidth>
            Signup
          </Button>
        </Stack>
      </form>
      {message && (
        <Text color={message.includes("successful") ? "green" : "red"} align="center" mt="md">
          {message}
        </Text>
      )}
      <Text align="center" mt="md">
        Already have an account?{" "}
        <Anchor href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }}>
          Login
        </Anchor>
      </Text>
    </Paper>
  );
}
