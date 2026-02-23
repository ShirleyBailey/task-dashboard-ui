"use client";

import { useEffect, useState } from "react";

const handleKeyDown = (e) => {
    if (e.key === "Enter") addTask();
};

export default function Page() {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [priority, setPriority] = useState("medium");

    const [error, setError] = useState("");

    const [priorityFilter, setPriorityFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    const [editingId, setEditingId] = useState(null);
    const [editingTitle, setEditingTitle] = useState("");
    const [toast, setToast] = useState(null);

    const [search, setSearch] = useState("");
    const [sortType, setSortType] = useState("newest");

    const totalCount = tasks.length;
    const completedCount = tasks.filter(t => t.completed).length;
    const activeCount = totalCount - completedCount;
    const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

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

    /* ---------------- ACTIONS ---------------- */
    const addTask = () => {
        const trimmedTitle = title.trim();

        if (!trimmedTitle) {
            setError("Task title is required");
            return;
        }

        if (trimmedTitle.length < 3) {
            setError("Minimum 3 characters");
            return;
        }

        if (trimmedTitle.length > 50) {
            setError("Maximum 50 characters");
            return;
        }

        const duplicate = tasks.some(
            task => task.title.toLowerCase() === trimmedTitle.toLowerCase()
        );

        if (duplicate) {
            setError("Duplicate task");
            return;
        }

        const newTask = {
            id: crypto.randomUUID(),
            title: trimmedTitle,
            completed: false,
            dueDate,
            priority,
            createdAt: Date.now(),
        };

        setTasks(prev => [...prev, newTask]);
        showToast("Task added 🚀");

        setTitle("");
        setDueDate("");
        setPriority("medium");
        setError("");
    };

    const toggleTask = (id) => {
        setTasks(prev =>
            prev.map(task =>
                task.id === id
                    ? { ...task, completed: !task.completed }
                    : task
            )
        );
        showToast("Task status updated ✅");
    };

    const deleteTask = (id) => {
        setTasks(prev => prev.filter(task => task.id !== id));
        showToast("Task deleted 🗑️");
    };

    const startEdit = (task) => {
        setEditingId(task.id);
        setEditingTitle(task.title);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingTitle("");
    };

    const saveEdit = (id) => {
        if (!editingTitle.trim()) return;

        setTasks(prev =>
            prev.map(task =>
                task.id === id
                    ? { ...task, title: editingTitle.trim() }
                    : task
            )
        );

        cancelEdit();
        showToast("Task updated ✨");
    };

    /* ---------------- FILTER ---------------- */

    const isOverdue = (task) => {
        if (!task.dueDate) return false;

        const today = new Date();
        const due = new Date(task.dueDate);

        today.setHours(0, 0, 0, 0);
        due.setHours(0, 0, 0, 0);

        return due < today && !task.completed;
    };

    const filteredTasks = tasks.filter(task => {

        if (search && !task.title.toLowerCase().includes(search.toLowerCase()))
            return false;

        if (priorityFilter !== "all" && task.priority !== priorityFilter)
            return false;

        if (statusFilter === "active" && task.completed) return false;
        if (statusFilter === "completed" && !task.completed) return false;

        return true;
    });

    const sortedTasks = [...filteredTasks].sort((a, b) => {

        if (sortType === "newest")
            return b.createdAt - a.createdAt;

        if (sortType === "oldest")
            return a.createdAt - b.createdAt;

        if (sortType === "priority") {
            const order = { high: 0, medium: 1, low: 2 };
            return order[a.priority] - order[b.priority];
        }

        if (sortType === "dueDate")
            return new Date(a.dueDate || 0) - new Date(b.dueDate || 0);

        return 0;
    });

    const getDueStatus = (dueDate) => {
        if (!dueDate) return "none";

        const today = new Date();
        const due = new Date(dueDate);

        today.setHours(0, 0, 0, 0);
        due.setHours(0, 0, 0, 0);

        if (due < today) return "overdue";
        if (due.getTime() === today.getTime()) return "today";

        return "upcoming";
    };


    /* ---------------- UI ---------------- */

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 2000);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-10">
            {toast && (
                <div className="fixed bottom-5 right-5 bg-black text-white px-4 py-2 rounded-lg shadow-lg">
                    {toast}
                </div>
            )}
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-6">

                <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

                <div className="flex gap-4 text-sm text-gray-500 mb-4">
                    <span>Total: {totalCount}</span>
                    <span>Active: {activeCount}</span>
                    <span>Completed: {completedCount}</span>
                </div>

                <div className="mt-4 mb-3">
                    <div className="text-sm mb-1">
                        Progress: {progress}%
                    </div>

                    <div className="w-full h-1 bg-gray-200 rounded">
                        <div
                            className="h-1 bg-black rounded"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
                {/* INPUTS */}

                <div className="flex gap-2 mb-4">
                    <input
                        className="border px-3 py-2 rounded w-full"
                        placeholder="Task title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") addTask();
                        }}
                    />

                    <input
                        type="date"
                        className="border px-3 py-2 rounded-lg"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                    />

                    <select
                        className="border px-3 py-2 rounded-lg"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                    >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>

                    <button
                        onClick={addTask}
                        className="px-4 rounded-lg bg-black text-white hover:opacity-80 transition"
                    >
                        Add
                    </button>
                    {error && (
                        <div className="text-red-500 text-sm mt-2 animate-fade">
                            {error}
                        </div>
                    )}
                </div>

                <div className="space-y-4 mb-6">

                    <section>
                        <div className="text-xs text-gray-500 mb-1">Priority</div>
                        <div className="flex gap-2">
                            {["all", "high", "medium", "low"].map(p => (
                                <button
                                    key={p}
                                    onClick={() => setPriorityFilter(p)}
                                    className={`px-3 py-1 rounded-lg border text-sm transition
                        ${priorityFilter === p
                                            ? "bg-black text-white"
                                            : "hover:bg-gray-100"
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </section>

                    <section>
                        <div className="text-xs text-gray-500 mb-1">Status</div>
                        <div className="flex gap-2">
                            {["all", "active", "completed"].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(s)}
                                    className={`px-3 py-1 rounded-lg border text-sm transition
                        ${statusFilter === s
                                            ? "bg-black text-white"
                                            : "hover:bg-gray-100"
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </section>

                    <section>
                        <div className="text-xs text-gray-500 mb-1">Sort</div>
                        <div className="flex gap-2">
                            {["newest", "oldest", "priority", "dueDate"].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setSortType(type)}
                                    className={`px-3 py-1 rounded-lg border text-sm transition
                        ${sortType === type
                                            ? "bg-black text-white"
                                            : "hover:bg-gray-100"
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </section>

                </div>

                <div className="mb-6">
                    <input
                        className="w-full bg-gray-100 px-4 py-2 rounded-full border-none
                   focus:outline-none focus:ring-2 focus:ring-black/10"
                        placeholder="Search tasks..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <button
                    onClick={() => setTasks(tasks.filter(t => !t.completed))}
                    className="text-sm text-red-500 hover:underline"
                >
                    Clear Completed
                </button>

                {/* TASK LIST */}

                <div className="space-y-3">

                    {sortedTasks.length === 0 && (
                        <div className="border rounded-lg p-6 text-center text-gray-400">
                            <div className="text-lg mb-1">Nothing here yet</div>
                            <div className="text-sm">
                                Add a task to get started 🚀
                            </div>
                        </div>
                    )}

                    {sortedTasks.map(task => (
                        <div
                            key={task.id}
                            className="border rounded-xl p-4 hover:shadow-sm transition bg-white"
                        >

                            <div className="flex justify-between items-center">

                                {editingId === task.id ? (
                                    <input
                                        value={editingTitle}
                                        onChange={(e) => setEditingTitle(e.target.value)}
                                        className="border rounded px-2 py-1 w-full"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") saveEdit(task.id);
                                            if (e.key === "Escape") cancelEdit();
                                        }}
                                    />
                                ) : (
                                    <div className={`font-medium ${isOverdue(task) ? "text-red-500" : ""}`}>
                                        {task.title}
                                    </div>
                                )}

                                <span
                                    className={`text-xs px-2 py-1 rounded-full ${task.priority === "high"
                                        ? "bg-red-100 text-red-600"
                                        : task.priority === "medium"
                                            ? "bg-yellow-100 text-yellow-600"
                                            : "bg-green-100 text-green-600"
                                        }`}
                                >
                                    {task.priority}
                                </span>

                                {isOverdue(task) && (
                                    <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600">
                                        overdue
                                    </span>
                                )}
                            </div>

                            {task.dueDate && (
                                <div className="text-xs">
                                    {!task.dueDate && (
                                        <span className="text-gray-400">No due date</span>
                                    )}

                                    {task.dueDate && (
                                        <span className={
                                            getDueStatus(task.dueDate) === "overdue"
                                                ? "text-red-500"
                                                : getDueStatus(task.dueDate) === "today"
                                                    ? "text-orange-500"
                                                    : "text-gray-400"
                                        }>
                                            {task.dueDate}
                                            {getDueStatus(task.dueDate) === "overdue" && " • Overdue"}
                                            {getDueStatus(task.dueDate) === "today" && " • Today"}
                                        </span>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-2 mt-3">

                                <button
                                    onClick={() => toggleTask(task.id)}
                                    className="px-3 py-1 rounded-lg bg-black text-white hover:opacity-80 transition"
                                >
                                    {task.completed ? "Undo" : "Complete"}
                                </button>

                                {editingId === task.id ? (
                                    <>
                                        <button
                                            onClick={() => saveEdit(task.id)}
                                            className="px-3 py-1 rounded-lg border hover:bg-gray-100 transition"
                                        >
                                            Save
                                        </button>

                                        <button
                                            onClick={cancelEdit}
                                            className="px-3 py-1 rounded-lg border hover:bg-gray-100 transition"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => startEdit(task)}
                                            className="px-3 py-1 rounded-lg border hover:bg-gray-100 transition"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => deleteTask(task.id)}
                                            className="px-3 py-1 rounded-lg border text-red-500 hover:bg-red-50 transition"
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}