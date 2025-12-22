// export const BASE_URL = "https://hrms.qreams.com/hdlc/qa";
export const BASE_URL = "https://hrms.qreams.com/hdlc/dev";
// export const BASE_URL = "https://hrms.qreams.com/hdlc/prod";
// export const BASE_URL = "http://192.168.1.130:5002";
// export const BASE_URL = "http://localhost:5003";
// export const BASE_URL = "http://192.168.1.111:5003";
export const LMT_CONTEXT = "lmtapi";
export const HR_CONTEXT = "hrapi";
export const MASTERS_URL = `${BASE_URL}/${LMT_CONTEXT}/master`;
//LOGIN
export const FORGOT_PASSWORD_URL = `${BASE_URL}/${HR_CONTEXT}/auth/forgot-password`;
export const OTP_VERIFICATION_URL = `${BASE_URL}/${HR_CONTEXT}/auth/reset-password`;
export const RESET_OLDPASS_URL = `${BASE_URL}/${HR_CONTEXT}/auth/reset-password-with-old-password`;

// WIZDOM
//document
export const DOCUMENT_URL = `${BASE_URL}/${LMT_CONTEXT}/document`;

//module
export const MODULE_URL = `${BASE_URL}/${LMT_CONTEXT}/module`;

//training
export const TRAINING_URL = `${BASE_URL}/${LMT_CONTEXT}/training`;

//assessments
export const UPLOAD_OR_UPDATE_ASSESSMENT_QUESTIONS_BY_EXCEL = `${BASE_URL}/${LMT_CONTEXT}/assessment/uploadOrUpdateQuestions`;
export const GET_PAGINATED_ASSESSMENTS_BY_DISTINCT_GROUP = `${BASE_URL}/${LMT_CONTEXT}/assessment/distinctGroup`;
export const GET_ASSESSMENTS_QUESTIONS_BY_MODULE_ID_GROUP_ID = `${BASE_URL}/${LMT_CONTEXT}/assessment/questions`;
export const EXPORT_EXCEL_BY_MODULE_ID = `${BASE_URL}/${LMT_CONTEXT}/assessment/export/module`;
export const CREATE_ASSESSMENT_EXCEL = `${BASE_URL}/${LMT_CONTEXT}/assessment/create`;
export const GET_ASSESSMENT_ANSWERS = `${BASE_URL}/${LMT_CONTEXT}/assessment-submit/answers-all`;
export const GET_ASSESSMENT_ANSWERS_BY_GROUP = `${BASE_URL}/${LMT_CONTEXT}/assessment-submit/answers`;
export const ASSESSMENT_SUBMIT_URL = `${BASE_URL}/${LMT_CONTEXT}/assessment-submit/submit`;

//certificates
export const CERTIFICATION_URL = `${BASE_URL}/${LMT_CONTEXT}/certification`;
export const CERTIFICATION_TRANSACTION_URL = `${BASE_URL}/${LMT_CONTEXT}/certification-transaction`;
export const CERTIFICATION_TRANSACTION_APPROVE_URL = `${BASE_URL}/${LMT_CONTEXT}/certification-transaction/approve`;
export const CERTIFICATION_RE_ASSIGNED_URL = `${BASE_URL}/${LMT_CONTEXT}/reAssign/certification`;
export const CERTIFICATION_LEARNER_PDF_URL = `${BASE_URL}/${LMT_CONTEXT}/certification-transaction/download/certTransactionPdf`;
export const CERTIFICATION_WITHOUT_ASSESSMENT_URL = `${CERTIFICATION_URL}/without-assessment`;

//HRMS
export const EMPLOYEE_URL = `${BASE_URL}/${HR_CONTEXT}/employee`;
export const DEPARTMENT_URL = `${BASE_URL}/${HR_CONTEXT}/department`;
export const LOGIN_URL = `${BASE_URL}/${HR_CONTEXT}/auth/login`;
export const COMPANY_URL = `${BASE_URL}/${HR_CONTEXT}/company`;
export const BRANCH_URL = `${BASE_URL}/${HR_CONTEXT}/branch`;

//LMS Dashboard
export const LMS_DASHBOARD_STATISTICS_URL = `${BASE_URL}/${LMT_CONTEXT}/lms-dashboard/statistics`;

//FeedBack Model
export const FEEDBACK_URL = `${BASE_URL}/${LMT_CONTEXT}/feedback`;