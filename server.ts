import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { User, Role, Task, Activity, UserStatus, TaskStatus } from "./src/types";

// Load environment variables
dotenv.config();

// Standard express server initialization
const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory Database state
let users: User[] = [
  {
    id: "user-1",
    name: "Elena Rodriguez",
    email: "elena.rodriguez@enterprise.com",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDMROP6AKt2impsW4yE6nTzZrRrSp1bkydZ5hjAaTFOZkWKad4-XHnWmgnpo6MSH2PkXJDTJcQk-xQF_EcbKscRYaPqIpjgcOcvSiguGtNJCUah4bABR-eynqY1RzuFBa73nSViPVs5XkPwb_0_6DR7XCEE4v-CvtFsdyi8lYF_TW13Zzk14aa5gSQRua4YW652P4_i_mrIjxC_aP1VjLT4RdVjobr7AXqUIXbpKt7p3suSD7QX_OkYIQ",
    role: "PM",
    status: UserStatus.ACTIVE,
    lastLogin: "3 minutes ago",
    department: "Project Management",
    securityLevel: "L3 - Manager Access",
    assignedRoles: ["PM_Core", "Finance_Read"]
  },
  {
    id: "user-2",
    name: "Marcus Chen",
    email: "marcus.chen@enterprise.com",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBk8lTS5vy-H-h34ERkR7uPmVkExJYHdbupuk3lh1et4D63B5Zns5j4OIxQNSvz_272txKvNAZP_TicC8-nno6VvwDHwYxbxZryeK-VQOAvtmX8K7O6-hgQ7GB15xCBX5-4Wul4W3VMsVYPwYXOtyPljshtNrMYZ6cQN6iInFK11DAP4j0_XJxPYK7hiZmG76C6g08u3UCAwXSUe2oXNaPXUZfvBdehMqNB3wlk3CFQYtT7KD6sx7KcpA",
    role: "Team Member",
    status: UserStatus.INACTIVE,
    lastLogin: "1 day ago",
    department: "Engineering Development",
    securityLevel: "L1 - Basic Developer",
    assignedRoles: ["Developer_Core"]
  },
  {
    id: "user-3",
    name: "Sarah Jenkins",
    email: "s.jenkins@enterprise.com",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBtGuTPs1g7IZtH5IleLiSerM7pRPDsbfLqdYZf6SdRRXyGIb98eIPYed8OJY-a1-Dqi9FsCgi8pEfmmMVKkJgWLYxlhMFxwkur6On5x0JnhqkGMko6xHw7F3KaGWIo51ZdetevbdgJV2o24k92AGt79lFvf8Oqtok7IMEmDRHDlVqpfJUevtiUaMnhTc57fMi2wsb2v-O9GycoFr9Q36dv5kIc0nm7WadCCESdZnAhyDxZ-yUOEXOwHQ",
    role: "PM",
    status: UserStatus.ACTIVE,
    lastLogin: "14 minutes ago",
    department: "Security Audit Dept",
    securityLevel: "L4 - Global Admin",
    assignedRoles: ["Global Admin", "Security_Audit"]
  },
  {
    id: "user-4",
    name: "David Okafor",
    email: "d.okafor@enterprise.com",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAHYEJCDAZ0jXVNcHqNF2dvs8zd9OzKm8m9pOtU1GvV68Ez3_2kYYKPWTActbe5NDsgrnSO-RfiJukMCfIJhXHjzxKQ_d1isDwj7FiyUprccvIGF4aKj9PVegsWmPParlOLZjvo-lTClZYU5qX2yeNy2hGhlRlSFQfE3e1Btd7h0tVeuRsyKkVr6zpp_Q0vC_3TJUmGBiykzWutslSmtcCEQG86wXNF2GVe4j0VfzlPim-gRIUqAWk8sg",
    role: "Team Member",
    status: UserStatus.ACTIVE,
    lastLogin: "2 hours ago",
    department: "Product Engineering",
    securityLevel: "L2 - Intermediate Access",
    assignedRoles: ["Developer_Core", "Finance_Read"]
  },
  {
    id: "user-5",
    name: "Amina Al-Farsi",
    email: "amina.f@enterprise.com",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBtjO6TN15bP1K1XphLDOLOwOgQv-AwDF3ygq1nX5ZcdAnaqhRtAcIsvH0PvZFszq1pbZks8ZgU2ZhBrp4SDY8q9JQ3TjUp7JIGNzBeeXJC_gC2oT8o0Yn7tpnPDwaHL9FzVc1yfciXxprLGArYsj7H8q-Fr-itsH5xoXCRRmKLk3tFFWDivJ7I3rp6rghBMxZIxkNn4yeWoxrZ4NaLtU_x7mIONgn_DDaJUIfbQP-jiJkb-tK0jZumDg",
    role: "Team Member",
    status: UserStatus.ACTIVE,
    lastLogin: "5 hours ago",
    department: "Infrastructure Ops",
    securityLevel: "L2 - Intermediate Access",
    assignedRoles: ["Developer_Core", "Database_Admin"]
  }
];

