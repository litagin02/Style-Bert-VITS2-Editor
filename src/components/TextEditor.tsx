import { Box, TextField } from '@mui/material';

interface TextEditorProps {
  text: string;
  setText: (text: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

export default function TextEditor({
  text,
  setText,
  onKeyDown,
}: TextEditorProps) {
  return (
    <Box mt={2}>
      <TextField
        label='Input text'
        fullWidth
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
      />
    </Box>
  );
}
