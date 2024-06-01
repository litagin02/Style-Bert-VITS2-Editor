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
import { useState } from 'react';

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
      <Grid
        container
        spacing={2}
        alignItems='center'
        justifyContent='space-between'
      >
        <Grid xs={9}>
          <Typography id='input-slider' gutterBottom>
            {label}
          </Typography>
          <Slider
            value={typeof value === 'number' ? value : min}
            onChange={handleSliderChange}
            aria-labelledby='input-slider'
            step={step}
            min={min}
            max={max}
          />
        </Grid>
        <Grid xs={3}>
          <Input
            value={value}
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
  const [styleWeightUB, setStyleWeightUB] = useState(10);

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
      speaker: selected?.speakers?.[0] || '',
    });
  };

  const handleDefault = () => {
    setLineState({
      ...defaultLineState,
      model: lines[currentIndex].model,
      modelFile: lines[currentIndex].modelFile,
      text: lines[currentIndex].text,
      speaker: lines[currentIndex].speaker,
      //もし選択肢にNeutralがあればそれを選択、あるはずだが一応
      style: modelList
        .find((model) => model.name === lines[currentIndex].model)
        ?.styles.includes('Neutral')
        ? 'Neutral'
        : modelList.find((model) => model.name === lines[currentIndex].model)
            ?.styles[0] || '',
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
      <FormControl fullWidth variant='standard' sx={{ mb: 1, minWidth: 120 }}>
        <InputLabel>話者</InputLabel>
        <Select
          value={lines[currentIndex].speaker}
          onChange={(e) => setLineState({ speaker: e.target.value as string })}
        >
          {modelList
            .find((model) => model.name === lines[currentIndex].model)
            ?.speakers?.map((model, index) => (
              <MenuItem key={index} value={model}>
                {model}
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
        label='スタイルの強さ上限設定'
        value={styleWeightUB}
        setValue={(value) => setStyleWeightUB(value)}
        step={0.1}
        min={1}
        max={20}
      />
      <InputSlider
        label='スタイルの強さ（崩壊したら下げて）'
        value={lines[currentIndex].styleWeight}
        setValue={(value) => setLineState({ styleWeight: value })}
        step={0.1}
        min={0}
        max={styleWeightUB}
      />
      <InputSlider
        label='話速'
        value={lines[currentIndex].speed}
        setValue={(value) => setLineState({ speed: value })}
        step={0.05}
        min={0.5}
        max={2}
      />
      <InputSlider
        label='テンポの緩急'
        value={lines[currentIndex].sdpRatio}
        setValue={(value) => setLineState({ sdpRatio: value })}
        step={0.05}
        min={0}
        max={1}
      />
      <InputSlider
        label='Noise'
        value={lines[currentIndex].noise}
        setValue={(value) => setLineState({ noise: value })}
        step={0.05}
        min={0}
        max={1}
      />
      <InputSlider
        label='NoiseW'
        value={lines[currentIndex].noisew}
        setValue={(value) => setLineState({ noisew: value })}
        step={0.05}
        min={0}
        max={1}
      />
      <InputSlider
        label='音高(1以外では音質劣化)'
        value={lines[currentIndex].pitchScale}
        setValue={(value) => setLineState({ pitchScale: value })}
        step={0.05}
        min={0.7}
        max={1.3}
      />
      <InputSlider
        label='抑揚(1以外では音質劣化)'
        value={lines[currentIndex].intonationScale}
        setValue={(value) => setLineState({ intonationScale: value })}
        step={0.05}
        min={0.7}
        max={1.3}
      />
      <InputSlider
        label='次のテキストとの間の無音'
        value={lines[currentIndex].silenceAfter}
        setValue={(value) => setLineState({ silenceAfter: value })}
        step={0.05}
        min={0}
        max={1.5}
      />
    </Paper>
  );
}
