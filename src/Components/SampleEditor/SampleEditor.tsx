import { File } from "@bentley/monaco-editor";
export interface InternalFile extends File {
  import: Promise<{ default: string; }>;
}
