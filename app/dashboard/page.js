"use client";

import { useEffect, useState } from "react";

export default function Page() {
    const [tasks, setTasks] = useState([]);

    const [title, setTitle] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [priority, setPriority] = useState("medium");

    const [priorityFilter, setPriorityFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    const [sortBy, setSortBy] = useState("newest");

    const [editingId, setEditingId] = useState(null);
    const [editingTitle, setEditingTitle] = useState("");

    /* ---------------- LOAD ---------------- */

    useEffect(() => {
        const storedTasks = localStorage.getItem("tasks");
        if (storedTasks) {
            setTasks(JSON.parse(storedTasks));
        }
    }, []);

    /* ---------------- SAVE ---------------- */

    useEffect(() => {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }, [tasks]);

    /* ---------------- TASK ACTIONS ---------------- */

    const addTask = () => {
        if (!title.trim()) return;

        const newTask = {
            id: crypto.randomUUID(),
            title: title,
            dueDate,
            priority,
            completed: false,
            createdAt: Date.now(),
        };

        setTasks(prev => [...prev, newTask]);

        setTitle("");
        setDueDate("");
        setPriority("medium");
    };

    const toggleTask = (id) => {
        setTasks(prev =>
            prev.map(task =>
                task.id === id
                    ? { ...task, completed: !task.completed }
                    : task
            )
        );
    };

    const deleteTask = (id) => {
        setTasks(prev => prev.filter(task => task.id !== id));
    };

    /* ---------------- EDIT ---------------- */

    const startEdit = (task) => {
        setEditingId(task.id);
        setEditingTitle(task.title);
    };

    const saveEdit = (id) => {
        if (!editingTitle.trim()) return;

        setTasks(prev =>
            prev.map(task =>
                task.id === id
                    ? { ...task, title: editingTitle }
                    : task
            )
        );

        setEditingId(null);
        setEditingTitle("");
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingTitle("");
    };

    /* ---------------- FILTER ---------------- */

    const filteredTasks = tasks.filter(task => {
        if (priorityFilter !== "all" && task.priority !== priorityFilter)
            return false;

        if (statusFilter === "active" && task.completed)
            return false;

        if (statusFilter === "completed" && !task.completed)
            return false;

        return true;
    });

    /* ---------------- SORT ---------------- */

    const sortedTasks = [...filteredTasks].sort((a, b) => {
        if (sortBy === "newest") {
            return b.createdAt - a.createdAt;
        }

        if (sortBy === "oldest") {
            return a.createdAt - b.createdAt;
        }

        if (sortBy === "priority") {
            const order = { high: 3, medium: 2, low: 1 };
            return order[b.priority] - order[a.priority];
        }

        if (sortBy === "dueDate") {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
        }

        return 0;
    });

    /* ---------------- UI ---------------- */

    return (
        <div className="p-10 max-w-3xl">
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

            {/* ADD TASK */}
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

            {/* PRIORITY FILTER */}
            <div className="flex gap-2 mb-4">
                {["all", "high", "medium", "low"].map(p => (
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

            {/* STATUS FILTER */}
            <div className="flex gap-2 mb-4">
                {["all", "active", "completed"].map(s => (
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

            {/* SORT */}
            <div className="flex gap-2 mb-6">
                {["newest", "oldest", "priority", "dueDate"].map(s => (
                    <button
                        key={s}
                        onClick={() => setSortBy(s)}
                        className={`px-3 py-1 rounded border ${
                            sortBy === s ? "bg-black text-white" : ""
                        }`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {/* TASK LIST */}
            <div className="space-y-2">
                {sortedTasks.length === 0 && (
                    <p className="text-gray-400">No tasks found</p>
                )}

                {sortedTasks.map(task => (
                    <div key={task.id} className="border p-3 rounded">

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => toggleTask(task.id)}
                            />

                            {editingId === task.id ? (
                                <input
                                    value={editingTitle}
                                    onChange={(e) => setEditingTitle(e.target.value)}
                                    className="border rounded px-2 py-1 w-full"
                                />
                            ) : (
                                <div className={`font-medium ${
                                    task.completed ? "line-through text-gray-400" : ""
                                }`}>
                                    {task.title}
                                </div>
                            )}
                        </div>

                        <div className="text-sm text-gray-500 mt-1">
                            {task.dueDate && `Due: ${task.dueDate}`}{" "}
                            | Priority: {task.priority}
                        </div>

                        <div className="flex gap-2 mt-2">

                            {editingId === task.id ? (
                                <>
                                    <button onClick={() => saveEdit(task.id)}>Save</button>
                                    <button onClick={cancelEdit}>Cancel</button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => startEdit(task)}>Edit</button>
                                    <button onClick={() => deleteTask(task.id)}>Delete</button>
                                </>
                            )}

                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}