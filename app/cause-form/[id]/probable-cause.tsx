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
    </div>
  );
}