let roles: Role[] = [
  {
    id: "role-1",
    name: "Global Admin",
    description: "Full access to modify all instance properties, firewall configurations, security protocols, and role mappings.",
    userCount: 1,
    permissions: { read: true, write: true, delete: true, audit: true },
    isCustom: false
  },
  {
    id: "role-2",
    name: "Security_Audit",
    description: "Read-only access to firewall metrics and event logs. Allowed to run full instance vulnerability scans.",
    userCount: 2,
    permissions: { read: true, write: false, delete: false, audit: true },
    isCustom: false
  },
  {
    id: "role-3",
    name: "Finance_Read",
    description: "Read-only ledger access to billing, resource allocation data, and general audit reports.",
    userCount: 3,
    permissions: { read: true, write: false, delete: false, audit: false },
    isCustom: false
  },
  {
    id: "role-4",
    name: "Developer_Core",
    description: "Standard developer environment access, database schema modification and code deployment.",
    userCount: 3,
    permissions: { read: true, write: true, delete: false, audit: false },
    isCustom: false
  },
  {
    id: "role-5",
    name: "Database_Admin",
    description: "Access to alter schema definitions, manage replication configurations, and optimize execution queries.",
    userCount: 1,
    permissions: { read: true, write: true, delete: true, audit: false },
    isCustom: true
  }
];

let tasks: Task[] = [
  {
    id: "task-1",
    title: "API Gateway Firewall Config",
    assigneeId: "user-3",
    assigneeName: "Sarah Jenkins",
    assigneeAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBtGuTPs1g7IZtH5IleLiSerM7pRPDsbfLqdYZf6SdRRXyGIb98eIPYed8OJY-a1-Dqi9FsCgi8pEfmmMVKkJgWLYxlhMFxwkur6On5x0JnhqkGMko6xHw7F3KaGWIo51ZdetevbdgJV2o24k92AGt79lFvf8Oqtok7IMEmDRHDlVqpfJUevtiUaMnhTc57fMi2wsb2v-O9GycoFr9Q36dv5kIc0nm7WadCCESdZnAhyDxZ-yUOEXOwHQ",
    dueDate: "Oct 24",
    status: TaskStatus.BLOCKED,
    description: "Firewall rules for port 443 proxy configuration must be aligned with ServiceNow secure egress guidelines."
  },
  {
    id: "task-2",
    title: "Database Schema Audit",
    assigneeId: "user-2",
    assigneeName: "Marcus Chen",
    assigneeAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBk8lTS5vy-H-h34ERkR7uPmVkExJYHdbupuk3lh1et4D63B5Zns5j4OIxQNSvz_272txKvNAZP_TicC8-nno6VvwDHwYxbxZryeK-VQOAvtmX8K7O6-hgQ7GB15xCBX5-4Wul4W3VMsVYPwYXOtyPljshtNrMYZ6cQN6iInFK11DAP4j0_XJxPYK7hiZmG76C6g08u3UCAwXSUe2oXNaPXUZfvBdehMqNB3wlk3CFQYtT7KD6sx7KcpA",
    dueDate: "Oct 28",
    status: TaskStatus.IN_PROGRESS,
    description: "Audit current custom tables in Finance scope to verify normalization requirements and key indexing."
  },
  {
    id: "task-3",
    title: "LDAP Sync Implementation",
    assigneeId: "user-5",
    assigneeName: "Amina Al-Farsi",
    assigneeAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBtjO6TN15bP1K1XphLDOLOwOgQv-AwDF3ygq1nX5ZcdAnaqhRtAcIsvH0PvZFszq1pbZks8ZgU2ZhBrp4SDY8q9JQ3TjUp7JIGNzBeeXJC_gC2oT8o0Yn7tpnPDwaHL9FzVc1yfciXxprLGArYsj7H8q-Fr-itsH5xoXCRRmKLk3tFFWDivJ7I3rp6rghBMxZIxkNn4yeWoxrZ4NaLtU_x7mIONgn_DDaJUIfbQP-jiJkb-tK0jZumDg",
    dueDate: "Oct 30",
    status: TaskStatus.IN_PROGRESS,
    description: "Synchronize user database profiles with Azure AD instance using the ServiceNow LDAP module."
  },
  {
    id: "task-4",
    title: "Provision Sandbox Instance",
    assigneeId: "user-1",
    assigneeName: "Elena Rodriguez",
    assigneeAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDMROP6AKt2impsW4yE6nTzZrRrSp1bkydZ5hjAaTFOZkWKad4-XHnWmgnpo6MSH2PkXJDTJcQk-xQF_EcbKscRYaPqIpjgcOcvSiguGtNJCUah4bABR-eynqY1RzuFBa73nSViPVs5XkPwb_0_6DR7XCEE4v-CvtFsdyi8lYF_TW13Zzk14aa5gSQRua4YW652P4_i_mrIjxC_aP1VjLT4RdVjobr7AXqUIXbpKt7p3suSD7QX_OkYIQ",
    dueDate: "Completed",
    status: TaskStatus.COMPLETED,
    doneBy: "Admin User",
    description: "Create an isolated testing node for verifying role mappings without risking production data integrity."
  }
];

