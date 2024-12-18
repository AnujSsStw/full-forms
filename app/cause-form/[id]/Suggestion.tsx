import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { SendIcon, TrashIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const welcomeMessage = "Welcome to the Cause Form! How can I help you?";

export function CauseFormIdSuggestion({
  data,
  sessionId,
  firstMsgId,
}: {
  data: any;
  sessionId: string;
  firstMsgId: string;
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

  const [expanded, setExpanded] = useState(false);
  const [isScrolled, setScrolled] = useState(false);

  const [input, setInput] = useState("");

  const handleExpand = () => {
    setExpanded(!expanded);
    setScrolled(false);
  };

  const handleSend = async () => {
    console.log("handleSend");

    await sendMessage({ message: input, sessionId });
    setInput("");
    setScrolled(false);
  };

  const handleClearMessages = async () => {
    await clearMesages({ sessionId });
    setScrolled(false);
  };

  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isScrolled) {
      return;
    }
    // Using `setTimeout` to make sure scrollTo works on button click in Chrome
    setTimeout(() => {
      listRef.current?.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 0);
  }, [messages, isScrolled]);

  return (
    <Dialog>
      <DialogTrigger>
        <Button type="button">Suggestions</Button>
      </DialogTrigger>
      <DialogContent className="md:max-w-[70rem] max-w-xl">
        <DialogHeader>
          <DialogTitle>Probable Cause From Helper</DialogTitle>
          {/* <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription> */}
        </DialogHeader>
        <div
          className="flex-grow overflow-scroll gap-2 flex flex-col mx-2 pb-2 rounded-lg h-80"
          ref={listRef}
          onWheel={() => {
            setScrolled(true);
          }}
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
                className={cn(message._id === firstMsgId ? "hidden" : "")}
              >
                <div
                  className={
                    "text-neutral-400 text-sm " +
                    (message.isViewer && !expanded ? "text-right" : "")
                  }
                >
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
                      (message.isViewer && !expanded
                        ? "rounded-tr-none"
                        : "rounded-tl-none")
                    }
                  >
                    {message.text}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        <DialogFooter className="sm:justify-normal">
          <form className="w-full flex items-center gap-3">
            <Textarea
              rows={3}
              className=""
              autoFocus
              name="message"
              placeholder="Send a message"
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />
            <button
              onClick={handleSend}
              type="button"
              disabled={input === ""}
              className=""
            >
              <SendIcon className="w-5 h-5" />
            </button>
            <button type="button" onClick={() => void handleClearMessages()}>
              <TrashIcon color="red" className="h-5 w-5" />
            </button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
