"use client";
import { useState } from "react";
import { Plus, Pencil, Trash2, Shield, UserCheck, UserX } from "lucide-react";
import { Button, Badge, Card, CardHeader, CardTitle, CardBody, Table, Th, Td, Tr, Modal, Input, Select } from "@/app/admin/_components/ui";
import { mockUsers, type AdminUser } from "@/app/admin/_data/mock";

const ROLE_VARIANTS: Record<AdminUser["role"], "purple"|"blue"|"gray"> = {
  "Super Admin": "purple",
  "Admin":       "blue",
  "Editor":      "gray",
};

const ROLE_OPTIONS = [
  { value: "Super Admin", label: "Super Admin" },
  { value: "Admin",       label: "Admin"       },
  { value: "Editor",      label: "Editor"      },
];

interface UserForm { name: string; email: string; role: AdminUser["role"]; password: string; }
const emptyForm: UserForm = { name: "", email: "", role: "Editor", password: "" };

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>(mockUsers);
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);

  const set = (k: keyof UserForm, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const openAdd = () => { setForm(emptyForm); setAddOpen(true); };
  const openEdit = (u: AdminUser) => {
    setEditTarget(u);
    setForm({ name: u.name, email: u.email, role: u.role, password: "" });
    setAddOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.email) return;
    if (editTarget) {
      setUsers((prev) => prev.map((u) => u.id === editTarget.id
        ? { ...u, name: form.name, email: form.email, role: form.role }
        : u));
    } else {
      const newUser: AdminUser = {
        id: Math.max(...users.map((u) => u.id)) + 1,
        name: form.name, email: form.email,
        role: form.role, status: "active",
        lastLogin: "Never",
      };
      setUsers((prev) => [...prev, newUser]);
    }
    setAddOpen(false);
    setEditTarget(null);
  };

  const handleDelete = () => {
    if (deleteTarget) setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const toggleStatus = (id: number) => {
    setUsers((prev) => prev.map((u) => u.id === id
      ? { ...u, status: u.status === "active" ? "inactive" : "active" }
      : u));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardBody className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Admins</p>
              <p className="text-2xl font-bold text-slate-800">{users.length}</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Active</p>
              <p className="text-2xl font-bold text-slate-800">{users.filter((u) => u.status === "active").length}</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
              <UserX className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Inactive</p>
              <p className="text-2xl font-bold text-slate-800">{users.filter((u) => u.status === "inactive").length}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={openAdd}><Plus className="w-4 h-4" />Add Admin User</Button>
      </div>

      <Card>
        <Table>
          <thead>
            <tr>
              <Th>User</Th><Th>Role</Th><Th>Status</Th><Th>Last Login</Th><Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <Tr key={u.id}>
                <Td>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{u.name}</p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </div>
                  </div>
                </Td>
                <Td><Badge label={u.role} variant={ROLE_VARIANTS[u.role]} /></Td>
                <Td>
                  {u.status === "active"
                    ? <Badge label="Active"   variant="green" />
                    : <Badge label="Inactive" variant="gray"  />}
                </Td>
                <Td className="text-xs text-slate-400">{u.lastLogin}</Td>
                <Td>
                  <div className="flex items-center gap-1.5">
                    <Button variant="ghost" size="sm" onClick={() => toggleStatus(u.id)}>
                      {u.status === "active" ? <UserX className="w-3.5 h-3.5 text-slate-400" /> : <UserCheck className="w-3.5 h-3.5 text-emerald-500" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(u)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(u)}>
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </Button>
                  </div>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Modal open={addOpen} onClose={() => { setAddOpen(false); setEditTarget(null); }} title={editTarget ? "Edit User" : "Add Admin User"}>
        <div className="space-y-4">
          <Input label="Full Name *" placeholder="Enter full name" value={form.name} onChange={(e) => set("name", e.target.value)} />
          <Input label="Email *" type="email" placeholder="user@kelikuli.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
          <Select label="Role *" options={ROLE_OPTIONS} value={form.role} onChange={(e) => set("role", e.target.value as AdminUser["role"])} />
          {!editTarget && (
            <Input label="Password *" type="password" placeholder="Set initial password" value={form.password} onChange={(e) => set("password", e.target.value)} />
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => { setAddOpen(false); setEditTarget(null); }}>Cancel</Button>
            <Button onClick={handleSave}>{editTarget ? "Save Changes" : "Create User"}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete User">
        <p className="text-sm text-slate-600 mb-4">
          Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
