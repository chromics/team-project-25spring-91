import React from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Gym } from '@/types/gym';
import { motion, AnimatePresence } from "framer-motion";

type StepNumber = 1 | 2;

const stepTitles: Record<StepNumber, string> = {
  1: "Choose Membership",
  2: "Confirmation"
};

interface MembershipDialogProps {
  gym: Gym;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function MembershipDialog({ gym, open, onOpenChange }: MembershipDialogProps) {
  const [step, setStep] = React.useState<StepNumber>(1);
  const [selectedPlan, setSelectedPlan] = React.useState<string>("");

  const resetAndClose = () => {
    onOpenChange(false);
    setStep(1);
    setSelectedPlan("");
  };

  const handleNext = () => {
    if (!selectedPlan) return;
    if (step < 2) setStep((step + 1) as StepNumber);
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as StepNumber);
  };

  const membershipPlans = [
    {
      name: "Basic",
      price: "29",
      period: "month",
      features: [
        "Access to gym equipment",
        "Standard operating hours",
        "Locker room access",
      ],
    },
    {
      name: "Premium",
      price: "49",
      period: "month",
      features: [
        "All Basic features",
        "Group fitness classes",
        "Extended hours access",
        "Personal trainer consultation",
        "Access to swimming pool",
      ],
      highlighted: true,
    },
    {
      name: "Elite",
      price: "89",
      period: "month",
      features: [
        "All Premium features",
        "Unlimited guest passes",
        "Private locker",
        "Spa access",
        "Priority booking",
        "Nutrition consultation",
      ],
    },
  ];
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="h-[450px] md:h-[450px] overflow-y-auto md:overflow-visible px-1" // Scrollable container on mobile
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:h-full">
              {membershipPlans.map((plan) => (
                <Card
                  key={plan.name}
                  className={`relative flex flex-col md:h-full ${
                    selectedPlan === plan.name
                      ? 'border-primary ring-2 ring-primary ring-offset-2'
                      : ''
                  } ${
                    plan.highlighted
                      ? 'shadow-lg'
                      : ''
                  }`}
                >
                  <CardHeader className="flex-none pb-4">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className="text-sm text-muted-foreground">/{plan.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 md:overflow-y-auto">
                    <div className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Check className="h-4 w-4 flex-none mt-1 text-primary" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex-none pt-4 bg-background">
                    <Button
                      variant={selectedPlan === plan.name ? "default" : "outline"}
                      className="w-full"
                      onClick={() => setSelectedPlan(plan.name)}
                    >
                      {selectedPlan === plan.name ? "Selected" : "Select"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="h-[450px] flex items-center justify-center"
          >
            <div className="space-y-4 text-center">
              <div className="text-green-600 text-xl font-semibold">
                Welcome to {gym.name}!
              </div>
              <div>
                <p>You've selected the:</p>
                <p className="text-2xl font-bold">{selectedPlan} Plan</p>
                <p className="mt-4 text-muted-foreground">
                  Please check your email for further instructions on completing your membership registration.
                </p>
              </div>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] h-[600px] md:h-auto">
        <DialogHeader>
          <DialogTitle>{gym.name} - {stepTitles[step]}</DialogTitle>
          <div className="flex gap-1 mt-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full ${
                  i <= step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </DialogHeader>

        <div className="relative flex-1 -mx-6 md:mx-0"> {/* Negative margin to allow full-width scroll on mobile */}
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
          {step < 2 ? (
            <Button onClick={handleNext} disabled={!selectedPlan}>
              Next
            </Button>
          ) : (
            <Button onClick={resetAndClose}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default MembershipDialog;