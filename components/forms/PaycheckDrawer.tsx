"use client";

import { useState, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Paycheck } from "@/types/finances";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paycheck: Paycheck | null;
  onSave: (data: Omit<Paycheck, "id">) => void;
}

export function PaycheckDrawer({ open, onOpenChange, paycheck, onSave }: Props) {
  const [date, setDate] = useState("");
  const [grossAmount, setGrossAmount] = useState("");
  const [netAmount, setNetAmount] = useState("");
  const [paycheckNumber, setPaycheckNumber] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (paycheck) {
      setDate(paycheck.date);
      setGrossAmount(paycheck.grossAmount.toString());
      setNetAmount(paycheck.netAmount.toString());
      setPaycheckNumber(paycheck.paycheckNumber?.toString() ?? "");
      setNotes(paycheck.notes ?? "");
    } else {
      setDate(new Date().toISOString().split("T")[0]);
      setGrossAmount("");
      setNetAmount("");
      setPaycheckNumber("");
      setNotes("");
    }
  }, [paycheck, open]);

  const handleSave = () => {
    if (!date || !grossAmount || !netAmount) return;
    onSave({
      date,
      grossAmount: parseFloat(grossAmount),
      netAmount: parseFloat(netAmount),
      paycheckNumber: paycheckNumber ? parseInt(paycheckNumber) : undefined,
      notes: notes.trim() || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{paycheck ? "Edit Income Entry" : "Log Income"}</DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-2 space-y-4">
          <div className="space-y-1.5">
            <Label>Source</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Cisco paycheck, Freelance project, Bonus" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Entry # (optional)</Label>
              <Input type="number" value={paycheckNumber} onChange={(e) => setPaycheckNumber(e.target.value)} placeholder="1" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Gross Amount ($)</Label>
              <Input type="number" value={grossAmount} onChange={(e) => setGrossAmount(e.target.value)} placeholder="2071.20" />
            </div>
            <div className="space-y-1.5">
              <Label>Net Amount ($)</Label>
              <Input type="number" value={netAmount} onChange={(e) => setNetAmount(e.target.value)} placeholder="1450.00" />
            </div>
          </div>
        </div>

        <DrawerFooter className="flex-row gap-2">
          <Button onClick={handleSave} className="aurora-btn flex-1">Save</Button>
          <DrawerClose asChild>
            <Button variant="outline" className="flex-1">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
