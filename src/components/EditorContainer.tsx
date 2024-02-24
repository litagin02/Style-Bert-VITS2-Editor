// TODO: コンポーネントを分割してリファクタリングする
import AddIcon from '@mui/icons-material/Add';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DeleteIcon from '@mui/icons-material/Delete';
import MenuIcon from '@mui/icons-material/Menu';
import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  Divider,
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
import { usePopup } from '@/contexts/PopupProvider';
import useWindowSize from '@/hooks/useWindowSize';
import { fetchApi } from '@/utils/api';

import type { MoraTone } from './AccentEditor';
import DictionaryDialog from './DictionaryDialog';
import LineSetting from './LineSetting';
import SimpleBackdrop from './SimpleBackdrop';

export interface ModelInfo {
  name: string;
  files: string[];
  styles: string[];
}

export interface LineState {
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
  pitchScale: number;
  intonationScale: number;
  silenceAfter: number;
}

export const defaultLineState: LineState = {
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
  pitchScale: 1,
  intonationScale: 1,
  silenceAfter: 0.5,
};

// Validation
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isMoraTone(data: any): data is MoraTone {
  return typeof data.mora === 'string' && (data.tone === 0 || data.tone === 1);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isLineState(data: any): data is LineState {
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
    typeof data.noisew === 'number' &&
    typeof data.silenceAfter === 'number' &&
    typeof data.pitchScale === 'number' &&
    typeof data.intonationScale === 'number'
  );
}

