import React, { useState, useEffect } from "react";
import {
  Users, Layers, FileText, Trophy, RefreshCw,
  Sparkles, ChevronRight, TrendingUp, GraduationCap,
  ArrowUpRight, Activity, ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Spin, Progress, Tooltip } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { fetchAdminDashboardStatistics } from "../../lib/network/dashboardApis";
import { useAppDispatch } from "../../lib/hooks/useAppDispatch";
import useLocalStorageUserData from "../../lib/hooks/useLocalStorageUserData";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
};

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const { tenentId, userName } = useLocalStorageUserData();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { adminStatistics, adminLoading, adminError } = useSelector(
    (state: RootState) => state.dashboard
  );

  useEffect(() => {
    if (tenentId) loadData();
  }, [tenentId]);

  const loadData = async () => {
    setIsRefreshing(true);
    if (tenentId) {
      await dispatch(fetchAdminDashboardStatistics({ tenantId: tenentId.toString() }));
    }
    setIsRefreshing(false);
  };

  const brandTeal = "#084c61";
  const brandAccent = "#2dd4bf";

  if (adminLoading && !adminStatistics) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f0fafa]">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="mb-8"
        >
          <Sparkles size={48} color={brandTeal} />
        </motion.div>
        <Spin size="large" />
        <p className="mt-10 text-[#084c61] font-black uppercase text-xs tracking-[0.3em] animate-pulse">
          Initialising Analytics...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7f9] pb-24 font-sans text-slate-900 overflow-x-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-slate-400/5 rounded-full blur-3xl" />
      </div>

      <header 
        style={{ backgroundColor: brandTeal }} 
        className="border-b border-white/10 sticky top-0 z-50 shadow-xl backdrop-blur-md bg-opacity-95"
      >
        <div className="max-w-[1600px] mx-auto px-8 h-20 flex items-center justify-between">
          <motion.div 
            initial={{ x: -20, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-4"
          >
            <div className="h-11 w-11 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 shadow-inner">
              <Sparkles className="text-white" size={22} />
            </div>
            <div>
              <h1 className="text-white text-xl font-black tracking-tight leading-none">
                LMS<span style={{ color: brandAccent }}>Command</span>
              </h1>
              <p className="text-teal-200/50 text-[10px] uppercase font-bold tracking-[0.2em] mt-1">
                Admin Intel Engine
              </p>
            </div>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="primary"
              onClick={loadData}
              style={{ backgroundColor: brandAccent, borderColor: "transparent" }}
              className="hover:shadow-[0_0_20px_rgba(45,212,191,0.4)] text-[#084c61] font-black h-11 px-8 rounded-xl flex items-center gap-3 transition-all"
            >
              <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
              SYNC REAL-TIME
            </Button>
          </motion.div>
        </div>
      </header>

      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-[1600px] mx-auto px-8 pt-12 relative z-10"
      >
        <motion.div variants={itemVariants} className="mb-12 flex justify-between items-end">
          <div>
             <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
                Hello, {userName?.split(' ')[0] || 'Trainer'}
             </h2>
             <div className="flex items-center gap-3 mt-3">
               <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
               <p className="text-slate-500 font-medium">System operational • <span style={{ color: brandTeal }} className="font-bold">Live Metrics</span></p>
             </div>
          </div>
          <div className="hidden lg:block text-right">
             <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Global Compliance</p>
             <p className="text-3xl font-black text-slate-800">94.2%</p>
          </div>
        </motion.div>

        {/* --- Stats Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <BookStatCard title="Workforce" value={adminStatistics?.totalEmployees} icon={<Users />} brandColor={brandTeal} />
          <BookStatCard title="Modules" value={adminStatistics?.totalModules} icon={<Layers />} brandColor={brandTeal} />
          <BookStatCard title="Documents" value={adminStatistics?.totalDocuments} icon={<FileText />} brandColor={brandTeal} />
          <BookStatCard title="Certs Issued" value={adminStatistics?.totalCertificates} icon={<Trophy />} brandColor={brandTeal} />
        </div>

        {/* --- Certification Section --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <motion.div 
            variants={itemVariants}
            className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100"
          >
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                Certification Lifecycle <ChevronRight size={20} style={{ color: brandTeal }} />
              </h3>
              <Activity size={20} className="text-slate-300" />
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <StatusTile label="Assigned" val={adminStatistics?.certifications.Assigned} color="teal" brandColor={brandTeal} />
              <StatusTile label="Review" val={adminStatistics?.certifications.Review} color="amber" brandColor={brandTeal} />
              <StatusTile label="Success" val={adminStatistics?.certifications.Completed} color="emerald" brandColor={brandTeal} />
              <StatusTile label="Retake" val={adminStatistics?.certifications["Re-assigned"]} color="slate" brandColor={brandTeal} />
              <StatusTile label="Dropped" val={adminStatistics?.certifications.Cancelled} color="rose" brandColor={brandTeal} />
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            style={{ backgroundColor: brandTeal }} 
            className="rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group"
          >
            {/* Animated background circle */}
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 8, repeat: Infinity }}
              className="absolute -top-20 -right-20 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl" 
            />
            
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex justify-between items-start mb-8">
                <ShieldCheck size={32} className="text-[#2dd4bf]" />
                <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">Priority Audit</span>
              </div>
              
              <h3 className="text-2xl font-black mb-2">Performance Audit</h3>
              <p className="text-teal-100/60 text-xs font-bold uppercase tracking-widest mb-8">Quarterly Review</p>
              
              <div className="mt-auto">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-3xl font-black italic">85%</span>
                  <span className="text-teal-300 text-xs font-bold">+4.2%</span>
                </div>
                <Progress 
                  percent={85} 
                  strokeColor="#2dd4bf" 
                  trailColor="rgba(255,255,255,0.1)" 
                  showInfo={false} 
                  strokeWidth={10} 
                />
                <Button className="w-full mt-8 h-14 bg-white text-[#084c61] hover:bg-[#2dd4bf] hover:text-white border-none font-black rounded-2xl transition-all flex items-center justify-center gap-2">
                  VIEW FULL REPORTS <ArrowUpRight size={18} />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
};

