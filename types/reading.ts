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
  rating: number;
  summary?: string;
  takeaways: string[];
  favoriteQuote?: string;
  applyThis?: string;
  createdAt: string;
}

export interface ReadingLog {
  id: string;
  bookId: string;
  date: string;
  chapter?: string;
  pagesRead?: number;
  upToPage?: number;
  notes?: string;
  createdAt: string;
}