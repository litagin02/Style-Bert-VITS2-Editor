// TODO: コンポーネントを分割してリファクタリングする
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
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
import { useEffect, useRef, useState } from 'react';

import AccentEditor from '@/components/AccentEditor';
import { usePopup } from '@/contexts/PopupProvider';
import useWindowSize from '@/hooks/useWindowSize';
import { fetchApi } from '@/utils/api';

import type { MoraTone } from './AccentEditor';
import DictionaryDialog from './DictionaryDialog';
import LineSetting from './LineSetting';
import SimpleBackdrop from './SimpleBackdrop';
import TermOfUseDialog from './TermOfUse';

export interface ModelInfo {
  name: string;
  files: string[];
  styles: string[];
  speakers: string[];
}

export interface LineState {
  text: string;
  model: string;
  modelFile: string;
  speaker: string;
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
  style: '', // fetch前はNeutralがないので空文字列にする
  speaker: '',
  moraToneList: [],
  accentModified: false,
  styleWeight: 1,
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
  const [termOfUseOpen, setTermOfUseOpen] = useState(true);

  const [version, setVersion] = useState('');

  const { height } = useWindowSize();

  const [composing, setComposition] = useState(false);
  const startComposition = () => setComposition(true);
  const endComposition = () => setComposition(false);
  const refs = useRef<HTMLTextAreaElement[]>([]);

