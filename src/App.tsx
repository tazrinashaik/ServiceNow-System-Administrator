import React, { useState, useEffect } from "react";
import { LayoutGrid, Users, Shield, ListTodo, Search, LogOut, Loader2, Sparkles } from "lucide-react";
import { User, Role, Task, Activity, SystemHealth } from "./types";
import LoginScreen from "./components/LoginScreen";
import DashboardTab from "./components/DashboardTab";
import UsersTab from "./components/UsersTab";
import AccessTab from "./components/AccessTab";
import TasksTab from "./components/TasksTab";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [session, setSession] = useState<{
    token: string;
    user: { name: string; email: string; avatar: string; role: string };
  } | null>(null);

  const [activeTab, setActiveTab] = useState<"dashboard" | "users" | "access" | "tasks">("dashboard");
  const [isLoading, setIsLoading] = useState(true);

  // Core collections synced with full-stack backend
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);

  // Restore session and bootstrap collections
  useEffect(() => {
    const savedSession = localStorage.getItem("sn_admin_session");
    if (savedSession) {
      try {
        setSession(JSON.parse(savedSession));
      } catch (err) {
        localStorage.removeItem("sn_admin_session");
      }
    }
    bootstrapData();
  }, []);

  const bootstrapData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchUsers(),
        fetchRoles(),
        fetchTasks(),
        fetchActivities(),
        fetchHealth(),
      ]);
    } catch (err) {
      console.error("Error bootstrapping initial data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data);
  };

  const fetchRoles = async () => {
    const res = await fetch("/api/roles");
    const data = await res.json();
    setRoles(data);
  };

  const fetchTasks = async () => {
    const res = await fetch("/api/tasks");
    const data = await res.json();
    setTasks(data);
  };

  const fetchActivities = async () => {
    const res = await fetch("/api/activities");
    const data = await res.json();
    setActivities(data);
  };

  const fetchHealth = async () => {
    const res = await fetch("/api/system/health");
    const data = await res.json();
    setHealth(data);
  };

  // Callback implementations

  const handleLoginSuccess = (user: { name: string; email: string; avatar: string; role: string }) => {
    const newSession = { token: "mock-session-token", user };
    setSession(newSession);
    localStorage.setItem("sn_admin_session", JSON.stringify(newSession));
    bootstrapData();
  };

  const handleLogout = () => {
    setSession(null);
    localStorage.removeItem("sn_admin_session");
  };

  const handleAddUser = async (userPayload: Omit<User, "id" | "avatar" | "lastLogin">) => {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userPayload),
    });
    if (res.ok) {
      await fetchUsers();
      await fetchActivities();
    }
  };

  const handleUpdateUser = async (id: string, updates: Partial<User>) => {
    const res = await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      await fetchUsers();
    }
  };

  const handleDeleteUser = async (id: string) => {
    const res = await fetch(`/api/users/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      await fetchUsers();
      await fetchActivities();
    }
  };

  const handleAddRole = async (rolePayload: Omit<Role, "id" | "userCount" | "isCustom">) => {
    const res = await fetch("/api/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rolePayload),
    });
    if (res.ok) {
      await fetchRoles();
      await fetchActivities();
    }
  };

  const handleUpdateRole = async (id: string, updates: Partial<Role>) => {
    const res = await fetch(`/api/roles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      await fetchRoles();
    }
  };

  const handleAddTask = async (taskPayload: Omit<Task, "id" | "assigneeName" | "assigneeAvatar">) => {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskPayload),
    });
    if (res.ok) {
      await fetchTasks();
    }
  };

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      await fetchTasks();
      await fetchActivities();
    }
  };

  const handleDeleteTask = async (id: string) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      await fetchTasks();
    }
  };

  // Render Authentication screen if not authenticated
  if (!session) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="bg-background text-on-surface min-h-screen pb-24 flex flex-col font-sans">
      {/* Header / TopAppBar */}
      <header className="w-full top-0 sticky z-40 bg-surface border-b border-outline-variant flex items-center justify-between px-4 h-14 bg-surface-container-lowest/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {/* User profile with logout menu dropdown */}
          <div className="relative group cursor-pointer">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant hover:ring-2 hover:ring-primary/40 transition-all">
              <img
                className="w-full h-full object-cover"
                src={session.user.avatar}
                alt={session.user.name}
              />
            </div>
            {/* Quick mini-logout tooltip/action */}
            <div
              onClick={handleLogout}
              className="absolute left-0 mt-1 p-2 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 flex items-center gap-1.5 hover:bg-error-container hover:text-on-error-container whitespace-nowrap text-xs font-semibold"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </div>
          </div>
          
          <h1 className="text-base font-black text-primary flex items-center gap-1 tracking-tight">
            ServiceNow Admin
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Mini role-pill indicators */}
          <span className="text-[9px] font-black tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded uppercase hidden sm:inline-block">
            {session.user.role}
          </span>
          <button className="p-2 hover:bg-secondary-container/50 transition-colors rounded-full flex items-center justify-center text-primary active:scale-95 cursor-pointer">
            <Search className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main content viewport */}
      <main className="flex-grow px-4 pt-4 max-w-3xl mx-auto w-full">
        {isLoading ? (
          <div className="h-[60vh] flex flex-col items-center justify-center gap-2.5 text-xs text-outline">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span>Connecting to secure ServiceNow gateway...</span>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === "dashboard" && (
                <DashboardTab
                  users={users}
                  roles={roles}
                  tasks={tasks}
                  activities={activities}
                  onNavigateToTab={(tab) => setActiveTab(tab as any)}
                  onRefreshData={bootstrapData}
                />
              )}
              {activeTab === "users" && (
                <UsersTab
                  users={users}
                  onAddUser={handleAddUser}
                  onUpdateUser={handleUpdateUser}
                  onDeleteUser={handleDeleteUser}
                />
              )}
              {activeTab === "access" && (
                <AccessTab
                  roles={roles}
                  onAddRole={handleAddRole}
                  onUpdateRole={handleUpdateRole}
                />
              )}
              {activeTab === "tasks" && (
                <TasksTab
                  tasks={tasks}
                  users={users}
                  onAddTask={handleAddTask}
                  onUpdateTask={handleUpdateTask}
                  onDeleteTask={handleDeleteTask}
                />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-outline-variant bg-surface-container-lowest/90 backdrop-blur-md flex justify-around items-center h-16 px-3">
        {/* Dashboard */}
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex flex-col items-center justify-center w-full h-full scale-95 transition-all duration-150 cursor-pointer ${
            activeTab === "dashboard"
              ? "text-primary border-t-2 border-primary font-bold"
              : "text-secondary hover:bg-surface-container-low"
          }`}
        >
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[10px] tracking-wide mt-0.5">Dashboard</span>
        </button>

        {/* Users */}
        <button
          onClick={() => setActiveTab("users")}
          className={`flex flex-col items-center justify-center w-full h-full scale-95 transition-all duration-150 cursor-pointer ${
            activeTab === "users"
              ? "text-primary border-t-2 border-primary font-bold"
              : "text-secondary hover:bg-surface-container-low"
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] tracking-wide mt-0.5">Users</span>
        </button>

        {/* Access */}
        <button
          onClick={() => setActiveTab("access")}
          className={`flex flex-col items-center justify-center w-full h-full scale-95 transition-all duration-150 cursor-pointer ${
            activeTab === "access"
              ? "text-primary border-t-2 border-primary font-bold"
              : "text-secondary hover:bg-surface-container-low"
          }`}
        >
          <Shield className="w-5 h-5" />
          <span className="text-[10px] tracking-wide mt-0.5">Access</span>
        </button>

        {/* Tasks */}
        <button
          onClick={() => setActiveTab("tasks")}
          className={`flex flex-col items-center justify-center w-full h-full scale-95 transition-all duration-150 cursor-pointer ${
            activeTab === "tasks"
              ? "text-primary border-t-2 border-primary font-bold"
              : "text-secondary hover:bg-surface-container-low"
          }`}
        >
          <ListTodo className="w-5 h-5" />
          <span className="text-[10px] tracking-wide mt-0.5">Tasks</span>
        </button>
      </nav>
    </div>
  );
}
