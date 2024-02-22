import {
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Slider,
  Typography,
} from '@mui/material';

import type { EditorState, ModelInfo } from './TTSContainer';

interface TTSSettingProps {
  modelList: ModelInfo[];
  editors: EditorState[];
  setEditors: (editors: EditorState[]) => void;
  currentIndex: number;
}

export default function TTSSetting({
  modelList,
  editors,
  setEditors,
  currentIndex,
}: TTSSettingProps) {
  const setEditorState = (newState: Partial<EditorState>) => {
    const newEditors = editors.map((editor, index) => {
      if (index === currentIndex) {
        return {
          ...editor,
          ...newState,
        };
      }
      return editor;
    });
    setEditors(newEditors);
  };

  const handleModelChange = (model: string) => {
    const selected = modelList?.find((m) => m.name === model);
    setEditorState({
      model: model,
      modelFile: selected?.files[0] || '',
      style: selected?.styles[0] || '',
    });
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography>テキスト{currentIndex + 1}の設定</Typography>
      <FormControl fullWidth variant='standard' sx={{ mb: 1, minWidth: 120 }}>
        <InputLabel>モデル</InputLabel>
        <Select
          value={editors[currentIndex].model}
          onChange={(e) => handleModelChange(e.target.value as string)}
        >
          {modelList.map((modelInfo, index) => (
            <MenuItem key={index} value={modelInfo.name}>
              {modelInfo.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth variant='standard' sx={{ mb: 1, minWidth: 120 }}>
        <InputLabel>モデルファイル</InputLabel>
        <Select
          value={editors[currentIndex].modelFile}
          onChange={(e) =>
            setEditorState({ modelFile: e.target.value as string })
          }
        >
          {modelList
            .find((speaker) => speaker.name === editors[currentIndex].model)
            ?.files.map((file, index) => (
              <MenuItem key={index} value={file}>
                {file}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
      <FormControl fullWidth variant='standard' sx={{ mb: 2, minWidth: 120 }}>
        <InputLabel>スタイル</InputLabel>
        <Select
          value={editors[currentIndex].style}
          onChange={(e) => setEditorState({ style: e.target.value as string })}
        >
          {modelList
            .find((speaker) => speaker.name === editors[currentIndex].model)
            ?.styles.map((style, index) => (
              <MenuItem key={index} value={style}>
                {style}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
      <Typography gutterBottom>
        スタイルの強さ: {editors[currentIndex].styleWeight}
      </Typography>
      <Slider
        step={0.5}
        min={0}
        max={50}
        value={editors[currentIndex].styleWeight}
        onChange={(_, value) =>
          setEditorState({ styleWeight: value as number })
        }
      />
      <Typography gutterBottom>話速: {editors[currentIndex].speed}</Typography>
      <Slider
        step={0.05}
        min={0.5}
        max={2}
        value={editors[currentIndex].speed}
        onChange={(_, value) => setEditorState({ speed: value as number })}
      />
      <Typography gutterBottom>
        テンポの緩急: {editors[currentIndex].sdpRatio}
      </Typography>
      <Slider
        step={0.05}
        min={0}
        max={1}
        value={editors[currentIndex].sdpRatio}
        onChange={(_, value) => setEditorState({ sdpRatio: value as number })}
      />
      <Typography gutterBottom>Noise: {editors[currentIndex].noise}</Typography>
      <Slider
        step={0.05}
        min={0}
        max={1}
        value={editors[currentIndex].noise}
        onChange={(_, value) => setEditorState({ noise: value as number })}
      />
      <Typography gutterBottom>
        NoiseW: {editors[currentIndex].noisew}
      </Typography>
      <Slider
        step={0.05}
        min={0}
        max={1}
        value={editors[currentIndex].noisew}
        onChange={(_, value) => setEditorState({ noisew: value as number })}
      />
    </Paper>
  );
}
