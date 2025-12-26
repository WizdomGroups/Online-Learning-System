import React, { useState } from "react";
import Breadcrumb from "../../components/Breadcrumb";
import BackButton from "../../components/BackButton";
import TextField from "../../components/TextField";
import SelectField from "../../components/SelectField";
import ButtonSecondary from "../../components/ButtonSecondary";
import ButtonPrimary from "../../components/ButtonPrimary";
import SuccessModal from "../../components/SuccessModel";
import DateField from "../../components/DateField";
import Tabs from "../../components/Tabs";
import SearchField from "../../components/SearchField";
import UserCard from "../../components/UserCard";

interface FormDataType {
  name: string;
  description: string;
  certificateType: string;
  certificateName: string;
  certificateDescription: string;
  assessment: string;
  status: string;
  timings: string;
  feedback: string;
}

interface FormErrorType {
  [key: string]: string;
}

const tabItems = [
  { label: "Users", value: "users" },
  { label: "User Groups", value: "userGroups" },
  { label: "Roles", value: "roles" },
];

const userList = [
  {
    id: "C1234",
    name: "Khushi",
    image: "/images/user-dummy-profile.svg", // or any dummy img
    department: "Department",
    role: "Role",
  },
  {
    id: "C5678",
    name: "Aman",
    image: "/images/user-dummy-profile.svg", // or any dummy img
    department: "Dept",
    role: "Manager",
  },
];

const ReAssignCertifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    description: "",
    certificateType: "",
    certificateName: "",
    certificateDescription: "",
    assessment: "",
    status: "",
    timings: "",
    feedback: "",
  });

  const [errors, setErrors] = useState<FormErrorType>({});

  const [isModalOpen, setModalOpen] = useState(false);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Breadcrumb
        path="Certification"
        subPath="Manage Certification"
        subSubPath="Re Assign Certification"
      />
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-6">
          <BackButton />
          <h1 className="text-xl font-semibold mb-1">
            Re Assign Certification
          </h1>
          {/* <span className="text-gray-500 text-sm">
            Re Assign certificate template that can be assigned to users upon
            completion of courses or modules.
          </span> */}
        </div>
        <main className="bg-white p-8 rounded-lg shadow-sm">

          {/* <h2 className="text-lg font-medium mt-6 mb-2">Details</h2> */}

          <form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label="Certificate Type"
                name="certificateType"
                required
                value={formData.certificateType}
                onChange={handleChange}
                options={[
                  { label: "Design", value: "design" },
                  { label: "Development", value: "development" },
                ]}
                customDropdown={true}
              />

              <SelectField
                label="Certificate Name"
                name="certificateName"
                required
                value={formData.certificateName}
                onChange={handleChange}
                error={errors.certificateName}
                options={[
                  { label: "Design", value: "design" },
                  { label: "Development", value: "development" },
                ]}
                customDropdown={true}
              />

              <TextField
                label="Certificate Description"
                placeholder="Design"
                name="certificateDescription"
                required
                value={formData.certificateDescription}
                onChange={handleChange}
                error={formData.certificateDescription}
              />

              <SelectField
                label="Company"
                name="assessment"
                required
                value={formData.assessment}
                onChange={handleChange}
                error={errors.assessment}
                options={[
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" },
                ]}
                placeholder="Yes/No"
                customDropdown={true}
              />

              <SelectField
                label="Department"
                name="certificateType"
                required
                value={formData.certificateType}
                onChange={handleChange}
                options={[
                  { label: "Design", value: "design" },
                  { label: "Development", value: "development" },
                ]}
                customDropdown={true}
              />
              <DateField
                label="Start Date"
                name="certificateType"
                required
                value={formData.certificateType}
                onChange={handleChange}
              />
              <DateField
                label="End Date"
                name="certificateType"
                required
                value={formData.certificateType}
                onChange={handleChange}
              />

              <SelectField
                label="Status"
                name="status"
                required
                value={formData.status}
                onChange={handleChange}
                error={errors.status}
                options={[
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" },
                ]}
                placeholder="-Select status-"
                customDropdown={true}
              />

              <SelectField
                label="Associated Course or Module"
                name="certificateType"
                required
                value={formData.certificateType}
                onChange={handleChange}
                options={[
                  { label: "Design", value: "design" },
                  { label: "Development", value: "development" },
                ]}
                customDropdown={true}
              />

              <div className="col-span-1 md:col-span-2">
                <h2 className="font-bold ">Re Assign To</h2>
                <Tabs
                  tabs={tabItems}
                  selectedTab={activeTab}
                  onChange={setActiveTab}
                />

                <SearchField placeholder="Search..." className="my-5" />

                <div className="bg-white p-4 rounded shadow-sm">
                  {userList.map((user) => (
                    <UserCard
                      key={user.id}
                      image={user.image}
                      name={user.name}
                      department={user.department}
                      role={user.role}
                      id={user.id}
                      isSelected={selectedIds.includes(user.id)}
                      onToggle={() => toggleSelection(user.id)}
                    />
                  ))}
                  <div className="text-sm text-orange-500 font-medium mt-3 cursor-pointer hover:underline">
                    + Add More Users
                  </div>
                </div>
              </div>

              <SuccessModal
                isOpen={isModalOpen}
                title="Module Details Edited Successfully"
                subtitle="Your Module Details has been published."
                onCancel={() => setModalOpen(false)}
                onConfirm={() => console.log("View clicked")}
                onClose={() => setModalOpen(false)} // <-- handles outside click
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 mt-8 border-t border-gray-200">
              <ButtonSecondary
                text="Cancel"
                onClick={() => console.log("log")}
              />
              <ButtonPrimary text="Submit" onClick={() => console.log("log")} />
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default ReAssignCertifications;