  useEffect(() => {
    // 初期のモデル情報取得
    setOpenBackdrop(true);

    let timeoutId: NodeJS.Timeout;
    let retryCount = 0;
    const maxRetries = 10;
    const retryInterval = 1000; // 1秒

    const fetchModelInfo = () => {
      fetchApi<ModelInfo[]>('/models_info')
        .then((data) => {
          setModelList(data);
          setLines([
            {
              ...defaultLineState,
              model: data[0].name || '',
              modelFile: data[0].files[0] || '',
              style: data[0].styles[0] || '',
              speaker: data[0].speakers?.[0] || '',
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
            timeoutId = setTimeout(fetchModelInfo, retryInterval);
          } else {
            console.log(
              `モデル情報の取得に失敗しました。リトライ回数: ${retryCount}`,
            );
            console.log(e);
            openPopup(`モデル情報の取得に失敗しました。\n${e}`, 'error');
            setOpenBackdrop(false);
          }
        });
    };

    fetchModelInfo();

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

  useEffect(() => {
    console.log('currentLineIndex:', currentLineIndex);
    // 現在の行にフォーカスを設定
    if (refs.current[currentLineIndex]) {
      refs.current[currentLineIndex].focus();
    }
  }, [currentLineIndex]); // currentLineIndex が変更された時に実行

  const handleRefresh = () => {
    // TODO: 初期読み込み時とだいたい同じ処理なので共通化する
    handleMenuClose();
    setOpenBackdrop(true);
    fetchApi<ModelInfo[]>('/models_info')
      .then((data) => {
        setModelList(data);
        setOpenBackdrop(false);
      })
      .catch((e) => {
        console.error(e);
        openPopup(`モデル情報の取得に失敗しました。\n${e}`, 'error');
        setOpenBackdrop(false);
      });
  };

  const addLineAt = (index: number) => {
    const newLine = {
      ...lines[index],
      text: '',
      moraToneList: [],
      accentModified: false,
    };

    const newLines = [...lines];
    newLines.splice(index + 1, 0, newLine);

    setLines(newLines);
    setCurrentLineIndex(index + 1);
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
        openPopup(`音声合成に失敗しました。${e}`, 'error');
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
        openPopup(`音声合成に失敗しました。${e}`, 'error');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !composing) {
      handleSynthesis();
    } else if (e.key === 'ArrowDown') {
      if (currentLineIndex < lines.length - 1) {
        setCurrentLineIndex(currentLineIndex + 1);
      } else {
        addLineAt(currentLineIndex);
      }
    } else if (e.key === 'ArrowUp') {
      if (currentLineIndex > 0) {
        setCurrentLineIndex(currentLineIndex - 1);
      }
    }
  };

  const handleDelete = (lineIndex: number) => {
    setLines([...lines.slice(0, lineIndex), ...lines.slice(lineIndex + 1)]);
    if (lineIndex <= currentLineIndex && currentLineIndex > 0) {
      setCurrentLineIndex(currentLineIndex - 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const text = e.clipboardData.getData('text');
    if (text) {
      const newTexts = text.split(/[\r\n]+/);
      // 複数行のテキストがペーストされた場合は、改行で分けて新規行を挿入
      // 単一行の場合はそのままペースト（選択されているテキストを置き換えて挿入する）
      if (newTexts.length > 1) {
        e.preventDefault();
        // 改行で分けて、currentLineIndexの設定のまま新規行を間に挿入
        const beforeLines = lines.slice(0, currentLineIndex);

        const newLines = newTexts.map((newText, index) => {
          if (index === 0) {
            return {
              ...lines[currentLineIndex],
              text: lines[currentLineIndex].text + newText,
            };
          }
          return { ...lines[currentLineIndex], text: newText };
        });
        const afterLines = lines.slice(currentLineIndex + 1);

        const updatedLines = [...beforeLines, ...newLines, ...afterLines];
        setLines(updatedLines);
        setCurrentLineIndex(currentLineIndex + newTexts.length - 1);
      }
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
    const json = JSON.stringify(lines);
    const blob = new Blob([json], { type: 'application/json' });
    saveAs(blob, 'project.json');
    handleMenuClose();
  };

  const handleLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleMenuClose();
    // FIXME: ファイル選択ダイアログが閉じるまでメニューが閉じない

    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      setCurrentLineIndex(0);
      const content = e.target?.result;
      if (typeof content === 'string') {
        try {
          const data: LineState[] = JSON.parse(content);
          if (!Array.isArray(data) || !data.every(isLineState)) {
            console.error('データがLineState[]型と一致しません。');
            openPopup('データが有効な形式ではありません。', 'error');
            return;
          }
          setLines(data);
        } catch (e) {
          console.error(e);
          openPopup(`プロジェクトの読み込みに失敗しました。${e}`, 'error');
        }
      } else {
        console.error('typeof content', typeof content);
        openPopup('ファイルの読み込みに失敗しました。', 'error');
      }
    };

    reader.readAsText(file);
  };

  return (
    <>
      <AppBar position='static'>
        <Toolbar>
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
          <Typography variant='subtitle1'>
            SBV2 ver: {version}, editor ver: {process.env.version}
          </Typography>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleRefresh}>モデル情報をリロード</MenuItem>
            <Divider />
            <MenuItem onClick={handleSave}>プロジェクトの保存</MenuItem>
            <MenuItem component='label'>
              プロジェクトの読み込み
              <input type='file' onChange={handleLoad} hidden accept='.json' />
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                setDictOpen(true);
                handleMenuClose();
              }}
            >
              ユーザー辞書の編集
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                setTermOfUseOpen(true);
                handleMenuClose();
              }}
            >
              利用規約
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box display='flex' justifyContent='space-between' gap={2} mt={2}>
        <Box flexGrow={1} width='100%' overflow='auto'>
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
                alignItems='center'
                justifyContent='space-between'
                sx={{
                  // ホバーしたときに削除ボタンを表示
                  '& .delete-button': {
                    display: 'none',
                  },
                  '&:hover .delete-button': {
                    display: 'block',
                  },
                  '& .add-line-button': {
                    display: 'none',
                  },
                  '&:hover .add-line-button': {
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
                    onCompositionStart={startComposition}
                    onCompositionEnd={endComposition}
                    focused={currentLineIndex === index}
                    onPaste={handlePaste}
                    // inputRef={(input) => {
                    //   if (input && currentLineIndex === index) {
                    //     input.focus();
                    //   }
                    // }}
                    inputRef={(el) => (refs.current[index] = el)} // 各行の ref を保存
                  />
                </Grid>
                <Grid xs='auto'>
                  <IconButton
                    className='delete-button'
                    disabled={lines.length === 1}
                    onClick={() => handleDelete(index)}
                    title='この行を削除する'
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
                <Grid xs='auto'>
                  <IconButton
                    className='add-line-button'
                    onClick={() => addLineAt(index)}
                    title='行を追加する'
                  >
                    <AddCircleRoundedIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
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
        </Box>
        <Box width='30%' maxWidth={350} minWidth={200}>
          <LineSetting
            modelList={modelList}
            lines={lines}
            currentIndex={currentLineIndex}
            setLines={setLines}
          />
        </Box>
      </Box>
      <SimpleBackdrop open={openBackdrop} />
      <DictionaryDialog open={dictOpen} onClose={() => setDictOpen(false)} />
      <TermOfUseDialog
        open={termOfUseOpen}
        onClose={() => setTermOfUseOpen(false)}
      />
    </>
  );
}
