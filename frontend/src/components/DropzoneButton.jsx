import { useRef } from "react";
import { IconCloudUpload, IconDownload, IconX } from "@tabler/icons-react";
import { Button, Group, Text, useMantineTheme } from "@mantine/core";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";

export function DropzoneButton({ onFileUpload }) {
  const theme = useMantineTheme();
  const openRef = useRef(null);

  return (
    <div style={{ maxWidth: 500, margin: "auto" }}>
      <Dropzone
        openRef={openRef}
        onDrop={(files) => {
          if (files.length > 0) {
            onFileUpload(files[0]); // Pass uploaded file to parent
          }
        }}
        radius="md"
        accept={[MIME_TYPES.pdf]}
        maxSize={30 * 1024 ** 2}
      >
        <div style={{ pointerEvents: "none" }}>
          <Group justify="center">
            <Dropzone.Accept>
              <IconDownload size={50} color={theme.colors.blue[6]} stroke={1.5} />
            </Dropzone.Accept>
            <Dropzone.Reject>
              <IconX size={50} color={theme.colors.red[6]} stroke={1.5} />
            </Dropzone.Reject>
            <Dropzone.Idle>
              <IconCloudUpload size={50} stroke={1.5} />
            </Dropzone.Idle>
          </Group>

          <Text ta="center" fw={700} fz="lg" mt="xl">
            <Dropzone.Accept>Drop file here</Dropzone.Accept>
            <Dropzone.Reject>PDF file under 30mb required</Dropzone.Reject>
            <Dropzone.Idle>Upload your resume</Dropzone.Idle>
          </Text>

          <Text ta="center" c="dimmed" mt="sm">
            Drag & drop or click to upload. Only <i>.pdf</i> under 30mb supported.
          </Text>
        </div>
      </Dropzone>

      <Button
        fullWidth
        mt="md"
        radius="xl"
        onClick={() => openRef.current?.()}
      >
        Select file
      </Button>
    </div>
  );
}
