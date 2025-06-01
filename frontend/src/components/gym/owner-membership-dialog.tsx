// components/gym/owner-membership-dialog.tsx
"use client"

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Edit, Trash2, Plus } from "lucide-react";
import { Gym, MembershipPlan } from '@/types/gym';
import { motion, AnimatePresence } from "framer-motion";
import { toast } from 'sonner';
import api from '@/lib/api';

interface OwnerMembershipDialogProps {
  gym: Gym;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface MembershipFormData {
  name: string;
  description: string;
  price: string;
  durationDays: string;
  maxBookingsPerWeek: string;
  isActive: boolean;
}

const OwnerMembershipDialog: React.FC<OwnerMembershipDialogProps> = ({ 
  gym, 
  open, 
  onOpenChange 
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [membershipPlans, setMembershipPlans] = useState<MembershipPlan[]>([]);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<MembershipPlan | null>(null);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const [formData, setFormData] = useState<MembershipFormData>({
    name: '',
    description: '',
    price: '',
    durationDays: '',
    maxBookingsPerWeek: '10',
    isActive: true,
  });

  useEffect(() => {
    if (open) {
      handleFetchPlans();
    }
  }, [gym.id, open]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      durationDays: '',
      maxBookingsPerWeek: '10',
      isActive: true,
    });
    setEditingPlan(null);
    setShowAddForm(false);
  };

  const handleFetchPlans = async () => {
    try {
      setLoading(true);
      const { data } = await api.get<{ data: MembershipPlan[] }>(
        `/gyms/${gym.id}/membership-plans`
      );
      setMembershipPlans(data.data);
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Failed to load membership plans");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = (plan: MembershipPlan) => {
    setFormData({
      name: plan.name,
      description: plan.description,
      price: plan.price.toString(),
      durationDays: plan.durationDays.toString(),
      maxBookingsPerWeek: plan.maxBookingsPerWeek.toString(),
      isActive: plan.isActive,
    });
    setEditingPlan(plan);
    setShowAddForm(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const submitData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        durationDays: parseInt(formData.durationDays),
        maxBookingsPerWeek: parseInt(formData.maxBookingsPerWeek),
        isActive: formData.isActive,
      };

      if (editingPlan) {
        // Update existing plan
        await api.put(`/membership-plans/plans/${editingPlan.id}`, submitData);
        toast.success('Membership plan updated successfully!');
      } else {
        // Create new plan
        await api.post(`/gyms/${gym.id}/membership-plans`, submitData);
        toast.success('Membership plan created successfully!');
      }
      
      resetForm();
      handleFetchPlans();
    } catch (error: any) {
      console.error('Error saving plan:', error);
      toast.error(
        editingPlan 
          ? 'Failed to update membership plan' 
          : 'Failed to create membership plan'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingPlan) return;
    
    try {
      await api.delete(`/membership-plans/plans/${deletingPlan.id}`);
      toast.success('Membership plan deleted successfully!');
      setDeletingPlan(null);
      handleFetchPlans();
    } catch (error: any) {
      console.error('Error deleting plan:', error);
      toast.error('Failed to delete membership plan');
    }
  };

  if (showAddForm) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? 'Edit' : 'Add'} Membership Plan
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Plan Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Gold Monthly"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe what's included in this plan"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="49.99"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="durationDays">Duration (Days)</Label>
                <Input
                  id="durationDays"
                  name="durationDays"
                  type="number"
                  value={formData.durationDays}
                  onChange={handleInputChange}
                  placeholder="30"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxBookingsPerWeek">Max Bookings Per Week</Label>
              <Input
                id="maxBookingsPerWeek"
                name="maxBookingsPerWeek"
                type="number"
                value={formData.maxBookingsPerWeek}
                onChange={handleInputChange}
                placeholder="10"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="isActive">Status</Label>
              <Select
                value={formData.isActive ? 'active' : 'inactive'}
                onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, isActive: value === 'active' }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !formData.name || !formData.price}
            >
              {isSubmitting ? 'Saving...' : editingPlan ? 'Update' : 'Create'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-semibold">
                {gym.name} - Membership Plans
              </DialogTitle>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Plan
              </Button>
            </div>
          </DialogHeader>

          <div className="py-4">
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-h-[450px] overflow-y-auto pr-2"
              >
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-muted-foreground">Loading plans...</div>
                  </div>
                ) : membershipPlans.length === 0 ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center space-y-2">
                      <div className="text-4xl opacity-20">📋</div>
                      <p className="text-muted-foreground">No membership plans yet</p>
                      <Button onClick={() => setShowAddForm(true)}>
                        Create your first plan
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {membershipPlans.map((plan) => (
                      <div
                        key={plan.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold">{plan.name}</h3>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                plan.isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {plan.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <p className="text-muted-foreground text-sm mb-2">
                              {plan.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="font-semibold">${plan.price}</span>
                              <span>{plan.durationDays} days</span>
                              <span>{plan.maxBookingsPerWeek} bookings/week</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(plan)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeletingPlan(plan)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingPlan} onOpenChange={() => setDeletingPlan(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Membership Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingPlan?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default OwnerMembershipDialog;