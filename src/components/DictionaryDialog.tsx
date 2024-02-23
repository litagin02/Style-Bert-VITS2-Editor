import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Slider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import { useState } from 'react';

import { usePopup } from '@/contexts/dialogContext';
import { fetchApi } from '@/utils/api';

import type { MoraTone } from './AccentEditor';
import AccentEditor from './AccentEditor';

export interface DictionaryDialogProps {
  open: boolean;
  onClose: () => void;
}

const marks = [
  {
    value: 0,
    label: '最低',
  },
  {
    value: 3,
    label: '低',
  },
  {
    value: 5,
    label: '標準',
  },
  {
    value: 7,
    label: '高',
  },
  {
    value: 10,
    label: '最高',
  },
];

export default function DictionaryDialog({
  open,
  onClose,
}: DictionaryDialogProps) {
  const [text, setText] = useState('');
  const [yomi, setYomi] = useState('');
  // **注意** moraToneList は最後に助詞「が」が追加されている
  const [moraToneList, setMoraToneList] = useState<MoraTone[]>([]);
  const [accentCore, setAccentCore] = useState(0);
  const [priority, setPriority] = useState(5);

  const [yomiError, setYomiError] = useState(false);

  const [fetched, setFetched] = useState(false);

  const { openPopup: openDialog } = usePopup();

  const convertToZenkaku = (text: string) => {
    text = text.replace(/\p{Z}/gu, () => '\u3000'); // 空白を全角スペースに変換
    return text.replace(/[\u0021-\u007e]/g, (s) => {
      return String.fromCharCode(s.charCodeAt(0) + 0xfee0); // 半角英数字等を全角英数字に変換
    });
  };

  const fetchAccent = async () => {
    setText(convertToZenkaku(text));
    setYomiError(false);
    const fetchedMoraTone = await fetchApi<MoraTone[]>('/g2p', {
      method: 'POST',
      body: JSON.stringify({ text: yomi + 'が' }),
    }).catch((e) => {
      console.error(e);
      setYomiError(true);
      return [];
    });
    // アクセント情報は使わず（アクセント核を1文字目に設定）、読み情報だけを更新する
    const newMoraTone: MoraTone[] = fetchedMoraTone.map((moraTone, index) => {
      return { ...moraTone, tone: index === 0 ? 1 : 0 };
    });

    setMoraToneList(newMoraTone);
    setAccentCore(0);
    // Remove last 'が' and join mora
    const newYomi = newMoraTone
      .slice(0, -1)
      .map((moraTone) => moraTone.mora)
      .join('');
    setYomi(newYomi);
    setFetched(true);
  };

  const handleAccentCoreChange = (newAccentCore: number) => {
    setAccentCore(newAccentCore);

    const newMoraToneList: MoraTone[] = moraToneList.map((moraTone, index) => {
      if (newAccentCore === 0) {
        return { ...moraTone, tone: index === 0 ? 1 : 0 };
      } else {
        return {
          ...moraTone,
          tone: index === 0 ? 0 : index <= newAccentCore ? 1 : 0,
        };
      }
    });
    setMoraToneList(newMoraToneList);
  };

  const handleRegister = async () => {
    // アクセント核位置は、1-indexedだが、最後の場合（アクセント核無し）は0にする
    const accentCoreNumber =
      accentCore === moraToneList.length - 1 ? 0 : accentCore + 1;
    const res = await fetchApi<{ message: string }>('/user_dict_word', {
      method: 'POST',
      body: JSON.stringify({
        surface: text,
        pronunciation: yomi,
        accentType: `${accentCoreNumber}/${moraToneList.length - 1}`,
        priority,
      }),
    }).catch((e) => {
      openDialog(`登録に失敗しました: ${e.message}`, 'error');
      return null;
    });
    if (!res) return;
    openDialog(`${res.message}`, 'success');
    handleClose();
  };

  const handleClose = () => {
    onClose();
    setText('');
    setYomi('');
    setMoraToneList([]);
    setAccentCore(0);
    setPriority(5);
    setFetched(false);
  };

  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle>ユーザー辞書登録</DialogTitle>
      <DialogContent>
        <Typography>
          まだ辞書の編集や削除は実装していないので、dict/user_dict.csvファイルから直接削除等をしてください。
        </Typography>
        <DialogContentText mb={2}>
          単語（名詞）の読みとアクセントを登録できます。正しいアクセント情報を登録するため、最後に助詞「が」が追加されています。
        </DialogContentText>
        <TextField
          autoFocus
          required
          label='単語（名詞）'
          fullWidth
          value={text}
          onChange={(e) => setText(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Grid container spacing={2} justifyContent='center' alignItems='center'>
          <Grid xs={9}>
            <TextField
              required
              label='読み（平仮名かカタカナ）'
              error={yomiError}
              helperText={
                yomiError ? '平仮名かカタカナのみで入力してください' : ''
              }
              fullWidth
              value={yomi}
              onChange={(e) => setYomi(e.target.value)}
              sx={{ mb: 2 }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  fetchAccent();
                }
              }}
            />
          </Grid>
          <Grid xs>
            <Button
              color='primary'
              variant='outlined'
              onClick={fetchAccent}
              startIcon={<RefreshIcon />}
              sx={{ mb: 2 }}
              fullWidth
            >
              情報取得
            </Button>
          </Grid>
        </Grid>
        <Stack>
          <FormControl>
            <FormLabel>アクセント位置</FormLabel>
            <RadioGroup
              row
              value={accentCore}
              onChange={(e) => handleAccentCoreChange(Number(e.target.value))}
              sx={{ flexWrap: 'nowrap', overflow: 'auto' }}
            >
              {moraToneList.map((moraTone, index) => (
                <FormControlLabel
                  key={index}
                  value={index}
                  control={<Radio />}
                  label={moraTone.mora}
                  labelPlacement='bottom'
                  sx={{ mx: 0 }}
                />
              ))}
            </RadioGroup>
          </FormControl>
          <AccentEditor moraToneList={moraToneList} disabled />
          <Typography sx={{ mt: 1 }}>優先度</Typography>
          <Box sx={{ textAlign: 'center' }}>
            <Slider
              value={priority}
              onChange={(_, newValue) => setPriority(newValue as number)}
              marks={marks}
              step={1}
              min={0}
              max={10}
              sx={{
                mt: 2,
                width: '80%',
              }}
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>キャンセル</Button>
        <Button
          type='submit'
          variant='contained'
          onClick={handleRegister}
          disabled={!fetched}
        >
          登録
        </Button>
      </DialogActions>
    </Dialog>
  );
}
