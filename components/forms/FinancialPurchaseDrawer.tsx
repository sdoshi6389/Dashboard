"use client";

import { useState, useEffect } from "react";
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { FinancialPurchase, BudgetCategory, FinancialAccount } from "@/types/finances";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchase: FinancialPurchase | null;
  budgetCategories: BudgetCategory[];
  accounts: FinancialAccount[];
  onSave: (data: Omit<FinancialPurchase, "id">) => void;
}

const NONE = "__none__";

export function FinancialPurchaseDrawer({
  open, onOpenChange, purchase, budgetCategories, accounts, onSave,
}: Props) {
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState(NONE);
  const [accountId, setAccountId] = useState(NONE);
  const [notes, setNotes] = useState("");

  const creditCards = accounts.filter((a) => a.type === "credit_card");

  useEffect(() => {
    if (purchase) {
      setDate(purchase.date);
      setDescription(purchase.description);
      setAmount(purchase.amount.toString());
      setCategoryId(purchase.categoryId ?? NONE);
      setAccountId(purchase.accountId ?? NONE);
      setNotes(purchase.notes ?? "");
    } else {
      setDate(new Date().toISOString().split("T")[0]);
      setDescription("");
      setAmount("");
      setCategoryId(NONE);
      setAccountId(creditCards[0]?.id ?? NONE);
      setNotes("");
    }
  }, [purchase, open]);

  const handleSave = () => {
    const d = description.trim();
    if (!d || !amount) return;
    onSave({
      date,
      description: d,
      amount: parseFloat(amount),
      categoryId: categoryId === NONE ? undefined : categoryId,
      accountId: accountId === NONE ? undefined : accountId,
      notes: notes.trim() || undefined,
    });
    onOpenChange(false);
  };

  const selectedAccount = accounts.find((a) => a.id === accountId);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{purchase ? "Edit Purchase" : "Log Purchase"}</DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-2 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Amount ($)</Label>
              <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Trader Joe's groceries" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Budget Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger><SelectValue placeholder="Uncategorized" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Uncategorized</SelectItem>
                  {budgetCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.emoji && `${c.emoji} `}{c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Charged to</Label>
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger><SelectValue placeholder="No account" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>No account</SelectItem>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name} ({a.institution})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedAccount?.type === "credit_card" && (
                <p className="text-xs text-amber-400">Card balance will be updated automatically</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes…" rows={2} />
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
