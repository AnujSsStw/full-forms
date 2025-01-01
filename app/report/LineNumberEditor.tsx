import { Editor } from "react-draft-wysiwyg";
import { EditorState } from "draft-js";
import { cn } from "@/lib/utils";

interface LineNumberEditorProps {
  editorState: EditorState;
  onEditorStateChange: (editorState: EditorState) => void;
}

export function LineNumberEditor({
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
