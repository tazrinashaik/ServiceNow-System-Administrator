import React, { useState } from "react";
import { Search, ChevronRight, UserPlus, TrendingUp, ShieldCheck, X, Trash2, Eye, Edit } from "lucide-react";
import { User, UserStatus } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface UsersTabProps {
  users: User[];
  onAddUser: (user: Omit<User, "id" | "avatar" | "lastLogin">) => Promise<void>;
  onUpdateUser: (id: string, updates: Partial<User>) => Promise<void>;
  onDeleteUser: (id: string) => Promise<void>;
}

export default function UsersTab({
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
}: UsersTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"All" | "PM" | "Team Member">("All");
  
  // Drawer / Add user state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<"PM" | "Team Member">("Team Member");
  const [newUserDept, setNewUserDept] = useState("Engineering");
  const [newUserSecLvl, setNewUserSecLvl] = useState("L1 - Basic Access");
  const [newUserRoles, setNewUserRoles] = useState<string[]>(["Developer_Core"]);

  // Details Modal state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form Submission
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;

    await onAddUser({
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      status: UserStatus.ACTIVE,
      department: newUserDept,
      securityLevel: newUserSecLvl,
      assignedRoles: newUserRoles,
    });

    // Reset Form
    setNewUserName("");
    setNewUserEmail("");
    setNewUserRole("Team Member");
    setIsAddOpen(false);
  };

  // Filter & Search computation
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = activeFilter === "All" ? true : u.role === activeFilter;

    return matchesSearch && matchesFilter;
  });

  const pmsCount = users.filter((u) => u.role === "PM").length;
  const teamCount = users.filter((u) => u.role === "Team Member").length;

  return (
    <div className="space-y-6 pb-6 relative">
      {/* Search & Filter Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
          <input
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-3 pl-10 pr-4 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline"
            placeholder="Search team members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            type="text"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setActiveFilter("All")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
              activeFilter === "All"
                ? "bg-primary-container text-on-primary-container"
                : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
            }`}
          >
            All Users ({users.length})
          </button>
          <button
            onClick={() => setActiveFilter("PM")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
              activeFilter === "PM"
                ? "bg-primary-container text-on-primary-container"
                : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
            }`}
          >
            PMs ({pmsCount})
          </button>
          <button
            onClick={() => setActiveFilter("Team Member")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
              activeFilter === "Team Member"
                ? "bg-primary-container text-on-primary-container"
                : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
            }`}
          >
            Team Members ({teamCount})
          </button>
        </div>
      </div>

      {/* Roster list header */}
      <div className="flex justify-between items-end">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-on-surface">Team Roster</h2>
        <span className="text-xs text-on-surface-variant">Showing {filteredUsers.length} users</span>
      </div>

      {/* Roster list */}
      <div className="space-y-2">
        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center bg-surface-container-lowest border border-outline-variant rounded-xl text-xs text-outline">
            No team members matched the filters or search.
          </div>
        ) : (
          filteredUsers.map((u) => (
            <div
              key={u.id}
              onClick={() => setSelectedUser(u)}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-surface-container-low active:border-l-4 active:border-primary transition-all duration-150"
            >
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full border border-outline-variant overflow-hidden">
                    <img className="w-full h-full object-cover" src={u.avatar} alt={u.name} />
                  </div>
                  <div
                    className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-surface-container-lowest rounded-full ${
                      u.status === UserStatus.ACTIVE ? "bg-primary" : "bg-outline"
                    }`}
                  />
                </div>
                
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-on-surface">{u.name}</span>
                  <span className="text-[11px] text-on-surface-variant">{u.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                  u.role === "PM"
                    ? "bg-primary-container/20 text-on-primary-container"
                    : "bg-secondary-container text-on-secondary-container"
                }`}>
                  {u.role === "PM" ? "PM" : "Team"}
                </span>
                <ChevronRight className="w-4 h-4 text-outline" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Stats Cards (Bento Style) */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="bg-surface-container p-4 rounded-xl border border-outline-variant">
          <TrendingUp className="w-5 h-5 text-primary mb-1" />
          <div className="text-xl font-black text-on-surface">12%</div>
          <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Team Growth</div>
        </div>
        <div className="bg-surface-container p-4 rounded-xl border border-outline-variant">
          <ShieldCheck className="w-5 h-5 text-primary mb-1" />
          <div className="text-xl font-black text-on-surface">98%</div>
          <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Access Compliance</div>
        </div>
      </div>

      {/* Floating Action Button (Add User) */}
      <button
        onClick={() => setIsAddOpen(true)}
        className="fixed bottom-20 right-6 w-14 h-14 bg-primary text-on-primary rounded-2xl shadow-lg flex items-center justify-center active:scale-90 hover:opacity-95 transition-all z-40 cursor-pointer"
      >
        <UserPlus className="w-6 h-6 text-white" />
      </button>

      {/* Add User Slide-over Drawer / Modal */}
      <AnimatePresence>
        {isAddOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddOpen(false)}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-surface-container-lowest border-t border-outline-variant rounded-t-2xl p-6 z-50 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-primary" /> Provision New User
                </h3>
                <button
                  onClick={() => setIsAddOpen(false)}
                  className="p-1.5 hover:bg-surface-container-low rounded-full text-outline hover:text-on-surface cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Full Name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-white border border-outline-variant rounded-lg p-2.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="Elena Rodriguez"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Enterprise Email</label>
                  <input
                    type="email"
                    required
                    className="w-full bg-white border border-outline-variant rounded-lg p-2.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="elena.r@enterprise.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Primary Role</label>
                    <select
                      className="w-full bg-white border border-outline-variant rounded-lg p-2.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as "PM" | "Team Member")}
                    >
                      <option value="Team Member">Team Member</option>
                      <option value="PM">Project Manager (PM)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Department</label>
                    <input
                      type="text"
                      className="w-full bg-white border border-outline-variant rounded-lg p-2.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      placeholder="Infrastructure Ops"
                      value={newUserDept}
                      onChange={(e) => setNewUserDept(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Security Clearance</label>
                    <select
                      className="w-full bg-white border border-outline-variant rounded-lg p-2.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      value={newUserSecLvl}
                      onChange={(e) => setNewUserSecLvl(e.target.value)}
                    >
                      <option value="L1 - Basic Access">L1 - Basic Access</option>
                      <option value="L2 - Intermediate Access">L2 - Intermediate Access</option>
                      <option value="L3 - Manager Access">L3 - Manager Access</option>
                      <option value="L4 - Global Admin">L4 - Global Admin</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Initial Status</label>
                    <div className="flex items-center gap-4 py-2">
                      <label className="flex items-center gap-1.5 text-xs text-on-surface">
                        <input type="radio" name="status" defaultChecked /> Active
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-on-primary py-3 rounded-lg font-semibold text-sm hover:opacity-95 active:scale-95 transition-all cursor-pointer shadow-sm mt-4"
                >
                  Create and Provision User
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* User Detail & Edit Modal */}
      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed inset-x-4 top-[15vh] max-w-sm mx-auto bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 z-50 shadow-xl space-y-5"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img className="w-12 h-12 rounded-full object-cover border" src={selectedUser.avatar} alt={selectedUser.name} />
                    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      selectedUser.status === UserStatus.ACTIVE ? "bg-primary" : "bg-outline"
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-on-surface">{selectedUser.name}</h3>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{selectedUser.role} • {selectedUser.department}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-1 hover:bg-surface-container-low rounded-full text-outline hover:text-on-surface cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 pt-2 border-t border-outline-variant">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">Email Address</span>
                    <span className="text-on-surface break-all">{selectedUser.email}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">Security Level</span>
                    <span className="text-on-surface font-semibold">{selectedUser.securityLevel}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">Last Access</span>
                    <span className="text-on-surface">{selectedUser.lastLogin}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">Status</span>
                    <button
                      onClick={async () => {
                        const nextStatus = selectedUser.status === UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE;
                        await onUpdateUser(selectedUser.id, { status: nextStatus });
                        setSelectedUser({ ...selectedUser, status: nextStatus });
                      }}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer transition-colors ${
                        selectedUser.status === UserStatus.ACTIVE
                          ? "bg-primary-container/20 text-primary hover:bg-primary/20"
                          : "bg-outline/20 text-outline hover:bg-outline/30"
                      }`}
                    >
                      {selectedUser.status} (Toggle)
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-outline uppercase tracking-wider block mb-1">Allocated Security Roles</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedUser.assignedRoles.length === 0 ? (
                      <span className="text-[11px] text-outline">No assigned roles</span>
                    ) : (
                      selectedUser.assignedRoles.map((role, i) => (
                        <span key={i} className="text-[9px] font-bold bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full uppercase">
                          {role}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-outline-variant">
                <button
                  onClick={async () => {
                    if (confirm(`Offboard and delete credentials for ${selectedUser.name}?`)) {
                      await onDeleteUser(selectedUser.id);
                      setSelectedUser(null);
                    }
                  }}
                  className="flex-1 bg-white border border-error text-error py-2 rounded-lg text-xs font-bold hover:bg-error-container/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  De-allocate & Delete
                </button>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 bg-primary text-on-primary py-2 rounded-lg text-xs font-bold hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Close Profile
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
