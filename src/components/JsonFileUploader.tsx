
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, File } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface UploadedFile {
  name: string;
  content: string;
  parsed: any | null;
  error?: string;
}

interface JsonFileUploaderProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
}

export function JsonFileUploader({ files, onFilesChange }: JsonFileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList) return;
    const items: UploadedFile[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      try {
        const text = await file.text();
        let parsed: any = null;
        try {
          parsed = JSON.parse(text);
        } catch (err) {
          items.push({ name: file.name, content: text, parsed: null, error: "Invalid JSON" });
          continue;
        }
        items.push({ name: file.name, content: text, parsed });
      } catch {
        items.push({ name: file.name, content: "", parsed: null, error: "Read error" });
      }
    }
    // Deduplicate by name
    const allFiles = [...files, ...items].reduce<UploadedFile[]>((acc, curr) => {
      if (!acc.some(f => f.name === curr.name)) acc.push(curr);
      return acc;
    }, []);
    onFilesChange(allFiles);
    if (inputRef.current) inputRef.current.value = "";
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const removeFile = (idx: number) => {
    const updated = files.slice();
    updated.splice(idx, 1);
    onFilesChange(updated);
  };

  return (
    <div>
      <label className="block mb-2 font-semibold">Upload Keycloak realm.json files:</label>
      <div className="flex gap-4">
        <Input
          type="file"
          accept=".json,application/json"
          multiple
          ref={inputRef}
          onChange={onFileInputChange}
          className="max-w-xs"
        />
        {files.length > 0 && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => onFilesChange([])}
          >
            Remove All
          </Button>
        )}
      </div>
      {files.length > 0 && (
        <div className="mt-4">
          <ul className="space-y-2">
            {files.map((f, i) => (
              <li
                key={f.name}
                className={cn(
                  "flex items-center gap-2 p-2 rounded bg-muted",
                  f.error ? "border border-destructive bg-destructive/10 text-destructive" : ""
                )}
              >
                <File className="w-4 h-4" />
                <span className="flex-1 truncate">{f.name}</span>
                {f.error && <span className="text-xs italic">{f.error}</span>}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(i)}
                  aria-label={`Remove ${f.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
