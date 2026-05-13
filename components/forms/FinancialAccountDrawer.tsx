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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FinancialAccount, AccountType } from "@/types/finances";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: FinancialAccount | null;
  onSave: (data: Omit<FinancialAccount, "id">) => void;
}

const accountTypeOptions: { value: AccountType; label: string }[] = [
  { value: "checking", label: "Checking" },
  { value: "savings", label: "Savings" },
  { value: "brokerage", label: "Brokerage" },
  { value: "roth_ira", label: "Roth IRA" },
  { value: "credit_card", label: "Credit Card" },
  { value: "venmo", label: "Venmo" },
  { value: "other", label: "Other" },
];

export function FinancialAccountDrawer({ open, onOpenChange, account, onSave }: Props) {
  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("");
  const [type, setType] = useState<AccountType>("checking");
  const [balance, setBalance] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [statementDate, setStatementDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [autopay, setAutopay] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (account) {
      setName(account.name);
      setInstitution(account.institution);
      setType(account.type);
      setBalance(account.balance.toString());
      setCreditLimit(account.creditLimit?.toString() ?? "");
      setStatementDate(account.statementDate?.toString() ?? "");
      setDueDate(account.dueDate?.toString() ?? "");
      setAutopay(account.autopay ?? false);
      setNotes(account.notes ?? "");
    } else {
      setName("");
      setInstitution("");
      setType("checking");
      setBalance("");
      setCreditLimit("");
      setStatementDate("");
      setDueDate("");
      setAutopay(false);
      setNotes("");
    }
  }, [account, open]);

  const handleSave = () => {
    const n = name.trim();
    if (!n) return;
    const isCC = type === "credit_card";
    onSave({
      name: n,
      institution: institution.trim() || "Unknown",
      type,
      balance: parseFloat(balance) || 0,
      creditLimit: isCC && creditLimit ? parseFloat(creditLimit) : undefined,
      statementDate: isCC && statementDate ? parseInt(statementDate) : undefined,
      dueDate: isCC && dueDate ? parseInt(dueDate) : undefined,
      autopay: isCC ? autopay : undefined,
      notes: notes.trim() || undefined,
    });
    onOpenChange(false);
  };

  const isCC = type === "credit_card";

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>{account ? "Edit Account" : "Add Account"}</DrawerTitle>
        </DrawerHeader>

        <div className="overflow-y-auto px-4 pb-2 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Account Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. BoFA Checking 1" />
            </div>
            <div className="space-y-1.5">
              <Label>Institution</Label>
              <Input value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="e.g. Bank of America" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as AccountType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {accountTypeOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{isCC ? "Current Balance Owed" : "Balance"}</Label>
              <Input
                type="number"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          {isCC && (
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Credit Limit</Label>
                <Input type="number" value={creditLimit} onChange={(e) => setCreditLimit(e.target.value)} placeholder="5000" />
              </div>
              <div className="space-y-1.5">
                <Label>Statement Day</Label>
                <Input type="number" min={1} max={31} value={statementDate} onChange={(e) => setStatementDate(e.target.value)} placeholder="1-31" />
              </div>
              <div className="space-y-1.5">
                <Label>Due Day</Label>
                <Input type="number" min={1} max={31} value={dueDate} onChange={(e) => setDueDate(e.target.value)} placeholder="1-31" />
              </div>
            </div>
          )}

          {isCC && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autopay"
                checked={autopay}
                onChange={(e) => setAutopay(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="autopay">Autopay enabled</Label>
            </div>
          )}

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
