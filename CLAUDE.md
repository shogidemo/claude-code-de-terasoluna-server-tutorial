# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains a TODO application with two implementations:
1. **Backend**: Spring Boot + Terasoluna Framework (Java)
2. **Frontend**: React + TypeScript (in progress)

## Common Development Commands

### Backend (Spring Boot)

```bash
# Run tests
./mvnw test
./mvnw test -Dtest=TodoServiceImplTest  # Run specific test class

# Build and run
./mvnw clean package
./mvnw spring-boot:run

# Lint and format
./mvnw clean test  # Tests include code quality checks

# Coverage report
./mvnw jacoco:report
```

### Frontend (React)

```bash
# Navigate to frontend directory first
cd frontend

# Development
npm run dev          # Start dev server at http://localhost:5173
npm run build        # Production build
npm run preview      # Preview production build

# Testing
npm run test         # Run tests in watch mode
npm run test:ui      # Run tests with UI
npm run test:coverage # Generate coverage report

# Linting
npm run lint
```

## Architecture Overview

### Backend Architecture (Spring Boot)

The backend follows a layered architecture pattern with Terasoluna Framework principles:

- **Domain Layer** (`domain/`): Business logic and data access
  - `model/Todo.java`: JPA Entity with validation rules
  - `repository/TodoRepository.java`: Spring Data JPA interface
  - `service/TodoService.java` & `TodoServiceImpl.java`: Business logic with transaction management
  
- **Application Layer** (`app/`): Web controllers and forms
  - `todo/TodoController.java`: Handles HTTP requests, uses `@RequestMapping`
  - `todo/TodoForm.java`: Form backing object with validation groups
  - Error handling: Catches `BusinessException` and `ResourceNotFoundException`

- **Key Business Rules**:
  - Maximum 5 unfinished TODOs (enforced in service layer)
  - TODO title: 1-30 characters (Bean Validation)
  - Finished TODOs cannot be finished again

### Frontend Architecture (React - In Progress)

The frontend is being developed with:
- React 18 + TypeScript
- Vite for build tooling
- Context API for state management
- LocalStorage for persistence

Planned structure:
```
frontend/src/
├── components/      # UI components
├── context/        # State management
├── types/          # TypeScript interfaces
├── hooks/          # Custom React hooks
└── utils/          # Helper functions
```

## Important Configuration

### Ports and Services
- Backend: Port 8080 (configured in `application.properties`)
- Frontend dev server: Port 5173 (Vite default)
- H2 Database Console: http://localhost:8080/h2-console
  - JDBC URL: `jdbc:h2:mem:todoapp`
  - Username: `sa`
  - Password: (empty)

### Git Workflow
- Feature branches: `feature/[feature-name]`
- Commit messages should be descriptive and in appropriate granularity
- Use `gh pr create` for pull requests
- Pull requests should include comprehensive descriptions

### Permissions (from .claude/settings.local.json)
The repository has pre-configured permissions for:
- Git operations (add, commit, push, branch management)
- Maven operations (`./mvnw` commands)
- NPM operations (install, create)
- GitHub CLI operations (`gh` commands)

## Testing Strategy

### Backend Testing
- Unit tests for Service and Repository layers using Mockito
- Integration tests using `@SpringBootTest`
- Controller tests using `MockMvc`
- All tests use JUnit 5 and AssertJ

### Frontend Testing
- React Testing Library for component tests
- Vitest as test runner
- Focus on user interaction testing

## Key Dependencies and Versions
- Java 17
- Spring Boot 3.2.1
- Terasoluna Framework 5.8.1.RELEASE
- React 19.1.0
- TypeScript 5.8.3
- Vite 6.3.5

## Development Notes
- The backend returns `Collection<Todo>` but internally uses `List<Todo>` for consistent ordering
- Internationalization is configured for Japanese (default) and English
- The frontend should implement the same business rules as the backend
- When making changes, ensure both unit and integration tests pass

