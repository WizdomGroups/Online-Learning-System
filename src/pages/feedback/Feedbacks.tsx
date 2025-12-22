import { useNavigate } from "react-router-dom";
import ButtonPrimary from "../../components/ButtonPrimary";
import NoRecentActivity from "../../components/NoRecentActivity";
import Tabs from "../../components/Tabs";
import { useState } from "react";
import SearchField from "../../components/SearchField";
import FilterField from "../../components/FilterField";
import ValidityField from "../../components/ValidityField";
import SelectField from "../../components/SelectField";
import DynamicTable from "../../components/DynamicTable";
import { EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Tag, Tooltip } from "antd";

const Feedbacks = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const tabItems = [{ label: "All Feedbacks", value: "all" }];

  const data = [
    {
      key: "1",
      sno: 1,
      name: "ABCD",
      certification: "Test",
      role: "Test",
      status: "Active",
      security: "High",
    },
    {
      key: "2",
      sno: 2,
      name: "Test",
      certification: "Test",
      role: "Test",
      status: "In Active",
      security: "Medium",
    },
    {
      key: "3",
      sno: 3,
      name: "Test",
      certification: "Test",
      role: "Test",
      status: "Pending",
      security: "Low",
    },
  ];

  const columns = [
    {
      key: "sno",
      label: "SNo",
      dataIndex: "sno",
    },
    {
      key: "name",
      label: "Name",
      dataIndex: "name",
    },
    {
      key: "certification",
      label: "Certification",
      dataIndex: "certification",
    },
    {
      key: "role",
      label: "Role",
      dataIndex: "role",
    },
    {
      key: "document",
      label: "Document",
      render: () => <span className="text-blue-500 cursor-pointer">View</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (value: string, record: any) => {
        let color = "default";
        switch (record.status) {
          case "Active":
            color = "green";
            break;
          case "In Active":
            color = "gold";
            break;
          case "Pending":
            color = "purple";
            break;
          default:
            color = "default";
        }

        return (
          <Tag color={color} className="px-3 py-1 rounded-full capitalize">
            {record.status}
          </Tag>
        );
      },
    },
    {
      key: "security",
      label: "Security",
      render: (value: string, record: any) => {
        let color = "default";
        switch (record.security) {
          case "High":
            color = "green";
            break;
          case "Medium":
            color = "gold";
            break;
          case "Low":
            color = "red";
            break;
        }

        return (
          <Tag color={color} className="px-3 py-1 rounded-full capitalize">
            {record.security}
          </Tag>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, record: any) => {
        return (
          <div className="flex gap-3 action-icon">
            {/* <Tooltip title="View">
              <EyeOutlined
                onClick={() =>
                  navigate(`create-update-feedback?key=${record.key}`)
                }
                className="cursor-pointer text-gray-600 hover:text-blue-500"
              />
            </Tooltip> */}
            <Tooltip title="Edit">
              <EditOutlined
                onClick={() =>
                  navigate(`create-update-feedback?key=${record.key}`)
                }
                className="cursor-pointer text-gray-600 hover:text-green-500"
              />
            </Tooltip>
            <Tooltip title="Delete">
              <DeleteOutlined
                onClick={() => console.log("Delete key:", record.key)}
                className="cursor-pointer text-gray-600 hover:text-primary"
              />
            </Tooltip>
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-2 sm:p-4 md:p-6 lg:p-8">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Feedback</h1>
        <ButtonPrimary
          text="Add Feedback"
          onClick={() => navigate("create-update-feedback")}
        />
      </div>

      <NoRecentActivity subHeading="Give and receive feedback to support continuous learning." />

      {/* <Tabs tabs={tabItems} selectedTab={activeTab} onChange={setActiveTab} />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 col-span-2 md:col-end-4 mt-5">
        <SearchField className="col-span-1" />
        <FilterField label="Certificate Name" className="col-span-1" />
        <ValidityField label="Validity" className="col-span-1" />
        <SelectField
          label="Status"
          options={[
            { label: "All", value: "all" },
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
            { label: "Pending", value: "pending" },
          ]}
          className="col-span-1"
        />
      </div>

      <div className="table">
        <DynamicTable
          label="All Feedbacks"
          columns={columns}
          data={data}
          pagination={{
            current: currentPage,
            total: data.length,
            pageSize: pageSize,
          }}
          onPageChange={(page, pageSize) => {
            setCurrentPage(page);
            setPageSize(pageSize);
          }}
          // pathToNavigate="/document-details"
        />
      </div> */}
    </div>
  );
};

export default Feedbacks;
