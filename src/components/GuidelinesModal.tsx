import React, { useEffect, useRef } from "react";
import {
  X,
  Download,
  FileText,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";
import ButtonPrimary from "./ButtonPrimary";
import ButtonSecondary from "./ButtonSecondary";
import Tabs from "./Tabs";

interface GuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GuidelinesModal: React.FC<GuidelinesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [selectedTab, setSelectedTab] = React.useState("overview");

  const tabs = [
    { label: "Overview", value: "overview" },
    { label: "Required Columns", value: "columns" },
    { label: "Format Requirements", value: "format" },
    { label: "Examples", value: "examples" },
    { label: "Common Mistakes", value: "mistakes" },
    { label: "Best Practices", value: "practices" },
    { label: "Error Solutions", value: "errors" },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const renderOverview = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="text-blue-500 mt-1 h-5 w-5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-800 mb-2">Quick Start</h3>
            <p className="text-blue-700 text-sm">
              Follow these guidelines to ensure successful uploads and avoid
              common errors when uploading assessment questions via Excel.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="text-green-500 h-5 w-5" />
            <h4 className="font-semibold text-green-800">Supported Formats</h4>
          </div>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• .xlsx (recommended)</li>
            <li>• .xls</li>
            <li>• Max file size: 5MB</li>
            <li>• Max 1000 questions per file</li>
          </ul>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="text-orange-500 h-5 w-5" />
            <h4 className="font-semibold text-orange-800">Important Notes</h4>
          </div>
          <ul className="text-sm text-orange-700 space-y-1">
            <li>• First row must be headers</li>
            <li>• All mandatory fields required</li>
            <li>• Case-sensitive values</li>
            <li>• Module must exist in system</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderColumns = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">Mandatory Columns</h3>
        <div className="space-y-3">
          {[
            {
              name: "question",
              type: "Text/String",
              required: "Yes",
              maxLength: "1000 characters",
              description: "The actual question text",
              example: "What is the capital of France?",
            },
            {
              name: "questionType",
              type: "Text/String",
              required: "Yes",
              validValues: "MCQ, True/False, Descriptive",
              description: "Type of question",
              example: "MCQ",
            },
            {
              name: "options",
              type: "JSON Array",
              required: "Yes (for MCQ)",
              maxLength: "2000 characters",
              description: "Array of answer options",
              example: '["Paris", "London", "Berlin", "Madrid"]',
            },
            {
              name: "correctAnswer",
              type: "Text/String",
              required: "Yes",
              description: "The correct answer",
              example: "Paris",
            },
            {
              name: "marks",
              type: "Number",
              required: "Yes",
              range: "1-100",
              description: "Points awarded",
              example: "10",
            },
            {
              name: "moduleId",
              type: "Number",
              required: "Yes",
              description: "ID of existing module",
              example: "1",
            },
          ].map((column) => (
            <div
              key={column.name}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm font-semibold">
                  {column.name}
                </span>
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                  Required
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div>
                  <strong>Type:</strong> {column.type}
                </div>
                {column.range && (
                  <div>
                    <strong>Range:</strong> {column.range}
                  </div>
                )}
                {column.maxLength && (
                  <div>
                    <strong>Max Length:</strong> {column.maxLength}
                  </div>
                )}
                {column.validValues && (
                  <div>
                    <strong>Valid Values:</strong> {column.validValues}
                  </div>
                )}
              </div>
              <div className="mt-2 text-sm">
                <strong>Description:</strong> {column.description}
              </div>
              <div className="mt-1 text-sm">
                <strong>Example:</strong>{" "}
                <code className="bg-gray-100 px-1 rounded">
                  {column.example}
                </code>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-800 mb-3">Optional Columns</h3>
        <div className="space-y-3">
          {[
            {
              name: "explanation",
              type: "Text/String",
              maxLength: "1000 characters",
              description: "Explanation for correct answer",
              example: "Paris is the capital and largest city of France.",
            },
            {
              name: "difficultyLevel",
              type: "Text/String",
              validValues: "Easy, Medium, Hard",
              description: "Question difficulty level",
              example: "Easy",
            },
            {
              name: "timeLimit",
              type: "Number",
              range: "30-3600 seconds",
              description: "Time limit for answering",
              example: "60",
            },
          ].map((column) => (
            <div
              key={column.name}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm font-semibold">
                  {column.name}
                </span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  Optional
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div>
                  <strong>Type:</strong> {column.type}
                </div>
                {column.range && (
                  <div>
                    <strong>Range:</strong> {column.range}
                  </div>
                )}
                {column.maxLength && (
                  <div>
                    <strong>Max Length:</strong> {column.maxLength}
                  </div>
                )}
                {column.validValues && (
                  <div>
                    <strong>Valid Values:</strong> {column.validValues}
                  </div>
                )}
              </div>
              <div className="mt-2 text-sm">
                <strong>Description:</strong> {column.description}
              </div>
              <div className="mt-1 text-sm">
                <strong>Example:</strong>{" "}
                <code className="bg-gray-100 px-1 rounded">
                  {column.example}
                </code>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFormat = () => (
    <div className="space-y-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">
          File Format Requirements
        </h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>
            • <strong>Supported Formats:</strong> .xlsx, .xls
          </li>
          <li>
            • <strong>Maximum File Size:</strong> 5MB
          </li>
          <li>
            • <strong>Maximum Rows:</strong> 1000 questions per file
          </li>
          <li>
            • <strong>Header Row:</strong> First row must contain column headers
          </li>
          <li>
            • <strong>Headers:</strong> Must match exactly (case-sensitive)
          </li>
          <li>
            • <strong>Data Rows:</strong> No empty rows between data
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-gray-800 mb-3">
          Data Validation Rules
        </h3>
        <div className="space-y-3">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-700 mb-2">Text Fields</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• No leading/trailing spaces</li>
              <li>• Maximum 1000 characters for questions</li>
              <li>• Maximum 2000 characters for options</li>
              <li>
                • Case-sensitive values for questionType and difficultyLevel
              </li>
            </ul>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-700 mb-2">Numeric Fields</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>
                • <strong>marks:</strong> Must be between 1-100
              </li>
              <li>
                • <strong>timeLimit:</strong> Must be between 30-3600 seconds
              </li>
              <li>
                • <strong>moduleId:</strong> Must be a valid existing module ID
              </li>
            </ul>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-700 mb-2">
              JSON Format (Options)
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Must be valid JSON array format</li>
              <li>
                • Example:{" "}
                <code className="bg-gray-100 px-1 rounded">
                  ["option1", "option2", "option3"]
                </code>
              </li>
              <li>
                • For True/False:{" "}
                <code className="bg-gray-100 px-1 rounded">
                  ["True", "False"]
                </code>
              </li>
              <li>
                • For Descriptive:{" "}
                <code className="bg-gray-100 px-1 rounded">[]</code> (empty
                array)
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderExamples = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">
          Example Excel Structure
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">
                  question
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">
                  questionType
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">
                  options
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">
                  correctAnswer
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">
                  marks
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">
                  moduleId
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">
                  explanation
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">
                  difficultyLevel
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">
                  timeLimit
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-3 py-2">
                  What is the capital of France?
                </td>
                <td className="border border-gray-300 px-3 py-2">MCQ</td>
                <td className="border border-gray-300 px-3 py-2">
                  ["Paris", "London", "Berlin", "Madrid"]
                </td>
                <td className="border border-gray-300 px-3 py-2">Paris</td>
                <td className="border border-gray-300 px-3 py-2">10</td>
                <td className="border border-gray-300 px-3 py-2">1</td>
                <td className="border border-gray-300 px-3 py-2">
                  Paris is the capital and largest city of France.
                </td>
                <td className="border border-gray-300 px-3 py-2">Easy</td>
                <td className="border border-gray-300 px-3 py-2">60</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-3 py-2">
                  Is the Earth round?
                </td>
                <td className="border border-gray-300 px-3 py-2">True/False</td>
                <td className="border border-gray-300 px-3 py-2">
                  ["True", "False"]
                </td>
                <td className="border border-gray-300 px-3 py-2">True</td>
                <td className="border border-gray-300 px-3 py-2">5</td>
                <td className="border border-gray-300 px-3 py-2">1</td>
                <td className="border border-gray-300 px-3 py-2">
                  The Earth is approximately spherical in shape.
                </td>
                <td className="border border-gray-300 px-3 py-2">Easy</td>
                <td className="border border-gray-300 px-3 py-2">30</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2">
                  Explain the concept of gravity.
                </td>
                <td className="border border-gray-300 px-3 py-2">
                  Descriptive
                </td>
                <td className="border border-gray-300 px-3 py-2">[]</td>
                <td className="border border-gray-300 px-3 py-2">
                  Gravity is a force that attracts objects toward each other.
                </td>
                <td className="border border-gray-300 px-3 py-2">20</td>
                <td className="border border-gray-300 px-3 py-2">1</td>
                <td className="border border-gray-300 px-3 py-2">
                  Gravity is a fundamental force of nature.
                </td>
                <td className="border border-gray-300 px-3 py-2">Hard</td>
                <td className="border border-gray-300 px-3 py-2">300</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-800 mb-3">
          Question Type Examples
        </h3>
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-700 mb-2">MCQ Questions</h4>
            <div className="text-sm space-y-2">
              <p>
                <strong>questionType:</strong> "MCQ"
              </p>
              <p>
                <strong>options:</strong>{" "}
                <code className="bg-gray-100 px-1 rounded">
                  ["Option A", "Option B", "Option C", "Option D"]
                </code>
              </p>
              <p>
                <strong>correctAnswer:</strong> Must exactly match one of the
                options
              </p>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-700 mb-2">
              True/False Questions
            </h4>
            <div className="text-sm space-y-2">
              <p>
                <strong>questionType:</strong> "True/False"
              </p>
              <p>
                <strong>options:</strong>{" "}
                <code className="bg-gray-100 px-1 rounded">
                  ["True", "False"]
                </code>
              </p>
              <p>
                <strong>correctAnswer:</strong> Either "True" or "False"
              </p>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-700 mb-2">
              Descriptive Questions
            </h4>
            <div className="text-sm space-y-2">
              <p>
                <strong>questionType:</strong> "Descriptive"
              </p>
              <p>
                <strong>options:</strong>{" "}
                <code className="bg-gray-100 px-1 rounded">[]</code> (empty
                array)
              </p>
              <p>
                <strong>correctAnswer:</strong> Expected answer text
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMistakes = () => (
    <div className="space-y-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="font-semibold text-red-800 mb-3">
          Common Data Format Errors
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <X className="text-red-500 mt-1 h-4 w-4 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-700">
                Incorrect JSON format
              </p>
              <p className="text-sm text-red-600">
                ❌ <code>Paris, London, Berlin</code>
              </p>
              <p className="text-sm text-red-600">
                ✅ <code>["Paris", "London", "Berlin"]</code>
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <X className="text-red-500 mt-1 h-4 w-4 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-700">
                Wrong questionType case
              </p>
              <p className="text-sm text-red-600">
                ❌ <code>mcq</code>
              </p>
              <p className="text-sm text-red-600">
                ✅ <code>MCQ</code>
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <X className="text-red-500 mt-1 h-4 w-4 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-700">Invalid marks value</p>
              <p className="text-sm text-red-600">
                ❌ <code>0</code> or negative numbers
              </p>
              <p className="text-sm text-red-600">
                ✅ <code>1-100</code>
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <X className="text-red-500 mt-1 h-4 w-4 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-700">
                Non-existent moduleId
              </p>
              <p className="text-sm text-red-600">
                ❌ Using ID that doesn't exist in system
              </p>
              <p className="text-sm text-red-600">✅ Use existing module ID</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="font-semibold text-red-800 mb-3">Content Errors</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <X className="text-red-500 mt-1 h-4 w-4 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-700">
                Empty mandatory fields
              </p>
              <p className="text-sm text-red-600">
                ❌ Leaving question or correctAnswer blank
              </p>
              <p className="text-sm text-red-600">
                ✅ Fill all required fields
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <X className="text-red-500 mt-1 h-4 w-4 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-700">Mismatched answers</p>
              <p className="text-sm text-red-600">
                ❌ correctAnswer not matching any option
              </p>
              <p className="text-sm text-red-600">
                ✅ Ensure exact match with options
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <X className="text-red-500 mt-1 h-4 w-4 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-700">
                Invalid options format
              </p>
              <p className="text-sm text-red-600">
                ❌ Not using JSON array for MCQ options
              </p>
              <p className="text-sm text-red-600">
                ✅ Use proper JSON array format
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="font-semibold text-red-800 mb-3">File Errors</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <X className="text-red-500 mt-1 h-4 w-4 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-700">Wrong file format</p>
              <p className="text-sm text-red-600">
                ❌ Using .csv or .txt instead of .xlsx
              </p>
              <p className="text-sm text-red-600">
                ✅ Use .xlsx or .xls format
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <X className="text-red-500 mt-1 h-4 w-4 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-700">Large file size</p>
              <p className="text-sm text-red-600">❌ Exceeding 5MB limit</p>
              <p className="text-sm text-red-600">✅ Keep file under 5MB</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <X className="text-red-500 mt-1 h-4 w-4 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-700">Too many rows</p>
              <p className="text-sm text-red-600">
                ❌ More than 1000 questions
              </p>
              <p className="text-sm text-red-600">
                ✅ Split into smaller files
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <X className="text-red-500 mt-1 h-4 w-4 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-700">Empty rows</p>
              <p className="text-sm text-red-600">❌ Gaps between data rows</p>
              <p className="text-sm text-red-600">✅ Remove empty rows</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPractices = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">Data Preparation</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="text-green-500 mt-1 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-700">
                Validate data beforehand
              </p>
              <p className="text-sm text-green-600">
                Check all required fields are filled
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="text-green-500 mt-1 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-700">
                Test with small files
              </p>
              <p className="text-sm text-green-600">
                Start with 5-10 questions to test format
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="text-green-500 mt-1 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-700">
                Use consistent formatting
              </p>
              <p className="text-sm text-green-600">
                Same case, spacing, and structure
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="text-green-500 mt-1 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-700">Verify module IDs</p>
              <p className="text-sm text-green-600">
                Ensure all moduleId values exist in the system
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-800 mb-3">File Preparation</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="text-green-500 mt-1 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-700">
                Use proper Excel format
              </p>
              <p className="text-sm text-green-600">
                .xlsx recommended for best compatibility
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="text-green-500 mt-1 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-700">Clean data</p>
              <p className="text-sm text-green-600">
                Remove extra spaces and special characters
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="text-green-500 mt-1 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-700">Check file size</p>
              <p className="text-sm text-green-600">Keep under 5MB limit</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="text-green-500 mt-1 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-700">
                Backup original data
              </p>
              <p className="text-sm text-green-600">
                Keep a copy before uploading
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-800 mb-3">Upload Process</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="text-green-500 mt-1 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-700">
                Review validation errors
              </p>
              <p className="text-sm text-green-600">
                Check all error messages carefully
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="text-green-500 mt-1 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-700">
                Fix issues incrementally
              </p>
              <p className="text-sm text-green-600">
                Address one error type at a time
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="text-green-500 mt-1 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-700">
                Test with sample data
              </p>
              <p className="text-sm text-green-600">
                Verify format with small dataset first
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="text-green-500 mt-1 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-700">Keep records</p>
              <p className="text-sm text-green-600">
                Note which questions were successfully uploaded
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderErrors = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-3">
          Common Error Messages & Solutions
        </h3>
        <div className="space-y-4">
          <div className="border border-blue-200 rounded-lg p-3 bg-white">
            <p className="font-semibold text-red-600 mb-1">
              "question is required"
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Cause:</strong> Empty question field
            </p>
            <p className="text-sm text-gray-600">
              <strong>Solution:</strong> Fill in the question text
            </p>
          </div>
          <div className="border border-blue-200 rounded-lg p-3 bg-white">
            <p className="font-semibold text-red-600 mb-1">
              "Invalid questionType"
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Cause:</strong> Wrong value in questionType
            </p>
            <p className="text-sm text-gray-600">
              <strong>Solution:</strong> Use exact values: MCQ, True/False,
              Descriptive
            </p>
          </div>
          <div className="border border-blue-200 rounded-lg p-3 bg-white">
            <p className="font-semibold text-red-600 mb-1">
              "options must be a valid JSON array"
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Cause:</strong> Incorrect options format
            </p>
            <p className="text-sm text-gray-600">
              <strong>Solution:</strong> Use format: ["option1", "option2",
              "option3"]
            </p>
          </div>
          <div className="border border-blue-200 rounded-lg p-3 bg-white">
            <p className="font-semibold text-red-600 mb-1">
              "correctAnswer must match one of the options"
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Cause:</strong> Answer doesn't match options
            </p>
            <p className="text-sm text-gray-600">
              <strong>Solution:</strong> Ensure correctAnswer exactly matches an
              option
            </p>
          </div>
          <div className="border border-blue-200 rounded-lg p-3 bg-white">
            <p className="font-semibold text-red-600 mb-1">
              "marks must be between 1 and 100"
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Cause:</strong> Invalid marks value
            </p>
            <p className="text-sm text-gray-600">
              <strong>Solution:</strong> Use number between 1-100
            </p>
          </div>
          <div className="border border-blue-200 rounded-lg p-3 bg-white">
            <p className="font-semibold text-red-600 mb-1">
              "Module not found"
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Cause:</strong> Invalid moduleId
            </p>
            <p className="text-sm text-gray-600">
              <strong>Solution:</strong> Use existing module ID from the system
            </p>
          </div>
          <div className="border border-blue-200 rounded-lg p-3 bg-white">
            <p className="font-semibold text-red-600 mb-1">"File too large"</p>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Cause:</strong> File exceeds 5MB
            </p>
            <p className="text-sm text-gray-600">
              <strong>Solution:</strong> Reduce file size or split into smaller
              files
            </p>
          </div>
          <div className="border border-blue-200 rounded-lg p-3 bg-white">
            <p className="font-semibold text-red-600 mb-1">"Too many rows"</p>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Cause:</strong> More than 1000 questions
            </p>
            <p className="text-sm text-gray-600">
              <strong>Solution:</strong> Split file into smaller batches
            </p>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">
          Validation Error Format
        </h3>
        <div className="bg-gray-100 p-3 rounded text-sm font-mono">
          <pre>{`{
  "row": 5,
  "errors": {
    "question": "question is required",
    "questionType": "Invalid questionType"
  }
}`}</pre>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-800 mb-3">
          Troubleshooting Steps
        </h3>
        <div className="space-y-2 text-sm text-green-700">
          <p>
            <strong>1. Check file format:</strong> Ensure it's .xlsx or .xls
          </p>
          <p>
            <strong>2. Verify file size:</strong> Must be under 5MB
          </p>
          <p>
            <strong>3. Review error messages:</strong> Address each error
            systematically
          </p>
          <p>
            <strong>4. Test with sample data:</strong> Try with 1-2 questions
            first
          </p>
          <p>
            <strong>5. Check moduleId:</strong> Ensure it matches existing
            module
          </p>
          <p>
            <strong>6. Verify upload success:</strong> Check success count in
            results
          </p>
          <p>
            <strong>7. Refresh page:</strong> Questions may need page refresh to
            appear
          </p>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (selectedTab) {
      case "overview":
        return renderOverview();
      case "columns":
        return renderColumns();
      case "format":
        return renderFormat();
      case "examples":
        return renderExamples();
      case "mistakes":
        return renderMistakes();
      case "practices":
        return renderPractices();
      case "errors":
        return renderErrors();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        ref={modalRef}
        className="bg-white w-[95%] max-w-6xl max-h-[90vh] rounded-lg shadow-lg overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <FileText className="text-blue-600 h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Assessment Question Excel Upload Guidelines
              </h2>
              <p className="text-sm text-gray-500">
                Comprehensive guide for uploading assessment questions via Excel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6">
          <Tabs
            tabs={tabs}
            selectedTab={selectedTab}
            onChange={setSelectedTab}
          />
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Info className="h-4 w-4" />
            <span>
              Need help? Contact support if you encounter persistent issues.
            </span>
          </div>
          <div className="flex gap-3">
            <ButtonSecondary
              text="Download Template"
              onClick={() => {
                const link = document.createElement("a");
                link.href = "/files/module-assessment.xlsx";
                link.download = "assessment-template.xlsx";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            />
            <ButtonPrimary text="Got it" onClick={onClose} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidelinesModal;
