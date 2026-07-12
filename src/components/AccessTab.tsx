import React, { useState } from "react";
import { ShieldAlert, ShieldCheck, Shield, Users, Plus, BrainCircuit, RefreshCw, X, Sparkles } from "lucide-react";
import { Role, PermissionSet } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface AccessTabProps {
  roles: Role[];
  onAddRole: (role: Omit<Role, "id" | "userCount" | "isCustom">) => Promise<void>;
  onUpdateRole: (id: string, updates: Partial<Role>) => Promise<void>;
}

export default function AccessTab({ roles, onAddRole, onUpdateRole }: AccessTabProps) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  
  // Custom Role creation form states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [newRolePerms, setNewRolePerms] = useState<PermissionSet>({
    read: true,
    write: false,
    delete: false,
    audit: false,
  });
  
  // AI assistant states
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);

  const handleGenerateAIDescription = async () => {
    if (!newRoleName) {
      alert("Please provide a Role Name first to generate an AI description.");
      return;
    }
    setIsGeneratingDesc(true);

    try {
      const response = await fetch("/api/generate-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newRoleName, permissions: newRolePerms }),
      });
      const data = await response.json();
      if (data.description) {
        setNewRoleDesc(data.description);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const handleCreateRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName || !newRoleDesc) return;

    await onAddRole({
      name: newRoleName,
      description: newRoleDesc,
      permissions: newRolePerms,
    });

    // Reset Form
    setNewRoleName("");
    setNewRoleDesc("");
    setNewRolePerms({ read: true, write: false, delete: false, audit: false });
    setIsCreateOpen(false);
  };

  const handleTogglePermission = async (roleId: string, permKey: keyof PermissionSet) => {
    const role = roles.find((r) => r.id === roleId);
    if (!role) return;

    const updatedPerms = {
      ...role.permissions,
      [permKey]: !role.permissions[permKey],
    };

    await onUpdateRole(roleId, { permissions: updatedPerms });

    if (selectedRole && selectedRole.id === roleId) {
      setSelectedRole({
        ...selectedRole,
        permissions: updatedPerms,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-on-surface">Instance Security Matrix</h2>
          <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">Configure role-based access tokens and security permissions</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="bg-primary text-on-primary px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-95 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> New Custom Role
        </button>
      </div>

      {/* Role list */}
      <div className="space-y-3">
        {roles.map((role) => (
          <div
            key={role.id}
            onClick={() => setSelectedRole(role)}
            className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 space-y-3 cursor-pointer hover:bg-surface-container-low transition-all"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-secondary-container rounded-lg text-on-secondary-container shrink-0">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                    {role.name}
                    {role.isCustom && (
                      <span className="text-[8px] font-black tracking-wide bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase">
                        Custom
                      </span>
                    )}
                  </h3>
                  <p className="text-[10px] text-outline flex items-center gap-1 font-medium mt-0.5">
                    <Users className="w-3 h-3" /> {role.userCount} allocated user{role.userCount === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              <span className="text-[10px] text-on-surface-variant font-medium max-w-[50%] text-right line-clamp-1">
                {role.description}
              </span>
            </div>

            {/* Permissions row representation */}
            <div className="flex items-center gap-1 bg-surface-container p-2 rounded-lg justify-between text-[10px]">
              <span className="font-bold text-on-surface-variant">Active Tokens:</span>
              <div className="flex gap-2">
                {(Object.keys(role.permissions) as Array<keyof PermissionSet>).map((perm) => (
                  <button
                    key={perm}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTogglePermission(role.id, perm);
                    }}
                    className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider cursor-pointer border ${
                      role.permissions[perm]
                        ? "bg-primary-container/20 text-primary border-primary-container/30"
                        : "bg-surface-container-lowest text-outline border-outline-variant"
                    }`}
                  >
                    {perm}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Role Details and Configuration Modal */}
      <AnimatePresence>
        {selectedRole && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRole(null)}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed inset-x-4 top-[20vh] max-w-sm mx-auto bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 z-50 shadow-xl space-y-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="text-sm font-black text-on-surface">{selectedRole.name} Configuration</h3>
                    <p className="text-[10px] text-outline font-semibold">ROLE SECURITY PROFILE</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRole(null)}
                  className="p-1 hover:bg-surface-container-low rounded-full text-outline hover:text-on-surface cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-outline uppercase tracking-wider block mb-0.5">Role Policy Statement</span>
                  <p className="text-on-surface bg-surface-container p-3 rounded-lg leading-relaxed text-xs">
                    {selectedRole.description}
                  </p>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] font-bold text-outline uppercase tracking-wider block mb-2">Toggle Permission Flags</span>
                  <div className="space-y-1.5">
                    {(Object.keys(selectedRole.permissions) as Array<keyof PermissionSet>).map((perm) => (
                      <div
                        key={perm}
                        onClick={() => handleTogglePermission(selectedRole.id, perm)}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low transition-colors cursor-pointer"
                      >
                        <span className="font-bold text-on-surface capitalize">{perm} Access</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                            selectedRole.permissions[perm]
                              ? "bg-primary-container/20 text-primary"
                              : "bg-error-container text-on-error-container"
                          }`}>
                            {selectedRole.permissions[perm] ? "Allowed" : "Restricted"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedRole(null)}
                className="w-full bg-primary text-on-primary py-2.5 rounded-lg text-xs font-bold hover:opacity-95 active:scale-95 transition-all cursor-pointer shadow-sm"
              >
                Apply Role Policies
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Create Custom Role slide-over drawer */}
      <AnimatePresence>
        {isCreateOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateOpen(false)}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-surface-container-lowest border-t border-outline-variant rounded-t-2xl p-6 z-50 overflow-y-auto space-y-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" /> Create Custom Security Role
                </h3>
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="p-1.5 hover:bg-surface-container-low rounded-full text-outline hover:text-on-surface cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateRoleSubmit} className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Role Identifier / Name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-white border border-outline-variant rounded-lg p-2.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="Support_Level_3"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center mb-0.5">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Role Description</label>
                    <button
                      type="button"
                      onClick={handleGenerateAIDescription}
                      disabled={isGeneratingDesc}
                      className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline cursor-pointer disabled:opacity-50"
                    >
                      {isGeneratingDesc ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" /> Drafting Statement...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3" /> Auto-Draft Description with AI
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    required
                    rows={3}
                    className="w-full bg-white border border-outline-variant rounded-lg p-2.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary leading-relaxed"
                    placeholder="Custom privilege statement detailing access controls and data retention scope..."
                    value={newRoleDesc}
                    onChange={(e) => setNewRoleDesc(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide block">Grant Permissions</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(newRolePerms) as Array<keyof PermissionSet>).map((perm) => (
                      <div
                        key={perm}
                        onClick={() => setNewRolePerms({
                          ...newRolePerms,
                          [perm]: !newRolePerms[perm]
                        })}
                        className={`p-3 rounded-lg border text-xs font-bold capitalize flex items-center justify-between cursor-pointer transition-all ${
                          newRolePerms[perm]
                            ? "bg-primary-container/10 border-primary text-primary"
                            : "bg-white border-outline-variant text-on-surface-variant"
                        }`}
                      >
                        <span>{perm} Access</span>
                        <input
                          type="checkbox"
                          checked={newRolePerms[perm]}
                          readOnly
                          className="rounded text-primary focus:ring-primary"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-on-primary py-3 rounded-lg font-semibold text-sm hover:opacity-95 active:scale-95 transition-all cursor-pointer shadow-sm mt-4"
                >
                  Deploy Role to ServiceNow Schema
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
