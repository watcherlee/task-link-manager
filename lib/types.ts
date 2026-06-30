export type TaskKind = "task" | "bookmark";
export type Stage = "inbox" | "week" | "today" | "archived";
export type InboxCategory = "work" | "life";
export type Priority = 0 | 1 | 2;
export type Platform =
  | "bilibili"
  | "weixin"
  | "feishu"
  | "xiaohongshu"
  | "youtube"
  | "generic";

export interface Tag {
  id: string;
  name: string;
  preset: boolean;
}

export interface Task {
  id: string;
  userId: string;
  kind: TaskKind;
  title: string;
  url: string | null;
  platform: Platform | null;
  notes: string | null;
  stage: Stage;
  category: InboxCategory;
  priority: Priority;
  sortOrder: number;
  done: boolean;
  doneAt: string | null;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
}

export interface CreateTaskInput {
  title: string;
  kind?: TaskKind;
  url?: string | null;
  platform?: Platform | null;
  notes?: string | null;
  stage?: Stage;
  category?: InboxCategory;
  priority?: Priority;
  tagNames?: string[];
}

export interface UpdateTaskInput {
  title?: string;
  kind?: TaskKind;
  url?: string | null;
  platform?: Platform | null;
  notes?: string | null;
  stage?: Stage;
  category?: InboxCategory;
  priority?: Priority;
  sortOrder?: number;
  done?: boolean;
  tagNames?: string[];
}

export interface MetadataResult {
  title: string | null;
  url: string;
  platform: Platform;
  favicon?: string | null;
  error?: string;
}
