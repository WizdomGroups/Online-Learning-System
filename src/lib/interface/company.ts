export interface Company {
  id: number;
  name: string;
  registrationNumber: string;
  gstNumber: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  status: string;
}

export interface Pagination {
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface CompanyResult {
  pagination: Pagination;
  data: Company[];
}

export interface CompanyListResponse {
  content: {
    result: {
      data: Company[];
      pagination: Pagination;
    };
  };
}

export interface SingleCompanyResponse {
  content: {
    result: Company;
  };
}

export interface CreateCompanyPayload {
  name: string;
  registrationNumber: string;
  gstNumber: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  status: string;
}

export interface CompanyState {
  list: CompanyListResponse | null;
  selected: SingleCompanyResponse | null;
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  data: Company[];
}
