import React, { useState, useEffect } from "react";
import ProfileCard from "../../../components/ProfileCard";
import StatCard from "../../../components/StatCard";
import {
  Book,
  Clock,
  PlayCircle,
  CheckCircle,
  Calendar,
  TrendingUp,
  Award,
  Bell,
  Eye,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Target,
  XCircle,
  RotateCcw,
  Star,
  BarChart3,
} from "lucide-react";
import useLocalStorageUserData from "../../../lib/hooks/useLocalStorageUserData";
import { Button, Spin, Alert } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import {
  fetchLMSDashboardStatistics,
  DashboardStatistics,
} from "../../../lib/network/dashboardApis";
import { useAppDispatch } from "../../../lib/hooks/useAppDispatch";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Color palette for consistency
const COLORS = {
  primary: "#243672",
  success: "#6ab187",
  warning: "#f6c85f",
  accent: "#bc5090",
  info: "#5b9bd5",
  chart: ["#243672", "#6ab187", "#f6c85f", "#bc5090", "#5b9bd5"],
};

// Generate chart data from API data
const getProgressData = (statistics: DashboardStatistics | null) => {
  if (!statistics) {
    return [
      { name: "Jan", completed: 0, enrolled: 0 },
      { name: "Feb", completed: 0, enrolled: 0 },
      { name: "Mar", completed: 0, enrolled: 0 },
      { name: "Apr", completed: 0, enrolled: 0 },
      { name: "May", completed: 0, enrolled: 0 },
      { name: "Jun", completed: 0, enrolled: 0 },
    ];
  }

  const total = statistics.certifications.Total;
  const completed = statistics.certifications.Completed;

  return [
    {
      name: "Jan",
      completed: Math.floor(completed * 0.1),
      enrolled: Math.floor(total * 0.15),
    },
    {
      name: "Feb",
      completed: Math.floor(completed * 0.2),
      enrolled: Math.floor(total * 0.25),
    },
    {
      name: "Mar",
      completed: Math.floor(completed * 0.35),
      enrolled: Math.floor(total * 0.4),
    },
    {
      name: "Apr",
      completed: Math.floor(completed * 0.5),
      enrolled: Math.floor(total * 0.6),
    },
    {
      name: "May",
      completed: Math.floor(completed * 0.8),
      enrolled: Math.floor(total * 0.85),
    },
    { name: "Jun", completed: completed, enrolled: total },
  ];
};

const getCourseDistribution = (statistics: DashboardStatistics | null) => {
  if (!statistics) {
    return [
      { name: "Assigned", value: 0, color: COLORS.warning },
      { name: "Re-assigned", value: 0, color: "#8b5cf6" },
      { name: "Completed", value: 0, color: COLORS.success },
      { name: "Review", value: 0, color: "#f59e0b" },
      { name: "Rejected", value: 0, color: "#6b7280" },
    ];
  }

  return [
    {
      name: "Assigned",
      value: statistics.certifications.Assigned,
      color: COLORS.warning,
    },
    {
      name: "Re-assigned",
      value: statistics.certifications["Re-assigned"],
      color: "#8b5cf6",
    },
    {
      name: "Completed",
      value: statistics.certifications.Completed,
      color: COLORS.success,
    },
    {
      name: "Review",
      value: statistics.certifications.Review,
      color: "#f59e0b",
    },
    {
      name: "Rejected",
      value: statistics.certifications.Cancelled,
      color: "#6b7280",
    },
  ];
};

// Recent activity notifications
const recentActivities = [
  {
    title: "Completed course: 'Advanced JavaScript Fundamentals'",
    time: "2 hours ago",
    type: "completion",
  },
  {
    title: "New course available: 'React Best Practices 2024'",
    time: "1 day ago",
    type: "new_course",
  },
  {
    title: "Certificate earned for 'UI/UX Design Principles'",
    time: "3 days ago",
    type: "certificate",
  },
];

// Upcoming deadlines
const upcomingDeadlines = [
  {
    title: "Complete 'Project Management Basics' assessment",
    deadline: "Due in 2 days",
    priority: "high",
  },
  {
    title: "Submit 'Data Analysis' project",
    deadline: "Due in 5 days",
    priority: "medium",
  },
  {
    title: "Attend 'Leadership Workshop' webinar",
    deadline: "Next week",
    priority: "low",
  },
];

