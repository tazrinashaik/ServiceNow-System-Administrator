import React, { useState } from "react";
import { ListTodo, CheckCircle, Clock, AlertOctagon, Plus, ChevronRight, X, User as UserIcon, Calendar, Trash2 } from "lucide-react";
import { Task, TaskStatus, User } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface TasksTabProps {
  tasks: Task[];
  users: User[];
  onAddTask: (task: Omit<Task, "id" | "assigneeName" | "assigneeAvatar">) => Promise<void>;
  onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
}

export default function TasksTab({
  tasks,
  users,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
}: TasksTabProps) {
  const [activeFilter, setActiveFilter] = useState<"All" | "Assigned to Me" | "Blocked" | "Completed">("All");
  
  // Create task states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newAssigneeId, setNewAssigneeId] = useState(users[0]?.id || "");
  const [newDueDate, setNewDueDate] = useState("Oct 25");

  // Selected task state for completion/toggles
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Stats calculation
  const completedCount = tasks.filter((t) => t.status === TaskStatus.COMPLETED).length;
  const inProgressCount = tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length;
  const blockedCount = tasks.filter((t) => t.status === TaskStatus.BLOCKED).length;
  const totalCount = tasks.length;
  const overallProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filter computation
  const filteredTasks = tasks.filter((t) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Blocked") return t.status === TaskStatus.BLOCKED;
    if (activeFilter === "Completed") return t.status === TaskStatus.COMPLETED;
    if (activeFilter === "Assigned to Me") {
      // For demo, we consider PM tasks assigned to Sarah Jenkins or user-3 "Assigned to Me"
      return t.assigneeId === "user-3";
    }
    return true;
  });

  const handleCreateTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newAssigneeId) return;

    await onAddTask({
      title: newTitle,
      assigneeId: newAssigneeId,
      dueDate: newDueDate,
      status: TaskStatus.IN_PROGRESS,
      description: newDesc,
    });

    // Reset Form
    setNewTitle("");
    setNewDesc("");
    setNewDueDate("Oct 25");
    setIsCreateOpen(false);
  };

  const handleToggleTaskStatus = async (task: Task) => {
    let nextStatus: TaskStatus;
    if (task.status === TaskStatus.BLOCKED) {
      nextStatus = TaskStatus.IN_PROGRESS;
    } else if (task.status === TaskStatus.IN_PROGRESS) {
      nextStatus = TaskStatus.COMPLETED;
    } else {
      nextStatus = TaskStatus.BLOCKED;
    }

    await onUpdateTask(task.id, {
      status: nextStatus,
      doneBy: nextStatus === TaskStatus.COMPLETED ? "Admin User" : undefined,
    });

    if (selectedTask && selectedTask.id === task.id) {
      setSelectedTask({
        ...selectedTask,
        status: nextStatus,
        doneBy: nextStatus === TaskStatus.COMPLETED ? "Admin User" : undefined,
      });
    }
  };

  return (
    <div className="space-y-6 pb-6 relative">
      {/* Project Progress Header (Bento Style Card) */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-base font-bold text-on-surface">Q3 System Migration</h1>
            <p className="text-[10px] text-on-surface-variant font-semibold">Admin Console • IT Infrastructure</p>
          </div>
          <span className="text-[9px] font-black tracking-wider px-2.5 py-0.5 bg-secondary-container text-on-secondary-container rounded-full uppercase">
            Active
          </span>
        </div>

        <div className="mt-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-on-surface-variant">Overall Progress</span>
            <span className="text-xs font-bold text-primary font-mono">{overallProgress}%</span>
          </div>
          <div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden border border-outline-variant/35">
            <div
              className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-5">
          <div className="p-2.5 border border-outline-variant rounded-lg bg-surface text-center">
            <p className="text-[9px] font-bold text-outline uppercase tracking-wider mb-0.5">Completed</p>
            <p className="text-sm font-black text-primary">{completedCount}</p>
          </div>
          <div className="p-2.5 border border-outline-variant rounded-lg bg-surface text-center">
            <p className="text-[9px] font-bold text-outline uppercase tracking-wider mb-0.5">In Progress</p>
            <p className="text-sm font-black text-secondary">{inProgressCount}</p>
          </div>
          <div className="p-2.5 border border-outline-variant rounded-lg bg-surface text-center">
            <p className="text-[9px] font-bold text-outline uppercase tracking-wider mb-0.5">Blocked</p>
            <p className="text-sm font-black text-error">{blockedCount}</p>
          </div>
        </div>
      </section>

      {/* Task List Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {(["All", "Assigned to Me", "Blocked", "Completed"] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer border transition-all ${
              activeFilter === filter
                ? "bg-primary text-on-primary border-primary shadow-sm"
                : "bg-surface-container border-outline-variant text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            {filter === "All" ? "All Tasks" : filter}
          </button>
        ))}
      </div>

      {/* Task List Categorizations */}
      <div className="space-y-6">
        {/* Urgent & Blocked Tasks */}
        {filteredTasks.some((t) => t.status === TaskStatus.BLOCKED) && (
          <div className="space-y-2">
            <h3 className="text-[10px] font-black text-error uppercase tracking-wider px-1">Urgent & Blocked</h3>
            {filteredTasks
              .filter((t) => t.status === TaskStatus.BLOCKED)
              .map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTask(t)}
                  className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex items-center justify-between group hover:border-error transition-all duration-200 cursor-pointer"
                >
                  <div className="flex-1 pr-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <AlertOctagon className="w-4 h-4 text-error shrink-0" />
                      <h4 className="text-xs font-bold text-on-surface leading-tight">{t.title}</h4>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[10px] text-on-surface-variant">
                        <UserIcon className="w-3 h-3" />
                        <span>{t.assigneeName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-error font-semibold">
                        <Calendar className="w-3 h-3" />
                        <span>{t.dueDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-[9px] font-bold px-2 py-0.5 bg-error-container text-on-error-container rounded uppercase">
                      Blocked
                    </span>
                    <ChevronRight className="w-4 h-4 text-outline" />
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* In Progress Tasks */}
        {filteredTasks.some((t) => t.status === TaskStatus.IN_PROGRESS) && (
          <div className="space-y-2">
            <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider px-1">In Progress</h3>
            <div className="divide-y divide-outline-variant border border-outline-variant rounded-xl bg-surface-container-lowest overflow-hidden">
              {filteredTasks
                .filter((t) => t.status === TaskStatus.IN_PROGRESS)
                .map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTask(t)}
                    className="p-4 flex items-center justify-between hover:bg-surface-container-low transition-colors cursor-pointer border-l-2 border-primary"
                  >
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-on-surface leading-tight">{t.title}</h4>
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="w-5 h-5 rounded-full bg-secondary-container flex items-center justify-center overflow-hidden border">
                          <img className="w-full h-full object-cover" src={t.assigneeAvatar} alt={t.assigneeName} />
                        </div>
                        <span className="text-[10px] text-on-surface-variant font-medium">{t.assigneeName}</span>
                        <span className="text-outline text-[10px]">•</span>
                        <span className="text-[10px] text-on-surface-variant font-medium flex items-center gap-0.5">
                          <Calendar className="w-3 h-3" /> Due {t.dueDate}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-[9px] font-bold px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded uppercase">
                        Active
                      </span>
                      <ChevronRight className="w-4 h-4 text-outline opacity-40" />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Completed Tasks */}
        {filteredTasks.some((t) => t.status === TaskStatus.COMPLETED) && (
          <div className="space-y-2 opacity-65">
            <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider px-1">Completed</h3>
            <div className="divide-y divide-outline-variant border border-outline-variant rounded-xl bg-surface-container-low overflow-hidden">
              {filteredTasks
                .filter((t) => t.status === TaskStatus.COMPLETED)
                .map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTask(t)}
                    className="p-4 flex items-center justify-between hover:bg-surface-container-low transition-colors cursor-pointer"
                  >
                    <div className="flex-1 line-through decoration-on-surface-variant decoration-1">
                      <h4 className="text-xs font-bold text-on-surface leading-tight">{t.title}</h4>
                      <p className="text-[10px] text-on-surface-variant mt-0.5">Done by {t.doneBy || "Admin User"}</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                  </div>
                ))}
            </div>
          </div>
        )}

        {filteredTasks.length === 0 && (
          <div className="p-8 text-center bg-surface-container-lowest border border-outline-variant rounded-xl text-xs text-outline">
            No active migration tasks matched this filter category.
          </div>
        )}
      </div>

      {/* FAB - Add Task */}
      <button
        onClick={() => setIsCreateOpen(true)}
        className="fixed bottom-20 right-6 w-14 h-14 bg-primary text-on-primary rounded-2xl shadow-lg flex items-center justify-center active:scale-90 hover:opacity-95 transition-all z-40 cursor-pointer"
      >
        <Plus className="w-6 h-6 text-white" />
      </button>

      {/* Create Task Slide-over */}
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
                  <ListTodo className="w-5 h-5 text-primary" /> Create Migration Task
                </h3>
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="p-1.5 hover:bg-surface-container-low rounded-full text-outline hover:text-on-surface cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTaskSubmit} className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Task Title</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-white border border-outline-variant rounded-lg p-2.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="Configure Secure Token Auth"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Assignee</label>
                  <select
                    className="w-full bg-white border border-outline-variant rounded-lg p-2.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    value={newAssigneeId}
                    onChange={(e) => setNewAssigneeId(e.target.value)}
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Due Date</label>
                    <input
                      type="text"
                      className="w-full bg-white border border-outline-variant rounded-lg p-2.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      placeholder="Oct 31"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Task Details</label>
                  <textarea
                    rows={3}
                    className="w-full bg-white border border-outline-variant rounded-lg p-2.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary leading-relaxed"
                    placeholder="Provide compliance mandates and technical details..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-on-primary py-3 rounded-lg font-semibold text-sm hover:opacity-95 active:scale-95 transition-all cursor-pointer shadow-sm mt-4"
                >
                  Create & Assign Task
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Task Details and Status toggler Modal */}
      <AnimatePresence>
        {selectedTask && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTask(null)}
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
                  <ListTodo className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="text-xs font-black text-on-surface">Migration Task Overview</h3>
                    <p className="text-[9px] text-outline font-semibold uppercase tracking-wider">Audit Controls</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="p-1 hover:bg-surface-container-low rounded-full text-outline hover:text-on-surface cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 pt-2 border-t border-outline-variant text-xs">
                <div>
                  <h4 className="font-bold text-on-surface text-xs leading-tight mb-1">{selectedTask.title}</h4>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed bg-surface-container p-2.5 rounded">
                    {selectedTask.description || "No description provided for this SOC2 milestone."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-[9px] font-bold text-outline uppercase tracking-wider block mb-0.5">Assigned Owner</span>
                    <div className="flex items-center gap-1.5">
                      <img className="w-4 h-4 rounded-full" src={selectedTask.assigneeAvatar} alt={selectedTask.assigneeName} />
                      <span className="text-on-surface font-semibold">{selectedTask.assigneeName}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-outline uppercase tracking-wider block mb-0.5">Due Compliance Date</span>
                    <span className="text-on-surface font-semibold">{selectedTask.dueDate}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-outline-variant flex justify-between items-center">
                  <div>
                    <span className="text-[9px] font-bold text-outline uppercase tracking-wider block mb-0.5">Current Status</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      selectedTask.status === TaskStatus.COMPLETED ? "bg-primary-container/20 text-primary" :
                      selectedTask.status === TaskStatus.BLOCKED ? "bg-error-container text-on-error-container" :
                      "bg-secondary-container text-on-secondary-container"
                    }`}>
                      {selectedTask.status}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleTaskStatus(selectedTask)}
                    className="bg-surface-container border border-outline-variant px-2.5 py-1 rounded text-[10px] font-bold text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface active:scale-95 transition-all cursor-pointer"
                  >
                    {selectedTask.status === TaskStatus.COMPLETED ? "Re-open Task" : "Toggle Status"}
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-outline-variant">
                <button
                  onClick={async () => {
                    if (confirm(`Remove and delete migration task: '${selectedTask.title}'?`)) {
                      await onDeleteTask(selectedTask.id);
                      setSelectedTask(null);
                    }
                  }}
                  className="flex-1 bg-white border border-error text-error py-2 rounded-lg text-xs font-bold hover:bg-error-container/20 active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Task
                </button>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="flex-1 bg-primary text-on-primary py-2 rounded-lg text-xs font-bold hover:opacity-95 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                >
                  Close Controls
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