## Pull Request レビューコメントへの対応ルール

### コメント対応時の手順
1. **レビューコメントの確認**
   - `gh api repos/{owner}/{repo}/pulls/{pr}/comments` でインラインコメント一覧を取得
   - `gh pr view {pr} --comments` でPR全体のコメントを確認
   - 各コメントのIDと種類（インライン/PR全体）を把握

2. **個別コメントへの返信（最優先）**
   - 可能な限りインラインコメントに直接Reply機能を使用
   - 各レビューコメントに対して、具体的な対応内容を個別に返信
   - 対応完了/未対応/検討中などのステータスを明記
   - 変更したファイル名と行番号を含める

3. **Claudeによる対応の明示**
   - コメント末尾に以下の文言を追加：
     ```
     🤖 Generated with [Claude Code](https://claude.ai/code)
     ```

4. **作業完了後のサマリー**
   - 全てのコメント対応後、PR全体に対してサマリーコメントを投稿
   - 対応したコメントの数と概要を記載
   - 未対応項目がある場合はその理由を説明

### GitHub PR インラインコメントへの返信方法

**基本方針**: 可能な限りインラインコメントに直接Replyし、不可能な場合のみ引用付きコメントを使用する

#### 1. インラインコメントに直接Reply（最優先）
GitHub API の Reply 機能を使用。個別のレビューコメントに対する最適な返信方法：
```bash
gh api repos/{owner}/{repo}/pulls/{pr}/comments/{comment_id}/replies \
  -X POST --field body="[返信内容]

🤖 Generated with [Claude Code](https://claude.ai/code)"
```

**使用条件**: 
- インラインコメント（コード行に対するコメント）
- comment_idが取得可能
- トップレベルコメント（Replyに対するReplyは不可）

#### 2. 引用付きPRコメント（フォールバック）
直接Replyが不可能な場合のみ使用：
```bash
gh pr comment [PR番号] --body "## [件名]

> [元のコメントを引用]

[返信内容]

🤖 Generated with [Claude Code](https://claude.ai/code)"
```

**使用条件**:
- PRレビュー全体に対するコメント
- 複数コメントをまとめて回答する場合
- Reply機能が利用できない場合

#### 3. 同じ行に新しいインラインコメント追加（特殊用途）
```bash
gh api repos/{owner}/{repo}/pulls/{pr}/comments -X POST \
  --field body="[コメント内容]" \
  --field commit_id="[コミットID]" \
  --field path="[ファイルパス]" \
  --field line=[行番号] \
  --field side="RIGHT"
```

**使用条件**: 新しい論点を追加する場合のみ

**⚠️ 注意**: `gh api repos/.../pulls/comments/{id} -X POST` はコメントを編集（上書き）してしまうため使用禁止

### コメント取得とReply手順の実例

#### Step 1: コメント確認
```bash
# インラインコメント一覧取得
gh api repos/{owner}/{repo}/pulls/{pr}/comments

# PR全体コメント確認  
gh pr view {pr} --comments
```

#### Step 2: インラインコメントへのReply
```bash
# comment_idを使ってReply
gh api repos/{owner}/{repo}/pulls/{pr}/comments/{comment_id}/replies \
  -X POST --field body="対応完了しました。ご指摘の通り配列インデックスをkeyとして使用するリスクを理解しています。

現在の実装では順序変更がないappend-only構造のため、このままとしました。

変更箇所：
- MessageDisplay.tsx line 16

🤖 Generated with [Claude Code](https://claude.ai/code)"
```

#### Step 3: サマリーコメント
```bash
gh pr comment {pr} --body "## レビューコメント対応完了

全 4 件のコメントに対応しました：
- ✅ MessageDisplay/TodoList/TodoItemテスト追加
- ✅ README.md スタイリング記載修正  
- ✅ React key使用に関する技術的説明

🤖 Generated with [Claude Code](https://claude.ai/code)"
```
