import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ProbableCause({
  value,
  handleInputChange,
}: {
  value: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) {
  return (
    <div>
      <Label htmlFor="probable-cause">
        I deem that there is probable cause to believe that the crime(s) as
        described have been committed by the arrestee:
      </Label>
      <div className="flex">
        <Textarea
          id="probable-cause"
          name="probable-cause"
          className="mt-2"
          value={value}
          onChange={handleInputChange}
          rows={10}
        />
      </div>
      {/* <ModelSelector /> */}
    </div>
  );
}

const useMutationObserver = (
  ref: React.MutableRefObject<HTMLElement | null>,
  callback: MutationCallback,
  options = {
    attributes: true,
    characterData: true,
    childList: true,
    subtree: true,
  }
) => {
  React.useEffect(() => {
    if (ref.current) {
      const observer = new MutationObserver(callback);
      observer.observe(ref.current, options);
      return () => observer.disconnect();
    }
  }, [ref, callback, options]);
};

import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const models = [
  {
    id: "gpt-3",
    name: "GPT-3",
    type: "text",
    description:
      "The third version of the Generative Pre-trained Transformer model by OpenAI.",
    strengths: [
      "Suitable for natural language tasks",
      "Can generate human-like text",
      "Supports multiple languages",
    ],
  },
  {
    id: "gpt-4",
    name: "GPT-4",
    type: "text",
    description:
      "The fourth version of the Generative Pre-trained Transformer model by OpenAI.",
    strengths: [
      "Suitable for natural language tasks",
      "Can generate human-like text",
      "Supports multiple languages",
    ],
  },
  {
    id: "code-gpt-3",
    name: "CodeGPT-3",
    type: "code",
    description: "A model fine-tuned for code generation tasks.",
    strengths: [
      "Suitable for code generation tasks",
      "Supports multiple languages",
    ],
  },
  {
    id: "code-gpt-4",
    name: "CodeGPT-4",
    type: "code",
    description: "A model fine-tuned for code generation tasks.",
    strengths: [
      "Suitable for code generation tasks",
      "Supports multiple languages",
    ],
  },
];

const types = Array.from(new Set(models.map((model) => model.type)));

export function ModelSelector() {
  const [open, setOpen] = React.useState(false);
  const [selectedModel, setSelectedModel] = React.useState(models[0]);
  const [peekedModel, setPeekedModel] = React.useState(models[0]);

  return (
    <div className="grid gap-2">
      <HoverCard openDelay={200}>
        <HoverCardTrigger asChild>
          <Label htmlFor="model">Model</Label>
        </HoverCardTrigger>
        <HoverCardContent
          align="start"
          className="w-[260px] text-sm"
          side="left"
        >
          The model which will generate the completion. Some models are suitable
          for natural language tasks, others specialize in code. Learn more.
        </HoverCardContent>
      </HoverCard>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select a model"
            className="w-full justify-between"
          >
            {selectedModel ? selectedModel.name : "Select a model..."}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[250px] p-0">
          <HoverCard>
            <HoverCardContent
              side="left"
              align="start"
              forceMount
              className="min-h-[280px]"
            >
              <div className="grid gap-2">
                <h4 className="font-medium leading-none">{peekedModel.name}</h4>
                <div className="text-sm text-muted-foreground">
                  {peekedModel.description}
                </div>
                {peekedModel.strengths ? (
                  <div className="mt-4 grid gap-2">
                    <h5 className="text-sm font-medium leading-none">
                      Strengths
                    </h5>
                    <ul className="text-sm text-muted-foreground">
                      {peekedModel.strengths}
                    </ul>
                  </div>
                ) : null}
              </div>
            </HoverCardContent>
            <Command loop>
              <CommandList className="h-[var(--cmdk-list-height)] max-h-[400px]">
                <CommandInput placeholder="Search Models..." />
                <CommandEmpty>No Models found.</CommandEmpty>
                <HoverCardTrigger />
                {types.map((type) => (
                  <CommandGroup key={type} heading={type}>
                    {models
                      .filter((model) => model.type === type)
                      .map((model) => (
                        <ModelItem
                          key={model.id}
                          model={model}
                          isSelected={selectedModel?.id === model.id}
                          onPeek={(model) => setPeekedModel(model)}
                          onSelect={() => {
                            setSelectedModel(model);
                            setOpen(false);
                          }}
                        />
                      ))}
                  </CommandGroup>
                ))}
              </CommandList>
            </Command>
          </HoverCard>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function ModelItem({
  model,
  isSelected,
  onSelect,
  onPeek,
}: {
  model: (typeof models)[0];
  isSelected: boolean;
  onSelect: () => void;
  onPeek: (model: (typeof models)[0]) => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  useMutationObserver(ref, (mutations) => {
    mutations.forEach((mutation) => {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "aria-selected" &&
        ref.current?.getAttribute("aria-selected") === "true"
      ) {
        onPeek(model);
      }
    });
  });

  return (
    <CommandItem
      key={model.id}
      onSelect={onSelect}
      ref={ref}
      className="data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground"
    >
      {model.name}
      <Check
        className={cn("ml-auto", isSelected ? "opacity-100" : "opacity-0")}
      />
    </CommandItem>
  );
}
