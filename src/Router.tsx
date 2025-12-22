import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/trainer/TrainerMainLayout";
import AuthLayout from "./layouts/trainer/AuthLayout";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import ModuleLayout from "./layouts/trainer/ModuleLayout";
import Module from "./pages/module/Module";
import CreateUpdateModule from "./pages/module/CreateUpdateModule";
import AssessmentsLayout from "./layouts/trainer/AssessmentsLayout";
import Assessments from "./pages/assessment/Assessments";
import CreateUpdateAssessment from "./pages/assessment/CreateUpdateAssessment";
import CertificationLayout from "./layouts/trainer/CertificationLayout";
import Certifications from "./pages/certifications/Certifications";
import CreateUpdateCertifications from "./pages/certifications/CreateUpdateCertifications";
import AssignCertifications from "./pages/certifications/AssignCertification";
import ReAssignCertifications from "./pages/certifications/ReAssignCertification";
import DocumentsLayout from "./layouts/trainer/DocumentLayout";
import Documents from "./pages/document/Documents";
import CreateUpdateDocument from "./pages/document/CreateUpdateDocuments";
import DocumentDetails from "./pages/document/DocumentDetails";
import ViewAssessment from "./pages/assessment/ViewAssessment";
import DownloadAssessment from "./pages/assessment/DownloadAssessment";
import AssessmentResult from "./pages/assessment/AssessmentResult";
import DashboardLayout from "./layouts/trainer/DashboardLayout";
import LatestNews from "./pages/dashboard/LatestNews";
import FeedbackAndSkills from "./pages/dashboard/FeedbackAndSkills";
import AddLatestNews from "./pages/dashboard/AddLatestNews";
import FeedbackLayout from "./layouts/trainer/FeedbackLayout";
import Feedbacks from "./pages/feedback/Feedbacks";
import CreateUpdateFeedback from "./pages/feedback/CreateUpdateFeedback";
import ModuleDetails from "./pages/module/ModuleDetails";
import CreateUpdateAssessmentExcel from "./pages/assessment/CreateUpdateAssessmentExcel";
import ViewAssessmentQuestions from "./pages/assessment/ViewAssessmentQuestions";
import CertificationDetails from "./pages/certifications/CertificationDetails";
import CertificationTransactionDetails from "./pages/certifications/CertificationTransactionDetails";
import EmployeeMainLayout from "./layouts/employee/EmployeeMainLayout";
import EmployeeDashboard from "./pages/employee/dahsboard/EmployeeDashboard";
import EmployeeCertificationLayout from "./layouts/employee/EmployeeCertificationLayout";
import EmployeeCertification from "./pages/employee/certification/EmployeeCertification";
import EmployeeCertificationTransactionDetails from "./pages/employee/certification/EmployeeCertificationDetails";
import ViewAssessmentAnswers from "./pages/assessment/ViewAssessmentAnswers";
import ViewAssessmentUserAnswers from "./pages/employee/assessment/ViewUserAssessmentAnswer";
import ViewUserAssessment from "./pages/employee/assessment/ViewUserAssessment";
import TrainerMainLayout from "./layouts/trainer/TrainerMainLayout";
import AdminMainLayout from "./layouts/admin/AdminMainLayout";
import SuperAdminMainLayout from "./layouts/superAdmin/SuperAdminMainLayout";
import ForgotPassword from "./pages/auth/ForgetPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import AssesmentMainLayout from "./layouts/assesments/AssesmentMainLayout";
import TrainingLayout from "./layouts/trainer/TrainingLayout";
import Trainings from "./pages/training/Trainings";
import CreateUpdateTraining from "./pages/training/CreateUpdateTraining";
import TrainingDetails from "./pages/training/TrainingDetails";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
        </Route>
        {/* employee full screen assesment mode */}
        <Route element={<AssesmentMainLayout />}>
          <Route
            path="/employee/certifications/user-certifications-assessment"
            element={<ViewUserAssessment />}
          />
        </Route>
        {/* Super Admin Routes */}

        <Route path="super-admin" element={<SuperAdminMainLayout />}>
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="latest-news" element={<LatestNews />} />
            <Route path="add-latest-news" element={<AddLatestNews />} />
            <Route
              path="feedbacks-and-skills"
              element={<FeedbackAndSkills />}
            />
          </Route>

          <Route path="modules" element={<ModuleLayout />}>
            <Route index element={<Module />} />
            <Route
              path="create-update-module"
              element={<CreateUpdateModule />}
            />
            <Route path="module-details" element={<ModuleDetails />} />
          </Route>

          <Route path="certifications" element={<CertificationLayout />}>
            <Route index element={<Navigate to="all" replace />} />

            <Route path=":status" element={<Certifications />} />

            <Route
              path="create-update-certifications"
              element={<CreateUpdateCertifications />}
            />
            <Route
              path="assign-certifications"
              element={<AssignCertifications />}
            />
            <Route
              path="re-assign-certifications"
              element={<ReAssignCertifications />}
            />
            <Route
              path="view-certifications"
              element={<CertificationDetails />}
            />
            <Route
              path="view-certifications-transaction"
              element={<CertificationTransactionDetails />}
            />
            <Route
              path="user-certifications-assessment"
              element={<ViewAssessmentUserAnswers />}
            />
          </Route>

          <Route path="assessments" element={<AssessmentsLayout />}>
            <Route index element={<Navigate to="questions" replace />} />
            <Route path=":status" element={<Assessments />} />

            <Route
              path="create-update-assessment"
              element={<CreateUpdateAssessment />}
            />
            <Route
              path="create-update-assessment-excel"
              element={<CreateUpdateAssessmentExcel />}
            />
            <Route path="view-assessment" element={<ViewAssessment />} />
            <Route
              path="view-assessment-questions"
              element={<ViewAssessmentQuestions />}
            />
            <Route
              path="view-assessment-answers"
              element={<ViewAssessmentAnswers />}
            />
            <Route path="assessment-result" element={<AssessmentResult />} />
            <Route
              path="download-assessment"
              element={<DownloadAssessment />}
            />
          </Route>
          <Route path="documents" element={<DocumentsLayout />}>
            <Route index element={<Documents />} />
            <Route
              path="create-update-document"
              element={<CreateUpdateDocument />}
            />
            <Route path="document-details" element={<DocumentDetails />} />
          </Route>
          <Route path="trainings" element={<TrainingLayout />}>
            <Route index element={<Trainings />} />
            <Route
              path="create-update-training"
              element={<CreateUpdateTraining />}
            />
            <Route path="training-details" element={<TrainingDetails />} />
          </Route>
          <Route path="feedbacks" element={<FeedbackLayout />}>
            <Route index element={<Feedbacks />} />
            <Route
              path="create-update-feedback"
              element={<CreateUpdateFeedback />}
            />
            {/* <Route path="document-details" element={<DocumentDetails />} /> */}
          </Route>
        </Route>
        {/*Admin Routes */}
        <Route path="admin" element={<AdminMainLayout />}>
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="latest-news" element={<LatestNews />} />
            <Route path="add-latest-news" element={<AddLatestNews />} />
            <Route
              path="feedbacks-and-skills"
              element={<FeedbackAndSkills />}
            />
          </Route>

          <Route path="modules" element={<ModuleLayout />}>
            <Route index element={<Module />} />
            <Route
              path="create-update-module"
              element={<CreateUpdateModule />}
            />
            <Route path="module-details" element={<ModuleDetails />} />
          </Route>

          <Route path="certifications" element={<CertificationLayout />}>
            <Route index element={<Navigate to="all" replace />} />

            <Route path=":status" element={<Certifications />} />

            <Route
              path="create-update-certifications"
              element={<CreateUpdateCertifications />}
            />
            <Route
              path="assign-certifications"
              element={<AssignCertifications />}
            />
            <Route
              path="re-assign-certifications"
              element={<ReAssignCertifications />}
            />
            <Route
              path="view-certifications"
              element={<CertificationDetails />}
            />
            <Route
              path="view-certifications-transaction"
              element={<CertificationTransactionDetails />}
            />
            <Route
              path="user-certifications-assessment"
              element={<ViewAssessmentUserAnswers />}
            />
          </Route>

          <Route path="assessments" element={<AssessmentsLayout />}>
            <Route index element={<Navigate to="questions" replace />} />
            <Route path=":status" element={<Assessments />} />

            <Route
              path="create-update-assessment"
              element={<CreateUpdateAssessment />}
            />
            <Route
              path="create-update-assessment-excel"
              element={<CreateUpdateAssessmentExcel />}
            />
            <Route path="view-assessment" element={<ViewAssessment />} />
            <Route
              path="view-assessment-questions"
              element={<ViewAssessmentQuestions />}
            />
            <Route
              path="view-assessment-answers"
              element={<ViewAssessmentAnswers />}
            />
            <Route path="assessment-result" element={<AssessmentResult />} />
            <Route
              path="download-assessment"
              element={<DownloadAssessment />}
            />
          </Route>
          <Route path="documents" element={<DocumentsLayout />}>
            <Route index element={<Documents />} />
            <Route
              path="create-update-document"
              element={<CreateUpdateDocument />}
            />
            <Route path="document-details" element={<DocumentDetails />} />
          </Route>
          <Route path="trainings" element={<TrainingLayout />}>
            <Route index element={<Trainings />} />
            <Route
              path="create-update-training"
              element={<CreateUpdateTraining />}
            />
            <Route path="training-details" element={<TrainingDetails />} />
          </Route>
          <Route path="feedbacks" element={<FeedbackLayout />}>
            <Route index element={<Feedbacks />} />
            <Route
              path="create-update-feedback"
              element={<CreateUpdateFeedback />}
            />
            {/* <Route path="document-details" element={<DocumentDetails />} /> */}
          </Route>
        </Route>

        {/* HR Routes */}
        <Route path="hr" element={<MainLayout />}></Route>

        {/*Manager Routes */}
        <Route path="manager" element={<MainLayout />}></Route>

        {/* Trainer Routes*/}
        <Route path="/trainer" element={<TrainerMainLayout />}>
          {/* Trainer Dashboard */}
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="latest-news" element={<LatestNews />} />
            <Route path="add-latest-news" element={<AddLatestNews />} />
            <Route
              path="feedbacks-and-skills"
              element={<FeedbackAndSkills />}
            />
          </Route>

          {/* Trainer Modules */}
          <Route path="modules" element={<ModuleLayout />}>
            <Route index element={<Module />} />
            <Route
              path="create-update-module"
              element={<CreateUpdateModule />}
            />
            <Route path="module-details" element={<ModuleDetails />} />
          </Route>

          <Route path="certifications" element={<CertificationLayout />}>
            <Route index element={<Navigate to="all" replace />} />
            <Route path=":status" element={<Certifications />} />
            <Route
              path="create-update-certifications"
              element={<CreateUpdateCertifications />}
            />
            <Route
              path="assign-certifications"
              element={<AssignCertifications />}
            />
            <Route
              path="re-assign-certifications"
              element={<ReAssignCertifications />}
            />
            <Route
              path="view-certifications"
              element={<CertificationDetails />}
            />
            <Route
              path="view-certifications-transaction"
              element={<CertificationTransactionDetails />}
            />
            <Route
              path="user-certifications-assessment"
              element={<ViewAssessmentUserAnswers />}
            />
          </Route>

          {/* Trainer Assessments */}
          <Route path="assessments" element={<AssessmentsLayout />}>
            <Route index element={<Navigate to="questions" replace />} />
            <Route path=":status" element={<Assessments />} />
            <Route
              path="create-update-assessment"
              element={<CreateUpdateAssessment />}
            />
            <Route
              path="create-update-assessment-excel"
              element={<CreateUpdateAssessmentExcel />}
            />
            <Route path="view-assessment" element={<ViewAssessment />} />
            <Route
              path="view-assessment-questions"
              element={<ViewAssessmentQuestions />}
            />
            <Route
              path="view-assessment-answers"
              element={<ViewAssessmentAnswers />}
            />
            <Route path="assessment-result" element={<AssessmentResult />} />
            <Route
              path="download-assessment"
              element={<DownloadAssessment />}
            />
          </Route>

          {/* Trainer Documents */}
          <Route path="documents" element={<DocumentsLayout />}>
            <Route index element={<Documents />} />
            <Route
              path="create-update-document"
              element={<CreateUpdateDocument />}
            />
            <Route path="document-details" element={<DocumentDetails />} />
          </Route>

          {/* Trainer Trainings */}
          <Route path="trainings" element={<TrainingLayout />}>
            <Route index element={<Trainings />} />
            <Route
              path="create-update-training"
              element={<CreateUpdateTraining />}
            />
            <Route path="training-details" element={<TrainingDetails />} />
          </Route>

          {/* Trainer Feedbacks */}
          <Route path="feedbacks" element={<FeedbackLayout />}>
            <Route index element={<Feedbacks />} />
            <Route
              path="create-update-feedback"
              element={<CreateUpdateFeedback />}
            />
          </Route>
        </Route>

        {/*Employee Routes */}
        <Route path="/employee" element={<EmployeeMainLayout />}>
          <Route path="dashboard" element={<EmployeeDashboard />} />
          <Route path="reset-password" element={<ResetPassword />} />

          <Route
            path="certifications"
            element={<EmployeeCertificationLayout />}
          >
            <Route index element={<Navigate to="assigned" replace />} />

            <Route path=":status" element={<EmployeeCertification />} />

            <Route
              path="view-certifications"
              element={<EmployeeCertificationTransactionDetails />}
            />
            {/* <Route
              path="user-certifications-assessment"
              element={<ViewUserAssessment />}
            /> */}

            <Route
              path="view-user-assessment-answer"
              element={<ViewAssessmentUserAnswers />}
            />

            {/* <Route index element={<EmployeeCertification />} /> */}
          </Route>
        </Route>

        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
