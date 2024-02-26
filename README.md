# Style-Bert-VITS2 エディター

- [Style-Bert-VITS2](https://github.com/litagin02/Style-Bert-VITS2) のエディターのフロントエンドです（Next.js + React + Material UI with TypeScript）。
- 単独では動かず、Style-Bert-VITS2側の`server_editor.py`と連携して動作します。

フロントエンド初心者なのでプルリクやアドバイスをお待ちしています。

## 開発

```bash
npm install
npm run dev
```

サーバー側では`server_editor.py`を起動しておいてください。サーバーのポートはデフォルトの8000で、dev環境ではフロントはポート3000から8000を叩き、本番環境では相対パスで自分を叩くようになっています。

## 連携

mainブランチにタグ`v*`をつけてpushすると、自動的にリリースが生成されて、`npm run build`の結果が`out.zip`としてリリースにアップロードされます。[Style-Bert-VITS2](https://github.com/litagin02/Style-Bert-VITS2)側では、音声合成サーバー起動時に、自動的にリリースを確認して更新されていたらこれをダウンロードして、サーバー側の静的ファイルとして`/`にホストされます。