// --- Sub-Components with Enhanced Animations ---

const BookStatCard = ({ title, value, icon, brandColor }: any) => (
  <motion.div
    variants={itemVariants}
    whileHover={{ y: -10, scale: 1.02 }}
    className="bg-white p-8 rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-slate-100 relative overflow-hidden group cursor-pointer"
  >
    <div className="relative z-10">
      <div 
        style={{ backgroundColor: `${brandColor}08`, color: brandColor }} 
        className="p-4 w-fit rounded-2xl mb-6 transition-all duration-500 group-hover:scale-110 group-hover:bg-[#084c61] group-hover:text-white"
      >
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <div className="flex items-baseline gap-2">
        <h4 className="text-4xl font-black text-slate-900 tracking-tighter">{value || 0}</h4>
        <div className="h-2 w-2 rounded-full bg-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] mt-2">{title}</p>
    </div>
    
    {/* Decorative Background Path */}
    <div className="absolute -bottom-4 -right-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
      {React.cloneElement(icon, { size: 120 })}
    </div>
  </motion.div>
);

const StatusTile = ({ label, val, color, brandColor }: any) => {
  const styles: any = {
    teal: { bg: `${brandColor}10`, text: brandColor, border: `${brandColor}20` },
    amber: { bg: "#fffbeb", text: "#d97706", border: "#fde68a" },
    emerald: { bg: "#ecfdf5", text: "#059669", border: "#a7f3d0" },
    slate: { bg: "#f8fafc", text: "#475569", border: "#e2e8f0" },
    rose: { bg: "#fff1f2", text: "#e11d48", border: "#fecdd3" },
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.05, rotate: [0, -1, 1, 0] }}
      style={{ 
        backgroundColor: styles[color].bg, 
        color: styles[color].text,
        borderColor: styles[color].border
      }} 
      className="flex flex-col items-center justify-center py-8 rounded-[2rem] border transition-shadow hover:shadow-lg"
    >
      <span className="text-[9px] font-black uppercase tracking-[0.15em] opacity-70 mb-2">{label}</span>
      <span className="text-3xl font-black tracking-tighter">{val || 0}</span>
    </motion.div>
  );
};

export default Dashboard;