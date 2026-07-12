import React, { useState } from "react";
import { Activity, Shield, ListTodo, ChevronRight, UserPlus, AlertOctagon, CheckCircle, BrainCircuit, RefreshCw, Sparkles, AlertTriangle } from "lucide-react";
import { motion } from "motion/react";
import { User, Role, Task, Activity as ActivityType } from "../types";

interface DashboardTabProps {
  users: User[];
  roles: Role[];
  tasks: Task[];
  activities: ActivityType[];
  onNavigateToTab: (tabId: string) => void;
  onRefreshData: () => void;
}

interface AuditFinding {
  title: string;
  description: string;
  impact: string;
  resolution: string;
}

interface AuditResult {
  findings: AuditFinding[];
  auditScore: number;
  explanation: string;
}

export default function DashboardTab({
  users,
  roles,
  tasks,
  activities,
  onNavigateToTab,
  onRefreshData,
}: DashboardTabProps) {
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);

  // Calculate dynamic metrics to correspond with current states
  const openTasksCount = tasks.filter((t) => t.status !== "Completed").length;
  const activeRolesCount = roles.length;
  const totalUsersCount = 14200 + users.length;

  const handleRunSecurityAudit = async () => {
    setIsAuditing(true);
    setAuditResult(null);

    try {
      const response = await fetch("/api/security-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      setAuditResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* System Health Section */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-on-surface">System Health</h2>
          <span className="text-xs font-semibold text-primary bg-primary-container/20 px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Operational
          </span>
        </div>
        
        <div className="glass-card rounded-xl p-5 flex flex-col md:flex-row gap-6 bg-surface-container-lowest border border-outline-variant">
          <div className="flex-1 space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-xs font-semibold text-on-surface-variant">API Latency</span>
              <span className="text-xs font-bold text-primary">42ms</span>
            </div>
            <div className="w-full bg-outline-variant h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full w-[85%] rounded-full transition-all duration-500"></div>
            </div>
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-xs font-semibold text-on-surface-variant">Cloud Sync</span>
              <span className="text-xs font-bold text-primary">100%</span>
            </div>
            <div className="w-full bg-outline-variant h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full w-full rounded-full transition-all duration-500"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats Grid (Bento Style) */}
      <section className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {/* Total Users */}
        <div
          onClick={() => onNavigateToTab("users")}
          className="glass-card rounded-xl p-4 flex flex-col justify-between h-28 border-l-4 border-primary bg-surface-container-lowest border border-outline-variant cursor-pointer hover:bg-surface-container-low transition-all"
        >
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
            <UserPlus className="w-3.5 h-3.5 text-primary" /> Total Users
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight">{totalUsersCount.toLocaleString()}</span>
            <span className="text-primary text-[10px] font-bold">+12%</span>
          </div>
        </div>

        {/* Active Roles */}
        <div
          onClick={() => onNavigateToTab("access")}
          className="glass-card rounded-xl p-4 flex flex-col justify-between h-28 bg-surface-container-lowest border border-outline-variant cursor-pointer hover:bg-surface-container-low transition-all"
        >
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-secondary" /> Active Roles
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight">{activeRolesCount}</span>
            <span className="text-xs text-outline font-medium">defined</span>
          </div>
        </div>

        {/* Open Tasks */}
        <div
          onClick={() => onNavigateToTab("tasks")}
          className="glass-card rounded-xl p-4 flex flex-col justify-between h-28 col-span-2 md:col-span-1 bg-surface-container-lowest border border-outline-variant cursor-pointer hover:bg-surface-container-low transition-all"
        >
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
            <ListTodo className="w-3.5 h-3.5 text-error" /> Open Tasks
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-error">{openTasksCount}</span>
            <span className="text-[10px] font-bold text-on-error-container bg-error-container px-2 py-0.5 rounded uppercase">Urgent</span>
          </div>
        </div>
      </section>

      {/* Visual Context Card */}
      <section className="relative rounded-xl overflow-hidden h-40 group shadow-sm border border-outline-variant">
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-on-surface/90 to-transparent"></div>
        <img
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          alt="Server room with glowing LEDs"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAv7R0-GctUR_j6nFAFs7c5DKpcAqda8bTt7zEyI5r8CFQlQbbQBfUSM5ELLvE2uwGYUxGNlegNHFMPE_dco61eyi1EP--n8cyM90Z8D_6uy9rxJhv-yHmU1oUFO7iFGpWZIzicZZEmtIIr3Hc3xdxEuwlwE84vpmwnAirNeizxxFl6Wg8kXZSzXqrSvi6sPQ52NQoHr7qMk6xsrhFveqw0RTrtncte6UV6jiOtxKt-AYM69nFjCJ7x_A"
        />
        <div className="absolute bottom-4 left-4 z-20">
          <h3 className="font-bold text-sm text-white tracking-wide">Instance: SN-PROD-01</h3>
          <p className="text-xs text-white/80 mt-0.5">Last audit completed 2 hours ago</p>
        </div>
      </section>

      {/* AI Security Copilot Audit Section */}
      <section className="bg-surface-container border border-outline-variant rounded-xl p-5 relative overflow-hidden">
        <div className="absolute right-[-20px] top-[-20px] opacity-10">
          <BrainCircuit className="w-32 h-32 text-primary" />
        </div>
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1 bg-primary-container rounded-lg text-on-primary-container">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-on-background">AI Security Copilot</h3>
            <p className="text-[11px] text-on-surface-variant font-medium">Real-time Role-Based Access Anomaly Audit</p>
          </div>
        </div>

        <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
          Initiate an automated security audit powered by Gemini. Analyzes active users, custom role permissions, security clearances, and alerts you to structural risks.
        </p>

        <button
          onClick={handleRunSecurityAudit}
          disabled={isAuditing}
          className="bg-primary text-on-primary px-4 py-2 rounded-lg text-xs font-bold hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {isAuditing ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Scanning Instance Configs...
            </>
          ) : (
            <>
              <BrainCircuit className="w-3.5 h-3.5" />
              Run Security Audit with Gemini
            </>
          )}
        </button>

        {/* Audit Results */}
        {auditResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 pt-4 border-t border-outline-variant space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface">Overall Security Score:</span>
              <div className="flex items-center gap-1">
                <span className={`text-sm font-black px-2 py-0.5 rounded-md ${
                  auditResult.auditScore >= 90 ? "bg-primary/20 text-primary" : "bg-error-container text-on-error-container"
                }`}>
                  {auditResult.auditScore}/100
                </span>
              </div>
            </div>

            <p className="text-xs text-on-surface-variant bg-surface-container-lowest/50 p-2.5 rounded border border-outline-variant italic leading-relaxed">
              "{auditResult.explanation}"
            </p>

            <div className="space-y-2.5">
              <h4 className="text-[11px] font-bold text-primary uppercase tracking-wider">Identified Findings:</h4>
              {auditResult.findings.map((finding, idx) => (
                <div key={idx} className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-on-surface flex items-center gap-1">
                      {finding.impact === "High" ? (
                        <AlertOctagon className="w-3.5 h-3.5 text-error" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-secondary" />
                      )}
                      {finding.title}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      finding.impact === "High" ? "bg-error-container text-on-error-container" : "bg-secondary-container text-on-secondary-container"
                    }`}>
                      {finding.impact} Impact
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    {finding.description}
                  </p>
                  <div className="bg-surface-container p-2 rounded text-[10px] text-on-secondary-container leading-relaxed">
                    <span className="font-bold">Suggested Remediation: </span>
                    {finding.resolution}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </section>

      {/* Recent Activity Feed */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-on-surface">Recent Activity</h2>
          <button
            onClick={() => onNavigateToTab("users")}
            className="text-primary font-semibold text-xs hover:underline cursor-pointer"
          >
            View All
          </button>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl divide-y divide-outline-variant overflow-hidden">
          {activities.slice(0, 3).map((act) => (
            <div key={act.id} className="p-4 flex gap-4 items-start hover:bg-surface-container-low transition-colors">
              <div className={`w-9 h-9 rounded flex items-center justify-center shrink-0 ${
                act.severity === "success" ? "bg-primary-container/20 text-primary" : 
                act.severity === "warning" ? "bg-error-container text-error" : 
                "bg-secondary-container text-secondary"
              }`}>
                {act.severity === "success" ? (
                  <CheckCircle className="w-5 h-5" />
                ) : act.severity === "warning" ? (
                  <AlertOctagon className="w-5 h-5" />
                ) : (
                  <Shield className="w-5 h-5" />
                )}
              </div>

              <div className="flex-1">
                <p className="text-xs text-on-surface">
                  <span className="font-semibold">{act.user || act.system}</span> {act.message.replace(act.user || "", "").trim()}
                </p>
                <p className="text-[10px] text-on-surface-variant mt-0.5">
                  {act.time} • {act.system}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-outline" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
