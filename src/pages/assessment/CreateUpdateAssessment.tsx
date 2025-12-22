import React, { useState } from "react";
import Breadcrumb from "../../components/Breadcrumb";
import BackButton from "../../components/BackButton";
import TextField from "../../components/TextField";
import SelectField from "../../components/SelectField";
import ButtonSecondary from "../../components/ButtonSecondary";
import ButtonPrimary from "../../components/ButtonPrimary";
import SuccessModal from "../../components/SuccessModel";
import FileInputField from "../../components/FileInputField";

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

const initialState = {
  name: "",
  description: "",
  certificateType: "",
  certificateName: "",
  certificateDescription: "",
  assessment: "",
  status: "",
  timings: "",
  feedback: "",
};

const CreateUpdateAssessment: React.FC = () => {
  const [formData, setFormData] = useState<FormDataType>(initialState);

  const [errors, setErrors] = useState<FormErrorType>({});

  const [isModalOpen, setModalOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };
  return (
    <div>
      <Breadcrumb path="Assessment" subPath="Create Assessment" />

      <div className="p-2 sm:p-4 md:p-6 lg:p-8 -mt-4">
        <BackButton />
        <main className="mt-4">
          <h1 className="text-xl font-semibold mb-1 break-words break-all whitespace-pre-wrap">Create Questions</h1>
          <span className="text-gray-500 text-sm">
            Make changes to existing assessments quickly and easily..
          </span>

          <h2 className="text-lg font-medium mt-6 mb-2">Details</h2>

          <form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label="Assessment Name"
                placeholder="Design"
                name="name"
                required
                value={formData?.name}
                onChange={handleChange}
              />

              <SelectField
                label="Certificate Type"
                name="certificateType"
                required
                value={formData?.certificateType}
                onChange={handleChange}
                className="min-w-0"
                customDropdown={true}
                isSearchable={false}
                options={[
                  { label: "Design", value: "design" },
                  { label: "Development", value: "development" },
                ]}
              />

              <SelectField
                label="Certificate Name"
                name="certificateName"
                required
                value={formData?.certificateName}
                onChange={handleChange}
                error={errors.certificateName}
                className="min-w-0"
                customDropdown={true}
                isSearchable={false}
                options={[
                  { label: "Design", value: "design" },
                  { label: "Development", value: "development" },
                ]}
              />
              <SelectField
                label="Company"
                name="certificateName"
                required
                value={formData?.certificateName}
                onChange={handleChange}
                error={errors.certificateName}
                className="min-w-0"
                customDropdown={true}
                isSearchable={false}
                options={[
                  { label: "Design", value: "design" },
                  { label: "Development", value: "development" },
                ]}
                placeholder="Select Company"
              />

              <TextField
                label="Module Name"
                placeholder="Design"
                name="certificateDescription"
                required
                value={formData?.certificateDescription}
                onChange={handleChange}
                error={formData?.certificateDescription}
              />

              <SelectField
                label="MCQ"
                name="assessment"
                required
                value={formData?.assessment}
                onChange={handleChange}
                error={errors.assessment}
                className="min-w-0"
                customDropdown={true}
                isSearchable={false}
                options={[
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" },
                ]}
                placeholder="Yes/No"
              />

              <div className="col-span-2">
                <FileInputField
                  label="Upload File"
                  required
                  onChange={(file) => setFile(file)}
                  error={!file ? "" : ""}
                />
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
            <div className="flex gap-4 mt-10">
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

export default CreateUpdateAssessment;
