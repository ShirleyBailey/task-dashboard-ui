"use client";

import { useEffect, useState } from "react";

export default function Page() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");

  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  /* ---------------- LOAD FROM LOCALSTORAGE ---------------- */

  useEffect(() => {
    const storedTasks = localStorage.getItem("tasks");

    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    }
  }, []);

  /* ---------------- SAVE TO LOCALSTORAGE ---------------- */

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  /* ---------------- TASK ACTIONS ---------------- */

  const addTask = () => {
    if (!title.trim()) return;

    const newTask = {
      id: Date.now(),
      title,
      dueDate,
      priority,
      completed: false,
    };

    setTasks([newTask, ...tasks]);
    setTitle("");
    setDueDate("");
    setPriority("medium");
  };

  const toggleTask = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  /* ---------------- FILTER LOGIC ---------------- */

  const filteredTasks = tasks.filter((task) => {
    if (priorityFilter !== "all" && task.priority !== priorityFilter)
      return false;

    if (statusFilter === "active" && task.completed) return false;
    if (statusFilter === "completed" && !task.completed) return false;

    return true;
  });

  /* ---------------- UI ---------------- */

  return (
    <div className="p-10 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="flex gap-2 mb-4">
        <input
          className="border px-3 py-2 rounded w-full"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="date"
          className="border px-3 py-2 rounded"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <select
          className="border px-3 py-2 rounded"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <button
          onClick={addTask}
          className="bg-black text-white px-4 rounded"
        >
          Add
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {["all", "high", "medium", "low"].map((p) => (
          <button
            key={p}
            onClick={() => setPriorityFilter(p)}
            className={`px-3 py-1 rounded border ${
              priorityFilter === p ? "bg-black text-white" : ""
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-6">
        {["all", "active", "completed"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 rounded border ${
              statusFilter === s ? "bg-black text-white" : ""
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filteredTasks.length === 0 && (
          <p className="text-gray-400">No tasks found</p>
        )}

        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="border rounded p-3 flex justify-between items-center"
          >
            <div>
              <p
                className={`font-medium ${
                  task.completed ? "line-through text-gray-400" : ""
                }`}
              >
                {task.title}
              </p>

              <p className="text-sm text-gray-400">
                {task.dueDate || "No due date"} • {task.priority}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => toggleTask(task.id)}
                className="text-sm border px-2 rounded"
              >
                {task.completed ? "Undo" : "Done"}
              </button>

              <button
                onClick={() => deleteTask(task.id)}
                className="text-sm border px-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}