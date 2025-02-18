import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { Copy, PlusIcon, SendIcon, TrashIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const welcomeMessage = "Welcome! How can I help you?";

export function CauseFormIdSuggestion({
  data,
  sessionId,
  handleCauseFom,
  firstMsgId,
  label,
  type,
}: {
  data: any;
  sessionId: string;
  firstMsgId: string;
  handleCauseFom: (e: any) => void;
  label?: string;
  type?: "arrest" | "probable-cause";
}) {
  const remoteMessages = useQuery(api.message.list, { sessionId });
  const messages = useMemo(
    () =>
      [
        {
          isViewer: false,
          text: welcomeMessage,
          _id: "0",
        },
      ].concat(
        (remoteMessages ?? []) as {
          isViewer: boolean;
          text: string;
          _id: string;
        }[]
      ),
    [remoteMessages, welcomeMessage]
  );
  const sendMessage = useMutation(api.message.send);
  const clearMesages = useMutation(api.message.clear);

  const [isScrolled, setScrolled] = useState(false);

  const [inputValue, setInputValue] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const [isOpen, setIsOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const tags = ["suggestion", "example", "check"];

  const findMentionStart = (text: string | string[], cursorPos: number) => {
    let start = cursorPos;
    while (start > 0 && text[start - 1] !== "@" && text[start - 1] !== " ") {
      start--;
    }
    if (start > 0 && text[start - 1] === "@") {
      return start - 1;
    }
    return -1;
  };

  const handleInputChange = (e: {
    target: { value: any; selectionStart: any };
  }) => {
    const newValue = e.target.value;
    const newPosition = e.target.selectionStart;
    setInputValue(newValue);
    setCursorPosition(newPosition);

    const mentionStart = findMentionStart(newValue, newPosition);
    if (mentionStart >= 0) {
      const query = newValue.slice(mentionStart + 1, newPosition).toLowerCase();
      const filtered = tags.filter((user) =>
        user.toLowerCase().includes(query)
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const insertMention = (user: string) => {
    const mentionStart = findMentionStart(inputValue, cursorPosition);
    if (mentionStart >= 0) {
      const beforeMention = inputValue.slice(0, mentionStart);
      const afterMention = inputValue.slice(cursorPosition);
      const newValue = `${beforeMention}@${user} ${afterMention}`;
      setInputValue(newValue);
      setShowSuggestions(false);

      // Focus back on input after selection
      if (inputRef.current) {
        inputRef.current?.focus();
      }
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSuggestions(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleSend = async () => {
    console.log("handleSend");
    if (inputValue.includes("@suggestion")) {
      await sendMessage({
        message:
          inputValue +
          `${type === "arrest" ? data["attachments"] : data["probable-cause"]}`,
        sessionId,
      });
    } else if (inputValue.includes("@example")) {
      await sendMessage({
        message: "write me an example with this data" + inputValue,
        sessionId,
      });
    } else if (inputValue.includes("@check")) {
      await sendMessage({
        message:
          "check the data for Legal Standards, Evidence Reliability, Constitutional Requirements, Documentation Quality, Procedural Compliance, Investigative Thoroughness, Specific Crime Elements" +
          inputValue,
        sessionId,
      });
    } else {
      await sendMessage({ message: inputValue, sessionId });
    }

    setInputValue("");
    setScrolled(false);
  };

  const handleClearMessages = async () => {
    await clearMesages({ sessionId });
    setScrolled(false);
  };

  const listRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );

      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages]);

  // useEffect(() => {
  //   if (isScrolled) {
  //     return;
  //   }
  //   // Using `setTimeout` to make sure scrollTo works on button click in Chrome
  //   setTimeout(() => {
  //     listRef.current?.scrollTo({
  //       top: listRef.current.scrollHeight,
  //       behavior: "smooth",
  //     });
  //   }, 0);
  // }, [messages, isScrolled]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button type="button">{label ?? "Probable Cause Analysis"}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[700px] xl:max-w-[800px] w-[90vw] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{label ?? "Probable Cause Analysis"}</DialogTitle>
          {/* <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription> */}
        </DialogHeader>
        {/* <div
          className="flex-grow overflow-scroll gap-2 flex flex-col mx-2 pb-2 rounded-lg h-80"
          ref={listRef}
          onWheel={() => {
            setScrolled(true);
          }}
        > */}
        <ScrollArea
          className="flex-grow px-4 pb-4 space-y-4 border rounded-md"
          ref={scrollAreaRef}
        >
          {remoteMessages === undefined ? (
            <>
              <div className="animate-pulse rounded-md bg-black/10 h-5" />
              <div className="animate-pulse rounded-md bg-black/10 h-9" />
            </>
          ) : (
            messages.map((message) => (
              <div
                key={message._id}
                className={cn(
                  message._id === firstMsgId ? "hidden" : "",
                  "py-2"
                )}
              >
                <div className={"text-neutral-400 text-sm " + "text-right"}>
                  {message.isViewer ? <>You</> : <>{name}</>}
                </div>
                {message.text === "" ? (
                  <div className="animate-pulse rounded-md bg-black/10 h-9" />
                ) : (
                  <div
                    className={
                      "w-full rounded-xl px-3 py-2 whitespace-pre-wrap " +
                      (message.isViewer
                        ? "bg-neutral-200 dark:bg-neutral-800 "
                        : "bg-neutral-100 dark:bg-neutral-900 ") +
                      (message.isViewer ? "rounded-tr-none" : "rounded-tl-none")
                    }
                  >
                    {message.text}
                    {!message.isViewer && message._id !== "0" && (
                      <div className="pt-2 flex">
                        <Button
                          className="w-8 h-8"
                          type="button"
                          variant={"outline"}
                          onClick={() => {
                            handleCauseFom(message.text);
                          }}
                        >
                          <PlusIcon />
                        </Button>
                        <Button
                          className="w-8 h-8"
                          type="button"
                          variant={"outline"}
                          onClick={async () => {
                            await navigator.clipboard.writeText(message.text);
                          }}
                        >
                          <Copy />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </ScrollArea>
        {/* </div> */}
        <DialogFooter className="sm:justify-normal">
          <form className="w-full flex items-center gap-3 relative">
            <div className="flex-1 relative">
              <Textarea
                rows={3}
                className="w-full"
                autoFocus
                name="message"
                placeholder="Send a message or type @ to see options"
                value={inputValue}
                onChange={handleInputChange}
                ref={inputRef}
              />
              {showSuggestions && (
                <div className="absolute left-0 right-0 bottom-full mb-1 border rounded-md shadow-lg max-h-48 overflow-y-auto bg-white dark:bg-black">
                  {suggestions.map((user, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-950"
                      onClick={() => insertMention(user)}
                    >
                      {user}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={handleSend}
              type="button"
              disabled={inputValue === ""}
              className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SendIcon className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => void handleClearMessages()}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <TrashIcon color="red" className="h-5 w-5" />
            </button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
