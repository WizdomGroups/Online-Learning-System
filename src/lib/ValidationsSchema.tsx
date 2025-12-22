import * as yup from "yup";

export const createDocumentValidationSchema = yup.object().shape({
  name: yup
    .string()
    .required("Document name is required")
    .max(200, "Document name should be maximum 200 characters")
    .matches(
      /^[a-zA-Z0-9@#_.\-& ]+$/,
      "Only letters, numbers, spaces, and @, #, _, ., - are allowed"
    )
    .matches(
      /[a-zA-Z0-9]/,
      "Module name must contain at least one letter or number"
    ),
  description: yup
    .string()
    .required("Description is required")
    .max(500, "Description should be maximum 500 characters"),
  status: yup.string().required("Status is required"),
  securityTypeId: yup.string().required("Security Type is required"),
  tenantId: yup.string().required("Tenant ID is required"),
  // Links are optional for create; when provided, title and url are required per entry
  documentLinks: yup
    .array()
    .of(
      yup.object({
        title: yup
          .string()
          .trim()
          .max(200, "Link title must be at most 200 characters")
          .required("Link title is required"),
        url: yup
          .string()
          .trim()
          .url("Must be a valid URL")
          .matches(/^https?:\/\//, "URL must start with http:// or https://")
          .required("Link URL is required"),
      })
    )
    .optional(),
  documentFiles: yup
    .array()
    .of(
      yup
        .mixed()
        .test(
          "fileType",
          "Only PDF, Word or Excel files are allowed",
          (value) => {
            if (!value) return true; // optional on create
            const allowedTypes = [
              "application/pdf",
              "application/msword",
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              "application/vnd.ms-excel",
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ];
            return allowedTypes.includes((value as File).type);
          }
        )
        .test(
          "fileSize",
          "Document file must be less than or equal to 5MB",
          (value) => {
            if (!value) return true; // optional
            const maxSize = 5 * 1024 * 1024;
            return (value as File).size <= maxSize;
          }
        )
    )
    .max(10, "Maximum 10 files allowed"),
});

export const editDocumentValidationSchema = yup.object().shape({
  name: yup
    .string()
    .required("Document Name is required")
    .max(200, "Document Name should be maximum 200 characters")
    .matches(
      /^[a-zA-Z0-9@#_.\-& ]+$/,
      "Only letters, numbers, spaces, and @, #, _, ., - are allowed"
    )
    .matches(
      /[a-zA-Z0-9]/,
      "Module name must contain at least one letter or number"
    ),
  description: yup
    .string()
    .required("Description is required")
    .max(500, "Description should be maximum 500 characters"),
  status: yup.string().required("Status is required"),
  securityTypeId: yup.string().required("Security Type is required"),
  tenantId: yup.string().required("Tenant ID is required"),
  // Links are optional for update; validate title and url when provided
  documentLinks: yup
    .array()
    .of(
      yup.object({
        title: yup
          .string()
          .trim()
          .max(200, "Link title must be at most 200 characters")
          .required("Link title is required"),
        url: yup
          .string()
          .trim()
          .url("Must be a valid URL")
          .matches(/^https?:\/\//, "URL must start with http:// or https://")
          .required("Link URL is required"),
      })
    )
    .optional(),
  deleteLinkIds: yup
    .mixed<string | number[]>()
    .test(
      "is-valid",
      "deleteLinkIds must be array of numbers or comma-separated numbers",
      (value) => {
        if (value === undefined || value === null || value === "") return true;
        if (Array.isArray(value))
          return value.every((v) => typeof v === "number");
        if (typeof value === "string") return /^\d+(,\d+)*$/.test(value);
        return false;
      }
    )
    .optional(),
  documentFiles: yup
    .array()
    .of(
      yup
        .mixed()
        .test(
          "fileType",
          "Only PDF, Word or Excel files are allowed",
          (value) => {
            if (!value) return true; // file is optional on edit
            const allowedTypes = [
              "application/pdf",
              "application/msword",
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              "application/vnd.ms-excel",
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ];
            return allowedTypes.includes((value as File).type);
          }
        )
        .test(
          "fileSize",
          "Document file must be less than or equal to 5MB",
          (value) => {
            if (!value) return true;
            const maxSize = 5 * 1024 * 1024; // 1 MB
            return (value as File).size <= maxSize;
          }
        )
    )
    .max(10, "Maximum 10 files allowed"),
});

export const createModuleValidationSchema = yup.object().shape({
  name: yup
    .string()
    .required("Module name is required")
    .max(200, "Module name should be maximum 200 characters")
    .matches(
      /^[a-zA-Z0-9@#_.\-& ]+$/,
      "Only letters, numbers, spaces, and @, #, _, ., - are allowed"
    )
    .matches(
      /[a-zA-Z0-9]/,
      "Module name must contain at least one letter or number"
    ),
  description: yup
    .string()
    .required("Description is required")
    .max(500, "Description should be maximum 500 characters"),
  // assessment: yup.string().optional(), // Made optional since not in form UI
  // feedback: yup.string().optional(), // Made optional since not in form UI
  status: yup.string().required("Status is required"),
  tenantId: yup.string().optional(), // Made optional since super admin might not always select a company
  allotedTimeMins: yup
    .string()
    .trim()
    .required("Allotted time in minutes is required")
    .matches(/^\d+$/, "Allotted time must be a whole number")
    .test(
      "min-1",
      "Allotted time must be at least 1 minute",
      (value) => !!value && Number(value) >= 1
    )
    .test(
      "max-10000",
      "Allotted time must be 10000 minutes or less",
      (value) => !!value && Number(value) <= 10000
    ),
  wizdomCategory: yup.string().required("Category is required"),
  documentIds: yup.array().of(yup.string()).optional(), // Made optional since documents might not always be required
  assessmentFile: yup
    .mixed<File>()
    .nullable()
    .test("fileType", "Only Excel files allowed", (value) => {
      if (!value) return true; // file is optional
      return (
        value instanceof File &&
        [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
          "application/vnd.ms-excel", // .xls
        ].includes(value.type)
      );
    })
    .test("fileSize", "File must be less than or equal to 500KB", (value) => {
      if (!(value instanceof File)) return true; // skip if no file
      const maxSize = 500 * 1024; // 500 KB
      return value.size <= maxSize;
    }),
});

export const uploadAssessmentByExcelValidationSchema = yup.object().shape({
  certificationId: yup.string().required("Certification is required"),

  assessmentFile: yup
    .mixed()
    .nullable()
    .required("Assessment file is required")
    .test("fileType", "Only Excel files are allowed", (value) => {
      if (!value) return false;

      const allowedTypes = [
        "application/vnd.ms-excel", // .xls
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      ];

      const file = value as File;
      return allowedTypes.includes(file.type);
    })
    .test("fileSize", "File must be less than or equal to 500KB", (value) => {
      if (!(value instanceof File)) return true; // skip if no file
      const maxSize = 500 * 1024; // 500 KB
      return value.size <= maxSize;
    }),
});

export const createCertificateValidationSchema = yup.object().shape({
  tenantId: yup.string().required("Company ID is required"),
  title: yup
    .string()
    .required("Title is required")
    .max(200, "Title should be maximum 200 characters")
    .matches(
      /^[a-zA-Z0-9@#_.\-& ]+$/,
      "Only letters, numbers, spaces, and @, #, _, ., - are allowed"
    )
    .matches(
      /[a-zA-Z0-9]/,
      "Module name must contain at least one letter or number"
    ),
  description: yup
    .string()
    .required("Description is required")
    .max(500, "Description should be maximum 500 characters"),
  status: yup.string().required("Status is required"),
  totalAssessmentQuestions: yup
    .string()
    .matches(/^\d+$/, "Assessment Time must be a number")
    .required("Total Assessment Questions is required"),
  assessmentTime: yup
    .string()
    .matches(/^\d+$/, "Total Assessment Questions must be a number")
    .required("Assessment Time is required"),
  passPercentage: yup
    .string()
    .matches(
      /^(100(\.0{1,2})?|[0-9]{1,2}(\.[0-9]{1,2})?)$/,
      "Must be a valid percentage (0–100, up to 2 decimal places)"
    )
    .required("Pass Percentage is required"),
  interval_unit: yup.string().optional(),
  interval_value: yup
    .string()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .matches(/^\d+$/, "Interval value must be a number")
    .notRequired(),
  expiry_date: yup.string().optional(),
  moduleIds: yup
    .array()
    .of(yup.string().required("Module ID cannot be empty"))
    .min(1, "At least one module must be selected")
    .required("Module IDs are required"),
});

export const certificationTransactionSchema = yup.object().shape({
  companyId: yup.string().required("Company ID is required"),
  selectedIds: yup
    .array()
    .of(yup.string().required("Employee ID cannot be empty"))
    .min(1, "Please select at least one employee")
    .required("Employee selection is required"),
  certificationId: yup.string().required("Certification selection is required"),
  status: yup
    .string()
    .oneOf(["Assigned", "Completed", "In Progress", "Failed"], "Invalid status")
    .required("Status is required"),
  certificationResult: yup
    .string()
    .oneOf(["Pending", "Pass", "Fail"], "Invalid result")
    .required("Certification result is required"),
  assignedBy: yup
    .number()
    .typeError("Assigned By must be a number")
    .required("Assigned By is required"),
  assignedDate: yup
    .date()
    .typeError("Assigned Date must be a valid date")
    .required("Assigned Date is required"),
  completedDate: yup.date().nullable().optional(),
  documentReadStatus: yup
    .boolean()
    .required("Document Read Status is required"),
  feedbackGiven: yup.boolean().required("Feedback Given is required"),
  attempts: yup
    .number()
    .typeError("Attempts must be a number")
    .min(1, "Attempts must be at least 1")
    .default(1)
    .required("Attempts is required"),
  trainer: yup
    .number()
    .typeError("Trainer must be a number")
    .required("Trainer is required"),
  assessmentAnswerId: yup.number().nullable().optional(),
  version: yup.string().required("Version is required"),
  remark: yup.string().nullable().optional(),
});

export const loginValidationSchema = yup.object().shape({
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required"),

  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),

  rememberMe: yup.boolean(),
});

export const forgotPasswordValidationSchema = yup.object({
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required"),
});
export const resetPasswordValidationSchema = yup.object().shape({
  otp: yup.string().required("OTP is required"),
  newPassword: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("New password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Passwords must match")
    .required("Confirm password is required"),
});
