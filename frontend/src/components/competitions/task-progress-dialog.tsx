import React, { useState } from "react";
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
import { CompetitionTask } from "@/types/competition";
import api from "@/lib/api";
import { toast } from "sonner";

interface TaskProgressDialogProps {
  task: CompetitionTask;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProgressUpdated: () => void;
}

export const TaskProgressDialog: React.FC<TaskProgressDialogProps> = ({
  task,
  open,
  onOpenChange,
  onProgressUpdated,
}) => {
  const [currentValue, setCurrentValue] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentValue) return;

    setLoading(true);
    try {
      await api.put(`/competitions/tasks/${task.id}/progress`, {
        currentValue: parseFloat(currentValue),
        notes: notes.trim() || undefined,
      });

      toast.success("Progress updated successfully!");
      onProgressUpdated();
      setCurrentValue("");
      setNotes("");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to update progress"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Progress</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <h3 className="font-medium">{task.name}</h3>
            <p className="text-sm text-muted-foreground">
              Target: {task.targetValue} {task.unit}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentValue">Current Value ({task.unit})</Label>
            <Input
              id="currentValue"
              type="number"
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
              placeholder={`Enter value in ${task.unit}`}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about your progress..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !currentValue}>
              {loading ? "Updating..." : "Update Progress"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
