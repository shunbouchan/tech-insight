import { Article, ArticleSummary, Pagination, SearchResult } from './article';

export interface ArticleListResponse extends Pagination {
  items: ArticleSummary[];
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  total: number;
}

export interface ArticleListParams {
  [key: string]: string | number | undefined;
  page?: number;
  page_size?: number;
  category?: string;
  author?: string;
  keyword?: string;
  sort_order?: string;
}

export interface SearchParams {
  [key: string]: string | number | undefined;
  q: string;
  category?: string;
  top_k?: number;
}

export interface ApiError {
  detail: string | ValidationError[];
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export type ArticleResponse = Article;
