// TODO: Refactor, 長い
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Radio,
  RadioGroup,
  Slider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import { useEffect, useState } from 'react';

import { usePopup } from '@/contexts/PopupProvider';
import { fetchApi } from '@/utils/api';

import type { MoraTone } from './AccentEditor';
import AccentEditor from './AccentEditor';

interface UserDictWord {
  surface: string;
  pronunciation: string;
  // 1-indexedだがアクセント核がない場合は0。json辞書のキーと合わせるためにsnake_caseにしている
  accent_type: number;
  priority: number;
}

interface UserDict {
  [uuid: string]: UserDictWord;
}

interface UserDictElement {
  uuid: string;
  word: UserDictWord;
}

// UserDictElementと等価だがUI上での使いやすい形式
// moraToneListは最後に助詞「ガ」を含むが、pronunciationは助詞「ガ」を含まない
interface WordState {
  uuid: string;
  surface: string;
  pronunciation: string;
  moraToneList: MoraTone[];
  accentIndex: number; // 0-indexedで高→低となる最後の高の添字
  priority: number;
}

const defaultWordState: WordState = {
  uuid: '',
  surface: '',
  pronunciation: '',
  moraToneList: [{ mora: 'ガ', tone: 0 }],
  accentIndex: 0,
  priority: 5,
};

// カタカナのみで構成された文字列をモーラに分割する
// 参考：https://github.com/VOICEVOX/voicevox_engine/blob/f181411ec69812296989d9cc583826c22eec87ae/voicevox_engine/model.py#L270
function extractMorae(pronunciation: string): string[] {
  const ruleOthers =
    '[イ][ェ]|[ヴ][ャュョ]|[トド][ゥ]|[テデ][ィャュョ]|[デ][ェ]|[クグ][ヮ]';
  const ruleLineI = '[キシチニヒミリギジビピ][ェャュョ]';
  const ruleLineU = '[ツフヴ][ァ]|[ウスツフヴズ][ィ]|[ウツフヴ][ェォ]';
  const ruleOneMora = '[ァ-ヴー]';

  const pattern = new RegExp(
    `${ruleOthers}|${ruleLineI}|${ruleLineU}|${ruleOneMora}`,
    'g',
  );

  return pronunciation.match(pattern) || [];
}

function wordStateToUserDictElement(state: WordState): UserDictElement {
  return {
    uuid: state.uuid,
    word: {
      surface: state.surface,
      pronunciation: state.pronunciation,
      accent_type:
        state.accentIndex === state.moraToneList.length - 1
          ? 0
          : state.accentIndex + 1,
      priority: state.priority,
    },
  };
}

function userDictElementToWordState(elem: UserDictElement): WordState {
  const moraToneList = wordToMoraToneList(elem.word);
  return {
    uuid: elem.uuid,
    surface: elem.word.surface,
    pronunciation: elem.word.pronunciation,
    moraToneList,
    accentIndex:
      elem.word.accent_type === 0
        ? moraToneList.length - 1 // 助詞「ガ」を除く
        : elem.word.accent_type - 1,
    priority: elem.word.priority,
  };
}