let activities: Activity[] = [
  {
    id: "act-1",
    type: "assign" as const,
    user: "Sarah Jenkins",
    role: "Global Admin",
    message: "Sarah Jenkins was assigned Global Admin role",
    time: "14 minutes ago",
    system: "Security Audit Dept",
    severity: "info" as const
  },
  {
    id: "act-2",
    type: "mismatch" as const,
    message: "Permission mismatch detected in Finance_Read role",
    time: "2 hours ago",
    system: "Auto-Scan System",
    severity: "warning" as const
  },
  {
    id: "act-3",
    type: "task_completed" as const,
    message: "Task #8812 completed: Batch role revocation",
    time: "5 hours ago",
    system: "Admin: David L.",
    severity: "success" as const
  }
];

let systemHealth = {
  apiLatency: 42,
  cloudSync: 100,
  status: "Operational" as const,
  lastAuditTime: "2 hours ago"
};

// Lazy initialization of GoogleGenAI SDK to prevent startup crash if API Key is missing
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }
  return aiClient;
}

// REST API Endpoints

// Authentication API
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  // Simple validation for enterprise demo
  const user = users.find(u => u.email.toLowerCase() === username.toLowerCase());
  
  if (user || username === "admin@service-now.com") {
    const sessionUser = user || {
      id: "admin-id",
      name: "David L.",
      email: "admin@service-now.com",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBYhmP4_3uTRkp9hTIQh88KaApx_8Gv3QQ0KRemDOB2TZQIFUyvT_UWw5gSSDhDyfQhm-iPn1R51gWtbmU5pw8IG5VYF3lSEZ6f6MafbTqeRSlvG_zZyPcno4b25sQT3IMuTy7mUvblps_IEDsJ7gdwGofHHQ-bCrQMy0n7L0pZVJU579b-iPEak8I-XoJL8qGv5wMERF12BoUzhwtX460TkesFH0w5RIh3bpZsFQtwA47sIl7rCbBzuQ",
      role: "Global Admin",
    };

    return res.json({
      token: "mock-session-token-12345",
      user: {
        name: sessionUser.name,
        email: sessionUser.email,
        avatar: sessionUser.avatar,
        role: sessionUser.role,
      }
    });
  }

  return res.status(401).json({ error: "Invalid email or credentials" });
});

// System Health API
app.get("/api/system/health", (req, res) => {
  res.json(systemHealth);
});

// Users API
app.get("/api/users", (req, res) => {
  res.json(users);
});

