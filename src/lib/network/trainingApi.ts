import axiosClient from "./axiosClient";
import { TRAINING_URL } from "../endPoints";
import { Module } from "../types/module";

// Training creation request interface
export interface CreateTrainingRequest {
  trainingName: string;
  trainingCode: string;
  description: string;
  moduleIds: number[];
  tenantId: number;
}

// Training creation response interface
export interface CreateTrainingResponse {
  code: number;
  error: boolean;
  message: string;
  exception: string;
  data?: any;
}

// API Error class
export class ApiError extends Error {
  public status?: number;
  public code?: string;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

// Training list response interface
export interface TrainingListResponse {
  code: number;
  error: boolean;
  message: string;
  exception: string;
  data?: {
    data: Training[];
    pagination: {
      total: number;
      page: number;
      pageSize: number;
      numberOfElements: number;
    };
  };
  content?: {
    data: Training[];
    pagination: {
      total: number;
      page: number;
      pageSize: number;
      numberOfElements: number;
    };
  };
}

// Training interface
export interface Training {
  id: number;
  trainingName: string;
  trainingCode: string;
  description: string;
  status: string;
  createdBy?: string;
  createdDate?: string;
  updatedDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
  tenantId: number;
  branchId?: number | null;
  modules?: Module[];
  Modules?: Module[];
  CompanyModel?: {
    id: number;
    name: string;
  };
}

// Training details response interface
export interface TrainingDetailsResponse {
  code: number;
  error: boolean;
  message: string;
  exception: string;
  data?: Training;
  content?: {
    data: Training;
  };
}

// Fetch training list API function
export const fetchTrainingData = async (params: {
  limit: number;
  page: number;
  search?: string;
  status?: string;
  tenantId?: string | number;
}): Promise<TrainingListResponse> => {
  try {
    const response = await axiosClient.request<TrainingListResponse>({
      method: "GET",
      url: TRAINING_URL,
      params,
    });

    return response.data;
  } catch (error: unknown) {
    // Handle different types of errors and provide specific messages
    if (error instanceof Error) {
      // If it's an axios error with response
      if ("response" in error && error.response) {
        const response = error.response as {
          status: number;
          data?: { 
            message?: string; 
            error?: string; 
            exception?: string;
            code?: number;
          };
        };

        // Extract backend message
        let backendMessage = "";
        try {
          if (
            typeof response.data === "object" &&
            response.data !== null
          ) {
            backendMessage = 
              response.data.message || 
              response.data.error || 
              response.data.exception || 
              "";
          }
        } catch (parseError) {
          console.warn("Failed to parse error response:", parseError);
        }

        // If we successfully extracted a backend message, use it
        if (backendMessage) {
          throw new ApiError(backendMessage, response.status);
        }

        // Handle different HTTP status codes with fallback messages
        switch (response.status) {
          case 400:
            throw new ApiError(
              "Invalid request. Please check the parameters and try again.",
              400
            );
          case 401:
            throw new ApiError(
              "You are not authorized to view trainings. Please login again.",
              401
            );
          case 403:
            throw new ApiError(
              "Access forbidden. You don't have permission to view trainings.",
              403
            );
          case 404:
            throw new ApiError(
              "Training service not found. Please contact support.",
              404
            );
          case 500:
            throw new ApiError(
              "Internal server error. Please try again later.",
              500
            );
          default:
            throw new ApiError(
              `Request failed with status ${response.status}. Please try again.`,
              response.status
            );
        }
      }

      // If it's a network error
      if (
        error.message.includes("Network Error") ||
        error.message.includes("ERR_NETWORK")
      ) {
        throw new ApiError(
          "Network connection error. Please check your internet connection and try again."
        );
      }

      // If it's a timeout error
      if (error.message.includes("timeout")) {
        throw new ApiError("Request timed out. Please try again.");
      }

      // For other errors, use the original message
      throw new ApiError(
        error.message || "Failed to fetch trainings. Please try again."
      );
    }

    // For unknown error types
    throw new ApiError(
      "An unexpected error occurred while fetching trainings. Please try again."
    );
  }
};

// Fetch training by ID API function
export const fetchTrainingById = async (id: string): Promise<TrainingDetailsResponse> => {
  try {
    const response = await axiosClient.request<TrainingDetailsResponse>({
      method: "GET",
      url: `${TRAINING_URL}/${id}`,
    });

    return response.data;
  } catch (error: unknown) {
    // Handle different types of errors and provide specific messages
    if (error instanceof Error) {
      // If it's an axios error with response
      if ("response" in error && error.response) {
        const response = error.response as {
          status: number;
          data?: { 
            message?: string; 
            error?: string; 
            exception?: string;
            code?: number;
          };
        };

        // Extract backend message
        let backendMessage = "";
        try {
          if (
            typeof response.data === "object" &&
            response.data !== null
          ) {
            backendMessage = 
              response.data.message || 
              response.data.error || 
              response.data.exception || 
              "";
          }
        } catch (parseError) {
          console.warn("Failed to parse error response:", parseError);
        }

        // If we successfully extracted a backend message, use it
        if (backendMessage) {
          throw new ApiError(backendMessage, response.status);
        }

        // Handle different HTTP status codes with fallback messages
        switch (response.status) {
          case 400:
            throw new ApiError(
              "Invalid request. Please check the training ID and try again.",
              400
            );
          case 401:
            throw new ApiError(
              "You are not authorized to view this training. Please login again.",
              401
            );
          case 403:
            throw new ApiError(
              "Access forbidden. You don't have permission to view this training.",
              403
            );
          case 404:
            throw new ApiError(
              "Training not found. The training may not exist or has been removed.",
              404
            );
          case 500:
            throw new ApiError(
              "Internal server error. Please try again later.",
              500
            );
          default:
            throw new ApiError(
              `Request failed with status ${response.status}. Please try again.`,
              response.status
            );
        }
      }

      // If it's a network error
      if (
        error.message.includes("Network Error") ||
        error.message.includes("ERR_NETWORK")
      ) {
        throw new ApiError(
          "Network connection error. Please check your internet connection and try again."
        );
      }

      // If it's a timeout error
      if (error.message.includes("timeout")) {
        throw new ApiError("Request timed out. Please try again.");
      }

      // For other errors, use the original message
      throw new ApiError(
        error.message || "Failed to fetch training details. Please try again."
      );
    }

    // For unknown error types
    throw new ApiError(
      "An unexpected error occurred while fetching training details. Please try again."
    );
  }
};

// Create training API function with comprehensive error handling
export const createTrainingApiFunction = async (
  trainingData: CreateTrainingRequest
): Promise<CreateTrainingResponse> => {
  try {
    const response = await axiosClient.request<CreateTrainingResponse>({
      method: "POST",
      url: TRAINING_URL,
      data: trainingData,
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error: unknown) {
    // Handle different types of errors and provide specific messages
    if (error instanceof Error) {
      // If it's an axios error with response
      if ("response" in error && error.response) {
        const response = error.response as {
          status: number;
          data?: { 
            message?: string; 
            error?: string; 
            exception?: string;
            code?: number;
          };
        };

        // Extract backend message
        let backendMessage = "";
        try {
          if (
            typeof response.data === "object" &&
            response.data !== null
          ) {
            backendMessage = 
              response.data.message || 
              response.data.error || 
              response.data.exception || 
              "";
          }
        } catch (parseError) {
          console.warn("Failed to parse error response:", parseError);
        }

        // If we successfully extracted a backend message, use it
        if (backendMessage) {
          throw new ApiError(backendMessage, response.status);
        }

        // Handle different HTTP status codes with fallback messages
        switch (response.status) {
          case 400:
            throw new ApiError(
              "Invalid request. Please check the training details and try again.",
              400
            );
          case 401:
            throw new ApiError(
              "You are not authorized to create training. Please login again.",
              401
            );
          case 403:
            throw new ApiError(
              "Access forbidden. You don't have permission to create training.",
              403
            );
          case 404:
            throw new ApiError(
              "Training service not found. Please contact support.",
              404
            );
          case 409:
            throw new ApiError(
              "Training with this code already exists. Please use a different code.",
              409
            );
          case 422:
            throw new ApiError(
              "Validation error. Please check all required fields and try again.",
              422
            );
          case 500:
            throw new ApiError(
              "Internal server error. Please try again later.",
              500
            );
          default:
            throw new ApiError(
              `Request failed with status ${response.status}. Please try again.`,
              response.status
            );
        }
      }

      // If it's a network error
      if (
        error.message.includes("Network Error") ||
        error.message.includes("ERR_NETWORK")
      ) {
        throw new ApiError(
          "Network connection error. Please check your internet connection and try again."
        );
      }

      // If it's a timeout error
      if (error.message.includes("timeout")) {
        throw new ApiError("Request timed out. Please try again.");
      }

      // For other errors, use the original message
      throw new ApiError(
        error.message || "Failed to create training. Please try again."
      );
    }

    // For unknown error types
    throw new ApiError(
      "An unexpected error occurred while creating the training. Please try again."
    );
  }
};

// Update training API function
export const updateTrainingApiFunction = async (id: string, trainingData: CreateTrainingRequest): Promise<CreateTrainingResponse> => {
  try {
    const response = await axiosClient.request<CreateTrainingResponse>({
      method: "PUT",
      url: `${TRAINING_URL}/${id}`,
      data: trainingData,
    });

    return response.data;
  } catch (error: unknown) {
    // Handle different types of errors and provide specific messages
    if (error instanceof Error) {
      // If it's an axios error with response
      if ("response" in error && error.response) {
        const response = error.response as {
          status: number;
          data?: { 
            message?: string; 
            error?: string; 
            exception?: string;
            code?: number;
          };
        };

        // Extract backend message
        let backendMessage = "";
        try {
          if (
            typeof response.data === "object" &&
            response.data !== null
          ) {
            backendMessage = 
              response.data.message || 
              response.data.error || 
              response.data.exception || 
              "";
          }
        } catch (parseError) {
          console.warn("Could not parse error response:", parseError);
        }

        // Handle specific status codes
        switch (response.status) {
          case 400:
            throw new ApiError(
              backendMessage || "Validation error. Please check your input.",
              response.status
            );
          case 401:
            throw new ApiError(
              "Authentication required. Please log in again.",
              response.status
            );
          case 403:
            throw new ApiError(
              "You don't have permission to update this training.",
              response.status
            );
          case 404:
            throw new ApiError(
              "Training not found.",
              response.status
            );
          case 409:
            throw new ApiError(
              backendMessage || "Training code already exists.",
              response.status
            );
          case 422:
            throw new ApiError(
              backendMessage || "Invalid data provided.",
              response.status
            );
          case 500:
            throw new ApiError(
              "Internal server error. Please try again later.",
              response.status
            );
          default:
            throw new ApiError(
              backendMessage || `Request failed with status ${response.status}. Please try again.`,
              response.status
            );
        }
      }

      // If it's a network error
      if (
        error.message.includes("Network Error") ||
        error.message.includes("ERR_NETWORK")
      ) {
        throw new ApiError(
          "Network connection error. Please check your internet connection and try again."
        );
      }

      // If it's a timeout error
      if (error.message.includes("timeout")) {
        throw new ApiError("Request timed out. Please try again.");
      }

      // For other errors, use the original message
      throw new ApiError(
        error.message || "Failed to update training. Please try again."
      );
    }

    // For unknown error types
    throw new ApiError(
      "An unexpected error occurred while updating the training. Please try again."
    );
  }
};
