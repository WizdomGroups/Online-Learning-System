import { useNavigate, useParams } from "react-router-dom";
import DropdownPrimaryButton from "../../components/DropdownPrimaryButton";
import Tabs from "../../components/Tabs";
import AllCertifications from "./AllCertification";
import CertificationsTransaction from "./CertificationTransaction";
import useLocalStorageData from "../../lib/hooks/useLocalStorageUserData";

const Certifications: React.FC = () => {
  const { isAdmin, isTrainer, isSuperAdmin } = useLocalStorageData();
  const { status = "all" } = useParams();
  const navigate = useNavigate();

  const tabItems = [
    { label: "Certifications", value: "all" },
    { label: "Assigned", value: "assigned" },
    { label: "Re-Assigned", value: "re-assigned" },
    { label: "Review", value: "review" },
    { label: "Completed", value: "completed" },
    { label: "Rejected", value: "cancelled" },
  ];

  return (
    <div className="p-2 sm:p-4 md:p-6 lg:p-8">
      <div className="flex justify-between items-center gap-3">
        <h1 className="text-xl sm:text-2xl font-bold">Certification</h1>
        <DropdownPrimaryButton
          text="Manage Certification"
          buttonClassName="min-w-[130px] px-4 py-1 text-sm sm:min-w-[150px] sm:px-6 sm:text-base"
          options={[
            {
              label: "Create Certification",
              path: isSuperAdmin
                ? "/super-admin/certifications/create-update-certifications"
                : isAdmin
                ? "/admin/certifications/create-update-certifications"
                : isTrainer
                ? "/trainer/certifications/create-update-certifications"
                : "/auth/login",
            },
            {
              label: "Assign Certification",
              path: isSuperAdmin
                ? "/super-admin/certifications/assign-certifications"
                : isAdmin
                ? "/admin/certifications/assign-certifications"
                : isTrainer
                ? "/trainer/certifications/assign-certifications"
                : "/auth/login",
            },
          ]}
        />
      </div>

      <Tabs
        tabs={tabItems}
        selectedTab={status}
        onChange={(tab) => {
          if (isSuperAdmin) {
            navigate(`/super-admin/certifications/${tab}`);
          } else if (isAdmin) {
            navigate(`/admin/certifications/${tab}`);
          } else if (isTrainer) {
            navigate(`/trainer/certifications/${tab}`);
          } else {
            navigate(`/auth/login`);
          }
        }}
      />

      {status === "all" && <AllCertifications />}
      {status !== "all" && <CertificationsTransaction />}
    </div>
  );
};

export default Certifications;
