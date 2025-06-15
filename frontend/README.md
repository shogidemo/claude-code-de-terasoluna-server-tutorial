# React TODO Application

React + TypeScriptで実装したTODOアプリケーションです。

## 🚀 機能

- **CRUD操作**: TODOの作成、表示、完了、削除
- **バリデーション**: 入力値検証（必須チェック、文字数制限）
- **ビジネスルール**: 未完了TODO数の上限制御（最大5件）
- **エラーハンドリング**: 統一されたエラー処理とメッセージ表示
- **レスポンシブデザイン**: モバイル対応UI
- **永続化**: LocalStorageによるデータ保存

## 🏗️ アーキテクチャ

### プロジェクト構造
```
src/
├── components/         # UIコンポーネント
│   ├── TodoList/      # TODOリスト表示
│   ├── TodoForm/      # TODO作成フォーム
│   ├── TodoItem/      # TODO個別アイテム
│   └── common/        # 共通コンポーネント
├── context/           # React Context（状態管理）
├── types/             # TypeScript型定義
└── test/              # テスト設定
```

### 技術スタック
- **フレームワーク**: React 19.1.0
- **型システム**: TypeScript 5.8.3
- **ビルドツール**: Vite 6.3.5
- **状態管理**: React Context API
- **スタイリング**: CSS files
- **テスト**: Vitest + React Testing Library
- **永続化**: LocalStorage

## 🔧 開発環境セットアップ

### 前提条件
- **Node.js**: バージョン18以上
- **npm**: バージョン8以上

### インストールと起動

```bash
# 依存関係のインストール
cd frontend
npm install

# 開発サーバー起動
npm run dev

# アプリケーションにアクセス
# http://localhost:5173
```

### 利用可能なコマンド

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 本番ビルドのプレビュー
npm run preview

# テスト実行
npm run test

# テスト実行（UI付き）
npm run test:ui

# カバレッジ付きテスト
npm run test:coverage

# ESLint実行
npm run lint
```

## 📝 使用方法

### 基本操作
1. **TODO追加**: 上部フォームにタイトルを入力して「追加」ボタンをクリック
2. **TODO完了**: 各TODOの「完了」ボタンをクリック
3. **TODO削除**: 各TODOの「削除」ボタンをクリック（確認ダイアログ表示）

### ビジネスルール
- **未完了TODO上限**: 未完了のTODOは最大5件まで
- **バリデーション**: タイトルは1〜30文字以内で必須
- **重複完了防止**: 既に完了済みのTODOは完了操作不可

## 🧪 テスト

### テスト実行
```bash
# 全テスト実行
npm run test

# 特定ファイルのテスト実行
npm run test TodoForm.test.tsx

# ウォッチモードでテスト実行
npm run test -- --watch
```

### テスト構成
- **コンポーネントテスト**: React Testing Libraryを使用
- **ユーザーインタラクションテスト**: user-eventsライブラリ
- **アクセシビリティテスト**: 適切なラベルとロール
- **状態管理テスト**: Context APIの動作検証

## 🎨 カスタマイズ

### スタイル変更
各コンポーネントフォルダ内の`.css`ファイルを編集

### ビジネスルール変更
`src/types/todo.ts`内の定数を変更:
- `MAX_UNFINISHED_TODOS`: 未完了TODO上限数
- `MAX_TODO_TITLE_LENGTH`: タイトル最大文字数

## 🚀 本番デプロイ

### 静的ファイル生成
```bash
npm run build
```

生成された`dist/`フォルダを静的ホスティングサービスにデプロイ

### 対応プラットフォーム
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

## 🔮 今後の拡張予定

### Phase 2 機能拡張
- [ ] **検索・フィルタ**: タイトル検索、ステータス絞り込み
- [ ] **カテゴリ機能**: TODOのカテゴリ分類
- [ ] **期限管理**: 期限設定・通知機能
- [ ] **並び替え**: ドラッグ&ドロップによる順序変更

### Phase 3 システム強化
- [ ] **REST API連携**: バックエンドAPIとの統合
- [ ] **PWA対応**: Service Worker、オフライン対応
- [ ] **パフォーマンス**: 仮想化、メモ化最適化
- [ ] **アクセシビリティ**: WAI-ARIA、キーボードナビゲーション

## 📚 参考資料

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチをプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトは MIT License の下でライセンスされています。