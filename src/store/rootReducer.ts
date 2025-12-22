import { combineReducers } from "@reduxjs/toolkit";
import assessmentReducer from "../store/features/assessment/assessmentSlice";
import certificationReducer from "../store/features/certification/certificationSlice";
import certificationByIdReducer from "../store/features/certification/certificationByIdSlice";
import dashboardReducer from "../store/features/dashboard/dashboardSlice";
import documentReducer from "./features/document/documentSlice";
import documentByIdReducer from "./features/document/documentByIdSlice";
import moduleReducer from "./features/module/moduleSlice";
import moduleByIdReducer from "./features/module/moduleByIdSlice";
import feedbackReducer from "./features/feedback/feedbackSlice";
import mastersReducer from "./features/masters/mastersSlice";
import loadingReducer from "./features/globalConstant/loadingSlice";
import assessmentQuestionsReducer from "./features/assessment/assessmentQuestionsSlice";
import assessmentAnswersReducer from "./features/assessment/assessmentAnswerSlice";
import assessmentAnswersByIdReducer from "./features/assessment/assessmentAnswersByIdSlice";
import employeesReducer from "./features/employee/employeesSlice";
import employeeByIdReducer from "./features/employee/employeeByIdSlice";
import departmentReducer from "./features/department/departmentSlice";
import certificationTransactionReducer from "./features/certificationTransaction/certificationTransactionSlice";
import certificationTransactionByIdReducer from "./features/certificationTransaction/certificationTransactionByIdSlice";
import companySlice from "./features/company/companySlice";
import companyByIdReducer from "./features/company/companyById";
import trainingReducer from "./features/training/trainingSlice";

const rootReducer = combineReducers({
  assessment: assessmentReducer,
  assessmentQuestions: assessmentQuestionsReducer,
  assessmentAnswer: assessmentAnswersReducer,
  assessmentAnswerById: assessmentAnswersByIdReducer,
  certification: certificationReducer,
  certificationById: certificationByIdReducer,
  dashboard: dashboardReducer,
  document: documentReducer,
  documentById: documentByIdReducer,
  module: moduleReducer,
  feedback: feedbackReducer,
  moduleById: moduleByIdReducer,
  masters: mastersReducer,
  loading: loadingReducer,
  employees: employeesReducer,
  employeesById: employeeByIdReducer,
  department: departmentReducer,
  certificationTransaction: certificationTransactionReducer,
  certificationTransactionById: certificationTransactionByIdReducer,
  company: companySlice,
  companyById: companyByIdReducer,
  training: trainingReducer,
});

export default rootReducer;
