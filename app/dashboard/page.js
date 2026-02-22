"use client";

import { useEffect, useState } from "react";
import {
    DndContext,
    closestCenter
} from "@dnd-kit/core";

import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
    arrayMove
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

function SortableTask({ task, children }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="border p-3 rounded bg-white">
            <div className="flex items-start gap-3">

                {/* ✅ DRAG HANDLE */}
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab text-gray-400 hover:text-black"
                >
                    ☰
                </div>

                <div className="flex-1">
                    {children}
                </div>

            </div>
        </div>
    );
}

export default function Page() {
    const [tasks, setTasks] = useState([]);

    const [title, setTitle] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [priority, setPriority] = useState("medium");

    const [priorityFilter, setPriorityFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    const [editingId, setEditingId] = useState(null);
    const [editingTitle, setEditingTitle] = useState("");

    /* ---------------- LOAD ---------------- */

    useEffect(() => {
        const stored = localStorage.getItem("tasks");
        if (stored) {
            try {
                setTasks(JSON.parse(stored));
            } catch {
                setTasks([]);
            }
        }
    }, []);

    /* ---------------- SAVE ---------------- */

    useEffect(() => {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }, [tasks]);

    /* ---------------- ACTIONS ---------------- */

    const addTask = () => {
        if (!title.trim()) return;

        const newTask = {
            id: crypto.randomUUID(),
            title,
            completed: false,
            dueDate,
            priority
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

    const startEdit = (task) => {
        setEditingId(task.id);
        setEditingTitle(task.title);
    };

    const saveEdit = (id) => {
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

    /* ---------------- DND ---------------- */

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        setTasks(prev => {
            const oldIndex = prev.findIndex(t => t.id === active.id);
            const newIndex = prev.findIndex(t => t.id === over.id);
            return arrayMove(prev, oldIndex, newIndex);
        });
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
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
    });

    /* ---------------- UI ---------------- */

    return (
        <div className="p-10 max-w-3xl">
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

            {/* INPUT */}
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

            {/* FILTERS */}
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

            <div className="flex gap-2 mb-6">
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

            {/* TASK LIST */}
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext
                    items={sortedTasks.map(t => t.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-2">
                        {sortedTasks.map(task => (
                            <SortableTask key={task.id} task={task}>
                                {editingId === task.id ? (
                                    <input
                                        value={editingTitle}
                                        onChange={(e) => setEditingTitle(e.target.value)}
                                        className="border rounded px-2 py-1 w-full"
                                    />
                                ) : (
                                    <div className="font-medium">
                                        {task.title}
                                    </div>
                                )}

                                <div className="flex gap-2 mt-2 text-sm">
                                    <button onClick={() => toggleTask(task.id)}>
                                        {task.completed ? "Undo" : "Complete"}
                                    </button>

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

                                {/* Priority Badge */}
                                {task.priority && (
                                    <span
                                        className={`px-2 py-1 text-xs rounded-full font-medium ${
                                            task.priority === "high"
                                                ? "bg-red-100 text-red-600"
                                                : task.priority === "medium"
                                                ? "bg-yellow-100 text-yellow-600"
                                                : "bg-blue-100 text-blue-600"
                                        }`}
                                    >
                                        {task.priority}
                                    </span>
                                )}
                            </SortableTask>
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
}