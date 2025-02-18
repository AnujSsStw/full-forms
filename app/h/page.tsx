"use client";

import type React from "react";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import mammoth from "mammoth";

export default function MatrixTerminal() {
  const [fileContent, setFileContent] = useState("");
  const { messages, input, handleInputChange, handleSubmit, setInput } =
    useChat();

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      let text = "";

      if (
        file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        // .docx handling
        const buffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer: buffer });
        text = result.value;
      } else if (file.type === "application/msword") {
        // .doc handling
        const reader = new FileReader();
        text = await new Promise((resolve, reject) => {
          reader.onload = (e) => {
            try {
              const binaryString = e.target?.result as string;
              // Additional processing for .doc files can be added here
              resolve(binaryString);
            } catch (err) {
              reject(err);
            }
          };
          reader.onerror = (err) => reject(err);
          reader.readAsBinaryString(file);
        });
      } else {
        // Fallback for txt files
        const reader = new FileReader();
        text = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsText(file);
        });
      }
      setFileContent(text);
    } catch (error) {
      console.error("Error processing file:", error);
      alert("Error processing file. Please try again.");
    }
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const content = fileContent || input;
    if (content) {
      handleInputChange({
        target: {
          value: content,
        },
      } as React.ChangeEvent<HTMLInputElement>);
      handleSubmit({
        target: {
          value: content,
        },
      } as React.ChangeEvent<HTMLInputElement>);
      setFileContent("");
    }
  };

  const handleDownload = (content: string, index: number) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-response-${index + 1}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-4 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl mb-4">Humanize</h1>
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="mb-4 flex items-center gap-2">
              <Input
                type="file"
                onChange={handleFileChange}
                accept=".txt,.docx"
                className="bg-transparent border-green-500 text-green-500"
              />
              <Button
                onClick={() => setInput(fileContent)}
                disabled={!fileContent}
                className="bg-green-500 text-black hover:bg-green-600 px-4 py-2"
              >
                Use Uploaded File
              </Button>
            </div>
            <form onSubmit={onSubmit} className="mb-4">
              <Textarea
                value={input}
                onChange={handleInputChange}
                placeholder="Enter your message or see uploaded file content here..."
                className="w-full h-[calc(100vh-16rem)] bg-black border-green-500 text-green-500 mb-2"
              />
              <Button
                type="submit"
                className="bg-green-500 text-black hover:bg-green-600"
              >
                Process
              </Button>
            </form>
          </div>
          <div className="flex-1">
            <div className="h-[calc(100vh-13rem)] overflow-y-auto border border-green-500 p-2">
              {messages
                .filter((m) => m.role === "assistant")
                .map((m, index) => (
                  <div key={m.id} className="mb-2 flex items-start gap-2">
                    <span>{m.content}</span>
                  </div>
                ))}
            </div>
            <Button
              onClick={() =>
                handleDownload(
                  messages
                    .filter((m) => m.role === "assistant")
                    .map((m) => m.content)
                    .join("\n"),
                  messages.length
                )
              }
              className="m-2 bg-green-500 text-black hover:bg-green-600 ml-2 px-2 py-1 text-sm"
            >
              Download
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