// Enhanced Notification Card
const NotificationCard = ({
  heading,
  items,
  icon,
  showViewAll = false,
}: {
  heading: string;
  items: Array<{
    title: string;
    time?: string;
    deadline?: string;
    priority?: string;
    type?: string;
  }>;
  icon: React.ReactNode;
  showViewAll?: boolean;
}) => (
  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        {icon}
        {heading}
      </h3>
      {showViewAll && (
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors duration-200">
          View All
          <ChevronRight size={14} />
        </button>
      )}
    </div>
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="flex items-start gap-3 p-3 rounded-md hover:bg-gray-50 transition-colors duration-200 border border-gray-100"
        >
          <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-700 text-sm leading-relaxed mb-1">
              {item.title}
            </p>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {item.time || item.deadline}
              </span>
              {item.priority && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    item.priority === "high"
                      ? "bg-red-100 text-red-600"
                      : item.priority === "medium"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {item.priority}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Chart Card Component
const ChartCard = ({ title, children, className = "" }) => (
  <div
    className={`bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200 ${className}`}
  >
    <h3 className="text-lg font-semibold mb-5 text-gray-800 flex items-center gap-2">
      <TrendingUp className="text-sky-600" size={18} />
      {title}
    </h3>
    {children}
  </div>
);

const EmployeeDashboard = () => {
  const { user, tenentId } = useLocalStorageUserData();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  // Redux state
  const { lmsStatistics, lmsLoading, lmsError } = useSelector(
    (state: RootState) => state.dashboard
  );

  // Fetch dashboard data on component mount
  useEffect(() => {
    if (user?.employeeId && tenentId) {
      dispatch(
        fetchLMSDashboardStatistics({
          tenantId: tenentId.toString(),
          employeeId: user.employeeId.toString(),
        })
      );
    }
  }, [dispatch, user?.employeeId, tenentId]);

  // Generate stats from API data
  const stats = lmsStatistics
    ? [
        // Certification Stats
        {
          title: "Assigned",
          value: lmsStatistics.certifications.Assigned,
          icon: <PlayCircle size={20} />,
          bgColor: "linear-gradient(135deg, #bae6fd 0%, rgb(126, 187, 219) 100%)",
          change: "Ready to start",
          description: "Certifications assigned",
        },
        {
          title: "Re-assigned",
          value: lmsStatistics.certifications["Re-assigned"],
          icon: <RotateCcw size={20} />,
          bgColor: "linear-gradient(135deg, #bae6fd 0%, rgb(126, 187, 219) 100%)",
          change: "Re-assigned",
          description: "Certifications re-assigned",
        },
        {
          title: "Completed",
          value: lmsStatistics.certifications.Completed,
          icon: <CheckCircle size={20} />,
          bgColor: "linear-gradient(135deg, #bae6fd 0%, rgb(126, 187, 219) 100%)",
          change: "Successfully completed",
          description: "Certifications completed",
        },
        {
          title: "Review",
          value: lmsStatistics.certifications.Review,
          icon: <Eye size={20} />,
          bgColor: "linear-gradient(135deg, #bae6fd 0%, rgb(126, 187, 219) 100%)",
          change: "Under review",
          description: "Certifications under review",
        },
        {
          title: "Rejected",
          value: lmsStatistics.certifications.Cancelled,
          icon: <XCircle size={20} />,
          bgColor: "linear-gradient(135deg, #bae6fd 0%, rgb(126, 187, 219) 100%)",
          change: "Rejected",
          description: "Certifications rejected",
        },
        // Assessment Stats
        {
          title: "Assessments Passed",
          value: lmsStatistics.assessments.Passed,
          icon: <Award size={20} />,
          bgColor: "linear-gradient(135deg, #bae6fd 0%, rgb(126, 187, 219) 100%)",
          change: "Successfully passed",
          description: "Assessments passed",
        },
        {
          title: "Assessments Failed",
          value: lmsStatistics.assessments.Failed,
          icon: <Target size={20} />,
          bgColor: "linear-gradient(135deg, #bae6fd 0%, rgb(126, 187, 219) 100%)",
          change: "Need improvement",
          description: "Assessments failed",
        },
        {
          title: "Total Attempts",
          value: lmsStatistics.assessments.TotalAttempts,
          icon: <BarChart3 size={20} />,
          bgColor: "linear-gradient(135deg, #bae6fd 0%, rgb(126, 187, 219) 100%)",
          change: "All attempts",
          description: "Total assessment attempts",
        },
        {
          title: "Average Score",
          value: lmsStatistics.assessments.AverageScore || 0,
          icon: <Star size={20} />,
          bgColor: "linear-gradient(135deg, #bae6fd 0%, rgb(126, 187, 219) 100%)",
          change: "Overall performance",
          description: "Average assessment score",
        },
      ]
    : [
        // Fallback data while loading
        {
          title: "Assigned",
          value: 0,
          icon: <PlayCircle size={20} />,
          bgColor: "linear-gradient(135deg, #bae6fd 0%, rgb(126, 187, 219) 100%)",
          change: "Loading...",
          description: "Certifications assigned",
        },
        {
          title: "Re-assigned",
          value: 0,
          icon: <RotateCcw size={20} />,
          bgColor: "linear-gradient(135deg, #bae6fd 0%, rgb(126, 187, 219) 100%)",
          change: "Loading...",
          description: "Certifications re-assigned",
        },
        {
          title: "Completed",
          value: 0,
          icon: <CheckCircle size={20} />,
          bgColor: "linear-gradient(135deg, #bae6fd 0%, rgb(126, 187, 219) 100%)",
          change: "Loading...",
          description: "Certifications completed",
        },
        {
          title: "Review",
          value: 0,
          icon: <Eye size={20} />,
          bgColor: "linear-gradient(135deg, #bae6fd 0%, rgb(126, 187, 219) 100%)",
          change: "Loading...",
          description: "Certifications under review",
        },
        {
          title: "Rejected",
          value: 0,
          icon: <XCircle size={20} />,
          bgColor: "linear-gradient(135deg, #bae6fd 0%, rgb(126, 187, 219) 100%)",
          change: "Loading...",
          description: "Certifications rejected",
        },
        {
          title: "Assessments Passed",
          value: 0,
          icon: <Award size={20} />,
          bgColor: "linear-gradient(135deg, #bae6fd 0%, rgb(126, 187, 219) 100%)",
          change: "Loading...",
          description: "Assessments passed",
        },
        {
          title: "Assessments Failed",
          value: 0,
          icon: <Target size={20} />,
          bgColor: "linear-gradient(135deg, #bae6fd 0%, rgb(126, 187, 219) 100%)",
          change: "Loading...",
          description: "Assessments failed",
        },
        {
          title: "Total Attempts",
          value: 0,
          icon: <BarChart3 size={20} />,
          bgColor: "linear-gradient(135deg, #bae6fd 0%, rgb(126, 187, 219) 100%)",
          change: "Loading...",
          description: "Total assessment attempts",
        },
      ];

  const loadDashboardData = () => {
    setLoading(true);
    if (user?.employeeId && tenentId) {
      dispatch(
        fetchLMSDashboardStatistics({
          tenantId: tenentId.toString(),
          employeeId: user.employeeId.toString(),
        })
      ).finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  };

  // Show loading spinner if data is being fetched
  if (lmsLoading && !lmsStatistics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600 text-sm">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{ fontFamily: "'Inter', 'Source Sans Pro', Arial, sans-serif" }}
    >
      {/* Professional Header - Sticky */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-2xl font-semibold text-gray-900"
                style={{ fontFamily: "'Source Sans Pro', Arial, sans-serif" }}
              >
                My Learning Dashboard
              </h1>
              <p
                className="text-sm text-gray-600 mt-1"
                style={{ fontFamily: "'Source Sans Pro', Arial, sans-serif" }}
              >
                Welcome back, {user?.firstName || "Employee"}!
              </p>
            </div>
            <Button
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={loadDashboardData}
              loading={loading || lmsLoading}
              className="bg-[#243672] text-white border-[#243672] hover:bg-[#1e2d5f] hover:border-[#1e2d5f] flex items-center gap-2 h-10 px-5 rounded-md transition-colors duration-200 font-medium"
            >
              Refresh Data
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-8 py-6">
        {/* Error Alert */}
        {lmsError && (
          <Alert
            message="Error Loading Dashboard Data"
            description={lmsError}
            type="error"
            icon={<AlertCircle className="w-4 h-4" />}
            closable
            className="mb-6 rounded-lg"
          />
        )}

        {/* Profile Card */}
        <div className="mb-6">
          <ProfileCard
            name={
              `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
              "Employee"
            }
            email={user?.email}
            avatarUrl="/images/user-dummy-profile.svg"
            designation={user?.designation?.name}
            department={user?.department?.name}
            idNumber={user?.empCode}
          />
        </div>

        {/* Stats Cards - Properly aligned sections */}
        <div className="space-y-8">
          {/* Certification Stats Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-sky-600 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-800">
                Certification Statistics
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
              {stats.slice(0, 5).map((stat, index) => (
                <StatCard
                  key={index}
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon}
                  bgColor={stat.bgColor}
                  change={stat.change}
                  description={stat.description}
                />
              ))}
            </div>
          </section>

          {/* Assessment Stats Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-sky-600 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-800">
                Assessment Statistics
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {stats.slice(5, 9).map((stat, index) => (
                <StatCard
                  key={index}
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon}
                  bgColor={stat.bgColor}
                  change={stat.change}
                  description={stat.description}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;