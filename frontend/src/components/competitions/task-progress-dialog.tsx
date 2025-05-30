import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskWithProgress } from "@/types/competition";
import api from "@/lib/api";
import { toast } from "sonner";

interface TaskProgressDialogProps {
  task: TaskWithProgress;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProgressUpdated: () => void;
}

const INTEGER_ONLY_UNITS = [
  "sessions",
  "classes",
  "steps",
  "reps",
  "floors",
];

export const TaskProgressDialog: React.FC<TaskProgressDialogProps> = ({
  task,
  open,
  onOpenChange,
  onProgressUpdated,
}) => {
  const [newValue, setNewValue] = useState("");
  const [incrementValue, setIncrementValue] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [updateMode, setUpdateMode] = useState<"set" | "increment">("increment");

  const getCurrentProgress = () => {
    if (task.progress) {
      return task.progress.currentValue || "0";
    }
    if (task.userProgress && task.userProgress.length > 0) {
      return task.userProgress[0].currentValue || "0";
    }
    return "0";
  };

  const getCurrentNotes = () => {
    if (task.progress) {
      return task.progress.notes || "";
    }
    if (task.userProgress && task.userProgress.length > 0) {
      return task.userProgress[0].notes || "";
    }
    return "";
  };

  const currentProgress = getCurrentProgress();
  const currentValue = parseFloat(currentProgress);
  const targetValue = parseFloat(task.targetValue);
  const progressPercentage =
    targetValue > 0 ? Math.min((currentValue / targetValue) * 100, 100) : 0;

  const isIntegerOnlyUnit = INTEGER_ONLY_UNITS.includes(task.unit);

  useEffect(() => {
    if (open) {
      setNewValue(currentProgress);
      setIncrementValue("");
      setNotes(getCurrentNotes());
      setUpdateMode("increment");
    }
  }, [open, task]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const { key, target } = e;
    const input = target as HTMLInputElement;
    const currentValue = input.value;
    const cursorPosition = input.selectionStart || 0;

    // Allow control keys (backspace, delete, arrow keys, tab, etc.)
    if (
      key === "Backspace" ||
      key === "Delete" ||
      key === "ArrowLeft" ||
      key === "ArrowRight" ||
      key === "ArrowUp" ||
      key === "ArrowDown" ||
      key === "Tab" ||
      key === "Enter" ||
      key === "Escape" ||
      (e.ctrlKey && (key === "a" || key === "c" || key === "v" || key === "x"))
    ) {
      return;
    }

    // Only allow digits, minus, and decimal point
    if (!/^[0-9.-]$/.test(key)) {
      e.preventDefault();
      return;
    }

    // Check length limit (20 digits)
    const digitsOnly = currentValue.replace(/[^0-9]/g, "");
    if (/^[0-9]$/.test(key) && digitsOnly.length >= 20) {
      e.preventDefault();
      return;
    }

    // Handle minus sign
    if (key === "-") {
      // Special case: if current value is exactly "0", replace it with "-"
      if (currentValue === "0") {
        e.preventDefault();
        const setValue =
          input.id === "incrementValue" ? setIncrementValue : setNewValue;
        setValue("-");
        return;
      }

      // Only allow minus at the beginning and if there's no minus already
      if (cursorPosition !== 0 || currentValue.includes("-")) {
        e.preventDefault();
        return;
      }
    }

    // Handle decimal point
    if (key === ".") {
      // Block decimal point for integer-only units
      if (isIntegerOnlyUnit) {
        e.preventDefault();
        return;
      }

      // Block if decimal point already exists
      if (currentValue.includes(".")) {
        e.preventDefault();
        return;
      }
    }

    // Handle digits
    if (/^[0-9]$/.test(key)) {
      // Check if we're adding to decimal places
      const decimalIndex = currentValue.indexOf(".");
      if (decimalIndex !== -1) {
        const decimalPlaces = currentValue.substring(decimalIndex + 1);
        if (cursorPosition > decimalIndex && decimalPlaces.length >= 2) {
          e.preventDefault();
          return;
        }
      }
    }
  };

  const handleInputChange = (
    value: string,
    setValue: (value: string) => void
  ) => {
    // Handle special cases for decimal point
    if (value === ".") {
      setValue("0.");
      return;
    }
    if (value === "-.") {
      setValue("-0.");
      return;
    }

    // Remove leading zeros (except for valid cases)
    if (value.match(/^-?0+\d/) && !value.includes(".")) {
      const isNegative = value.startsWith("-");
      const withoutLeadingZeros = value.replace(/^-?0+/, "");
      value = isNegative ? "-" + withoutLeadingZeros : withoutLeadingZeros;
    }

    setValue(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalValue: number = currentValue;
    let inputValue: string = "";
    let hasValidProgressInput = false;

    if (updateMode === "set") {
      inputValue = newValue;
      if (inputValue && inputValue !== "-") {
        finalValue = parseFloat(inputValue);
        hasValidProgressInput = true;
      }
    } else {
      inputValue = incrementValue;
      if (inputValue && inputValue !== "-" && inputValue !== "0") {
        const increment = parseFloat(inputValue);
        finalValue = currentValue + increment;
        hasValidProgressInput = true;
      }
    }

    // Check if there are no changes
    const newNotes = notes.trim();
    const currentNotes = getCurrentNotes();
    const hasProgressChange = hasValidProgressInput && finalValue !== currentValue;
    const hasNotesChange = newNotes !== currentNotes;

    if (!hasProgressChange && !hasNotesChange) {
      toast.info("No changes to save");
      return;
    }

    // Only apply progress validation if we have a valid progress input
    if (hasValidProgressInput) {
      // Cap negative values to 0
      if (finalValue < 0) {
        finalValue = 0;
        toast.info("Progress cannot be negative, set to 0");
      }

      // Cap at target value
      const cappedValue = Math.min(finalValue, targetValue);
      if (finalValue > targetValue) {
        toast.info(
          `Progress capped at target value of ${targetValue} ${task.unit}`
        );
      }
      finalValue = cappedValue;
    }

    setLoading(true);
    try {
      const updateData: any = {
        currentValue: finalValue,
        notes: newNotes === "" ? "" : newNotes,
      };

      await api.put(`/competitions/tasks/${task.id}/progress`, updateData);

      toast.success(
        hasProgressChange && hasNotesChange
          ? "Progress and notes updated successfully!"
          : hasProgressChange
          ? "Progress updated successfully!"
          : "Notes updated successfully!"
      );
      onProgressUpdated();
      setNewValue("");
      setIncrementValue("");
      setNotes("");
    } catch (error: any) {
      console.error("Error updating progress:", error);
      toast.error(
        error.response?.data?.message || "Failed to update progress"
      );
    } finally {
      setLoading(false);
    }
  };

  const getPreviewValue = () => {
    if (updateMode === "set") {
      // Handle case where input is just "-" or empty
      if (!newValue || newValue === "-") {
        return 0;
      }
      const setValue = parseFloat(newValue);
      // Cap negative values to 0 for preview
      const cappedSetValue = Math.max(0, setValue);
      return Math.min(cappedSetValue, targetValue);
    } else {
      // Handle case where input is just "-" or empty
      if (!incrementValue || incrementValue === "-") {
        return currentValue;
      }
      const increment = parseFloat(incrementValue);
      const newTotal = currentValue + increment;
      // Cap negative values to 0 for preview
      const cappedTotal = Math.max(0, newTotal);
      return Math.min(cappedTotal, targetValue);
    }
  };

  const previewValue = getPreviewValue();
  const previewPercentage =
    targetValue > 0 ? Math.min((previewValue / targetValue) * 100, 100) : 0;

  const getWarningMessage = () => {
    if (updateMode === "set") {
      if (!newValue || newValue === "-") return null;
      const setValue = parseFloat(newValue);
      if (setValue < 0) {
        return (
          <span className="text-amber-600">
            {" "}
            (will be capped at 0 {task.unit})
          </span>
        );
      }
      if (setValue > targetValue) {
        return (
          <span className="text-amber-600">
            {" "}
            (will be capped at {targetValue} {task.unit})
          </span>
        );
      }
    } else {
      if (!incrementValue || incrementValue === "-") return null;
      const increment = parseFloat(incrementValue);
      const newTotal = currentValue + increment;
      if (newTotal < 0) {
        return (
          <span className="text-amber-600">
            {" "}
            (will be capped at 0 {task.unit})
          </span>
        );
      }
      if (newTotal > targetValue) {
        return (
          <span className="text-amber-600">
            {" "}
            (will be capped at {targetValue} {task.unit})
          </span>
        );
      }
    }
    return null;
  };

  const isSubmitDisabled = () => {
    if (loading) return true;

    // Check if notes have changed
    const newNotes = notes.trim();
    const currentNotes = getCurrentNotes();
    const hasNotesChange = newNotes !== currentNotes;

    // If notes changed, allow submission regardless of progress input
    if (hasNotesChange) return false;

    // Check if input is empty, just "-", or "0" for increment mode
    if (updateMode === "increment") {
      if (!incrementValue || incrementValue === "-" || incrementValue === "0") {
        return true;
      }
    } else {
      if (!newValue || newValue === "-") return true;
    }

    return false;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md overflow-hidden">
        <DialogHeader>
          <DialogTitle className="break-words">Update Progress</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-hidden">
          <div className="overflow-hidden">
            <h3 className="font-medium break-words">{task.name}</h3>
            <p className="text-sm text-muted-foreground break-words">
              Target: {targetValue.toLocaleString()} {task.unit}
            </p>
          </div>

          {/* Current Progress Display */}
          <div className="space-y-2 overflow-hidden">
            <div className="flex items-center justify-between overflow-hidden">
              <span className="text-sm font-medium">Current Progress</span>
              <Badge variant="outline" className="break-words min-w-0">
                {currentValue.toLocaleString()} / {targetValue.toLocaleString()} {task.unit}
              </Badge>
            </div>
            <Progress value={progressPercentage} />
            <p className="text-xs text-muted-foreground text-center break-words">
              {progressPercentage.toFixed(1)}% complete
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 overflow-hidden">
            {/* Update Mode Tabs */}
            <Tabs
              value={updateMode}
              onValueChange={(value) =>
                setUpdateMode(value as "set" | "increment")
              }
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="increment">Add Progress</TabsTrigger>
                <TabsTrigger value="set">Set Total</TabsTrigger>
              </TabsList>

              <TabsContent value="increment" className="space-y-4 mt-4 overflow-hidden">
                <div className="space-y-2 overflow-hidden">
                  <Label htmlFor="incrementValue" className="break-words">
                    Add to Progress ({task.unit})
                  </Label>
                  <Input
                    id="incrementValue"
                    type="text"
                    value={incrementValue}
                    onKeyDown={handleKeyDown}
                    onChange={(e) =>
                      handleInputChange(e.target.value, setIncrementValue)
                    }
                    placeholder={`Enter amount to add in ${task.unit}`}
                    maxLength={22}
                    className="w-full min-w-0"
                  />
                  <p className="text-xs text-muted-foreground break-words overflow-hidden">
                    This will be added to your current progress of{" "}
                    {currentValue.toLocaleString()} {task.unit}. Use negative values to subtract.
                    {getWarningMessage()}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="set" className="space-y-4 mt-4 overflow-hidden">
                <div className="space-y-2 overflow-hidden">
                  <Label htmlFor="newValue" className="break-words">
                    Set Total Progress ({task.unit})
                  </Label>
                  <Input
                    id="newValue"
                    type="text"
                    value={newValue}
                    onKeyDown={handleKeyDown}
                    onChange={(e) =>
                      handleInputChange(e.target.value, setNewValue)
                    }
                    placeholder={`Enter total value in ${task.unit}`}
                    maxLength={22}
                    className="w-full min-w-0"
                  />
                  <p className="text-xs text-muted-foreground break-words overflow-hidden">
                    This will replace your current progress
                    {getWarningMessage()}
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Preview */}
            <div className="space-y-2 p-3 bg-muted rounded-lg overflow-hidden">
              <div className="flex items-center justify-between overflow-hidden">
                <span className="text-sm font-medium">Preview</span>
                <Badge variant="secondary" className="break-words min-w-0">
                  {previewValue.toLocaleString()} / {targetValue.toLocaleString()} {task.unit}
                </Badge>
              </div>
              <Progress value={previewPercentage} />
              <p className="text-xs text-muted-foreground text-center break-words overflow-hidden">
                {previewPercentage.toFixed(1)}% complete
                {previewPercentage >= 100 && " 🎉 Task Complete!"}
              </p>
            </div>

            <div className="space-y-2 overflow-hidden">
              <Label htmlFor="notes" className="break-words">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about your progress..."
                className="resize-none h-12 overflow-y-auto w-full min-w-0 break-words"
              />
            </div>

            <DialogFooter className="overflow-hidden">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="min-w-0"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitDisabled()} className="min-w-0">
                {loading ? "Updating..." : "Update Progress"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
