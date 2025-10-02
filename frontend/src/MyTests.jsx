import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Text,
  Group,
  Badge,
  Title,
  Stack,
  Button,
  Tooltip,
  Center,
  Loader,
} from "@mantine/core";
import { Link, useNavigate } from "react-router-dom";
import { IconPlus, IconUsers, IconListCheck, IconClipboardText } from "@tabler/icons-react";
import axios from "axios";

export default function MyTests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:3000/api/my-tests", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTests(res.data.tests);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    fetchTests();
  }, []);

  return (
    <Container size="md" mt="md">
      <Group position="apart" mb="lg">
        <Title order={3}>My Tests</Title>
        <Button
          leftIcon={<IconPlus size={18} />}
          variant="gradient"
          gradient={{ from: "indigo", to: "cyan" }}
          style={{
            fontWeight: 600,
            borderRadius: 24,
            paddingLeft: 20,
            paddingRight: 20,
            fontSize: 16,
          }}
          onClick={() => navigate("/create-test")}
        >
          Create Test
        </Button>
      </Group>
      {loading ? (
        <Center mt="xl">
          <Loader size="lg" />
        </Center>
      ) : (
        <Stack spacing="md">
          {tests.length === 0 && (
            <Paper p="md" radius="md" shadow="xs" withBorder>
              <Text color="dimmed" align="center">
                No tests found. Click "Create Test" to add your first test!
              </Text>
            </Paper>
          )}
          {tests.map((test) => (
            <Paper
              key={test._id}
              shadow="sm"
              p="md"
              radius="md"
              withBorder
              style={{
                transition: "box-shadow 0.2s",
                cursor: "pointer",
                borderLeft: "6px solid #4dabf7",
              }}
              onClick={() => navigate(`/analysis/${test.testID}`)}
            >
              <Group position="apart" align="center" mb="xs">
                <Text weight={600} size="lg">
                  {test.name}
                </Text>
                <Badge color="blue" size="md" variant="filled">
                  ID: {test.testID}
                </Badge>
              </Group>
              <Group spacing="xl" mb="sm">
                <Group spacing={6}>
                  <IconListCheck size={18} color="#228be6" />
                  <Text size="sm" color="dimmed">
                    Questions: <b>{test.numberOfQuestions}</b>
                  </Text>
                </Group>
                <Group spacing={6}>
                  <IconClipboardText size={18} color="#15aabf" />
                  <Text size="sm" color="dimmed">
                    Roles: <b>{Array.isArray(test.availableRoles) ? test.availableRoles.join(", ") : test.availableRoles}</b>
                  </Text>
                </Group>
                <Group spacing={6}>
                  <IconUsers size={18} color="#40c057" />
                  <Text size="sm" color="dimmed">
                    Responses: <b>{test.responses.length}</b>
                  </Text>
                </Group>
              </Group>
              <Group position="right">
                <Tooltip label="View Analysis" withArrow>
                  <Button
                    component={Link}
                    to={`/analysis/${test.testID}`}
                    size="xs"
                    color="green"
                    variant="light"
                    onClick={e => e.stopPropagation()}
                  >
                    Analysis
                  </Button>
                </Tooltip>
              </Group>
            </Paper>
          ))}
        </Stack>
      )}
    </Container>
  );
}
