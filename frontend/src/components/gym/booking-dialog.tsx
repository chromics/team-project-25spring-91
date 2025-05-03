import React from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Gym } from '@/types/gym';
import { motion, AnimatePresence } from "framer-motion";

type StepNumber = 1 | 2 | 3;

const stepTitles: Record<StepNumber, string> = {
  1: "Select Class Time",
  2: "Class Details",
  3: "Confirmation"
};

interface BookingDialogProps {
  gym: Gym;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function BookingDialog({ gym, open, onOpenChange }: BookingDialogProps) {
  const [step, setStep] = React.useState<StepNumber>(1);
  const [date, setDate] = React.useState<Date>(new Date());
  const [timeSlot, setTimeSlot] = React.useState<string>("");

  const resetAndClose = () => {
    onOpenChange(false);
    setStep(1);
    setDate(new Date());
    setTimeSlot("");
  };

  const handleNext = () => {
    if (step < 3) setStep((step + 1) as StepNumber);
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as StepNumber);
  };

  const timeSlots = [
    "09:00 AM - Yoga",
    "10:30 AM - HIIT",
    "02:00 PM - Strength",
    "04:30 PM - Pilates"
  ];

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col items-center justify-center space-y-4 h-[400px] overflow-y-auto"
          >
            
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                className="rounded-md border"
              />
              <RadioGroup value={timeSlot} onValueChange={setTimeSlot}>
                <div className="space-y-2">
                  {timeSlots.map((slot) => (
                    <div key={slot} className="flex items-center space-x-2">
                      <RadioGroupItem value={slot} id={slot} />
                      <Label htmlFor={slot}>{slot}</Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-[400px] overflow-y-auto"
          >
            <Card>
              <CardContent className="space-y-4 pt-4">
                <div>
                  <h3 className="font-semibold">Selected Class:</h3>
                  <p>{timeSlot}</p>
                  <p>Date: {date.toLocaleDateString()}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Class Information:</h3>
                  <p>Duration: 60 minutes</p>
                  <p>Intensity: Intermediate</p>
                  <p>Equipment: Yoga mat, water bottle</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" />
                  <Label htmlFor="terms">I agree to the terms and conditions</Label>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-[400px] flex items-center justify-center"
          >
            <div className="space-y-4 text-center">
              <div className="text-green-600 text-xl font-semibold">
                Booking Confirmed!
              </div>
              <div>
                <p>You're all set for:</p>
                <p className="font-semibold">{timeSlot}</p>
                <p>on {date.toLocaleDateString()}</p>
              </div>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{gym.name} - {stepTitles[step]}</DialogTitle>
          <div className="flex gap-1 mt-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full ${i <= step ? 'bg-primary' : 'bg-muted'
                  }`}
              />
            ))}
          </div>
        </DialogHeader>

        <div className="relative">
          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>
        </div>

        <DialogFooter className="flex justify-between">
          {step > 1 && (
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={handleNext}>Next</Button>
          ) : (
            <Button onClick={resetAndClose}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default BookingDialog;