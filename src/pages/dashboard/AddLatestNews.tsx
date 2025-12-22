import React, { useState } from "react";
import Breadcrumb from "../../components/Breadcrumb";
import ButtonSecondary from "../../components/ButtonSecondary";
import ButtonPrimary from "../../components/ButtonPrimary";
import BackButton from "../../components/BackButton";
import TextField from "../../components/TextField";
import TextAreaField from "../../components/TextAreaField";
import { useNavigate } from "react-router-dom";

interface FormDataType {
  title: string;
  about: string;
  description: string;
}

interface FormErrorType {
  [key: string]: string;
}

const AddLatestNews: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormDataType>({
    title: "",
    about: "",
    description: "",
  });

  const [errors, setErrors] = useState<FormErrorType>({});

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Breadcrumb path="Latest News" subPath="Add News" />

       <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 -mt-2 ">
        <div className="flex items-center gap-4 mb-4">
          <BackButton />
          <h1 className="text-xl font-semibold text-gray-800">Add News</h1>
        </div>

        {/* <p className="text-sm text-gray-500 mb-6">
          News and updates to keep your learning journey informed and on track.
        </p> */}

        <main className="bg-white p-8 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-700 mb-4">Details</h2>

          <form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label="Title"
                placeholder="Title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
              />
              <TextField
                label="About"
                placeholder="About"
                name="about"
                required
                value={formData.about}
                onChange={handleChange}
              />

              <div className="col-span-1 md:col-span-2">
                <TextAreaField
                  label="Description"
                  placeholder="Description"
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleChange}
                  error={errors.description}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-10">
              <ButtonSecondary text="Cancel" onClick={() => navigate(-1)} />
              <ButtonPrimary text="Save" onClick={() => console.log("log")} />
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default AddLatestNews;
