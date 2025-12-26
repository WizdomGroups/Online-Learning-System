import React, { useState } from "react";
import Breadcrumb from "../../components/Breadcrumb";
import BackButton from "../../components/BackButton";
import TextField from "../../components/TextField";
import SelectField from "../../components/SelectField";
import ButtonSecondary from "../../components/ButtonSecondary";
import ButtonPrimary from "../../components/ButtonPrimary";
import SuccessModal from "../../components/SuccessModel";
import { useSearchParams } from "react-router-dom";
import FileInputField from "../../components/FileInputField";
import OverallExperienceRating from "../../components/OverallExperienceRating";

interface FormDataType {
  certificateType: string;
  certificate: string;
}

interface FormErrorType {
  [key: string]: string;
}

const CreateUpdateFeedback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const key = searchParams.get("key");

  const [formData, setFormData] = useState<FormDataType>({
    certificateType: "",
    certificate: "",
  });

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
      <Breadcrumb
        path="Feedbacks"
        subPath={`${key ? "Edit" : "Create"} Feedback`}
      />
      <div className="p-2 sm:p-4 md:p-6 lg:p-8">
        <BackButton />
        <main className="mt-4">
          <h1 className="text-xl font-semibold mb-1">
            {key ? "Edit" : "Add"} Feedback
          </h1>
          <span className="text-gray-500 text-sm">
            Provide personalized feedback to guide student improvement.
          </span>

          <h2 className="text-lg font-medium mt-6 mb-2">Details</h2>

          <form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label="Certificate"
                name="certificate"
                required
                value={formData.certificate}
                onChange={handleChange}
                options={[
                  { label: "Design", value: "design" },
                  { label: "Development", value: "development" },
                ]}
                customDropdown={true}
              />
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

              <div className="col-span-2">
                <OverallExperienceRating />
              </div>

              <div className="col-span-2">
                <FileInputField
                  label="Upload File (optional)"
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
            <div className="flex gap-4 mt-5">
              <ButtonSecondary
                text="Cancel"
                onClick={() => console.log("log")}
              />
              <ButtonPrimary text="Save" onClick={() => console.log("log")} />
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default CreateUpdateFeedback;
