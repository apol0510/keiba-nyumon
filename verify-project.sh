#!/bin/bash

# プロジェクト整合性確認スクリプト
# keiba-nyumon（競馬入門ガイド）専用

set -e

# 色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 期待されるプロジェクト情報
EXPECTED_PROJECT_NAME="keiba-nyumon"
EXPECTED_DIR_NAME="keiba-nyumon"

echo ""
echo "🔍 keiba-nyumon プロジェクト整合性チェック"
echo "============================================"
echo ""

# 現在のディレクトリを取得
CURRENT_DIR=$(pwd)
DIR_BASENAME=$(basename "$CURRENT_DIR")

echo "📂 現在のディレクトリ:"
echo "   $CURRENT_DIR"
echo ""

# ディレクトリ名の確認
if [ "$DIR_BASENAME" = "$EXPECTED_DIR_NAME" ]; then
    echo -e "${GREEN}✅ ディレクトリ名: 正常${NC}"
    echo "   期待値: $EXPECTED_DIR_NAME"
    echo "   実際値: $DIR_BASENAME"
else
    echo -e "${RED}❌ エラー: ディレクトリ名が一致しません${NC}"
    echo "   期待値: $EXPECTED_DIR_NAME"
    echo "   実際値: $DIR_BASENAME"
    echo ""
    echo -e "${YELLOW}⚠️  正しいディレクトリに移動してください:${NC}"
    echo "   cd '/Users/apolon/Library/Mobile Documents/com~apple~CloudDocs/WorkSpace/keiba-nyumon'"
    exit 1
fi

echo ""

# package.jsonのプロジェクト名確認
if [ -f "package.json" ]; then
    PROJECT_NAME=$(grep '"name"' package.json | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')
    if [ "$PROJECT_NAME" = "$EXPECTED_PROJECT_NAME" ]; then
        echo -e "${GREEN}✅ package.json: プロジェクト名が正しい${NC}"
        echo "   $PROJECT_NAME"
    else
        echo -e "${RED}❌ エラー: package.jsonのプロジェクト名が異なります${NC}"
        echo "   期待値: $EXPECTED_PROJECT_NAME"
        echo "   実際値: $PROJECT_NAME"
        exit 1
    fi
else
    echo -e "${RED}❌ エラー: package.jsonが見つかりません${NC}"
    exit 1
fi

echo ""

# 不要なファイル/ディレクトリのチェック（旧プロジェクトの残骸）
UNWANTED_ITEMS=(
    "netlify/functions"
    "packages"
    ".env.example.review"
)

FOUND_UNWANTED=0
for item in "${UNWANTED_ITEMS[@]}"; do
    if [ -e "$item" ]; then
        echo -e "${YELLOW}⚠️  不要なファイル/ディレクトリ: $item${NC}"
        FOUND_UNWANTED=1
    fi
done

if [ $FOUND_UNWANTED -eq 0 ]; then
    echo -e "${GREEN}✅ 不要なファイル: なし${NC}"
fi

echo ""

# 必須ファイルの確認
REQUIRED_FILES=(
    "src/config.ts"
    "src/lib/news.ts"
    "src/pages/index.astro"
    "src/components/Timeline.astro"
    "src/components/NewsCard.astro"
    "netlify.toml"
)

MISSING_FILES=0
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ 必須ファイルが見つかりません: $file${NC}"
        MISSING_FILES=1
    fi
done

if [ $MISSING_FILES -eq 0 ]; then
    echo -e "${GREEN}✅ 必須ファイル: すべて存在${NC}"
fi

echo ""

# GitHubリポジトリの確認
if [ -d ".git" ]; then
    REPO_URL=$(git remote get-url origin 2>/dev/null || echo "")
    if [[ "$REPO_URL" == *"keiba-nyumon"* ]]; then
        echo -e "${GREEN}✅ GitHubリポジトリ: keiba-nyumon${NC}"
    else
        echo -e "${YELLOW}⚠️  警告: GitHubリポジトリ名が異なります${NC}"
        echo "   $REPO_URL"
    fi
fi

echo ""
echo "============================================"

if [ $FOUND_UNWANTED -eq 0 ] && [ $MISSING_FILES -eq 0 ]; then
    echo -e "${GREEN}✅ プロジェクト整合性チェック完了${NC}"
    echo ""
    echo "📝 keiba-nyumon プロジェクト情報:"
    echo "   - 完全静的サイト（SSG）"
    echo "   - Airtable Newsテーブル使用"
    echo "   - Netlify Functions不要"
    exit 0
else
    echo -e "${RED}❌ 問題が見つかりました${NC}"
    exit 1
fi
