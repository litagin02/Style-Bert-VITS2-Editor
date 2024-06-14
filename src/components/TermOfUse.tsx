import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Link,
  Typography,
} from '@mui/material';

export interface TermOfUseDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function TermOfUseDialog({
  open,
  onClose,
}: TermOfUseDialogProps) {
  return (
    <Dialog open={open} fullWidth maxWidth='md'>
      <DialogTitle>お願いとモデルの利用規約</DialogTitle>
      <DialogContent>
        <Typography>
          Style-Bert-VITS2を利用する際は、
          <Link
            href='https://github.com/litagin02/Style-Bert-VITS2/blob/master/docs/TERMS_OF_USE.md'
            target='_blank'
            rel='noopener noreferrer'
          >
            Style-Bert-VITS2の開発陣からのお願いとデフォルトモデルの利用規約
          </Link>
          を読んで、使用するモデルの利用規約を遵守してください。
          初期からあるデフォルトモデルの利用規約の抜粋は以下の通りです（完全な利用規約は上記リンクにあります）。
        </Typography>
        <Box sx={{ fontWeight: 'bold' }}>JVNV</Box>
        <Typography>
          <Link
            href='https://huggingface.co/litagin/style_bert_vits2_jvnv'
            target='_blank'
            rel='noopener noreferrer'
          >
            「jvnv-」から始まるモデル
          </Link>
          は、
          <Link
            href='https://sites.google.com/site/shinnosuketakamichi/research-topics/jvnv_corpus'
            target='_blank'
            rel='noopener noreferrer'
          >
            JVNVコーパス
          </Link>
          の音声で学習されました。このコーパスのライセンスは
          <Link
            href='https://creativecommons.org/licenses/by-sa/4.0/deed.ja'
            target='_blank'
            rel='noopener noreferrer'
          >
            CC BY-SA 4.0
          </Link>
          ですので、jvnv-で始まるモデルの利用規約はこれを継承します。
        </Typography>
        <Box sx={{ fontWeight: 'bold' }}>小春音アミ・あみたろ</Box>
        <Typography>
          「koharune-ami / amitaro」モデルは、
          <Link
            href='https://amitaro.net/'
            target='_blank'
            rel='noopener noreferrer'
          >
            あみたろの声素材工房
          </Link>
          のコーパス音声・ライブ配信音声から許可を得て学習されました（Ver
          2.5.0で追加されたモデルです、アップデートした方は`Initialize.bat`ファイルをダブルクリックするとモデルのダウンロードができます）。利用の際には、
          <Link
            href='https://amitaro.net/voice/voice_rule/'
            target='_blank'
            rel='noopener noreferrer'
          >
            あみたろの声素材工房の規約
          </Link>
          と
          <Link
            href='https://amitaro.net/voice/livevoice/#index_id6'
            target='_blank'
            rel='noopener noreferrer'
          >
            あみたろのライブ配信音声・利用規約
          </Link>
          を遵守してください。
        </Typography>
        <Typography>
          特に、年齢制限がかかりそうなセリフやセンシティブな用途には使用できません。
        </Typography>
        <Typography>
          生成音声を公開する際は（媒体は問わない）、必ず分かりやすい場所に
          「あみたろの声素材工房 (https://amitaro.net/)」
          の声を元にした音声モデルを使用していることが分かるようなクレジット表記を記載してください：
          「Style-BertVITS2モデル: 小春音アミ、あみたろの声素材工房
          (https://amitaro.net/)」 「Style-BertVITS2モデル:
          あみたろ、あみたろの声素材工房 (https://amitaro.net/)」
        </Typography>
        <Typography>
          完全なモデルの利用規約は
          <Link
            href='https://github.com/litagin02/Style-Bert-VITS2/blob/master/docs/TERMS_OF_USE.md'
            target='_blank'
            rel='noopener noreferrer'
          >
            Style-Bert-VITS2の利用規約
          </Link>
          をお読みください。
        </Typography>
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button onClick={onClose}>同意する</Button>
      </DialogActions>
    </Dialog>
  );
}
