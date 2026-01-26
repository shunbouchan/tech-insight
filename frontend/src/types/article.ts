export type Category = 'AI/ML' | 'Backend' | 'Frontend' | 'DevOps';

export interface Article {
  id: number;
  title: string;
  content: string;
  author: string;
  category: Category;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface ArticleSummary {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  category: Category;
  published_at: string;
  created_at: string;
  updated_at: string;
  highlight?: string;
}

export interface SearchResult {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  category: Category;
  published_at: string;
  similarity: number;
  highlight?: string;
}

export interface ArticleCreateInput {
  title: string;
  content: string;
  author: string;
  category: Category;
  published_at: string;
}

export interface ArticleUpdateInput {
  title?: string;
  content?: string;
  author?: string;
  category?: Category;
  published_at?: string;
}

export interface Pagination {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