app.post("/api/users", (req, res) => {
  const { name, email, role, department, securityLevel, assignedRoles, status } = req.body;
  if (!name || !email || !role) {
    return res.status(400).json({ error: "Name, email, and role are required." });
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    name,
    email,
    avatar: `https://lh3.googleusercontent.com/aida-public/AB6AXuBYhmP4_3uTRkp9hTIQh88KaApx_8Gv3QQ0KRemDOB2TZQIFUyvT_UWw5gSSDhDyfQhm-iPn1R51gWtbmU5pw8IG5VYF3lSEZ6f6MafbTqeRSlvG_zZyPcno4b25sQT3IMuTy7mUvblps_IEDsJ7gdwGofHHQ-bCrQMy0n7L0pZVJU579b-iPEak8I-XoJL8qGv5wMERF12BoUzhwtX460TkesFH0w5RIh3bpZsFQtwA47sIl7rCbBzuQ`, // standard fall back avatar
    role: role as "PM" | "Team Member",
    status: (status || UserStatus.ACTIVE) as UserStatus,
    lastLogin: "Just Created",
    department: department || "Enterprise Operations",
    securityLevel: securityLevel || "L1 - Basic Access",
    assignedRoles: assignedRoles || []
  };

  users.push(newUser);

  // Auto add activity log
  activities.unshift({
    id: `act-${Date.now()}`,
    type: "assign",
    user: name,
    message: `${name} has been enrolled in ServiceNow Roster with security level ${newUser.securityLevel}.`,
    time: "Just now",
    system: "Admin Enroller",
    severity: "success"
  });

  res.status(201).json(newUser);
});

app.put("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const index = users.findIndex(u => u.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  users[index] = {
    ...users[index],
    ...req.body
  };

  res.json(users[index]);
});

app.delete("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const userToDelete = users.find(u => u.id === id);
  users = users.filter(u => u.id !== id);
  
  if (userToDelete) {
    activities.unshift({
      id: `act-${Date.now()}`,
      type: "mismatch",
      message: `User ${userToDelete.name} has been offboarded and de-allocated from roles.`,
      time: "Just now",
      system: "Identity Service",
      severity: "warning"
    });
  }

  res.json({ success: true });
});

// Roles API
app.get("/api/roles", (req, res) => {
  res.json(roles);
});

app.post("/api/roles", (req, res) => {
  const { name, description, permissions } = req.body;
  if (!name || !description) {
    return res.status(400).json({ error: "Name and description are required." });
  }

  const newRole = {
    id: `role-${Date.now()}`,
    name,
    description,
    userCount: 0,
    permissions: permissions || { read: true, write: false, delete: false, audit: false },
    isCustom: true
  };

  roles.push(newRole);

  activities.unshift({
    id: `act-${Date.now()}`,
    type: "assign",
    message: `Custom role '${name}' was initialized and deployed to production state.`,
    time: "Just now",
    system: "RBAC Module",
    severity: "success"
  });

  res.status(201).json(newRole);
});

app.put("/api/roles/:id", (req, res) => {
  const { id } = req.params;
  const index = roles.findIndex(r => r.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Role not found" });
  }

  roles[index] = {
    ...roles[index],
    ...req.body
  };

  res.json(roles[index]);
});

// Tasks API
app.get("/api/tasks", (req, res) => {
  res.json(tasks);
});

