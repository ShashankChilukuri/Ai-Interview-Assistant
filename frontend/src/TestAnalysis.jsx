import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Paper,
  Text,
  Title,
  Stack,
  Group,
  Badge,
  Table,
  TextInput,
  Collapse,
  Button,
  Loader,
  Center,
  Select,
  NumberInput,
} from "@mantine/core";
import axios from "axios";

export default function TestAnalysis() {
  const { testID } = useParams();
  const [test, setTest] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState("desc");
  const [minScore, setMinScore] = useState("");
  const [maxScore, setMaxScore] = useState("");

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`/api/start/${testID}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTest(res.data.test);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchTest();
  }, [testID]);

  if (loading)
    return (
      <Container size="md">
        <Center mt="xl">
          <Loader size="lg" />
        </Center>
        <Text align="center" mt="md">
          Loading test details...
        </Text>
      </Container>
    );

  if (!test)
    return (
      <Container size="md">
        <Text align="center" mt="md">
          Test not found.
        </Text>
      </Container>
    );

  // Filter responses by candidate name or email
  let filteredResponses = (test.responses || []).filter(
    (resp) =>
      resp.candidateName?.toLowerCase().includes(search.toLowerCase()) ||
      resp.candidateEmail?.toLowerCase().includes(search.toLowerCase())
  );

  // Filter by score range
  filteredResponses = filteredResponses.filter((resp) => {
    const score = Number(resp.score) || 0;
    if (minScore !== "" && score < minScore) return false;
    if (maxScore !== "" && score > maxScore) return false;
    return true;
  });

  // Sort by score
  filteredResponses.sort((a, b) =>
    sortOrder === "asc"
      ? (a.score || 0) - (b.score || 0)
      : (b.score || 0) - (a.score || 0)
  );

  // Helper: filter out name/email/phone questions
  const isProfileQuestion = (q) => {
    const lower = q.trim().toLowerCase();
    return (
      lower === "what is your name?" ||
      lower === "what is your email?" ||
      lower === "what is your phone number?"
    );
  };

  return (
    <Container size="md" mt="md">
      <Title order={3} mb="md">
        {test.name || test.title || "Untitled Test"} - Analysis
      </Title>
      <Paper shadow="xs" radius="md" p="md" mb="md" withBorder>
        <Group position="apart">
          <Text>
            <b>Test ID:</b> {testID}
          </Text>
          <Text>
            <b>Roles:</b> {Array.isArray(test.availableRoles) ? test.availableRoles.join(", ") : (test.availableRoles || "N/A")}
          </Text>
          <Text>
            <b>Total Questions:</b> {test.questions?.length || 0}
          </Text>
        </Group>
      </Paper>
      <Group mb="md" spacing="md" align="flex-end">
        <TextInput
          placeholder="Search by candidate name or email"
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ flex: 2 }}
        />
        <Select
          label="Sort by Score"
          value={sortOrder}
          onChange={setSortOrder}
          data={[
            { value: "desc", label: "High to Low" },
            { value: "asc", label: "Low to High" },
          ]}
          style={{ flex: 1 }}
        />
        <NumberInput
          label="Min Score"
          value={minScore}
          onChange={setMinScore}
          min={0}
          style={{ width: 110 }}
        />
        <NumberInput
          label="Max Score"
          value={maxScore}
          onChange={setMaxScore}
          min={0}
          style={{ width: 110 }}
        />
      </Group>
      <Stack spacing="sm">
        {filteredResponses.length === 0 && (
          <Paper p="md" radius="md" shadow="xs" withBorder>
            <Text color="dimmed" align="center">
              No matching candidates found.
            </Text>
          </Paper>
        )}
        {filteredResponses.map((resp, idx) => (
          <Paper key={idx} shadow="sm" p="md" radius="md" withBorder>
            <Group position="apart" align="center">
              <div>
                <Text weight={500}>{resp.candidateName || "Unnamed"}</Text>
                <Text size="sm" color="dimmed">
                  {resp.candidateEmail}
                </Text>
              </div>
              <Badge color="teal" size="lg" variant="filled">
                Score: {resp.score}
              </Badge>
              <Button
                size="xs"
                variant="outline"
                onClick={() =>
                  setExpanded((prev) => ({
                    ...prev,
                    [idx]: !prev[idx],
                  }))
                }
              >
                {expanded[idx] ? "Hide Details" : "View Details"}
              </Button>
            </Group>
            <Collapse in={!!expanded[idx]}>
              <Table mt="md" striped highlightOnHover withBorder>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Question</th>
                    <th>Answer</th>
                  </tr>
                </thead>
                <tbody>
                  {(resp.answers || [])
                    .filter((a) => !isProfileQuestion(a.question))
                    .map((a, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{a.question}</td>
                        <td>{a.answer}</td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </Collapse>
          </Paper>
        ))}
      </Stack>
    </Container>
  );
}
