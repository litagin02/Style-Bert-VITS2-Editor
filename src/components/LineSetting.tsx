import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Box,
  FormControl,
  IconButton,
  Input,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Slider,
  Tooltip,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/Grid2';

import type { LineState, ModelInfo } from './EditorContainer';
import { defaultLineState } from './EditorContainer';

interface InputSliderProps {
  value: number;
  setValue: (value: number) => void;
  step: number;
  min: number;
  max: number;
  label: string;
}

function InputSlider({
  value,
  setValue,
  step,
  min,
  max,
  label,
}: InputSliderProps) {
  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    setValue(newValue as number);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value === '' ? 0 : Number(event.target.value));
  };

  const handleBlur = () => {
    if (value < min) {
      setValue(min);
    } else if (value > max) {
      setValue(max);
    }
  };

  return (
    <Box>
      <Typography id='input-slider' gutterBottom>
        {label}
      </Typography>
      <Grid container spacing={2} alignItems='center'>
        <Grid xs>
          <Slider
            value={typeof value === 'number' ? value : min}
            onChange={handleSliderChange}
            aria-labelledby='input-slider'
            step={step}
            min={min}
            max={max}
          />
        </Grid>
        <Grid>
          <Input
            value={value}
            size='small'
            onChange={handleInputChange}
            onBlur={handleBlur}
            inputProps={{
              step,
              min,
              max,
              type: 'number',
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

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
      text: lines[currentIndex].text,
      //もし選択肢にNeutralがあればそれを選択、あるはずだが一応
      style: modelList
        .find((speaker) => speaker.name === lines[currentIndex].model)
        ?.styles.includes('Neutral')
        ? 'Neutral'
        : modelList.find(
            (speaker) => speaker.name === lines[currentIndex].model,
          )?.styles[0] || '',
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
      <InputSlider
        label='スタイルの強さ'
        value={lines[currentIndex].styleWeight}
        setValue={(value) => setLineState({ styleWeight: value })}
        step={0.5}
        min={0}
        max={50}
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
