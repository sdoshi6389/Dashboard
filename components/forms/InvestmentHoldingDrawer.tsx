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
import type { InvestmentHolding, HoldingCategory } from "@/types/finances";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  holding: InvestmentHolding | null;
  onSave: (data: Omit<InvestmentHolding, "id">) => void;
}

export function InvestmentHoldingDrawer({ open, onOpenChange, holding, onSave }: Props) {
  const [accountType, setAccountType] = useState<"brokerage" | "roth_ira">("brokerage");
  const [ticker, setTicker] = useState("");
  const [name, setName] = useState("");
  const [shares, setShares] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [category, setCategory] = useState<HoldingCategory>("stock");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (holding) {
      setAccountType(holding.accountType);
      setTicker(holding.ticker);
      setName(holding.name ?? "");
      setShares(holding.shares.toString());
      setCurrentPrice(holding.currentPrice.toString());
      setCategory(holding.category);
      setNotes(holding.notes ?? "");
    } else {
      setAccountType("brokerage");
      setTicker("");
      setName("");
      setShares("");
      setCurrentPrice("");
      setCategory("stock");
      setNotes("");
    }
  }, [holding, open]);

  const handleSave = () => {
    const t = ticker.trim().toUpperCase();
    if (!t || !shares || !currentPrice) return;
    onSave({
      accountType,
      ticker: t,
      name: name.trim() || undefined,
      shares: parseFloat(shares),
      currentPrice: parseFloat(currentPrice),
      category,
      notes: notes.trim() || undefined,
    });
    onOpenChange(false);
  };

  const estimatedValue =
    shares && currentPrice
      ? (parseFloat(shares) * parseFloat(currentPrice)).toFixed(2)
      : null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{holding ? "Edit Holding" : "Add Holding"}</DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-2 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Account</Label>
              <Select value={accountType} onValueChange={(v) => setAccountType(v as "brokerage" | "roth_ira")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="brokerage">Brokerage</SelectItem>
                  <SelectItem value="roth_ira">Roth IRA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as HoldingCategory)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="stock">Stock</SelectItem>
                  <SelectItem value="etf">ETF</SelectItem>
                  <SelectItem value="crypto">Crypto</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Ticker</Label>
              <Input value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase())} placeholder="AAPL" />
            </div>
            <div className="space-y-1.5">
              <Label>Name (optional)</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Apple Inc." />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Shares</Label>
              <Input type="number" step="0.0001" value={shares} onChange={(e) => setShares(e.target.value)} placeholder="10" />
            </div>
            <div className="space-y-1.5">
              <Label>Current Price ($)</Label>
              <Input type="number" step="0.01" value={currentPrice} onChange={(e) => setCurrentPrice(e.target.value)} placeholder="185.00" />
            </div>
          </div>

          {estimatedValue && (
            <p className="text-sm text-muted-foreground">
              Estimated value: <span className="text-foreground font-medium">${parseFloat(estimatedValue).toLocaleString()}</span>
            </p>
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
