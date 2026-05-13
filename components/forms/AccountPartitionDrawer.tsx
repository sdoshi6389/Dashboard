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
import type { AccountPartition, FinancialAccount, SinkingFund } from "@/types/finances";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partition: AccountPartition | null;
  accountId: string; // pre-selected account
  accounts: FinancialAccount[];
  sinkingFunds: SinkingFund[];
  onSave: (data: Omit<AccountPartition, "id">) => void;
}

export function AccountPartitionDrawer({
  open, onOpenChange, partition, accountId, accounts, sinkingFunds, onSave,
}: Props) {
  const NONE = "__none__";
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [sinkingFundId, setSinkingFundId] = useState(NONE);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (partition) {
      setLabel(partition.label);
      setAmount(partition.amount.toString());
      setSinkingFundId(partition.sinkingFundId ?? NONE);
      setNotes(partition.notes ?? "");
    } else {
      setLabel("");
      setAmount("");
      setSinkingFundId(NONE);
      setNotes("");
    }
  }, [partition, open]);

  const handleSave = () => {
    const l = label.trim();
    if (!l || !amount) return;
    onSave({
      accountId,
      label: l,
      amount: parseFloat(amount) || 0,
      sinkingFundId: sinkingFundId === NONE ? undefined : sinkingFundId,
      notes: notes.trim() || undefined,
    });
    onOpenChange(false);
  };

  const account = accounts.find((a) => a.id === accountId);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            {partition ? "Edit Partition" : "Add Partition"}
            {account && <span className="text-muted-foreground font-normal text-sm ml-2">— {account.name}</span>}
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-2 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Label</Label>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Kyrgyzstan trip" />
            </div>
            <div className="space-y-1.5">
              <Label>Amount ($)</Label>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="1000" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Linked Goal (optional)</Label>
            <Select value={sinkingFundId} onValueChange={setSinkingFundId}>
              <SelectTrigger><SelectValue placeholder="No linked goal" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>No linked goal</SelectItem>
                {sinkingFunds.filter((f) => !f.completed).map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.emoji && `${f.emoji} `}{f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Linking shows this account in the goal's funding breakdown</p>
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
