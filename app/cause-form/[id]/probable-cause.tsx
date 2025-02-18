import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ProbableCause({
  value,
  handleInputChange,
  label,
}: {
  value: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  label: string;
}) {
  return (
    <div>
      <Label htmlFor="probable-cause">{label}</Label>
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
    </div>
  );
}
