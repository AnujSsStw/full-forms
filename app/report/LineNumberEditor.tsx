// import { Editor } from "react-draft-wysiwyg";
import { EditorState } from "draft-js";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

// Dynamically import the Editor to avoid SSR issues
const Editor = dynamic(
  () => import("react-draft-wysiwyg").then((mod) => mod.Editor),
  { ssr: false }
);

interface LineNumberEditorProps {
  editorState: EditorState;
  onEditorStateChange: (editorState: EditorState) => void;
}

export function TextEditor({
  editorState,
  onEditorStateChange,
}: LineNumberEditorProps) {
  return (
    <div className="">
      <div className={cn("flex-1 border border-gray-200")}>
        <Editor
          editorState={editorState}
          onEditorStateChange={onEditorStateChange}
          toolbar={{
            options: ["inline", "list", "textAlign", "history"],
          }}
          editorClassName="min-h-[300px] px-4 py-2"
        />
      </div>
    </div>
  );
}
