import {
  FileText,
  PlusCircle,
  Users,
  Trophy,
  Layers,
  TrendingUp,
  Bell,
  Eye,
  Clock,
  Star,
  ChevronRight,
  RefreshCw,
  PlayCircle,
  CheckCircle,
  RotateCcw,
  XCircle,
  Target,
  BarChart3,
  Award,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
} from "recharts";
import StatCard from "../../components/StatCard";
import { Button, Spin, Alert } from "antd";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import {
  fetchAdminDashboardStatistics,
  AdminDashboardStatistics,
} from "../../lib/network/dashboardApis";
import { useAppDispatch } from "../../lib/hooks/useAppDispatch";
import useLocalStorageUserData from "../../lib/hooks/useLocalStorageUserData";

// Single brand color palette in light sky blue
const BRAND_COLOR = "#38bdf8"; // sky-400
const OD_COLORS = {
  blue: BRAND_COLOR,
  lightBlue: BRAND_COLOR,
  green: BRAND_COLOR,
  yellow: BRAND_COLOR,
  magenta: BRAND_COLOR,
  orange: BRAND_COLOR,
  teal: BRAND_COLOR,
  grey: BRAND_COLOR,
  red: BRAND_COLOR,
  purple: BRAND_COLOR,
  indigo: BRAND_COLOR,
  gradients: {
    // slightly richer light sky blue for icon backgrounds
    blue: `linear-gradient(135deg, #bae6fd 0%,rgb(126, 187, 219) 100%)`, // sky-200
    green: `linear-gradient(135deg, #bae6fd 0%, rgb(126, 187, 219) 100%)`,
    yellow: `linear-gradient(135deg, #bae6fd 0%, rgb(126, 187, 219) 100%)`,
    purple: `linear-gradient(135deg, #bae6fd 0%, rgb(126, 187, 219) 100%)`,
    orange: `linear-gradient(135deg, #bae6fd 0%, rgb(126, 187, 219) 100%)`,
    teal: `linear-gradient(135deg, #bae6fd 0%, rgb(126, 187, 219)100%)`,
    grey: `linear-gradient(135deg, #bae6fd 0%, rgb(126, 187, 219) 100%)`,
    amber: `linear-gradient(135deg, #bae6fd 0%, rgb(126, 187, 219) 100%)`,
    emerald: `linear-gradient(135deg, #bae6fd 0%, rgb(126, 187, 219) 100%)`,
  },
};

