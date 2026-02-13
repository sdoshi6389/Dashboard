export type BookType = "academic" | "nonacademic";
export type BookStatus = "want" | "reading" | "done";

export interface Book {
  id: string;
  title: string;
  author: string;
  type: BookType;
  status: BookStatus;
  pages?: number;
  tags: string[];
  link?: string;
  imageDataUrl?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  bookId: string;
  rating: number; // 1-5
  summary?: string;
  takeaways: string[];
  favoriteQuote?: string;
  applyThis?: string;
  createdAt: string;
}
