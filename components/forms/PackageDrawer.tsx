"use client";

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
import { ImagePicker } from "@/components/shared/ImagePicker";
import type { Package, PackageStatus } from "@/types/packages";
import { useState, useEffect } from "react";

interface PackageDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Package | null;
  onSave: (data: Omit<Package, "id">) => void;
}

export function PackageDrawer({ open, onOpenChange, item, onSave }: PackageDrawerProps) {
  const [itemName, setItemName] = useState("");
  const [carrier, setCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [status, setStatus] = useState<PackageStatus>("ordered");
  const [link, setLink] = useState("");
  const [notes, setNotes] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>();
  const [imageUrl, setImageUrl] = useState<string | undefined>();

  useEffect(() => {
    if (item) {
      setItemName(item.itemName);
      setCarrier(item.carrier ?? "");
      setTrackingNumber(item.trackingNumber ?? "");
      setOrderDate(item.orderDate ?? "");
      setExpectedDeliveryDate(item.expectedDeliveryDate ?? "");
      setStatus(item.status);
      setLink(item.link ?? "");
      setNotes(item.notes ?? "");
      setImageDataUrl(item.imageDataUrl);
      setImageUrl(item.imageUrl);
    } else {
      setItemName("");
      setCarrier("");
      setTrackingNumber("");
      setOrderDate("");
      setExpectedDeliveryDate("");
      setStatus("ordered");
      setLink("");
      setNotes("");
      setImageDataUrl(undefined);
      setImageUrl(undefined);
    }
  }, [item, open]);

  const handleSave = () => {
    const n = itemName.trim();
    if (!n) return;
    onSave({
      itemName: n,
      carrier: carrier.trim() || undefined,
      trackingNumber: trackingNumber.trim() || undefined,
      orderDate: orderDate.trim() || undefined,
      expectedDeliveryDate: expectedDeliveryDate.trim() || undefined,
      status,
      link: link.trim() || undefined,
      notes: notes.trim() || undefined,
      imageDataUrl,
      imageUrl,
    });
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{item ? "Edit package" : "Add package"}</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 space-y-4 overflow-y-auto max-h-[70vh]">
          <ImagePicker
            value={{ imageDataUrl, imageUrl }}
            onChange={({ imageDataUrl: d, imageUrl: u }) => {
              setImageDataUrl(d);
              setImageUrl(u);
            }}
          />
          <div>
            <Label>Item name</Label>
            <Input value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="What's in the package" className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Carrier</Label>
              <Input value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="UPS, FedEx" className="mt-1" />
            </div>
            <div>
              <Label>Tracking number</Label>
              <Input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="Optional" className="mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Order date</Label>
              <Input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Expected delivery</Label>
              <Input type="date" value={expectedDeliveryDate} onChange={(e) => setExpectedDeliveryDate(e.target.value)} className="mt-1" />
            </div>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as PackageStatus)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ordered">Ordered</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Link (order/product)</Label>
            <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." className="mt-1" />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" className="mt-1" />
          </div>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
          <Button onClick={handleSave}>Save</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