export default function EditorContainer() {
  const [modelList, setModelList] = useState<ModelInfo[]>([]);

  const [lines, setLines] = useState<LineState[]>([defaultLineState]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  const { openPopup } = usePopup();

  const [audioUrl, setAudioUrl] = useState('');
  const [openBackdrop, setOpenBackdrop] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dictOpen, setDictOpen] = useState(false);

  const [version, setVersion] = useState('');

  const { height } = useWindowSize();

  useEffect(() => {
    // 初期のモデル情報取得
    setOpenBackdrop(true);

    let retryCount = 0;
    const maxRetries = 10;
    const retryInterval = 1000; // 1秒
    let timeoutId: NodeJS.Timeout;

    const fetchData = () => {
      fetchApi<ModelInfo[]>('/models_info')
        .then((data) => {
          setModelList(data);
          setLines([
            {
              ...defaultLineState,
              model: data[0].name || '',
              modelFile: data[0].files[0] || '',
              style: data[0].styles[0] || '',
            },
          ]);
          setOpenBackdrop(false);
        })
        .catch((e) => {
          if (retryCount < maxRetries) {
            console.log(e);
            retryCount++;
            console.log(
              `モデル情報の取得に失敗しました。リトライします。${retryCount}回目...`,
            );
            timeoutId = setTimeout(fetchData, retryInterval);
          } else {
            console.log(
              `モデル情報の取得に失敗しました。リトライ回数: ${retryCount}`,
            );
            console.log(e);
            openPopup(`モデル情報の取得に失敗しました。\n${e}`);
            setOpenBackdrop(false);
          }
        });
    };

    fetchData();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [openPopup]);

  useEffect(() => {
    // 初回のバージョン取得
    let retryCount = 0;
    const maxRetries = 10;
    const retryInterval = 1000; // 1秒
    let timeoutId: NodeJS.Timeout;

    const fetchVersion = () => {
      fetchApi<string>('/version')
        .then((data) => {
          setVersion(data);
        })
        .catch((e) => {
          if (retryCount < maxRetries) {
            console.log(e);
            retryCount++;
            console.log(
              `バージョン情報の取得に失敗しました。リトライします。${retryCount}回目...`,
            );
            timeoutId = setTimeout(fetchVersion, retryInterval);
          } else {
            console.log(
              `バージョン情報の取得に失敗しました。リトライ回数: ${retryCount}`,
            );
            console.log(e);
          }
        });
    };

    fetchVersion();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const addLine = () => {
    setLines([
      ...lines,
      {
        ...lines[lines.length - 1],
        text: '',
        moraToneList: [],
        accentModified: false,
      },
    ]);
    setCurrentLineIndex(lines.length);
  };

  const setLineState = (newState: Partial<LineState>) => {
    const newLines = lines.map((line, index) => {
      if (index === currentLineIndex) {
        return {
          ...line,
          ...newState,
        };
      }
      return line;
    });
    setLines(newLines);
  };

  const fetchMoraTonePromise = async (): Promise<MoraTone[]> => {
    return fetchApi<MoraTone[]>('/g2p', {
      method: 'POST',
      body: JSON.stringify({ text: lines[currentLineIndex].text }),
    });
  };

  const handleTextChange = (newText: string) => {
    setLineState({ text: newText, moraToneList: [], accentModified: false });
  };

  const handleSynthesis = async () => {
    setLoading(true);
    const newMoraToneList = lines[currentLineIndex].accentModified
      ? lines[currentLineIndex].moraToneList
      : await fetchMoraTonePromise();
    setLineState({ moraToneList: newMoraToneList });
    const newLine = {
      ...lines[currentLineIndex],
      moraToneList: newMoraToneList,
    };
    await fetchApi<Blob>(
      '/synthesis',
      {
        method: 'POST',
        body: JSON.stringify(newLine),
      },
      'blob',
    )
      .then((data) => {
        const newAudioUrl = URL.createObjectURL(data);
        setAudioUrl(newAudioUrl);
      })
      .catch((e) => {
        console.error(e);
        openPopup(`音声合成に失敗しました。${e}`);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleMultiSynthesis = async () => {
    setLoading(true);
    // すべてのテキストに対して未取得な読み・アクセント情報を取得
    const newMoraToneList = await Promise.all(
      lines.map(async (line) => {
        if (line.accentModified) {
          return line.moraToneList;
        }
        return await fetchApi<MoraTone[]>('/g2p', {
          method: 'POST',
          body: JSON.stringify({ text: line.text }),
        });
      }),
    );
    const newLines = lines.map((line, index) => ({
      ...line,
      moraToneList: newMoraToneList[index],
    }));
    setLines(newLines);

    await fetchApi<Blob>(
      '/multi_synthesis',
      {
        method: 'POST',
        body: JSON.stringify({
          lines: newLines,
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
        openPopup(`音声合成に失敗しました。${e}`);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      handleSynthesis();
    }
  };

  const handleDelete = (lineIndex: number) => {
    setLines([...lines.slice(0, lineIndex), ...lines.slice(lineIndex + 1)]);
    if (lineIndex <= currentLineIndex && currentLineIndex > 0) {
      setCurrentLineIndex(currentLineIndex - 1);
    }
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSave = () => {
    const json = JSON.stringify(lines, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    saveAs(blob, 'project.json');
    handleMenuClose();
  };

  const handleLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleMenuClose();
    setCurrentLineIndex(0);

    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        try {
          const data: LineState[] = JSON.parse(content);
          if (!Array.isArray(data) || !data.every(isLineState)) {
            console.error('データがLineState[]型と一致しません。');
            openPopup('データが有効な形式ではありません。');
            return;
          }
          setLines(data);
        } catch (e) {
          console.error(e);
          openPopup(`プロジェクトの読み込みに失敗しました。${e}`);
        }
      } else {
        console.error('typeof content', typeof content);
        openPopup('ファイルの読み込みに失敗しました。');
      }
    };

    reader.readAsText(file);
  };

  return (
    <>
      <AppBar position='static'>
        <Toolbar>
          {/* <IconButton
            onClick={handleMenuOpen}
            color='inherit'
            size='large'
            edge='start'
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton> */}
          <Button
            onClick={handleMenuOpen}
            color='inherit'
            startIcon={<MenuIcon />}
          >
            メニュー
          </Button>

          <Typography variant='h6' sx={{ flexGrow: 3, textAlign: 'center' }}>
            Style-Bert-VITS2 エディター
          </Typography>
          <Typography variant='subtitle1' sx={{ mr: 2 }}>
            SBV2 ver: {version}, editor ver: {process.env.version}
          </Typography>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleSave}>プロジェクトの保存</MenuItem>
            <MenuItem component='label'>
              プロジェクトの読み込み
              <input type='file' onChange={handleLoad} hidden />
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                setDictOpen(true);
                handleMenuClose();
              }}
            >
              辞書登録
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Grid container spacing={2} mt={1}>
        <Grid xs>
          <Paper
            sx={{ p: 2, height: height / 2, overflow: 'auto' }}
            elevation={2}
          >
            {lines.map((line, index) => (
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
                <Grid xs='auto'>
                  <ChevronRightIcon
                    fontSize='small'
                    sx={{
                      display: currentLineIndex === index ? 'block' : 'none',
                    }}
                  />
                </Grid>
                <Grid xs>
                  <TextField
                    label={`テキスト${index + 1}`}
                    fullWidth
                    value={line.text}
                    onFocus={() => setCurrentLineIndex(index)}
                    onChange={(e) => handleTextChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    focused={currentLineIndex === index}
                    autoFocus={true}
                  />
                </Grid>
                <Grid xs='auto'>
                  <IconButton
                    className='delete-button'
                    disabled={lines.length === 1}
                    onClick={() => handleDelete(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
            <Button
              variant='outlined'
              startIcon={<AddIcon />}
              onClick={addLine}
              sx={{ mt: 2 }}
            >
              テキスト追加
            </Button>
          </Paper>
          <AccentEditor
            moraToneList={lines[currentLineIndex].moraToneList}
            setMoraToneList={(moraToneList) =>
              setLineState({ moraToneList, accentModified: true })
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
              onClick={handleSynthesis}
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
              variant='outlined'
              color='primary'
              disabled={loading}
              onClick={handleMultiSynthesis}
            >
              全てのテキストを音声合成
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
          {audioUrl && <audio src={audioUrl} controls autoPlay />}
        </Grid>
        <Grid xs={4}>
          <LineSetting
            modelList={modelList}
            lines={lines}
            currentIndex={currentLineIndex}
            setLines={setLines}
          />
        </Grid>
      </Grid>
      <SimpleBackdrop open={openBackdrop} />
      <DictionaryDialog open={dictOpen} onClose={() => setDictOpen(false)} />
    </>
  );
}
