import { cn } from "@/lib/utils";

interface ThumbnailProps {
  imageDataUrl?: string;
  imageUrl?: string;
  alt: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = { sm: "w-10 h-10", md: "w-14 h-14", lg: "w-20 h-20" };

export function Thumbnail({ imageDataUrl, imageUrl, alt, className, size = "md" }: ThumbnailProps) {
  const src = imageDataUrl ?? imageUrl;
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-muted overflow-hidden flex-shrink-0 flex items-center justify-center text-muted-foreground text-xs",
        sizeClasses[size],
        className
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="w-full h-full object-cover transition-transform hover:scale-105" />
      ) : (
        <span className="truncate px-1">—</span>
      )}
    </div>
  );
}
