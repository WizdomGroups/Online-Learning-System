import React from "react";
import Tabs from "../../components/Tabs";
import DropdownPrimaryButton from "../../components/DropdownPrimaryButton";
import { useNavigate, useParams } from "react-router-dom";
import AssessmentQuestions from "./AssessmentQuestions";
import AssessmentAnswers from "./AssessmentAnswers";
import useLocalStorageData from "../../lib/hooks/useLocalStorageUserData";
const Assessments = () => {
  const { isAdmin, isTrainer, isSuperAdmin } = useLocalStorageData();
  const navigate = useNavigate();
  const { status = "questions" } = useParams();

  const tabItems = [
    { label: "Questions", value: "questions" },
    { label: "Answers", value: "answers" },
  ];

  return (
    <div className="p-2 sm:p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold">Assessments</h1>
        {/* <ButtonPrimary
          text="Create Assessment"
          onClick={() => navigate("create-update-assessment")}
        /> */}

        <DropdownPrimaryButton
          text="Manage Assessment"
          className="w-full sm:w-auto"
          buttonClassName="w-full sm:w-auto text-base sm:text-sm py-3 sm:py-2 px-5"
          options={[
            {
              label: "Create Questions By Excel",
              path: isAdmin
                ? "/admin/assessments/create-update-assessment-excel"
                : "/trainer/assessments/create-update-assessment-excel",
            },
            // {
            //   label: "Create Assessment By Form",
            //   path: "create-update-assessment",
            // },
          ]}
        />
      </div>

      {/* <NoRecentActivity subHeading="Discover new and updated modules to boost your learning." /> */}

      <Tabs
        tabs={tabItems}
        selectedTab={status}
        onChange={(tab) => {
          if (isSuperAdmin) {
            navigate(`/super-admin/assessments/${tab}`);
          } else if (isAdmin) {
            navigate(`/admin/assessments/${tab}`);
          } else if (isTrainer) {
            navigate(`/trainer/assessments/${tab}`);
          } else {
            navigate(`/auth/login`);
          }
        }}
      />

      {status === "questions" && <AssessmentQuestions />}
      {status === "answers" && <AssessmentAnswers />}
    </div>
  );
};

export default Assessments;
