import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import { saveAs } from 'file-saver';
import { useEffect, useState } from 'react';

import AccentEditor from '@/components/AccentEditor';
import { useDialog } from '@/contexts/dialogContext';
import useWindowSize from '@/hooks/useWindowSize';
import { fetchApi } from '@/utils/api';

import type { MoraTone } from './AccentEditor';
import DictionaryDialog from './DictionaryDialog';
import SimpleBackdrop from './SimpleBackdrop';
import TTSSetting from './TTSSetting';

export interface ModelInfo {
  name: string;
  files: string[];
  styles: string[];
}

export interface EditorState {
  text: string;
  model: string;
  modelFile: string;
  style: string;
  moraToneList: MoraTone[];
  accentModified: boolean;
  styleWeight: number;
  speed: number;
  sdpRatio: number;
  noise: number;
  noisew: number;
}

const defaultEditorState: EditorState = {
  text: '',
  model: '',
  modelFile: '',
  style: '',
  moraToneList: [],
  accentModified: false,
  styleWeight: 5,
  speed: 1,
  sdpRatio: 0.2,
  noise: 0.6,
  noisew: 0.8,
};

// Validation
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isMoraTone(data: any): data is MoraTone {
  return typeof data.mora === 'string' && (data.tone === 0 || data.tone === 1);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isEditorState(data: any): data is EditorState {
  return (
    typeof data.text === 'string' &&
    typeof data.model === 'string' &&
    typeof data.modelFile === 'string' &&
    typeof data.style === 'string' &&
    Array.isArray(data.moraToneList) &&
    data.moraToneList.every(isMoraTone) &&
    typeof data.accentModified === 'boolean' &&
    typeof data.styleWeight === 'number' &&
    typeof data.speed === 'number' &&
    typeof data.sdpRatio === 'number' &&
    typeof data.noise === 'number' &&
    typeof data.noisew === 'number'
  );
}

export default function TTSContainer() {
  const [modelList, setModelList] = useState<ModelInfo[]>([]);
  const [editors, setEditors] = useState<EditorState[]>([defaultEditorState]);
  const [currentEditorIndex, setCurrentEditorIndex] = useState(0);

  const { openDialog } = useDialog();

  const [audioUrl, setAudioUrl] = useState('');
  const [openBackdrop, setOpenBackdrop] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dictOpen, setDictOpen] = useState(false);

  const { height } = useWindowSize();

  const addEditor = () => {
    setEditors([
      ...editors,
      {
        ...editors[currentEditorIndex],
        text: '',
        moraToneList: [],
        accentModified: false,
      },
    ]);
  };

  const setEditorState = (newState: Partial<EditorState>) => {
    const newEditors = editors.map((editor, index) => {
      if (index === currentEditorIndex) {
        return {
          ...editor,
          ...newState,
        };
      }
      return editor;
    });
    setEditors(newEditors);
  };

  useEffect(() => {
    setOpenBackdrop(true);
    fetchApi<ModelInfo[]>('/models_info')
      .then((data) => {
        setModelList(data);
        console.log(data);
        console.log(data[0].name);
        setEditors([
          {
            ...defaultEditorState,
            model: data[0].name || '',
            modelFile: data[0].files[0] || '',
            style: data[0].styles[0] || '',
          },
        ]);
      })
      .catch((e) => {
        console.error(e);
        // openDialog(`モデル情報の取得に失敗しました。\n${e}`);
      })
      .finally(() => {
        setOpenBackdrop(false);
      });
  }, []);

  const fetchMoraTonePromise = async (): Promise<MoraTone[]> => {
    return fetchApi<MoraTone[]>('/g2p', {
      method: 'POST',
      body: JSON.stringify({ text: editors[currentEditorIndex].text }),
    });
  };

  const handleTextChange = (newText: string) => {
    setEditorState({ text: newText, moraToneList: [], accentModified: false });
  };

  const handleSynthesize = async () => {
    setLoading(true);
    const newMoraToneList = editors[currentEditorIndex].accentModified
      ? editors[currentEditorIndex].moraToneList
      : await fetchMoraTonePromise();
    setEditorState({ moraToneList: newMoraToneList });
    const {
      model,
      modelFile,
      text,
      style,
      styleWeight,
      speed,
      sdpRatio,
      noise,
      noisew,
    } = editors[currentEditorIndex];
    await fetchApi<Blob>(
      '/synthesis',
      {
        method: 'POST',
        body: JSON.stringify({
          model,
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
        openDialog(`音声合成に失敗しました。\n${e}`);
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

  const handleDelete = (editorIndex: number) => {
    setEditors([
      ...editors.slice(0, editorIndex),
      ...editors.slice(editorIndex + 1),
    ]);
    if (editorIndex <= currentEditorIndex && currentEditorIndex > 0) {
      setCurrentEditorIndex(currentEditorIndex - 1);
    }
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // 保存ボタンのクリックイベントハンドラ
  const handleSave = () => {
    handleMenuClose();
    const json = JSON.stringify(editors);
    const blob = new Blob([json], { type: 'application/json' });
    saveAs(blob, 'project.json');
  };

  const handleLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleMenuClose();

    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        try {
          const data: EditorState[] = JSON.parse(content);
          console.log(data);
          if (!Array.isArray(data) || !data.every(isEditorState)) {
            console.error('データがEditorState[]型と一致しません。');
            openDialog('データが有効な形式ではありません。');
            return;
          }
          setEditors(data);
          setCurrentEditorIndex(0);
        } catch (e) {
          console.error(e);
          openDialog(`プロジェクトの読み込みに失敗しました。\n${e}`);
        }
      } else {
        console.error('typeof content', typeof content);
        openDialog('ファイルの読み込みに失敗しました。');
      }
    };

    reader.readAsText(file);
  };

  return (
    <>
      <AppBar position='static'>
        <Toolbar>
          <Button
            size='large'
            onClick={handleMenuOpen}
            color='inherit'
            sx={{ mr: 2 }}
          >
            ファイル
          </Button>
          <Typography
            variant='h6'
            // 中央に表示
            sx={{ flexGrow: 1, textAlign: 'center' }}
          >
            Style-Bert-VITS2 エディター
          </Typography>
          <Menu
            id='menu-appbar'
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleSave}>プロジェクトの保存</MenuItem>
            <MenuItem component='label'>
              プロジェクトの読み込み
              <input type='file' onChange={handleLoad} hidden />
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Grid container spacing={2} mt={1}>
        <Grid xs={8}>
          <Paper
            sx={{ p: 2, height: height / 2, overflow: 'auto' }}
            elevation={2}
          >
            {editors.map((editor, index) => (
              <Grid
                container
                key={index}
                spacing={1}
                mt={2}
                sx={{
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  // ホバーしたときに削除ボタンを表示
                  '& .delete-button': {
                    display: 'none',
                  },
                  '&:hover .delete-button': {
                    display: 'block',
                  },
                }}
              >
                <Grid xs>
                  <TextField
                    label={`テキスト${index + 1}`}
                    fullWidth
                    value={editor.text}
                    onFocus={() => setCurrentEditorIndex(index)}
                    onChange={(e) => handleTextChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    variant={
                      index === currentEditorIndex ? 'filled' : 'outlined'
                    }
                  />
                </Grid>
                <Grid xs='auto'>
                  <IconButton
                    disabled={editors.length === 1}
                    onClick={() => handleDelete(index)}
                    className='delete-button'
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
            <Button
              variant='outlined'
              startIcon={<AddIcon />}
              onClick={addEditor}
              sx={{ mt: 2 }}
            >
              テキスト追加
            </Button>
          </Paper>
          <AccentEditor
            moraToneList={editors[currentEditorIndex].moraToneList}
            setMoraToneList={(moraToneList) =>
              setEditorState({ moraToneList, accentModified: true })
            }
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
          <TTSSetting
            modelList={modelList}
            editors={editors}
            currentIndex={currentEditorIndex}
            setEditors={setEditors}
          />
          <Button onClick={() => setDictOpen(true)}>辞書登録</Button>
        </Grid>
      </Grid>
      <SimpleBackdrop open={openBackdrop} />
      <DictionaryDialog open={dictOpen} onClose={() => setDictOpen(false)} />
    </>
  );
}
