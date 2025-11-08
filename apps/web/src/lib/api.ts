const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001/api';

export interface Stats {
  totalSpend: number;
  totalSpendChange: number;
  totalInvoices: number;
  totalInvoicesChange: number;
  documentsUploaded: number;
  documentsUploadedChange: number;
  averageInvoiceValue: number;
  averageInvoiceValueChange: number;
}

export interface InvoiceTrend {
  month: string;
  invoiceCount: number;
  totalSpend: number;
}

export interface VendorSpend {
  vendorName: string;
  totalSpend: number;
}

export interface CategorySpend {
  category: string;
  total: number;
}

export interface CashOutflow {
  range: string;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceId: string | null;
  invoiceDate: string | null;
  vendorName: string;
  invoiceTotal: number;
  status: string;
  documentId: string;
}

export interface InvoicesResponse {
  invoices: Invoice[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ChatResponse {
  sql: string;
  results: any[];
  explanation?: string;
}

export async function fetchStats(): Promise<Stats> {
  const response = await fetch(`${API_BASE}/stats`);
  if (!response.ok) throw new Error('Failed to fetch stats');
  return response.json();
}

export async function fetchInvoiceTrends(): Promise<InvoiceTrend[]> {
  const response = await fetch(`${API_BASE}/invoice-trends`);
  if (!response.ok) throw new Error('Failed to fetch invoice trends');
  return response.json();
}

export async function fetchTopVendors(): Promise<VendorSpend[]> {
  const response = await fetch(`${API_BASE}/vendors/top10`);
  if (!response.ok) throw new Error('Failed to fetch top vendors');
  return response.json();
}

export async function fetchCategorySpend(): Promise<CategorySpend[]> {
  const response = await fetch(`${API_BASE}/category-spend`);
  if (!response.ok) throw new Error('Failed to fetch category spend');
  return response.json();
}

export async function fetchCashOutflow(): Promise<CashOutflow[]> {
  const response = await fetch(`${API_BASE}/cash-outflow`);
  if (!response.ok) throw new Error('Failed to fetch cash outflow');
  return response.json();
}

export async function fetchInvoices(params: {
  search?: string;
  status?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}): Promise<InvoicesResponse> {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, String(value));
    }
  });

  const response = await fetch(`${API_BASE}/invoices?${queryParams}`);
  if (!response.ok) throw new Error('Failed to fetch invoices');
  return response.json();
}

export async function chatWithData(query: string): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE}/chat-with-data`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) throw new Error('Failed to process chat query');
  return response.json();
}
