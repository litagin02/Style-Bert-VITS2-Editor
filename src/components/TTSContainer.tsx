import { useState, useEffect } from 'react';

import {
  Button,
  CircularProgress,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Paper,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2

import SimpleBackdrop from './SimpleBackdrop';

import AccentEditor from '@/components/AccentEditor';
import ModelSelector from '@/components/ModelSelector';
import TextEditor from '@/components/TextEditor';
import { fetchApi } from '@/utils/api';
export interface ModelInfo {
  name: string;
  files: string[];
  styles: string[];
}

export interface MoraTone {
  mora: string; // katakana
  tone: 0 | 1; // 0: low, 1: high
}

export default function TTSContainer() {
  const [modelList, setModelList] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [modelFile, setModelFile] = useState('');
  const [style, setStyle] = useState('');

  const [text, setText] = useState('');
  const [moraToneList, setMoraToneList] = useState<MoraTone[]>([]);
  const [accentModified, setAccentModified] = useState(false);

  const [styleWeight, setStyleWeight] = useState(5.0);
  const [speed, setSpeed] = useState(1.0);
  const [sdpRatio, setSdpRatio] = useState(0.2);
  const [noise, setNoise] = useState(0.6);
  const [noisew, setNoisew] = useState(0.8);

  const [audioUrl, setAudioUrl] = useState('');
  const [openBackdrop, setOpenBackdrop] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setOpenBackdrop(true);
    fetchApi<ModelInfo[]>('/models_info')
      .then((data) => {
        setModelList(data);
        setSelectedModel(data[0].name);
        setModelFile(data[0].files[0] || '');
        setStyle(data[0].styles[0] || '');
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        setOpenBackdrop(false);
      });
  }, []);

  const handleModelChange = (model: string) => {
    const selected = modelList?.find((m) => m.name === model);
    setSelectedModel(model);
    setModelFile(selected?.files[0] || '');
    setStyle(selected?.styles[0] || '');
  };

  const fetchMoraTonePromise = async (): Promise<MoraTone[]> => {
    return fetchApi<MoraTone[]>('/g2p', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  };

  const handleTextChange = (newText: string) => {
    setText(newText);
    setMoraToneList([]);
    setAccentModified(false);
  };

  const handleSynthesize = async () => {
    setLoading(true);
    const newMoraToneList = accentModified
      ? moraToneList
      : await fetchMoraTonePromise();
    setMoraToneList(newMoraToneList);
    console.log('newMoraTone', newMoraToneList);
    await fetchApi<Blob>(
      '/synthesis',
      {
        method: 'POST',
        body: JSON.stringify({
          model: selectedModel,
          modelFile,
          text,
          moraToneList: newMoraToneList,
          style,
          styleWeight,
          length: 1 / speed,
          sdpRatio,
          noise,
          noisew,
        }),
      },
      'blob',
    )
      .then((data) => {
        const newAudioUrl = URL.createObjectURL(data);
        setAudioUrl(newAudioUrl);
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      handleSynthesize();
    }
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid xs={8}>
          <ModelSelector
            modelList={modelList || []}
            model={selectedModel}
            setModel={handleModelChange}
            modelFile={modelFile}
            setModelFile={setModelFile}
            style={style}
            setStyle={setStyle}
          />
          <TextEditor
            text={text}
            setText={handleTextChange}
            onKeyDown={handleKeyDown}
          />
          <AccentEditor
            moraToneList={moraToneList || []}
            setMoraToneList={(data) => {
              setMoraToneList(data);
              setAccentModified(true);
            }}
          />
          <Box
            mt={2}
            sx={{
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Button
              variant='contained'
              color='primary'
              disabled={loading}
              onClick={handleSynthesize}
            >
              音声合成
            </Button>
            {loading && (
              <CircularProgress
                size={24}
                sx={{
                  position: 'absolute',
                }}
              />
            )}
          </Box>
          {audioUrl && !loading && <audio src={audioUrl} controls autoPlay />}
        </Grid>
        <Grid xs={4}>
          <Paper sx={{ p: 2 }}>
            <FormControl
              fullWidth
              variant='standard'
              sx={{ mt: 1, mb: 2, minWidth: 120 }}
            >
              <InputLabel>スタイル</InputLabel>
              <Select value={style} onChange={(e) => setStyle(e.target.value)}>
                {modelList
                  .find((speaker) => speaker.name === selectedModel)
                  ?.styles.map((style, index) => (
                    <MenuItem key={index} value={style}>
                      {style}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <Typography gutterBottom>スタイルの強さ: {styleWeight}</Typography>
            <Slider
              step={0.1}
              min={0}
              max={50}
              value={styleWeight}
              onChange={(_, value) => setStyleWeight(value as number)}
            />
            <Typography gutterBottom>話速: {speed}</Typography>
            <Slider
              step={0.1}
              min={0.5}
              max={2}
              value={speed}
              onChange={(_, value) => setSpeed(value as number)}
            />
            <Typography gutterBottom>テンポの緩急: {sdpRatio}</Typography>
            <Slider
              step={0.1}
              min={0}
              max={1}
              value={sdpRatio}
              onChange={(_, value) => setSdpRatio(value as number)}
            />
            <Typography gutterBottom>Noise: {noise}</Typography>
            <Slider
              step={0.1}
              min={0}
              max={1}
              value={noise}
              onChange={(_, value) => setNoise(value as number)}
            />
            <Typography gutterBottom>NoiseW: {noisew}</Typography>
            <Slider
              step={0.1}
              min={0}
              max={1}
              value={noisew}
              onChange={(_, value) => setNoisew(value as number)}
            />
          </Paper>
        </Grid>
      </Grid>
      <SimpleBackdrop open={openBackdrop} />
    </>
  );
}
