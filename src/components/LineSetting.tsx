import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Box,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Slider,
  Tooltip,
  Typography,
} from '@mui/material';

import type { LineState, ModelInfo } from './EditorContainer';
import { defaultLineState } from './EditorContainer';

interface LineSettingProps {
  modelList: ModelInfo[];
  lines: LineState[];
  setLines: (lines: LineState[]) => void;
  currentIndex: number;
}

export default function LineSetting({
  modelList,
  lines,
  setLines,
  currentIndex,
}: LineSettingProps) {
  const setLineState = (newState: Partial<LineState>) => {
    const newLines = lines.map((line, index) => {
      if (index === currentIndex) {
        return {
          ...line,
          ...newState,
        };
      }
      return line;
    });
    setLines(newLines);
  };

  const handleModelChange = (model: string) => {
    const selected = modelList?.find((m) => m.name === model);
    setLineState({
      model,
      modelFile: selected?.files[0] || '',
      style: selected?.styles[0] || '',
    });
  };

  const handleDefault = () => {
    setLineState({
      ...defaultLineState,
      model: lines[currentIndex].model,
      modelFile: lines[currentIndex].modelFile,
      style: lines[currentIndex].style,
      text: lines[currentIndex].text,
    });
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mb: 1,
          alignItems: 'center',
        }}
      >
        <Typography>テキスト{currentIndex + 1}の設定</Typography>
        <Tooltip title='デフォルト設定に戻す' placement='left'>
          <IconButton onClick={handleDefault}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <FormControl fullWidth variant='standard' sx={{ mb: 1, minWidth: 120 }}>
        <InputLabel>モデル</InputLabel>
        <Select
          value={lines[currentIndex].model}
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
          value={lines[currentIndex].modelFile}
          onChange={(e) =>
            setLineState({ modelFile: e.target.value as string })
          }
        >
          {modelList
            .find((speaker) => speaker.name === lines[currentIndex].model)
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
          value={lines[currentIndex].style}
          onChange={(e) => setLineState({ style: e.target.value as string })}
        >
          {modelList
            .find((speaker) => speaker.name === lines[currentIndex].model)
            ?.styles.map((style, index) => (
              <MenuItem key={index} value={style}>
                {style}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
      <Typography gutterBottom>
        スタイルの強さ: {lines[currentIndex].styleWeight}
      </Typography>
      <Slider
        step={0.5}
        min={0}
        max={50}
        value={lines[currentIndex].styleWeight}
        onChange={(_, value) => setLineState({ styleWeight: value as number })}
      />
      <Typography gutterBottom>話速: {lines[currentIndex].speed}</Typography>
      <Slider
        step={0.05}
        min={0.5}
        max={2}
        value={lines[currentIndex].speed}
        onChange={(_, value) => setLineState({ speed: value as number })}
      />
      <Typography gutterBottom>
        テンポの緩急: {lines[currentIndex].sdpRatio}
      </Typography>
      <Slider
        step={0.05}
        min={0}
        max={1}
        value={lines[currentIndex].sdpRatio}
        onChange={(_, value) => setLineState({ sdpRatio: value as number })}
      />
      <Typography gutterBottom>Noise: {lines[currentIndex].noise}</Typography>
      <Slider
        step={0.05}
        min={0}
        max={1}
        value={lines[currentIndex].noise}
        onChange={(_, value) => setLineState({ noise: value as number })}
      />
      <Typography gutterBottom>NoiseW: {lines[currentIndex].noisew}</Typography>
      <Slider
        step={0.05}
        min={0}
        max={1}
        value={lines[currentIndex].noisew}
        onChange={(_, value) => setLineState({ noisew: value as number })}
      />
      <Box sx={{ display: 'flex', alignItems: 'center' }} mb={1}>
        <Tooltip title='1以外では音質が劣化します'>
          <InfoOutlinedIcon fontSize='small' />
        </Tooltip>
        <Typography>音高: {lines[currentIndex].pitchScale}</Typography>
      </Box>
      <Slider
        step={0.05}
        min={0.7}
        max={1.3}
        value={lines[currentIndex].pitchScale}
        onChange={(_, value) => setLineState({ pitchScale: value as number })}
      />
      <Box sx={{ display: 'flex', alignItems: 'center' }} mb={1}>
        <Tooltip title='1以外では音質が劣化します'>
          <InfoOutlinedIcon fontSize='small' />
        </Tooltip>
        <Typography>抑揚: {lines[currentIndex].intonationScale}</Typography>
      </Box>
      <Slider
        step={0.05}
        min={0}
        max={2}
        value={lines[currentIndex].intonationScale}
        onChange={(_, value) =>
          setLineState({ intonationScale: value as number })
        }
      />
      <Typography gutterBottom>
        次のテキストとの間の無音: {lines[currentIndex].silenceAfter}
      </Typography>
      <Slider
        step={0.05}
        min={0}
        max={1.5}
        value={lines[currentIndex].silenceAfter}
        onChange={(_, value) => setLineState({ silenceAfter: value as number })}
      />
    </Paper>
  );
}