app.post("/api/tasks", (req, res) => {
  const { title, assigneeId, dueDate, description } = req.body;
  if (!title || !assigneeId) {
    return res.status(400).json({ error: "Title and Assignee are required." });
  }

  const assignee = users.find(u => u.id === assigneeId) || users[0];

  const newTask: Task = {
    id: `task-${Date.now()}`,
    title,
    assigneeId,
    assigneeName: assignee.name,
    assigneeAvatar: assignee.avatar,
    dueDate: dueDate || "Due Soon",
    status: TaskStatus.IN_PROGRESS,
    description: description || ""
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

app.put("/api/tasks/:id", (req, res) => {
  const { id } = req.params;
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  const oldTask = tasks[index];
  tasks[index] = {
    ...tasks[index],
    ...req.body
  };

  // If completed, add an activity feed event
  if (req.body.status === "Completed" && oldTask.status !== "Completed") {
    activities.unshift({
      id: `act-${Date.now()}`,
      type: "task_completed",
      message: `Task completed: ${tasks[index].title}`,
      time: "Just now",
      system: `Admin: ${tasks[index].assigneeName}`,
      severity: "success"
    });
  }

  res.json(tasks[index]);
});

// Activities API
app.get("/api/activities", (req, res) => {
  res.json(activities);
});

// AI Gemini Security Audit API Route
app.post("/api/security-audit", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Graceful fallback with detailed mock findings if Gemini is not configured yet
      return res.json({
        findings: [
          {
            title: "Finance_Read Role Permissiveness Warning",
            description: "An administrative auto-scan found that 'Finance_Read' possesses an active 'read' status but is assigned to multiple non-financial roles, potentially violating standard corporate data-segregation compliance.",
            impact: "Medium",
            resolution: "Inspect role permissions under the Access panel and un-assign users who are not part of the Financial department."
          },
          {
            title: "Super-Admin Over-allocation Anomaly",
            description: "There is currently 1 Active Global Admin, but 2 users hold highly-permissive access levels. Access control suggests limiting Global Admin roles to designated emergency personnel only.",
            impact: "High",
            resolution: "Enforce Multi-Factor Authentication (SSO / 2FA) or implement standard batch role revocation tasks to limit admin sprawl."
          },
          {
            title: "Dangling Blocked Firewall Task",
            description: "The 'API Gateway Firewall Config' is blocked, which holds back the Q3 security audit sync. This can cause the cloud sync to delay past the Q3 compliance deadline.",
            impact: "Low",
            resolution: "Re-assign the task or resolve the security audit dependency with Sarah Jenkins."
          }
        ],
        auditScore: 88,
        explanation: "This is a local security intelligence preview. Configure your GEMINI_API_KEY in the AI Studio secrets configuration to unlock live model-generated corporate audits."
      });
    }

    const ai = getGeminiClient();

    // Prepare systemic prompt with current actual active roles, users, and tasks!
    const activeRolesDetails = roles.map(r => `Role: ${r.name}, Desc: ${r.description}, Permissions: ${JSON.stringify(r.permissions)}, Users Assigned: ${r.userCount}`).join("\n");
    const activeUsersDetails = users.map(u => `User: ${u.name}, Email: ${u.email}, Security Level: ${u.securityLevel}, Roles: ${JSON.stringify(u.assignedRoles)}`).join("\n");
    const activeTasksDetails = tasks.map(t => `Task: ${t.title}, Status: ${t.status}, Assignee: ${t.assigneeName}`).join("\n");

    const prompt = `You are a professional Enterprise Security and RBAC Auditor for a ServiceNow instance.
Analyze the following active security state of our instance:

ROLES CONFIGURED:
${activeRolesDetails}

USERS ROSTER:
${activeUsersDetails}

ACTIVE SYSTEM TASKS:
${activeTasksDetails}

Please identify 3 key security vulnerabilities, permission mismatches, or system synchronization bottlenecks in our configurations.
Return the result in standard JSON format exactly matching the schema.

Your JSON response must contain:
1. "findings": An array of objects, where each object has:
   - "title" (string): short title of vulnerability or anomaly.
   - "description" (string): precise explanation of what is wrong.
   - "impact" (string): "High", "Medium", or "Low"
   - "resolution" (string): direct step-by-step recommendation to remediate.
2. "auditScore" (number): a score from 1 to 100 assessing the overall security health of this instance.
3. "explanation" (string): brief 2-3 sentence overview summary of your compliance findings.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            findings: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  impact: { type: Type.STRING },
                  resolution: { type: Type.STRING }
                },
                required: ["title", "description", "impact", "resolution"]
              }
            },
            auditScore: { type: Type.INTEGER },
            explanation: { type: Type.STRING }
          },
          required: ["findings", "auditScore", "explanation"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.error("Gemini Security Audit Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate security audit report." });
  }
});

// AI Gemini Generate Role Description API Route
app.post("/api/generate-role", async (req, res) => {
  const { name, permissions } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Role name is required." });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Fallback description
      const permString = Object.entries(permissions || {})
        .filter(([_, val]) => val)
        .map(([key]) => key.toUpperCase())
        .join(", ");
      return res.json({
        description: `Custom ServiceNow Admin role designed to administer permissions. Standard privilege set configured with: [${permString || 'NONE'}]. Optimized for enterprise workflows.`
      });
    }

    const ai = getGeminiClient();
    const prompt = `Create a single, highly professional, compact enterprise security policy description for a new ServiceNow Role named: '${name}'.
The role has the following security permissions configured:
Read Access: ${permissions?.read ? "ENABLED" : "DISABLED"}
Write Access: ${permissions?.write ? "ENABLED" : "DISABLED"}
Delete Access: ${permissions?.delete ? "ENABLED" : "DISABLED"}
Audit Access: ${permissions?.audit ? "ENABLED" : "DISABLED"}

Write a clean, 2-sentence formal description detailing what an operator assigned to this role can do under compliance frameworks (e.g. SOC2, ISO27001). Do not include any filler text.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ description: response.text?.trim() });
  } catch (error: any) {
    console.error("Gemini Generate Role Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate role description." });
  }
});

// Vite middleware setup or production static files serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
