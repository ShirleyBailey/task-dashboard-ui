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
                task.id === id
                    ? { ...task, completed: !task.completed }
                    : task
            )
        );
    };

    const deleteTask = (id) => {
        setTasks(tasks.filter(task => task.id !== id));
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
        if (sortType === "newest") return b.id - a.id;

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
            <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

            {/* Task Input */}
            <div className="flex gap-2 bg-gray-50 p-3 rounded-xl border">
                <input
                    className="px-3 py-2 rounded-lg w-full bg-white border"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What needs to be done?"
                />

                <input
                    className="px-3 py-2 rounded-lg border bg-white"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                />

                <select
                    className="px-3 py-2 rounded-lg border bg-white"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>

                <button
                    className="bg-black text-white px-4 rounded-lg hover:opacity-80 transition"
                    onClick={addTask}
                >
                    Add
                </button>
            </div>

            {/* Task List */}
            <div className="mt-6 space-y-3">
                {sortedTasks.map((task) => (
                    <div
                        key={task.id}
                        className="bg-white border rounded-xl p-4 flex justify-between items-center shadow-sm hover:shadow-md transition"
                    >
                        <div className="flex flex-col">
                            <span
                                className={`font-medium ${task.completed ? "line-through text-gray-400" : ""
                                    }`}
                            >
                                {task.title}
                            </span>

                            {task.dueDate && (
                                <span className="text-xs text-gray-400 mt-1">
                                    Due {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <span
                                className={`text-xs px-2 py-1 rounded-lg ${task.priority === "high"
                                        ? "bg-red-100 text-red-600"
                                        : task.priority === "medium"
                                            ? "bg-yellow-100 text-yellow-700"
                                            : "bg-green-100 text-green-600"
                                    }`}
                            >
                                {task.priority}
                            </span>

                            <button
                                onClick={() => toggleTask(task.id)}
                                className={`text-sm w-7 h-7 rounded-lg border flex items-center justify-center transition
                                    ${task.completed
                                        ? "bg-black text-white"
                                        : "hover:bg-gray-100"
                                    }`}
                            >
                                ✓
                            </button>

                            <button
                                onClick={() => deleteTask(task.id)}
                                className="text-sm text-gray-400 hover:text-black transition"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                ))}

                {sortedTasks.length === 0 && (
                    <div className="text-gray-400 text-sm text-center py-10">
                        No tasks yet 😌
                    </div>
                )}
            </div>
        </div>
    );
}