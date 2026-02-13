import { promises as fs } from "fs";
import path from "path";
import { createBlankWeddingContent } from "@/lib/content/blank";
import type { WeddingContent } from "@/lib/content/types";
import {
  ContentValidationError,
  normalizeWeddingContent,
  validateWeddingContent,
} from "@/lib/content/validate";

const CONTENT_PATH = path.join(process.cwd(), "data", "wedding-content.json");
const BACKUP_DIR = path.join(process.cwd(), "data", "backups");

async function ensureDataDir() {
  await fs.mkdir(path.dirname(CONTENT_PATH), { recursive: true });
  await fs.mkdir(BACKUP_DIR, { recursive: true });
}

function getBackupName() {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `wedding-content-${stamp}.json`;
}

async function createBackupIfExists() {
  try {
    await fs.access(CONTENT_PATH);
    const backupPath = path.join(BACKUP_DIR, getBackupName());
    await fs.copyFile(CONTENT_PATH, backupPath);
  } catch {
    // 최초 저장 시에는 기존 파일이 없을 수 있다.
  }
}

export async function getWeddingContent(): Promise<WeddingContent> {
  try {
    const raw = await fs.readFile(CONTENT_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    const normalized = normalizeWeddingContent(parsed);
    return normalized;
  } catch {
    const initial = createBlankWeddingContent();
    await saveWeddingContent(initial);
    return initial;
  }
}

export async function saveWeddingContent(content: WeddingContent): Promise<WeddingContent> {
  const normalized = normalizeWeddingContent(content);
  const errors = validateWeddingContent(normalized);
  if (errors.length > 0) {
    throw new ContentValidationError(errors);
  }

  await ensureDataDir();
  await createBackupIfExists();
  await fs.writeFile(CONTENT_PATH, JSON.stringify(normalized, null, 2), "utf-8");
  return normalized;
}

export async function listContentBackups(): Promise<string[]> {
  await ensureDataDir();
  const entries = await fs.readdir(BACKUP_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name)
    .sort()
    .reverse();
}

export async function restoreContentBackup(name: string): Promise<WeddingContent> {
  if (!/^[a-zA-Z0-9._-]+\.json$/.test(name)) {
    throw new Error("잘못된 백업 파일명입니다.");
  }

  await ensureDataDir();
  const backupPath = path.join(BACKUP_DIR, name);
  const raw = await fs.readFile(backupPath, "utf-8");
  const normalized = normalizeWeddingContent(JSON.parse(raw));
  const errors = validateWeddingContent(normalized);
  if (errors.length > 0) {
    throw new ContentValidationError(errors);
  }

  await createBackupIfExists();
  await fs.writeFile(CONTENT_PATH, JSON.stringify(normalized, null, 2), "utf-8");
  return normalized;
}
