// Custom Roles/Titles system — admin can create custom roles and assign them by email

const CUSTOM_ROLES_KEY = "renime_custom_roles";       // role definitions
const ROLE_ASSIGNMENTS_KEY = "renime_role_assignments"; // email -> roleId

export function getRoles() {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_ROLES_KEY) || "[]");
  } catch { return []; }
}

export function saveRoles(roles) {
  localStorage.setItem(CUSTOM_ROLES_KEY, JSON.stringify(roles));
  window.dispatchEvent(new Event("renime-roles-change"));
}

export function getRoleAssignments() {
  try {
    return JSON.parse(localStorage.getItem(ROLE_ASSIGNMENTS_KEY) || "{}");
  } catch { return {}; }
}

export function assignRole(email, roleId) {
  const assignments = getRoleAssignments();
  if (roleId) {
    assignments[email.toLowerCase()] = roleId;
  } else {
    delete assignments[email.toLowerCase()];
  }
  localStorage.setItem(ROLE_ASSIGNMENTS_KEY, JSON.stringify(assignments));
  window.dispatchEvent(new Event("renime-roles-change"));
}

export function getUserRole(email) {
  if (!email) return null;
  const assignments = getRoleAssignments();
  const roleId = assignments[email.toLowerCase()];
  if (!roleId) return null;
  const roles = getRoles();
  return roles.find((r) => r.id === roleId) || null;
}

export function createRole({ label, color, emoji, effect }) {
  const roles = getRoles();
  const id = Math.random().toString(36).slice(2, 8) + Date.now().toString(36);
  const newRole = { id, label, color: color || "#a855f7", emoji: emoji || "🎖️", effect: effect || "none" };
  roles.push(newRole);
  saveRoles(roles);
  return newRole;
}

export function deleteRole(roleId) {
  const roles = getRoles().filter((r) => r.id !== roleId);
  saveRoles(roles);
  // Remove assignments that used this role
  const assignments = getRoleAssignments();
  Object.keys(assignments).forEach((email) => {
    if (assignments[email] === roleId) delete assignments[email];
  });
  localStorage.setItem(ROLE_ASSIGNMENTS_KEY, JSON.stringify(assignments));
  window.dispatchEvent(new Event("renime-roles-change"));
}