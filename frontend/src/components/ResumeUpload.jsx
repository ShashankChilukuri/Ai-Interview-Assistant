// ResumeUpload.jsx
import React, { useState } from "react";
import { Container, Text, Group, Loader, Alert, Paper, Center, Stack } from "@mantine/core";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import { IconCloudUpload, IconDownload, IconX, IconAlertCircle } from "@tabler/icons-react";
import { parseResume } from "./ExtractData";
import PropTypes from "prop-types";

export default function ResumeUpload({ onUpload }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileUpload = async (file) => {
    try {
      setError("");
      setLoading(true);

      const { name, email, phone } = await parseResume(file);

      // Call parent handler
      if (typeof onUpload === "function") {
        onUpload({ file, extracted: { name, email, phone } });
      }
    } catch (err) {
      console.error(err);
      setError("❌ Failed to parse resume. Try another file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="sm" style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Paper shadow="xl" radius="md" p="xl" style={{ width: "100%" }}>
        <Stack align="center" spacing="lg">
          <Text align="center" size="xl" weight={700}>
            Upload Your Resume to Start the Test
          </Text>

          {error && <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">{error}</Alert>}

          <Dropzone
            onDrop={(files) => handleFileUpload(files[0])}
            radius="md"
            accept={[MIME_TYPES.pdf, MIME_TYPES.docx]}
            maxSize={30 * 1024 ** 2}
            multiple={false}
            style={{ width: "100%", padding: "2rem" }}
          >
            <Center style={{ flexDirection: "column" }}>
              <Group position="center" spacing="xl">
                {loading ? <Loader size="lg" /> : (
                  <>
                    <Dropzone.Accept><IconDownload size={50} color="blue" stroke={1.5} /></Dropzone.Accept>
                    <Dropzone.Reject><IconX size={50} color="red" stroke={1.5} /></Dropzone.Reject>
                    <Dropzone.Idle><IconCloudUpload size={50} stroke={1.5} /></Dropzone.Idle>
                  </>
                )}
              </Group>

              <Text mt="sm" size="lg" weight={500}>
                {loading ? "Parsing Resume..." : "Drag & drop your PDF/DOCX here"}
              </Text>
              {!loading && <Text color="dimmed" size="sm">Or click to select a file</Text>}
            </Center>
          </Dropzone>
        </Stack>
      </Paper>
    </Container>
  );
}

ResumeUpload.propTypes = {
  onUpload: PropTypes.func.isRequired,
};