// Helper function to generate stats from admin dashboard data
const getAdminStats = (adminStatistics: AdminDashboardStatistics | null) => {
  if (!adminStatistics) {
    return [
      // Overview Stats
      {
        title: "Total Employees",
        value: 0,
        change: "Loading...",
        icon: <Users size={20} />,
        bgColor: OD_COLORS.gradients.blue,
        description: "Active employees enrolled",
      },
      {
        title: "Modules",
        value: 0,
        change: "Loading...",
        icon: <Layers size={20} />,
        bgColor: OD_COLORS.gradients.yellow,
        description: "Learning modules available",
      },
      {
        title: "Documents",
        value: 0,
        change: "Loading...",
        icon: <FileText size={20} />,
        bgColor: OD_COLORS.gradients.purple,
        description: "Learning resources",
      },
      {
        title: "Certifications",
        value: 0,
        change: "Loading...",
        icon: <Trophy size={20} />,
        bgColor: OD_COLORS.gradients.orange,
        description: "Certificates issued",
      },
      // Certification Breakdown
      {
        title: "Assigned",
        value: 0,
        change: "Loading...",
        icon: <PlayCircle size={20} />,
        bgColor: OD_COLORS.gradients.yellow,
        description: "Certifications assigned",
      },
      {
        title: "Re-assigned",
        value: 0,
        change: "Loading...",
        icon: <RotateCcw size={20} />,
        bgColor: OD_COLORS.gradients.purple,
        description: "Certifications re-assigned",
      },
      {
        title: "Completed",
        value: 0,
        change: "Loading...",
        icon: <CheckCircle size={20} />,
        bgColor: OD_COLORS.gradients.green,
        description: "Certifications completed",
      },
      {
        title: "Review",
        value: 0,
        change: "Loading...",
        icon: <Eye size={20} />,
        bgColor: OD_COLORS.gradients.amber,
        description: "Certifications under review",
      },
      {
        title: "Rejected",
        value: 0,
        change: "Loading...",
        icon: <XCircle size={20} />,
        bgColor: OD_COLORS.gradients.grey,
        description: "Certifications rejected",
      },
      // Assessment Breakdown
      {
        title: "Assessments Passed",
        value: 0,
        change: "Loading...",
        icon: <Award size={20} />,
        bgColor: OD_COLORS.gradients.emerald,
        description: "Assessments passed",
      },
      {
        title: "Assessments Failed",
        value: 0,
        change: "Loading...",
        icon: <Target size={20} />,
        bgColor: OD_COLORS.gradients.amber,
        description: "Assessments failed",
      },
    ];
  }

  return [
    // Overview Stats
    {
      title: "Total Employees",
      value: adminStatistics.totalEmployees,
      change: "Active employees",
      icon: <Users size={20} />,
      bgColor: OD_COLORS.gradients.blue,
      description: "Active employees enrolled",
    },
    {
      title: "Modules",
      value: adminStatistics.totalModules,
      change: "Available modules",
      icon: <Layers size={20} />,
      bgColor: OD_COLORS.gradients.yellow,
      description: "Learning modules available",
    },
    {
      title: "Documents",
      value: adminStatistics.totalDocuments,
      change: "Learning resources",
      icon: <FileText size={20} />,
      bgColor: OD_COLORS.gradients.purple,
      description: "Learning resources",
    },
    {
      title: "Certifications",
      value: adminStatistics.totalCertificates,
      change: "Total certificates",
      icon: <Trophy size={20} />,
      bgColor: OD_COLORS.gradients.orange,
      description: "Certificates issued",
    },
    // Certification Breakdown
    {
      title: "Assigned",
      value: adminStatistics.certifications.Assigned,
      change: "Ready to start",
      icon: <PlayCircle size={20} />,
      bgColor: OD_COLORS.gradients.yellow,
      description: "Certifications assigned",
    },
    {
      title: "Re-assigned",
      value: adminStatistics.certifications["Re-assigned"],
      change: "Re-assigned",
      icon: <RotateCcw size={20} />,
      bgColor: OD_COLORS.gradients.purple,
      description: "Certifications re-assigned",
    },
    {
      title: "Completed",
      value: adminStatistics.certifications.Completed,
      change: "Successfully completed",
      icon: <CheckCircle size={20} />,
      bgColor: OD_COLORS.gradients.green,
      description: "Certifications completed",
    },
    {
      title: "Review",
      value: adminStatistics.certifications.Review,
      change: "Under review",
      icon: <Eye size={20} />,
      bgColor: OD_COLORS.gradients.amber,
      description: "Certifications under review",
    },
    {
      title: "Rejected",
      value: adminStatistics.certifications.Cancelled,
      change: "Rejected",
      icon: <XCircle size={20} />,
      bgColor: OD_COLORS.gradients.grey,
      description: "Certifications rejected",
    },
    // Assessment Breakdown
    {
      title: "Assessments Passed",
      value: adminStatistics.assessments.Pass,
      change: "Successfully passed",
      icon: <Award size={20} />,
      bgColor: OD_COLORS.gradients.emerald,
      description: "Assessments passed",
    },
    {
      title: "Assessments Failed",
      value: adminStatistics.assessments.Fail,
      change: "Need improvement",
      icon: <Target size={20} />,
      bgColor: OD_COLORS.gradients.amber,
      description: "Assessments failed",
    },
  ];
};

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { tenentId } = useLocalStorageUserData();
  const [loading, setLoading] = useState(false);
  // Dynamic greeting with emoji
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return "🌞 Good Morning";
    if (hour >= 11 && hour < 16) return "🌤️ Good Afternoon";
    if (hour >= 16 && hour < 20) return "🌆 Good Evening";
    return "🌙 Good Night";
  };

  const greeting = getGreeting();

  // Redux state
  const { adminStatistics, adminLoading, adminError } = useSelector(
    (state: RootState) => state.dashboard
  );

  // Fetch admin dashboard data on component mount
  useEffect(() => {
    if (tenentId) {
      dispatch(
        fetchAdminDashboardStatistics({
          tenantId: tenentId.toString(),
        })
      );
    }
  }, [dispatch, tenentId]);

  const loadDashboardData = () => {
    setLoading(true);
    if (tenentId) {
      dispatch(
        fetchAdminDashboardStatistics({
          tenantId: tenentId.toString(),
        })
      ).finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  };

  // Generate stats from admin dashboard data
  const adminStats = getAdminStats(adminStatistics);

  // Show loading spinner if data is being fetched
  if (adminLoading && !adminStatistics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600 text-sm">
            Loading dashboard data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{ fontFamily: "'Inter', 'Source Sans Pro', Arial, sans-serif" }}
    >
      {/* Professional Header - Fixed positioning */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-2xl font-semibold text-gray-900"
                style={{ fontFamily: "'Source Sans Pro', Arial, sans-serif" }}
              >
                Dashboard
              </h1>
              <p
                className="text-sm text-gray-600 mt-1"
                style={{ fontFamily: "'Source Sans Pro', Arial, sans-serif" }}
              >
                {greeting}, welcome back
              </p>
            </div>
            <Button
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={loadDashboardData}
              loading={loading || adminLoading}
              className="bg-[#243672] text-white border-[#243672] hover:bg-[#1e2d5f] hover:border-[#1e2d5f] flex items-center gap-2 h-10 px-5 rounded-md transition-colors duration-200 font-medium"
            >
              Refresh Data
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area - Consistent padding */}
      <div className="px-8 py-6">
        {/* Error Alert */}
        {adminError && (
          <Alert
            message="Error Loading Dashboard Data"
            description={adminError}
            type="error"
            icon={<AlertCircle className="w-4 h-4" />}
            closable
            className="mb-6 rounded-lg"
          />
        )}

        {/* Stats Cards - Properly aligned sections */}
        <div className="space-y-8">
          {/* Overview Stats Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-800">
                System Overview
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {adminStats.slice(0, 4).map((stat, index) => (
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

          {/* Certification Stats Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-800">
                Certification Statistics
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
              {adminStats.slice(4, 9).map((stat, index) => (
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
              <div className="w-1 h-6 bg-green-600 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-800">
                Assessment Statistics
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {adminStats.slice(9, 11).map((stat, index) => (
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

export default Dashboard;
