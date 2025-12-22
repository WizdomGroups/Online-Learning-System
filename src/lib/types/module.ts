// Base interfaces for the response structure
interface BaseResponse {
  code: number;
  error: boolean;
  message: string;
  exception: string;
}

export interface Module {
  id: number;
  name: string;
  trimmedName: string;
  description: string;
  assessment: boolean;
  feedback: boolean;
  allotedTimeMins: number;
  createdBy: string | null;
  status: string;
  createdDate: string;
  updatedDate: string | null;
  wizdomCategory: number;
  moduleOrder: number | null;
  Documents: Array<{
    id: number;
    name: string;
    description: string;
    trimmedName: string;
    status: string;
    severityTypeId: number;
    tenantId: number;
    createdBy: string;
    createdDate: string;
    updatedDate: string | null;
    files: Array<{
      id: number;
      filePath: string;
      version: number;
      location: string;
      status: string;
      documentId: number;
      createdAt: string;
      updatedAt: string;
    }>;
  }>;
  MasterCategoryModel: {
    id: number;
    name: string;
    description: string;
    status: boolean;
  };
  tenantId?: number;
}

export interface Document {
  id: number;
  name: string;
  description: string;
  trimmedName: string;
  status: string;
  severityTypeId: number;
  tenantId: number;
  securityType?: {
    id: number;
    name: string;
    description: string | null;
    status: boolean;
  };
  createdBy: string;
  createdDate: string;
  updatedDate: string | null;
  files: Array<{
    id: number;
    filePath: string;
    version: number;
    location: string;
    status: string;
    documentId: number;
    createdAt: string;
    updatedAt: string;
  }>;
  // Optional links associated with a document
  links?: Array<{
    id: number;
    title: string;
    url: string;
    description?: string | null;
    linkType?: "external" | "internal" | "video" | "document" | "resource";
    displayOrder?: number | null;
    isPublic?: boolean;
    createdAt?: string;
    updatedAt?: string | null;
  }>;
}

// Updated to match how data is accessed in components
export interface ModuleResponse extends BaseResponse {
  data: Module[];
  content?: {
    data: {
      data: Module[];
      pagination: {
        total: number;
        page: number;
        limit: number;
      };
    };
  };
}

export interface SingleModuleResponse extends BaseResponse {
  data: Module;
  content?: {
    data: Module;
  };
}

export interface DocumentResponse extends BaseResponse {
  data: Document[];
  documents: Document[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    numberOfElements: number;
  };
  content?: {
    data: Document[];
    pagination: {
      total: number;
      page: number;
      pageSize: number;
      numberOfElements: number;
    };
  };
}

export interface SingleDocumentResponse extends BaseResponse {
  data: Document;
  content?: {
    data: Document;
  };
}

export interface ModuleState {
  data: ModuleResponse | null;
  moduleById: SingleModuleResponse | null;
  loading: boolean;
  error: string;
}

export interface DocumentState {
  data: DocumentResponse | null;
  loading: boolean;
  error: string;
}

// Add these interfaces to src/lib/types/module.ts

interface EmployeePagination {
  total: number;
  page: number;
  pages: number;
  limit: number;
}

interface Department {
  id: number;
  name: string;
}

interface Designation {
  id: number;
  name: string;
}

interface Role {
  id: number;
  name: string;
}

interface Branch {
  id: number;
  name: string;
}

interface Employee {
  id: number;
  firstName: string;
  middleName: string | null;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  bloodGroup: string;
  workStatus: string;
  confirmationStatus: string;
  empType: string;
  employmentType: string;
  religion: string;
  email: string;
  phone: string | null;
  mobile: string;
  panNumber: string | null;
  pfNumber: string | null;
  pfUanNumber: string | null;
  esiNumber: string | null;
  photoPath: string | null;
  resumePath: string | null;
  personalMark: string | null;
  temporaryAddress: string | null;
  permanentAddress: string | null;
  empSkills: string | null;
  empCode: string;
  buildingFloor: string | null;
  vendorId: number | null;
  aboutEmployee: string | null;
  joinDate: string | null;
  confirmationDueDate: string | null;
  confirmedDate: string | null;
  resignationDate: string | null;
  leaveDate: string | null;
  leaveReason: string | null;
  reportingManagerId: number;
  departmentId: number;
  designationId: number;
  branchId: number;
  roleId: number;
  createdAt: string;
  updatedAt: string;

  // Relations
  DepartmentModel?: Department;
  DesignationModel?: Designation;
  MasterRoleModel?: Role;
  BranchModel?: Branch;
}

export interface EmployeeResponse {
  code: number;
  error: boolean;
  message: string;
  exception: string;
  content: {
    pagination: EmployeePagination;
    data: Employee[];
  };
}

export interface SingleEmployeeResponse {
  code: number;
  error: boolean;
  message: string;
  exception: string;
  content: {
    result: Employee;
  };
}

export interface EmployeesState {
  data: EmployeeResponse | null;
  loading: boolean;
  error: string;
}

export interface EmployeeByIdState {
  data: SingleEmployeeResponse | null;
  loading: boolean;
  error: string;
}
