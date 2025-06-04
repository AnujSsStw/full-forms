"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlignLeft,
  Clock,
  FileText,
  MapPin,
  Users,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
// import { useLookupService } from "@/hooks/use-lookup-service";
import { VirtualizedCombobox } from "@/components/virtualized-combobox";
import { PenalCode } from "@/lib/pc";
import { cn } from "@/lib/utils";
import { SirEntryFormValues } from "./sir-entry-form";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ActivityCardProps {
  index: number;
  onDelete?: () => void;
}

export function ActivityCard({ index, onDelete }: ActivityCardProps) {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext<SirEntryFormValues>();

  const [showOtherField, setShowOtherField] = useState(false);
  const activityPath = `activities.${index}` as const;

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardContent className="pt-6">
        <div className="flex justify-end mb-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor={`${activityPath}.event_time`}>Time</Label>
            </div>
            <Input
              id={`${activityPath}.event_time`}
              type="time"
              {...register(`activities.${index}.event_time`)}
              className={
                errors?.activities?.[index]?.event_time
                  ? "border-destructive"
                  : ""
              }
            />
            {errors?.activities?.[index]?.event_time && (
              <p className="text-xs text-destructive">
                {errors.activities[index]?.event_time?.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor={`${activityPath}.file_number`}>
                File Number (Optional)
              </Label>
            </div>
            <Input
              id={`${activityPath}.file_number`}
              {...register(`activities.${index}.file_number`)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Label>Penal Code</Label>
            </div>
            <VirtualizedCombobox
              options={PenalCode.concat({
                code_number: "9999",
                narrative: "Other",
                codeType: "Other",
                m_f: "M",
                _creationTime: 0,
                _id: "9999",
              })}
              searchPlaceholder="Search for a penal code"
              onSelect={async (value) => {
                setValue(`activities.${index}.penal_code`, value);
                setShowOtherField(value.code_number === "9999");
              }}
              width="100%"
              selectedOptionWidth="500px"
            />
          </div>

          {showOtherField && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Label>Incident Type</Label>
              </div>
              <Input
                id={`${activityPath}.incident_type`}
                {...register(`${activityPath}.incident_type`)}
                placeholder="Specify the incident type"
              />
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Label>City</Label>
            </div>
            <Select
              onValueChange={(value) =>
                setValue(`activities.${index}.city`, value)
              }
              defaultValue={watch(`activities.${index}.city`) || undefined}
            >
              <SelectTrigger id={`${activityPath}.city`}>
                <SelectValue placeholder="Select a city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Indian Wells">Indian Wells</SelectItem>
                <SelectItem value="Palm Desert">Palm Desert</SelectItem>
                <SelectItem value="Rancho Mirage">Rancho Mirage</SelectItem>
                <SelectItem value="County">County</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor={`${activityPath}.location`}>Location</Label>
            </div>
            <Input
              id={`${activityPath}.location`}
              {...register(`activities.${index}.location`)}
              className={
                errors?.activities?.[index]?.location
                  ? "border-destructive"
                  : ""
              }
            />
            {errors?.activities?.[index]?.location && (
              <p className="text-xs text-destructive">
                {errors.activities[index]?.location?.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor={`${activityPath}.subject_info`}>
                Subject Information
              </Label>
            </div>
            <Input
              id={`${activityPath}.subject_info`}
              {...register(`activities.${index}.subject_info`)}
              className={
                errors?.activities?.[index]?.subject_info
                  ? "border-destructive"
                  : ""
              }
            />
            {errors?.activities?.[index]?.subject_info && (
              <p className="text-xs text-destructive">
                {errors.activities[index]?.subject_info?.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center space-x-2">
              <AlignLeft className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor={`${activityPath}.narrative`}>Narrative</Label>
            </div>
            <Textarea
              id={`${activityPath}.narrative`}
              {...register(`activities.${index}.narrative`)}
              className={cn(
                "min-h-[100px]",
                errors?.activities?.[index]?.narrative
                  ? "border-destructive"
                  : ""
              )}
            />
            {errors?.activities?.[index]?.narrative && (
              <p className="text-xs text-destructive">
                {errors.activities[index]?.narrative?.message as string}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
