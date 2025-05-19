'use client'
import { useEffect, useState } from "react";
import { createProject } from "../services/projectService";
import { useUserStore } from "@/store/userStore";

export default function ProjectForm({ toRefresh, setToRefresh }: { toRefresh: boolean, setToRefresh: React.Dispatch<React.SetStateAction<boolean>> }) {
    const {user} = useUserStore();
      const [hasMounted, setHasMounted] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    budget: "",
    deadline: "",
    buyerId: user?.id?user.id : "", // hardcoded for MVP
  });

  useEffect(() => {
    setHasMounted(true);
    if (user?.id) {
      setForm((prev) => ({ ...prev, buyerId: user.id }));
    }
  }, [user?.id]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await createProject(form);
    alert("Project created!");
    setForm({ ...form, title: "", description: "", budget: "", deadline: "" });
    setToRefresh(!toRefresh)
  };

    if (!hasMounted) return null;
    
  return (
    <form className="space-y-4 p-4 bg-white shadow-md rounded" onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold">Create Project</h2>
      <input className="w-full border p-2" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <textarea className="w-full border p-2" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <input className="w-full border p-2" placeholder="Budget" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
      <input className="w-full border p-2" type="datetime-local" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
      <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">Create</button>
    </form>
  );
}