function wordToMoraToneList(word: UserDictWord): MoraTone[] {
  // 最後に助詞「ガ」が追加されたものを使用する
  const moraToneList: MoraTone[] = [];
  const morae = extractMorae(word.pronunciation);
  const accentIndex =
    word.accent_type === 0 ? morae.length : word.accent_type - 1;
  for (let i = 0; i < morae.length; i++) {
    const mora = morae[i];
    const tone =
      i === 0 && word.accent_type === 1 ? 1 : i > 0 && i <= accentIndex ? 1 : 0;
    moraToneList.push({ mora, tone });
  }
  moraToneList.push({ mora: 'ガ', tone: word.accent_type === 0 ? 1 : 0 });
  return moraToneList;
}

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
  const [isNew, setIsNew] = useState(true);

  // 現在の辞書の情報
  const [dict, setDict] = useState<UserDict>({});

  // 右側に表示する単語の情報
  const [wordState, setWordState] = useState<WordState>(defaultWordState);
  const { surface, pronunciation, moraToneList, accentIndex, priority } =
    wordState;

  const [pronunciationError, setPronunciationError] = useState(false);

  const [fetched, setFetched] = useState(false);

  const { openPopup } = usePopup();

  useEffect(() => {
    const fetchDict = async () => {
      const res = await fetchApi<UserDict>('/user_dict');
      setDict(res);
    };
    fetchDict();
  }, []);

  const handleNewItemClick = () => {
    setIsNew(true);
    setWordState(defaultWordState);
    setFetched(false);
  };

  // 単語を正規化、読みに入力された文字からg2pを叩いてモーラを取得
  // 音声合成や学習には正規化された文字列が使われるため、辞書でもそれを登録する必要がある
  const fetchNormMora = async () => {
    setPronunciationError(false);

    // 単語を正規化。`/normalize`を叩く
    const fetchedSurface = await fetchApi<string>('/normalize', {
      method: 'POST',
      body: JSON.stringify({ text: surface }),
    }).catch((e) => {
      console.error(e);
      openPopup('正規化に失敗しました', 'error');
      return surface;
    });

    const fetchedMoraTone = await fetchApi<MoraTone[]>('/g2p', {
      method: 'POST',
      body: JSON.stringify({ text: pronunciation + 'が' }),
    }).catch((e) => {
      console.error(e);
      setPronunciationError(true);
      return [];
    });
    // アクセント情報は使わず（アクセント核を1文字目に設定）、読み情報だけを更新する
    const newMoraTone: MoraTone[] = fetchedMoraTone.map((moraTone, index) => {
      return { ...moraTone, tone: index === 0 ? 1 : 0 };
    });
    // Remove last 'が' and join mora
    const newPronunciation = newMoraTone
      .slice(0, -1)
      .map((moraTone) => moraTone.mora)
      .join('');
    setWordState({
      ...wordState,
      surface: fetchedSurface,
      moraToneList: newMoraTone,
      accentIndex: 0,
      pronunciation: newPronunciation,
    });
    setFetched(true);
  };

  const handleAccentIndexChange = (newAccentIndex: number) => {
    const newMoraToneList: MoraTone[] = moraToneList.map((moraTone, index) => ({
      ...moraTone,
      tone:
        newAccentIndex === 0
          ? index === 0
            ? 1
            : 0
          : index === 0
            ? 0
            : index <= newAccentIndex
              ? 1
              : 0,
    }));
    setWordState({
      ...wordState,
      accentIndex: newAccentIndex,
      moraToneList: newMoraToneList,
    });
  };

  const handleRegister = async () => {
    if (!surface || !pronunciation) {
      openPopup('単語と読みを入力してください', 'error');
      return;
    }
    const elem = wordStateToUserDictElement(wordState);
    const res = await fetchApi<{ uuid: string }>('/user_dict_word', {
      method: 'POST',
      body: JSON.stringify(elem.word),
    }).catch((e) => {
      openPopup(`登録に失敗しました: ${e}`, 'error');
    });
    if (!res) return;
    openPopup('登録しました', 'success', 3000);
    setDict({
      ...dict,
      [res.uuid]: elem.word,
    });
    setWordState({ ...wordState, uuid: res.uuid });
    setIsNew(false);
  };

  const handleUpdate = async () => {
    if (!surface || !pronunciation) {
      openPopup('単語と読みを入力してください', 'error');
      return;
    }
    const elem = wordStateToUserDictElement(wordState);
    const res = await fetchApi<{ uuid: string }>(
      `/user_dict_word/${elem.uuid}`,
      {
        method: 'PUT',
        body: JSON.stringify(elem.word),
      },
    ).catch((e) => {
      openPopup(`更新に失敗しました: ${e}`, 'error');
    });
    if (!res) return;
    openPopup('更新しました', 'success', 3000);
    setDict({
      ...dict,
      [elem.uuid]: elem.word,
    });
  };

  const handleDelete = async () => {
    const elem = wordStateToUserDictElement(wordState);
    const res = await fetchApi<{ uuid: number }>(
      `/user_dict_word/${elem.uuid}`,
      {
        method: 'DELETE',
      },
    ).catch((e) => {
      openPopup(`削除に失敗しました: ${e}`, 'error');
    });
    if (!res) return;
    openPopup('削除しました', 'success', 3000);
    const newDict = { ...dict };
    delete newDict[elem.uuid];
    setDict(newDict);
    setWordState(defaultWordState);
    setIsNew(true);
  };

  const handleClose = () => {
    onClose();
    setWordState(defaultWordState);
    setFetched(false);
    setPronunciationError(false);
    setIsNew(true);
  };

  return (
    <Dialog onClose={onClose} open={open} fullWidth maxWidth='md'>
      <DialogTitle>ユーザー辞書</DialogTitle>
      <Box display='flex' justifyContent='space-between' height={600}>
        <Box
          minWidth={200}
          pb={2}
          px={2}
          border={1}
          borderColor='divider'
          borderRadius={1}
        >
          <List>
            <ListItem disablePadding>
              <ListItemButton
                onClick={handleNewItemClick}
                selected={isNew}
                sx={{ justifyContent: 'center' }}
              >
                <ListItemIcon>
                  <AddIcon />
                </ListItemIcon>
                <ListItemText primary='新規登録' />
              </ListItemButton>
            </ListItem>
          </List>
          <Divider />
          <List sx={{ overflow: 'auto', height: '90%' }}>
            {Object.keys(dict).map((key) => (
              <ListItem key={key} disablePadding>
                <ListItemButton
                  onClick={() => {
                    console.log(wordToMoraToneList(dict[key]));
                    setWordState(
                      userDictElementToWordState({
                        uuid: key,
                        word: dict[key],
                      }),
                    );
                    console.log(
                      userDictElementToWordState({
                        uuid: key,
                        word: dict[key],
                      }),
                    );
                    setIsNew(false);
                  }}
                  selected={key === wordState.uuid}
                >
                  <ListItemText primary={dict[key].surface} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          {/* <Fab
            color='primary'
            // size='small'
            // variant='extended'
            sx={{ position: 'absolute', top: 0, right: 0 }}
            onClick={handleNewItemClick}
          >
            <AddIcon />
          </Fab> */}
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <DialogContent>
            <TextField
              autoFocus
              required
              label='単語（名詞）（自動的に正規化される）'
              fullWidth
              value={surface}
              onChange={(e) =>
                setWordState({ ...wordState, surface: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <Grid
              container
              spacing={2}
              justifyContent='center'
              alignItems='center'
            >
              <Grid xs={9}>
                <TextField
                  required
                  label='読み（平仮名かカタカナ）'
                  error={pronunciationError}
                  helperText={
                    pronunciationError
                      ? '平仮名かカタカナのみで入力してください'
                      : ''
                  }
                  fullWidth
                  value={pronunciation}
                  onChange={(e) => {
                    setWordState({
                      ...wordState,
                      pronunciation: e.target.value,
                    });
                    setFetched(false);
                  }}
                  sx={{ mb: 2 }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      fetchNormMora();
                    }
                  }}
                />
              </Grid>
              <Grid xs>
                <Button
                  color='primary'
                  variant='outlined'
                  onClick={fetchNormMora}
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
                <FormLabel>
                  アクセント位置（最後に助詞「が」が追加されています）
                </FormLabel>
                <RadioGroup
                  row
                  value={accentIndex}
                  onChange={(e) =>
                    handleAccentIndexChange(Number(e.target.value))
                  }
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
                  onChange={(_, newValue) => {
                    setWordState({
                      ...wordState,
                      priority: newValue as number,
                    });
                  }}
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
          <Stack direction='row' spacing={2} justifyContent='space-around'>
            {isNew && (
              <Button
                type='submit'
                variant='outlined'
                onClick={handleRegister}
                disabled={!fetched}
              >
                登録
              </Button>
            )}
            {!isNew && (
              <>
                <Button
                  type='submit'
                  variant='outlined'
                  onClick={handleUpdate}
                  startIcon={<RefreshIcon />}
                >
                  更新
                </Button>
                <Button
                  type='submit'
                  variant='outlined'
                  onClick={handleDelete}
                  startIcon={<DeleteIcon />}
                >
                  削除
                </Button>
              </>
            )}
            <Button onClick={handleClose}>閉じる</Button>
          </Stack>
        </Box>
      </Box>
    </Dialog>
  );
}
