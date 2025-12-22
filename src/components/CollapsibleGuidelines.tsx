import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  FileText,
} from "lucide-react";

interface CollapsibleGuidelinesProps {
  isExpanded?: boolean;
}

const CollapsibleGuidelines: React.FC<CollapsibleGuidelinesProps> = ({
  isExpanded = false,
}) => {
  const [expanded, setExpanded] = useState(isExpanded);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg mb-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-blue-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <FileText className="text-blue-600 h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-800">
              Excel Upload Guidelines
            </h3>
            <p className="text-sm text-blue-600">
              Click to view important formatting requirements
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronDown className="text-blue-600 h-5 w-5" />
        ) : (
          <ChevronRight className="text-blue-600 h-5 w-5" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Quick Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="text-green-500 h-4 w-4" />
                <h4 className="font-semibold text-green-700 text-sm">
                  Required Columns
                </h4>
              </div>
              <ul className="text-xs text-green-600 space-y-1">
                <li>• question (text, max 1000 chars)</li>
                <li>• questionType (MCQ, True/False, Descriptive)</li>
                <li>• options (JSON array for MCQ)</li>
                <li>• correctAnswer (must match option)</li>
                <li>• marks (1-100)</li>
                <li>• moduleId (existing module ID)</li>
              </ul>
            </div>

            <div className="bg-white border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="text-orange-500 h-4 w-4" />
                <h4 className="font-semibold text-orange-700 text-sm">
                  File Requirements
                </h4>
              </div>
              <ul className="text-xs text-orange-600 space-y-1">
                <li>• Format: .xlsx or .xls</li>
                <li>• Max size: 5MB</li>
                <li>• Max rows: 1000 questions</li>
                <li>• First row: headers</li>
                <li>• No empty rows</li>
              </ul>
            </div>
          </div>

          {/* Common Examples */}
          <div className="bg-white border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-700 mb-3 text-sm">
              Quick Examples
            </h4>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-2 py-1 text-left">
                      questionType
                    </th>
                    <th className="border border-gray-300 px-2 py-1 text-left">
                      options
                    </th>
                    <th className="border border-gray-300 px-2 py-1 text-left">
                      correctAnswer
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1 font-mono">
                      MCQ
                    </td>
                    <td className="border border-gray-300 px-2 py-1 font-mono">
                      ["A", "B", "C", "D"]
                    </td>
                    <td className="border border-gray-300 px-2 py-1">A</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-2 py-1 font-mono">
                      True/False
                    </td>
                    <td className="border border-gray-300 px-2 py-1 font-mono">
                      ["True", "False"]
                    </td>
                    <td className="border border-gray-300 px-2 py-1">True</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1 font-mono">
                      Descriptive
                    </td>
                    <td className="border border-gray-300 px-2 py-1 font-mono">
                      []
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      Expected answer text
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Common Mistakes */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-700 mb-2 text-sm">
              Common Mistakes to Avoid
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-red-600">
              <div>
                ❌ <code>mcq</code> → ✅ <code>MCQ</code>
              </div>
              <div>
                ❌ <code>A,B,C,D</code> → ✅ <code>["A","B","C","D"]</code>
              </div>
              <div>❌ Empty question field</div>
              <div>❌ correctAnswer not in options</div>
              <div>❌ marks = 0 or negative</div>
              <div>❌ Non-existent moduleId</div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-700 mb-2 text-sm">
              Pro Tips
            </h4>
            <ul className="text-xs text-green-600 space-y-1">
              <li>• Test with 2-3 questions first</li>
              <li>• Use .xlsx format for best compatibility</li>
              <li>• Verify all module IDs exist before uploading</li>
              <li>• Keep file under 5MB for faster processing</li>
              <li>• Remove extra spaces from text fields</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollapsibleGuidelines;
