# Terasoluna TODO Application

Spring BootとTerasolunaフレームワークを使用したTODOアプリケーションです。

## 🚀 機能

- **CRUD操作**: TODOの作成、表示、完了、削除
- **バリデーション**: 入力値検証（必須チェック、文字数制限）
- **ビジネスルール**: 未完了TODO数の上限制御（最大5件）
- **国際化**: 日本語・英語メッセージ対応
- **エラーハンドリング**: 統一されたエラー処理
- **レスポンシブデザイン**: モバイル対応UI

## 🏗️ アーキテクチャ

### プロジェクト構造
```
src/
├── main/
│   ├── java/com/example/todoapp/
│   │   ├── TodoApplication.java           # メインクラス
│   │   ├── app/                          # アプリケーション層
│   │   │   ├── todo/
│   │   │   │   ├── TodoController.java   # Webコントローラー
│   │   │   │   └── TodoForm.java         # フォームオブジェクト
│   │   │   ├── welcome/
│   │   │   │   └── HomeController.java   # ホームページ
│   │   │   └── common/error/
│   │   │       └── TodoErrorController.java  # エラーハンドリング
│   │   └── domain/                       # ドメイン層
│   │       ├── model/
│   │       │   └── Todo.java             # エンティティ
│   │       ├── repository/
│   │       │   └── TodoRepository.java   # データアクセス
│   │       └── service/
│   │           ├── TodoService.java      # サービスインターフェース
│   │           └── TodoServiceImpl.java  # サービス実装
│   └── resources/
│       ├── templates/todo/
│       │   └── list.html                 # TODOリスト画面
│       ├── static/css/
│       │   └── style.css                 # スタイルシート
│       ├── i18n/
│       │   ├── messages.properties       # 英語メッセージ
│       │   └── messages_ja.properties    # 日本語メッセージ
│       └── application.properties        # 設定ファイル
└── test/                                # テストコード
    └── java/com/example/todoapp/
        ├── TodoApplicationTests.java     # 統合テスト
        ├── domain/
        │   ├── service/TodoServiceImplTest.java    # サービステスト
        │   └── repository/TodoRepositoryTest.java  # リポジトリテスト
        └── app/todo/TodoControllerTest.java        # コントローラーテスト
```

### 技術スタック
- **フレームワーク**: Spring Boot 3.2.1
- **テンプレートエンジン**: Thymeleaf
- **データベース**: H2 Database (インメモリ)
- **ORM**: Spring Data JPA
- **バリデーション**: Bean Validation
- **テスト**: JUnit 5, Mockito, AssertJ
- **ビルドツール**: Maven
- **Java版本**: 17

## 🔧 開発環境セットアップ

### 前提条件
- Docker Desktop
- Visual Studio Code
- Dev Containers extension

### DevContainer起動
1. プロジェクトをVSCodeで開く
2. Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`) を開く
3. "Dev Containers: Reopen in Container" を選択
4. DevContainerが自動でビルドされ、開発環境が構築されます

### アプリケーション起動

```bash
# テスト実行
./mvnw clean test

# アプリケーション起動
./mvnw spring-boot:run
```

アプリケーションは http://localhost:8080 でアクセスできます。

### データベース管理（開発用）
H2 Consoleにアクセス: http://localhost:8080/h2-console

**接続設定:**
- JDBC URL: `jdbc:h2:mem:todoapp`
- User Name: `sa`
- Password: (空白)

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
./mvnw test

# 特定テストクラス実行
./mvnw test -Dtest=TodoServiceImplTest

# カバレッジレポート生成
./mvnw jacoco:report
```

### テスト構成
- **単体テスト**: Service層、Repository層の動作検証
- **統合テスト**: Controller層、アプリケーション全体の動作検証
- **テストツール**: JUnit 5, Mockito, @SpringBootTest

## 🎨 カスタマイズ

### スタイル変更
`src/main/resources/static/css/style.css` を編集

### メッセージ変更
- 日本語: `src/main/resources/i18n/messages_ja.properties`
- 英語: `src/main/resources/i18n/messages.properties`

### データベース設定変更
`src/main/resources/application.properties` でデータベース設定を変更可能

## 🚀 本番デプロイ

### JARファイル作成
```bash
./mvnw clean package
java -jar target/todo-app-1.0.0-SNAPSHOT.jar
```

### Docker対応
```dockerfile
FROM openjdk:17-jdk-slim
COPY target/todo-app-1.0.0-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

## 🔮 今後の拡張予定

### Phase 2 機能拡張
- [ ] **認証・認可**: Spring Security統合
- [ ] **カテゴリ機能**: TODOのカテゴリ分類
- [ ] **期限管理**: 期限設定・通知機能
- [ ] **検索・フィルタ**: タイトル検索、ステータス絞り込み

### Phase 3 システム強化
- [ ] **REST API**: フロントエンド分離対応
- [ ] **永続化DB**: PostgreSQL/MySQL対応
- [ ] **マイクロサービス**: 機能分割・独立デプロイ
- [ ] **監視・ログ**: Actuator、ログ集約

### Phase 4 DevOps・運用
- [ ] **CI/CD**: GitHub Actions統合
- [ ] **コンテナ化**: Docker Compose、Kubernetes対応
- [ ] **セキュリティ**: OWASP対策、脆弱性スキャン
- [ ] **パフォーマンス**: メトリクス監視、APM統合

## 📚 参考資料

- [Terasoluna Server Framework](https://terasolunaorg.github.io/guideline/)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Thymeleaf Documentation](https://www.thymeleaf.org/documentation.html)
- [Spring Data JPA Reference](https://spring.io/projects/spring-data-jpa)

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチをプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトは MIT License の下でライセンスされています。