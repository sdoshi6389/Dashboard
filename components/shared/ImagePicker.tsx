"use client";

import * as React from "react";
import { Upload, Link as LinkIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface ImagePickerValue {
  imageDataUrl?: string;
  imageUrl?: string;
}

interface ImagePickerProps {
  value?: ImagePickerValue;
  onChange: (value: ImagePickerValue) => void;
  label?: string;
  className?: string;
}

export function ImagePicker({ value, onChange, label = "Image", className }: ImagePickerProps) {
  const fileRef = React.useRef<HTMLInputElement>(null);
  const hasImage = !!(value?.imageDataUrl || value?.imageUrl);
  const displaySrc = value?.imageDataUrl ?? value?.imageUrl;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      onChange({ imageDataUrl: dataUrl, imageUrl: value?.imageUrl });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const setUrl = (url: string) => {
    const trimmed = url.trim();
    onChange({ imageDataUrl: value?.imageDataUrl, imageUrl: trimmed || undefined });
  };

  const remove = () => onChange({});

  return (
    <div className={cn("space-y-3", className)}>
      <Label>{label}</Label>
      {displaySrc ? (
        <div className="relative inline-block group">
          <div className="rounded-lg border border-border overflow-hidden bg-muted w-24 h-24 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displaySrc}
              alt=""
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-90 group-hover:opacity-100"
            onClick={remove}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 items-center">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
          <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
          <div className="flex-1 min-w-[180px] flex items-center gap-2">
            <LinkIcon className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              placeholder="Or paste image URL"
              value={value?.imageUrl ?? ""}
              onChange={(e) => setUrl(e.target.value)}
              className="h-9"
            />
          </div>
        </div>
      )}
    </div>
  );
}
