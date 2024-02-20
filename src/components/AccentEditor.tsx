'use client';

import {
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Typography,
  Paper,
} from '@mui/material';

import type { MoraTone } from './TTSContainer';

interface MoraToneToggleProps {
  moraTone: MoraTone;
  onChange: (tone: 0 | 1) => void;
  visible?: boolean;
}

function MoraToneToggle({
  moraTone: { mora, tone },
  onChange,
  visible = true,
}: MoraToneToggleProps) {
  const handleChange = (_: React.MouseEvent<HTMLElement>, newTone: 0 | 1) => {
    if (newTone !== null) {
      onChange(newTone);
    }
  };

  return (
    <Stack
      direction='column'
      spacing={1}
      sx={{ textAlign: 'center', visibility: visible ? 'visible' : 'hidden' }}
    >
      <Typography>{mora}</Typography>
      <ToggleButtonGroup
        exclusive
        color='primary'
        orientation='vertical'
        value={tone}
        onChange={handleChange}
      >
        <ToggleButton value={1}>高</ToggleButton>
        <ToggleButton value={0}>低</ToggleButton>
      </ToggleButtonGroup>
    </Stack>
  );
}

interface AccentEditorProps {
  moraToneList: MoraTone[];
  setMoraToneList: (moraToneList: MoraTone[]) => void;
}

export default function AccentEditor({
  moraToneList,
  setMoraToneList,
}: AccentEditorProps) {
  // ダミーのデータを定義
  const dummyMoraToneList: MoraTone[] = [{ mora: 'ア', tone: 0 }];

  // 実際にレンダリングするリストを決定
  const displayList =
    moraToneList && moraToneList.length > 0 ? moraToneList : dummyMoraToneList;

  const handleChange = (tone: 0 | 1, index: number) => {
    const newKataToneList = [...moraToneList];
    newKataToneList[index] = { ...newKataToneList[index], tone };
    setMoraToneList(newKataToneList);
  };
  return (
    <Paper sx={{ p: 1, mt: 2 }}>
      <Stack
        spacing={1}
        direction='row'
        sx={{ maxWidth: '100%', overflow: 'auto' }}
      >
        {displayList.map((moraTone, index) => (
          <MoraToneToggle
            key={index}
            moraTone={moraTone}
            onChange={(tone) => handleChange(tone, index)}
            visible={moraToneList && moraToneList.length > 0}
          />
        ))}
      </Stack>
    </Paper>
  );
}
