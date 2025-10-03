// Header.jsx
import React from "react";
import { Box, Group, Title, Container } from "@mantine/core";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <Box
      component="header"
      style={{
        height: 60,
        backgroundColor: "#1c1c1e",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Container size="lg">
        <Group position="apart" style={{ width: "100%" }}>
          <Title
            order={3}
            component={Link}
            to="/"
            style={{ color: "#4dabf7", textDecoration: "none" }}
          >
            AI Interview Assistant
          </Title>
        </Group>
      </Container>
    </Box>
  );
}
