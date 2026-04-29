"use client";

import {
  FileText,
  Globe,
  PenTool,
  TrendingUp,
  TrendingDown,
  Eye,
  Heart,
  Share2,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Calendar,
  Users,
  Activity,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";

const statsData = [
  { 
    label: "Total Pages", 
    value: "4", 
    change: "+2 this week", 
    trend: "up",
    icon: Globe,
    color: "from-blue-500/20 to-blue-500/5",
    iconColor: "text-blue-500",
  },
  { 
    label: "Published", 
    value: "3", 
    change: "75% of total", 
    trend: "up",
    icon: CheckCircle,
    color: "from-green-500/20 to-green-500/5",
    iconColor: "text-green-500",
  },
  { 
    label: "Draft", 
    value: "1", 
    change: "1 pending review", 
    trend: "neutral",
    icon: PenTool,
    color: "from-amber-500/20 to-amber-500/5",
    iconColor: "text-amber-500",
  },
];

const recentActivity = [
  { id: 1, action: "Created new page", page: "About Us", time: "2 hours ago", status: "published" },
  { id: 2, action: "Updated content", page: "Homepage", time: "5 hours ago", status: "draft" },
  { id: 3, action: "Deleted page", page: "Old Blog Post", time: "1 day ago", status: "deleted" },
  { id: 4, action: "Changed settings", page: "Global CSS", time: "2 days ago", status: "published" },
];

const pageViewsData = [
  { month: "Jan", views: 1200, visitors: 890 },
  { month: "Feb", views: 1900, visitors: 1450 },
  { month: "Mar", views: 2400, visitors: 1890 },
  { month: "Apr", views: 2100, visitors: 1670 },
  { month: "May", views: 2800, visitors: 2100 },
  { month: "Jun", views: 3200, visitors: 2450 },
];

const quickActions = [
  { label: "Create New Page", icon: FileText, action: "create", color: "bg-sidebar-primary" },
  { label: "Manage Content", icon: Globe, action: "manage", color: "bg-purple-500" },
  { label: "View Analytics", icon: Activity, action: "analytics", color: "bg-emerald-500" },
];

export function DashboardSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const statCardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    hover: { scale: 1.02, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="p-8 bg-gradient-to-br from-background via-background to-background/95 min-h-screen"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-sans text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-2">
              Dashboard
            </h1>
            <div className="flex items-center gap-2">
              <div className="h-1 w-8 bg-sidebar-primary rounded-full" />
              <p className="text-sm font-mono text-muted-foreground">
                Overview & Analytics
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg">
              <Calendar size={14} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-sidebar-primary text-white rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
            >
              <Zap size={14} />
              Export Report
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        variants={containerVariants}
        className="grid grid-cols-1 grid-cols-3 gap-6 mb-8"
      >
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === "up" ? TrendingUp : stat.trend === "down" ? TrendingDown : null;
          
          return (
            <motion.div
              key={stat.label}
              variants={statCardVariants}
              whileHover="hover"
              className="group relative bg-card border border-border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              
              <div className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color} ring-1 ring-border`}>
                    <Icon size={20} className={stat.iconColor} />
                  </div>
                  {TrendIcon && (
                    <div className={`flex items-center gap-1 ${stat.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                      <TrendIcon size={14} />
                      <span className="text-xs font-medium">
                        {stat.change.split(" ")[0]}
                      </span>
                    </div>
                  )}
                </div>
                
                <div>
                  <p className="text-4xl font-bold text-foreground mb-2">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-xs font-mono text-muted-foreground/70">{stat.change}</p>
                </div>

                {/* Progress bar for draft */}
                {stat.label === "Draft" && (
                  <div className="mt-4">
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "25%" }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-amber-500 rounded-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Traffic Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-foreground mb-1">Page Views</h3>
              <p className="text-xs text-muted-foreground">Last 6 months</p>
            </div>
            <div className="flex items-center gap-2">
              <Eye size={16} className="text-sidebar-primary" />
              <span className="text-2xl font-bold text-foreground">14.7k</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={pageViewsData}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--sidebar-primary)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--sidebar-primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "var(--card)", 
                  borderColor: "var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px"
                }}
              />
              <Area 
                type="monotone" 
                dataKey="views" 
                stroke="var(--sidebar-primary)" 
                strokeWidth={2}
                fill="url(#colorViews)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <h3 className="font-semibold text-foreground mb-4">Quick Stats</h3>
          <div className="space-y-4">
            {[
              { label: "Total Visitors", value: "2,450", change: "+23%", icon: Users, color: "text-blue-500" },
              { label: "Bounce Rate", value: "43%", change: "-5%", icon: Activity, color: "text-green-500" },
              { label: "Avg. Session", value: "4m 32s", change: "+12%", icon: Clock, color: "text-purple-500" },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <stat.icon size={18} className={stat.color} />
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-lg font-semibold text-foreground">{stat.value}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium ${stat.change.startsWith("+") ? "text-green-500" : "text-red-500"}`}>
                  {stat.change}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border border-border rounded-xl overflow-hidden"
        >
          <div className="p-6 border-b border-border">
            <h3 className="font-semibold text-foreground">Recent Activity</h3>
            <p className="text-xs text-muted-foreground mt-1">Latest changes to your content</p>
          </div>
          <div className="divide-y divide-border">
            {recentActivity.map((activity, idx) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + idx * 0.1 }}
                className="p-4 hover:bg-muted/30 transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground">{activity.action}</span>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        activity.status === "published" ? "bg-green-500" :
                        activity.status === "draft" ? "bg-amber-500" : "bg-red-500"
                      }`} />
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.page}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">{activity.time}</p>
                  </div>
                  <ArrowRight size={16} className="text-muted-foreground/30 group-hover:text-sidebar-primary transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + idx * 0.1 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${action.color}/10 text-white`}>
                      <Icon size={18} className={action.color === "bg-sidebar-primary" ? "text-sidebar-primary" : "text-white"} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-foreground">{action.label}</p>
                      <p className="text-xs text-muted-foreground">Click to get started</p>
                    </div>
                    <ArrowRight size={16} className="text-muted-foreground/30 group-hover:text-sidebar-primary transition-colors" />
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Engagement Metrics */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart size={14} className="text-red-500" />
                <span className="text-xs text-muted-foreground">Engagement Rate</span>
              </div>
              <span className="text-sm font-semibold text-foreground">78%</span>
            </div>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "78%" }}
                transition={{ duration: 1, delay: 0.8 }}
                className="h-full bg-gradient-to-r from-sidebar-primary to-sidebar-primary/60 rounded-full"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}