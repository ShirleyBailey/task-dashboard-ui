"use client";
import { useEffect, useState } from "react";
import {
    DndContext,
    closestCenter,
} from "@dnd-kit/core";

import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
    arrayMove,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

function SortableItem({ task, toggleTask, deleteTask }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="border rounded-lg p-4 flex justify-between items-center shadow-sm bg-white"
        >
            <div
                className="flex items-center gap-3 cursor-grab"
                {...attributes}
                {...listeners}
            >
                <button
                    onClick={() => toggleTask(task)}
                    className={`w-5 h-5 rounded border flex items-center justify-center
            ${task.completed ? "bg-black text-white" : ""}
          `}
                >
                    {task.completed && "✓"}
                </button>

                <div className="flex flex-col">
                    <span
                        className={`${task.completed ? "line-through text-gray-400" : ""
                            }`}
                    >
                        {task.title}
                    </span>

                    {task.dueDate && (
                        <span className="text-xs text-gray-400">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                    )}
                </div>
            </div>

            <button
                onClick={() => deleteTask(task)}
                className="text-sm text-red-500"
            >
                Delete
            </button>
        </div>
    );
}

export default function Dashboard() {
    const [dueDate, setDueDate] = useState("");
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState("");
    const [priority, setPriority] = useState("medium");
    const [filter, setFilter] = useState("all");

    const loadTasks = async () => {
        const res = await fetch("/api/tasks");
        const data = await res.json();

        const sorted = data.sort((a, b) => a.order - b.order);
        setTasks(sorted);
    };

    const addTask = async () => {
        if (!title) return;

        await fetch("/api/tasks", {
            method: "POST",
            body: JSON.stringify({ title, dueDate, priority }),
        });

        setTitle("");
        setDueDate("");
        setPriority("medium");
        loadTasks();
    };

    const toggleTask = async (task) => {
        await fetch(`/api/tasks/${task.id}`, {
            method: "PATCH",
        });

        loadTasks();
    };

    const deleteTask = async (task) => {
        await fetch(`/api/tasks/${task.id}`, {
            method: "DELETE",
        });

        loadTasks();
    };

    useEffect(() => {
        loadTasks();
    }, []);

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        const oldIndex = tasks.findIndex(t => t.id === active.id);
        const newIndex = tasks.findIndex(t => t.id === over.id);

        const newTasks = arrayMove(tasks, oldIndex, newIndex)
            .map((task, index) => ({
                ...task,
                order: index + 1,
            }));

        setTasks(newTasks);

        await fetch("/api/tasks/reorder", {
            method: "POST",
            body: JSON.stringify({ tasks: newTasks }),
        });
    };


    return (
        <div className="p-10 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">
                Task Dashboard 😏🔥
            </h1>

            <div className="flex gap-2">
                <input
                    className="border px-3 py-2 rounded"
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
                <button
                    onClick={() => setFilter("all")}
                    className={`px-3 py-1 rounded ${filter === "all" ? "bg-black text-white" : "bg-gray-200"
                        }`}
                >
                    All
                </button>

                <button
                    onClick={() => setFilter("high")}
                    className={`px-3 py-1 rounded ${filter === "high" ? "bg-black text-white" : "bg-gray-200"
                        }`}
                >
                    High
                </button>

                <button
                    onClick={() => setFilter("medium")}
                    className={`px-3 py-1 rounded ${filter === "medium" ? "bg-black text-white" : "bg-gray-200"
                        }`}
                >
                    Medium
                </button>

                <button
                    onClick={() => setFilter("low")}
                    className={`px-3 py-1 rounded ${filter === "low" ? "bg-black text-white" : "bg-gray-200"
                        }`}
                >
                    Low
                </button>
            </div>
            <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={tasks.map(t => t.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-3">
                        {tasks
                            .filter((task) => {
                                if (filter === "all") return true;
                                return task.priority === filter;
                            })
                            .map((task) => (
                                <SortableItem
                                    key={task.id}
                                    task={task}
                                    toggleTask={toggleTask}
                                    deleteTask={deleteTask}
                                />
                            ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
}

