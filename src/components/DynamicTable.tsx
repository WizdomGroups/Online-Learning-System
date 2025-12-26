import React, { useState } from "react";
import { Table, ConfigProvider } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Users,
  FileText,
  Calendar,
  Award,
  TrendingUp,
  Clock,
  ClipboardList,
  BarChart2,
  Hash,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "../store";

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
  headerType?: string;
}

const DynamicTable: React.FC<DynamicTableProps> = ({
  columns,
  data,
  pagination,
  onPageChange,
  rowSelection = false,
  pathToNavigate,
  label = "Overview",
  rowKey = "key",
  loading = false,
  headerType = "Award",
}) => {
  const navigate = useNavigate();
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const isTableDataLoading = useSelector(
    (state: RootState) => state.loading.isTableDataLoading
  );

  const isLoading = loading || isTableDataLoading;
  const brandTeal = "#084c61";

  // Icon mapping logic
  const getIcon = (type: string) => {
    const iconMap: Record<string, any> = {
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
    return <IconComponent size={18} style={{ color: brandTeal }} />;
  };

  // Modern Column Definition
  const antColumns: ColumnsType<any> = columns.map((col) => ({
    title: (
      <span className="uppercase tracking-[0.15em] text-[10px] font-black text-slate-500">
        {col.label}
      </span>
    ),
    dataIndex: col.dataIndex || col.key,
    key: col.key,
    sorter: col.sortable
      ? (a, b) => {
          const aVal = a[col.key]?.toString() || "";
          const bVal = b[col.key]?.toString() || "";
          return aVal.localeCompare(bVal);
        }
      : false,
    render: col.render,
    className: "py-3 px-6 text-slate-600 font-semibold border-none",
  }));

  return (
    <div className="w-full mt-4 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
      {/* Table Top Bar */}
      <div className="px-6 py-4 flex items-center justify-between bg-white border-b border-slate-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 shadow-sm">
            {getIcon(headerType)}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 tracking-tight leading-none">
              {label}
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
              Management System
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
          <Hash size={12} className="text-slate-400" />
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-tight">
            Total Records:
          </span>
          <span className="text-xs font-black text-[#084c61]">
            {pagination?.total || 0}
          </span>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: brandTeal,
              borderRadius: 8,
              fontFamily: "Inter, system-ui, sans-serif",
            },
          }}
        >
          <Table
            className="modern-light-table"
            columns={antColumns}
            dataSource={data}
            rowKey={rowKey}
            loading={isLoading}
            rowSelection={
              rowSelection
                ? {
                    selectedRowKeys,
                    onChange: (keys) => setSelectedRowKeys(keys),
                  }
                : undefined
            }
            pagination={{
              current: pagination?.current,
              total: pagination?.total,
              pageSize: pagination?.pageSize,
              showSizeChanger: false,
              nextIcon: <ChevronRight size={14} />,
              prevIcon: <ChevronLeft size={14} />,
              onChange: onPageChange,
              className: "px-6 py-4 border-t border-slate-50 m-0",
              showTotal: (total, range) => (
                <span className="text-slate-400 text-[11px] font-black uppercase tracking-widest">
                  Showing {range[0]}-{range[1]} of {total}
                </span>
              ),
            }}
            scroll={{ x: "max-content" }}
            onRow={
              pathToNavigate
                ? (record) => ({
                    onClick: (e: any) => {
                      if ((e.target as HTMLElement).closest(".action-icon")) return;
                      navigate(`${pathToNavigate}/${record[rowKey]}`);
                    },
                  })
                : undefined
            }
          />
        </ConfigProvider>
      </div>

      <style>{`
        /* Heading Styling: Light Background + Bold Text */
        .modern-light-table .ant-table-thead > tr > th {
          background-color: #f8fafc !important; /* Light Color */
          border-bottom: 1px solid #f1f5f9 !important;
          padding: 12px 24px !important;
        }

        /* TBody Text Density */
        .modern-light-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f8fafc !important;
          font-size: 13px;
          transition: all 0.2s ease;
        }

        /* Professional Hover State */
        .modern-light-table .ant-table-tbody > tr:hover > td {
          background-color: #fcfdfe !important;
          color: #084c61 !important;
        }

        /* Trendy Pagination Boxes */
        .modern-light-table .ant-pagination-item {
          border: none !important;
          background: #f1f5f9 !important;
          border-radius: 6px !important;
          font-weight: 800 !important;
          font-size: 11px !important;
          min-width: 28px !important;
          height: 28px !important;
          line-height: 28px !important;
        }

        .modern-light-table .ant-pagination-item-active {
          background: #084c61 !important;
        }

        .modern-light-table .ant-pagination-item-active a {
          color: #ffffff !important;
        }

        .modern-light-table .ant-pagination-prev, 
        .modern-light-table .ant-pagination-next {
          min-width: 28px !important;
          height: 28px !important;
          line-height: 28px !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 6px !important;
        }

        /* Checkbox Override */
        .modern-light-table .ant-checkbox-inner {
          border-radius: 4px;
          border-color: #cbd5e1;
        }

        /* Scrollbar for Professional Feel */
        .overflow-x-auto::-webkit-scrollbar {
          height: 6px;
        }
        .overflow-x-auto::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .overflow-x-auto::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default DynamicTable;