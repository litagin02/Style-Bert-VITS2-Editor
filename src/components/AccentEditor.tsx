'use client';

import {
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';

export interface MoraTone {
  mora: string; // katakana
  tone: 0 | 1; // 0: low, 1: high
}

interface MoraToneToggleProps {
  moraTone: MoraTone;
  onChange: (tone: 0 | 1) => void;
  visible?: boolean;
  disabled?: boolean;
}

function MoraToneToggle({
  moraTone: { mora, tone },
  onChange,
  visible = true,
  disabled = false,
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
        disabled={disabled}
      >
        <ToggleButton value={1}>高</ToggleButton>
        <ToggleButton value={0}>低</ToggleButton>
      </ToggleButtonGroup>
    </Stack>
  );
}

interface AccentEditorProps {
  moraToneList: MoraTone[];
  setMoraToneList?: (moraToneList: MoraTone[]) => void;
  onChange?: (tone: 0 | 1, index: number) => void;
  disabled?: boolean;
}

export default function AccentEditor({
  moraToneList,
  setMoraToneList,
  onChange,
  disabled = false,
}: AccentEditorProps) {
  // ダミーのデータを定義
  const dummyMoraToneList: MoraTone[] = [{ mora: 'ア', tone: 0 }];

  // 実際にレンダリングするリストを決定
  const displayList =
    moraToneList && moraToneList.length > 0 ? moraToneList : dummyMoraToneList;

  const handleChange = (tone: 0 | 1, index: number) => {
    if (onChange) {
      onChange(tone, index);
      return;
    }
    if (!setMoraToneList) {
      return;
    }
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
            disabled={disabled}
          />
        ))}
      </Stack>
    </Paper>
  );
}
