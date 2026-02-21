"use client";

import { useState, useEffect } from "react";

export default function DashboardPage() {
    const [title, setTitle] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [priority, setPriority] = useState("medium");

    const [tasks, setTasks] = useState([]);

    const [filter, setFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortType, setSortType] = useState("newest");

    /* ✅ 1. 최초 로딩 시 저장된 데이터 불러오기 */
    useEffect(() => {
        const savedTasks = localStorage.getItem("tasks");

        if (savedTasks) {
            setTasks(JSON.parse(savedTasks));
        }
    }, []);

    /* ✅ 2. tasks 변경될 때마다 저장 */
    useEffect(() => {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }, [tasks]);

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

            {/* 필터 UI 그대로 */}
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
                <button onClick={() => setSortType("newest")}>Newest</button>
                <button onClick={() => setSortType("due")}>Due</button>
                <button onClick={() => setSortType("priority")}>Priority</button>
            </div>

            <div className="mt-6 space-y-2">
                {sortedTasks.map((task) => (
                    <div
                        key={task.id}
                        className="border p-3 rounded flex justify-between"
                    >
                        <span
                            className={task.completed ? "line-through" : ""}
                        >
                            {task.title}
                        </span>

                        <button onClick={() => toggleTask(task.id)}>
                            ✓
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}