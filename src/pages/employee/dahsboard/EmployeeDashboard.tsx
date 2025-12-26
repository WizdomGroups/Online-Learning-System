import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Clock, PlayCircle, CheckCircle, Award, Eye,
  RefreshCw, AlertCircle, Target, XCircle, RotateCcw,
  Star, BarChart3, Bell, Calendar, ChevronRight,
  TrendingUp, GraduationCap, LayoutDashboard
} from "lucide-react";
import { Button, Spin, Alert, Tooltip } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { fetchLMSDashboardStatistics } from "../../../lib/network/dashboardApis";
import { useAppDispatch } from "../../../lib/hooks/useAppDispatch";
import useLocalStorageUserData from "../../../lib/hooks/useLocalStorageUserData";

// Custom Components
import ProfileCard from "../../../components/ProfileCard";

const brandTeal = "#084c61";
const brandAccent = "#2dd4bf";

const EmployeeDashboard = () => {
  const { user, tenentId } = useLocalStorageUserData();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const { lmsStatistics, lmsLoading, lmsError } = useSelector(
    (state: RootState) => state.dashboard
  );

  useEffect(() => {
    if (user?.employeeId && tenentId) {
      loadDashboardData();
    }
  }, [user?.employeeId, tenentId]);

  const loadDashboardData = () => {
    if (user?.employeeId && tenentId) {
      dispatch(
        fetchLMSDashboardStatistics({
          tenantId: tenentId.toString(),
          employeeId: user.employeeId.toString(),
        })
      );
    }
  };

  if (lmsLoading && !lmsStatistics) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Spin size="large" />
          <p className="mt-4 text-slate-500 font-bold uppercase text-[10px] tracking-widest">Compiling your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 pb-20 font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-[1600px] mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-[#084c61] rounded-xl flex items-center justify-center shadow-lg shadow-teal-900/20">
              <LayoutDashboard className="text-white" size={18} />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight leading-none text-slate-800">
                Learning<span className="text-[#084c61]">Center</span>
              </h1>
              <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-0.5">Performance Overview</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Tooltip title="Refresh Statistics">
              <Button 
                onClick={loadDashboardData}
                icon={<RefreshCw size={16} className={lmsLoading ? "animate-spin" : ""} />}
                className="border-slate-200 text-slate-600 hover:text-[#084c61] hover:border-[#084c61] rounded-lg h-10 flex items-center justify-center"
              />
            </Tooltip>
            <div className="h-10 px-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-tighter">Status: Active</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-8 pt-8">
        {lmsError && <Alert message={lmsError} type="error" showIcon className="mb-6 rounded-xl" />}

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-3">
             <ProfileCard 
                name={`${user?.firstName} ${user?.lastName}`}
                email={user?.email}
                designation={user?.designation?.name}
                department={user?.department?.name}
                idNumber={user?.empCode}
                className="h-full !rounded-[2rem] shadow-sm border-slate-200"
             />
          </div>
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-[#084c61] rounded-[2rem] p-8 text-white relative overflow-hidden flex flex-col justify-between"
          >
             <div className="relative z-10">
                <GraduationCap size={32} className="text-[#2dd4bf] mb-4" />
                <h3 className="text-xl font-black leading-tight mb-2">Academic Standing</h3>
                <p className="text-teal-100/60 text-xs font-medium uppercase tracking-widest">Assessment Average</p>
             </div>
             <div className="relative z-10 mt-6">
                <span className="text-5xl font-black tracking-tighter italic">{lmsStatistics?.assessments.AverageScore || 0}%</span>
                <div className="w-full h-1.5 bg-white/10 rounded-full mt-4 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${lmsStatistics?.assessments.AverageScore || 0}%` }}
                    className="h-full bg-[#2dd4bf]"
                  />
                </div>
             </div>
          </motion.div>
        </div>

        {/* Bento Grid Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Main Certification Stats */}
          <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-6">
             <StatBox title="Assigned" val={lmsStatistics?.certifications.Assigned} icon={<PlayCircle />} color="blue" />
             <StatBox title="In Review" val={lmsStatistics?.certifications.Review} icon={<Eye />} color="amber" />
             <StatBox title="Completed" val={lmsStatistics?.certifications.Completed} icon={<CheckCircle />} color="emerald" />
             <StatBox title="Retakes" val={lmsStatistics?.certifications["Re-assigned"]} icon={<RotateCcw />} color="violet" />
             <StatBox title="Cancelled" val={lmsStatistics?.certifications.Cancelled} icon={<XCircle />} color="rose" />
             <StatBox title="Total" val={lmsStatistics?.certifications.Total} icon={<BarChart3 />} color="slate" />
          </div>

          {/* Detailed Performance Stats */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2rem] p-8 border border-slate-200 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100">
                    <Award size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Successful Clearances</p>
                    <h4 className="text-2xl font-black text-slate-800 tracking-tight">{lmsStatistics?.assessments.Passed || 0} Assessments</h4>
                  </div>
                </div>
                <ChevronRight size={20} className="text-slate-300" />
            </div>

            <div className="bg-white rounded-[2rem] p-8 border border-slate-200 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center border border-rose-100">
                    <Target size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Action Required</p>
                    <h4 className="text-2xl font-black text-slate-800 tracking-tight">{lmsStatistics?.assessments.Failed || 0} Failures</h4>
                  </div>
                </div>
                <Button type="link" className="text-rose-500 font-bold p-0 h-auto">RETRY</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- Helper UI Components ---

const StatBox = ({ title, val, icon, color }: any) => {
  const themes: any = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    violet: "bg-violet-50 text-violet-600 border-violet-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    slate: "bg-slate-50 text-slate-600 border-slate-100",
  };

  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm transition-all"
    >
      <div className={`${themes[color]} h-10 w-10 rounded-xl border flex items-center justify-center mb-4`}>
        {React.cloneElement(icon, { size: 20 })}
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-1">{title}</p>
      <h4 className="text-3xl font-black text-slate-800 tracking-tighter">{val || 0}</h4>
    </motion.div>
  );
};

export default EmployeeDashboard;