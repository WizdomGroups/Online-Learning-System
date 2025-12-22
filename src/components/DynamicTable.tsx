import React, { useState } from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { TablePaginationConfig } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import "../css/dataTable.css";
import { RightOutlined, LeftOutlined } from "@ant-design/icons";
import {
  BookOpen,
  Users,
  FileText,
  Calendar,
  Award,
  TrendingUp,
  Clock,
  ClipboardList,
  BarChart2,
} from "lucide-react";
import { RootState } from "../store";
import { useSelector } from "react-redux";

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, record: any, index: number) => React.ReactNode;
  dataIndex?: string;
  className?: string;
}

interface DynamicTableProps {
  columns: Column[];
  data: any[];
  pagination?: {
    current: number;
    total: number;
    pageSize: number;
  };
  onPageChange?: (page: number, pageSize: number) => void;
  rowSelection?: boolean;
  pathToNavigate?: string;
  label?: string;
  rowKey?: string;
  loading?: boolean;
  headerType?: string; // New prop for header icon type
}

const DynamicTable: React.FC<DynamicTableProps> = ({
  columns,
  data,
  pagination,
  onPageChange,
  rowSelection = false,
  pathToNavigate,
  label = "All",
  rowKey = "key",
  loading = false,
  headerType = "Award", // New prop with default value
}) => {
  const navigate = useNavigate();
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const isTableDataLoading = useSelector(
    (state: RootState) => state.loading.isTableDataLoading
  );

  // Use either the prop loading or the Redux loading state
  const isLoading = loading || isTableDataLoading;

  // Icon mapping for different study-related sections
  const getIcon = (type: string) => {
    const iconMap = {
      grades: Award,
      document: FileText,
      modules: BookOpen,
      assessments: ClipboardList,
      assessmentsAns: BarChart2,
      certification: Award,
      courses: BookOpen,
      students: Users,
      assignments: FileText,
      schedule: Calendar,
      Award: Award,
      progress: TrendingUp,
      attendance: Clock,
    };

    const IconComponent = iconMap[type] || FileText;
    return <IconComponent className="w-5 h-5 text-blue-600" />;
  };

  const antColumns: ColumnsType<any> = columns.map((col) => ({
    title: col.label,
    dataIndex: col.dataIndex || col.key,
    key: col.key,
    sorter: col.sortable
      ? (a, b) => {
          const aValue = a[col.key]?.toString() || "";
          const bValue = b[col.key]?.toString() || "";
          return aValue.localeCompare(bValue);
        }
      : false,
    render: col.render,
    className: col.className || "text-sm font-medium",
    onCell: () => ({ className: col.className || "" }),
    onHeaderCell: () => ({ className: col.className || "" }),
  }));

  const onSelectChange = (newSelectedRowKeys: any[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  return (
    <div className="mt-2 bg-white shadow-sm">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getIcon(headerType)}
            <h2 className="font-semibold text-lg text-gray-800">{label}</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Total:</span>
            <span className="font-medium text-gray-700 bg-gray-50 px-3 py-1 text-sm">
              {pagination?.total}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile-only horizontal scroll to ensure only the table scrolls */}
      <div className="overflow-x-auto md:overflow-visible w-full">
      <div className="min-w-[700px] md:min-w-0">
      <Table
        className="custom-table"
        columns={antColumns}
        dataSource={data}
        rowKey={rowKey}
        loading={isLoading}
        rowSelection={
          rowSelection
            ? {
                selectedRowKeys,
                onChange: onSelectChange,
              }
            : undefined
        }
        pagination={{
          current: pagination?.current,
          total: pagination?.total,
          pageSize: pagination?.pageSize,
          showSizeChanger: false,
          locale: { items_per_page: "/ page" },
          nextIcon: <RightOutlined />,
          prevIcon: <LeftOutlined />,
          onChange: onPageChange,
          showTotal: (total: number, range: number[]) => (
            <span className="pagination-total-text text-gray-500">
              Showing {range[0]} - {range[1]} of {total} entries,
            </span>
          ),
          position: ["bottomRight"] as TablePaginationConfig["position"],
        }}
        scroll={{ x: "max-content" }}
        onRow={
          pathToNavigate
            ? (record: any) => ({
                onClick: (e: any) => {
                  if ((e.target as HTMLElement).closest(".action-icon")) return;
                  navigate(`${pathToNavigate}/${record[rowKey]}`);
                },
              })
            : undefined
        }
      />
      </div>
      </div>

      <style>
        {`
        .custom-table .ant-table {
          background: transparent;
          font-family: 'Source Sans Pro', Arial, sans-serif;
          border-radius: 0.5rem;
          overflow: hidden;
          // min-width: 1000px;
        }
        .custom-table .ant-table-container {
          border-radius: 0.5rem;
          overflow: hidden;
        }
        .custom-table .ant-table-thead > tr > th:first-child {
          border-top-left-radius: 0.5rem;
        }
        .custom-table .ant-table-thead > tr > th:last-child {
          border-top-right-radius: 0.5rem;
        }
        .custom-table .ant-table-thead > tr > th {
          background: #f8fafc;
          color: #1e293b;
          font-weight: 600;
          padding: 12px 16px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 0.95rem;
          white-space: nowrap;
        }
        .custom-table .ant-table-tbody > tr > td {
          padding: 12px 16px;
          border-bottom: 1px solid #f1f5f9;
          color: #334155;
          font-weight: 450;
          position: relative;
          overflow: visible;
        }
        .custom-table .ant-table-tbody > tr:hover > td {
          background: #f8fafc;
        }
        .custom-table .ant-table-tbody > tr.ant-table-row-selected > td {
          background: #f1f5f9;
        }

        /* Light Theme Pagination */
        .custom-table .ant-pagination-item {
          border-radius: 6px;
          margin: 0 4px;
          border-color: #e2e8f0;
        }
        .custom-table .ant-pagination-item-active {
          background: var(--color-primary);
          border-color: var(--color-primary);
        }
        .custom-table .ant-pagination-item-active a {
          color: white;
        }
        .custom-table .ant-pagination-prev .ant-pagination-item-link,
        .custom-table .ant-pagination-next .ant-pagination-item-link {
          border-radius: 6px;
          border-color: #e2e8f0;
          color: #64748b;
        }
        .custom-table .ant-pagination-prev .ant-pagination-item-link:hover,
        .custom-table .ant-pagination-next .ant-pagination-item-link:hover {
          border-color: var(--color-primary);
          color: var(--color-primary);
        }

        /* Dark Theme Pagination */
        [data-theme="dark"] .custom-table .ant-pagination-item {
          background: var(--color-sidebar-bg);
          border-color: var(--color-sidebar-hover-bg);
        }
        [data-theme="dark"] .custom-table .ant-pagination-item-active {
          background: var(--color-primary);
          border-color: var(--color-primary);
        }
        [data-theme="dark"] .custom-table .ant-pagination-item-active a {
          color: white;
        }
        [data-theme="dark"] .custom-table .ant-pagination-prev .ant-pagination-item-link,
        [data-theme="dark"] .custom-table .ant-pagination-next .ant-pagination-item-link {
          background: var(--color-sidebar-bg);
          border-color: var(--color-sidebar-hover-bg);
          color: var(--color-sidebar-fg);
        }
        [data-theme="dark"] .custom-table .ant-pagination-prev .ant-pagination-item-link:hover,
        [data-theme="dark"] .custom-table .ant-pagination-next .ant-pagination-item-link:hover {
          border-color: var(--color-primary);
          color: var(--color-primary);
        }

        .custom-table .ant-table-cell {
          font-size: 0.875rem;
          white-space: normal;
          position: relative;
          overflow: visible;
        }
        .custom-table .ant-table-row {
          transition: all 0.2s ease;
        }
        .custom-table .ant-table-row:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        @media (max-width: 768px) {
          .pagination-total-text {
            display: none;
          }
        }
        `}
      </style>
    </div>
  );
};

export default DynamicTable;
