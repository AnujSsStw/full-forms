"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ActivityCard } from "./activity-card";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const formSchema = z.object({
  date: z.date({
    required_error: "Date is required",
  }),
  activities: z
    .array(
      z.object({
        event_time: z.string().min(1, { message: "Time is required" }),
        penal_code: z.object({
          codeType: z.string(),
          code_number: z.string(),
          m_f: z.string(),
          narrative: z.string(),
        }),
        city: z.string().nullable(),
        location: z.string().min(1, { message: "Location is required" }),
        subject_info: z
          .string()
          .min(1, { message: "Subject info is required" }),
        narrative: z.string().min(1, { message: "Narrative is required" }),
        file_number: z.string().optional().nullable(),
        incident_type: z.string().optional().nullable(),
      })
    )
    .nonempty({ message: "At least one activity is required" }),
});

export type SirEntryFormValues = z.infer<typeof formSchema>;

export function SirEntryForm() {
  const createSirEntry = useMutation(api.mutation.createSirEntry);
  const [activityCount, setActivityCount] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<SirEntryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      activities: [{}],
    },
  });

  const onSubmit = async (data: SirEntryFormValues) => {
    setIsSubmitting(true);
    try {
      const formattedData = {
        date: format(data.date, "yyyy-MM-dd"),
        activities: data.activities.map((activity) => ({
          ...activity,
          event_time: activity.event_time,
          city: activity.city || undefined,
          file_number: activity.file_number || undefined,
          incident_type: activity.incident_type || undefined,
        })),
      };

      await createSirEntry({
        date: formattedData.date,
        activities: formattedData.activities,
      });

      toast.success("SIR entry has been saved.");

      // Reset form
      methods.reset({
        date: new Date(),
        activities: [{}],
      });
      setActivityCount(1);
    } catch (error) {
      toast.error("Failed to save SIR entry. Please try again.");
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addActivity = () => {
    const activities = methods.getValues("activities") || [];
    methods.setValue("activities", [
      ...activities,
      {
        event_time: "",
        penal_code: { codeType: "", code_number: "", m_f: "", narrative: "" },
        city: null,
        location: "",
        subject_info: "",
        narrative: "",
        file_number: null,
        incident_type: null,
      },
    ]);
    setActivityCount((prev) => prev + 1);
  };

  const deleteActivity = (index: number) => {
    const activities = methods.getValues("activities");
    if (activities.length <= 1) return; // Don't delete if it's the last activity
    const newActivities = activities.filter((_, i) => i !== index);
    if (newActivities.length === 0) return; // Ensure we don't set an empty array
    methods.setValue("activities", newActivities as any);
    setActivityCount((prev) => prev - 1);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-3">SIR Entry Form</h2>
          <div className="grid gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !methods.watch("date") && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {methods.watch("date") ? (
                      format(methods.watch("date"), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={methods.watch("date")}
                    onSelect={(date) => date && methods.setValue("date", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {methods.formState.errors.date && (
                <p className="text-sm text-destructive mt-1">
                  {methods.formState.errors.date.message}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-md font-medium">Activities</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addActivity}
                  className="flex items-center"
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add Activity
                </Button>
              </div>

              {Array.from({ length: activityCount }).map((_, index) => (
                <ActivityCard
                  key={index}
                  index={index}
                  onDelete={() => deleteActivity(index)}
                />
              ))}

              {methods.formState.errors.activities && (
                <p className="text-sm text-destructive">
                  {methods.formState.errors.activities.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || activityCount === 0}
        >
          {isSubmitting ? "Saving..." : "Save SIR Entry"}
          Save SIR Entry
        </Button>
      </form>
    </FormProvider>
  );
}
