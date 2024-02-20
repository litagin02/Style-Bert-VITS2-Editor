import { Box, FormControl, InputLabel, MenuItem, Select } from '@mui/material';

import type { ModelInfo } from './TTSContainer';

interface ModelSelectorProps {
  modelList: ModelInfo[];
  model: string;
  setModel: (model: string) => void;
  modelFile: string;
  setModelFile: (modelFile: string) => void;
  style: string;
  setStyle: (style: string) => void;
}

export default function ModelSelector({
  modelList,
  model,
  setModel,
  modelFile,
  setModelFile,
  style,
  setStyle,
}: ModelSelectorProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
      <FormControl variant='standard' sx={{ m: 1, minWidth: 120 }}>
        <InputLabel>Model</InputLabel>
        <Select
          value={model}
          onChange={(event) => setModel(event.target.value)}
        >
          {modelList.map((model, index) => (
            <MenuItem key={index} value={model.name}>
              {model.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl variant='standard' sx={{ m: 1, minWidth: 120 }}>
        <InputLabel>Model File</InputLabel>
        <Select
          value={modelFile}
          onChange={(event) => setModelFile(event.target.value)}
        >
          {modelList
            .find((speaker) => speaker.name === model)
            ?.files.map((file, index) => (
              <MenuItem key={index} value={file}>
                {file}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
      <FormControl variant='standard' sx={{ m: 1, minWidth: 120 }}>
        <InputLabel>Style</InputLabel>
        <Select
          value={style}
          onChange={(event) => setStyle(event.target.value)}
        >
          {modelList
            .find((speaker) => speaker.name === model)
            ?.styles.map((style, index) => (
              <MenuItem key={index} value={style}>
                {style}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </Box>
  );
}
