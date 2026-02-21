"use client";

import { useState } from "react";

export default function DashboardPage() {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");

  const [tasks, setTasks] = useState([]);

  const [filter, setFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortType, setSortType] = useState("newest");

  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

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

  const startEditing = (task) => {
    setEditingId(task.id);
    setEditingText(task.title);
  };

  const saveEdit = (id) => {
    if (!editingText.trim()) {
      setEditingId(null);
      return;
    }

    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, title: editingText } : task
      )
    );

    setEditingId(null);
  };

  const filteredTasks = tasks.filter((task) => {
    const priorityMatch =
      filter === "all" ? true : task.priority === filter;

    const statusMatch =
      statusFilter === "all"
        ? true
        : statusFilter === "completed"
        ? task.completed
        : !task.completed;

    return priorityMatch && statusMatch;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortType === "newest") {
      return b.id - a.id;
    }

    if (sortType === "due") {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;

      return new Date(a.dueDate) - new Date(b.dueDate);
    }

    if (sortType === "priority") {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.priority] - order[b.priority];
    }

    return 0;
  });

  return (
    <div className="p-10 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="flex gap-2">
        <input
          className="border px-3 py-2 rounded w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
        />

        <input
          className="border px-3 py-2 rounded"
          type="date"
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
          className="bg-black text-white px-4 rounded"
          onClick={addTask}
        >
          Add
        </button>
      </div>

      <div className="flex gap-2 mt-4">
        {["all", "high", "medium", "low"].map((value) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-3 py-1 rounded ${
              filter === value
                ? "bg-black text-white"
                : "bg-gray-200"
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mt-2">
        {["all", "active", "completed"].map((value) => (
          <button
            key={value}
            onClick={() => setStatusFilter(value)}
            className={`px-3 py-1 rounded ${
              statusFilter === value
                ? "bg-black text-white"
                : "bg-gray-200"
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mt-2">
        {["newest", "due", "priority"].map((value) => (
          <button
            key={value}
            onClick={() => setSortType(value)}
            className={`px-3 py-1 rounded ${
              sortType === value
                ? "bg-black text-white"
                : "bg-gray-200"
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-2">
        {sortedTasks.map((task) => (
          <div
            key={task.id}
            className="border p-3 rounded flex justify-between items-center animate-fade"
          >
            <div className="flex flex-col w-full">
              {editingId === task.id ? (
                <input
                  className="border px-2 py-1 rounded"
                  value={editingText}
                  autoFocus
                  onChange={(e) => setEditingText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit(task.id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  onBlur={() => saveEdit(task.id)}
                />
              ) : (
                <span
                  onDoubleClick={() => startEditing(task)}
                  className={`cursor-pointer ${
                    task.completed
                      ? "line-through text-gray-400"
                      : ""
                  }`}
                >
                  {task.title}
                </span>
              )}

              {task.dueDate && (
                <span className="text-xs text-gray-400">
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 ml-3">
              <span className="text-xs px-2 py-1 rounded bg-gray-100">
                {task.priority}
              </span>

              <button
                onClick={() => toggleTask(task.id)}
                className="text-sm"
              >
                ✓
              </button>
            </div>
          </div>
        ))}

        {sortedTasks.length === 0 && (
          <div className="text-gray-400 text-sm">
            No tasks found
          </div>
        )}
      </div>
    </div>
  );
}