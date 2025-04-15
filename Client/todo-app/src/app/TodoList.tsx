"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addTodo, deltodo, deltodobyid, edittodo, toggle } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
type Props = {
  initialTodos: Todo[];
};
export default function TodoList({ initialTodos }: Props) {
  const todos = initialTodos;
  const [open, setOpen] = useState(false);
  const [overdueTodo, setOverdueTodo] = useState<Todo | null>(null);
  const [durationHours, setDurationHours] = useState<number | "">("");
  const [task, setTask] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [editDuration, setEditDuration] = useState<number | "">("");

  // Check for overdue todos
  useEffect(() => {
    const overdue = todos.find(
      (todo) => todo.remaining_time === "Overdue!" && !todo.todo_completed
    );
    if (overdue) {
      setOverdueTodo(overdue);
      setOpen(true);
    }
  }, [todos]);
  // Add todo handler
  const handleAdd = async () => {
    try {
      if (!task || !durationHours) {
        toast.error("Please Enter both Task and Duration hours");
        return;
      }
      await addTodo(task, durationHours as number);

      setTask("");
      setDurationHours("");
    } catch (error) {
      console.error("Failed to add todo:", error);
      toast.error("Failed to add todo. Please try again.");
    }
  };
  // delete all todo
  const handleClear = async () => {
    await deltodo();
    // setTodos([]);
  };

  // Start editing a todo
  const handleEditStart = (
    id: number,
    currentText: string,
    duration_hours: number
  ) => {
    setEditId(id);
    setEditText(currentText);
    setEditDuration(duration_hours);
  };

  // Save edited todo
  const handleEditSave = async (id: number) => {
    if (!editText || !editDuration) {
      toast.error("Please enter a task and duration hours");
      return;
    }
    await edittodo(id, editText, editDuration as number);
    setEditId(null);
    // setEditText("");
    // setEditDuration("");
  };

  // Handle key press while editing
  const handleEditKey = (
    e: React.KeyboardEvent<HTMLInputElement>,
    id: number
  ) => {
    if (e.key === "Enter") handleEditSave(id);
  };

  // Toggle todo completion status
  const handleToggleCompleted = async (id: number, newStatus: boolean) => {
    try {
      toggle(id, newStatus);
      //   setTodos((prev) =>
      //     prev.map((todo) =>
      //       todo.id === id ? { ...todo, todo_completed: newStatus } : todo
      //     )
      //   );
    } catch (err) {
      console.error("Failed to toggle completed:", err);

    }
  };

  // Delete a todo by ID
  const handleClearid = async (id: number) => {
    try {
      await deltodobyid(id);
      //   setTodos((prev) => prev.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error("Failed to delete todo:", error);
      
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">To-Do List</h1>
      <div className="flex gap-2">
        <Input
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Add a task..."
        />
        <div className="flex items-center gap-2">
          <Label htmlFor="duration">Duration (hours):</Label>
          <Input
            id="duration"
            type="number"
            min="1"
            value={durationHours}
            onChange={(e) =>
              setDurationHours(e.target.value ? parseInt(e.target.value) : "")
            }
            placeholder="hours"
            className="w-20"
          />
        </div>
        <Button onClick={handleAdd}>Add</Button>
        <Button onClick={handleClear}>Clear</Button>
      </div>

      <ul className="space-y-2">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className={`p-3 border rounded-md flex flex-col gap-2 ${
              (todo.remaining_time === "Overdue!" && !todo.todo_completed) ||
              todo.remaining_time <= "12"
                ? "border-red-500 bg-red-50"
                : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={todo.todo_completed}
                  onChange={() =>
                    handleToggleCompleted(todo.id, !todo.todo_completed)
                  }
                  className="h-4 w-4"
                />
                {editId === todo.id ? (
                  <div className="flex flex-col gap-2 w-full">
                    <Input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault(); // Prevent form submission (if inside a form)
                          const durationInput =
                            document.getElementById("duration-input");
                          if (durationInput) durationInput.focus(); // Move focus to duration input
                        }
                      }}
                    />
                    <div className="flex items-center gap-2">
                      <Label>Duration:</Label>
                      <Input
                        id="duration-input"
                        type="number"
                        min="1"
                        value={editDuration}
                        onBlur={() => handleEditSave(todo.id)}
                        onKeyDown={(e) => handleEditKey(e, todo.id)}
                        onChange={(e) =>
                          setEditDuration(
                            e.target.value ? parseInt(e.target.value) : ""
                          )
                        }
                        className="w-20"
                      />
                    </div>
                  </div>
                ) : (
                  <span
                    onDoubleClick={() =>
                      handleEditStart(
                        todo.id,
                        todo.todo,
                        todo.duration_hours ?? 0
                      )
                    }
                    className={`cursor-pointer ${
                      todo.todo_completed ? "line-through text-gray-400" : ""
                    }`}
                  >
                    {todo.todo}
                  </span>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleClearid(todo.id)}
              >
                Delete
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 text-sm text-gray-600">
              {todo.duration_hours !== null && todo.remaining_time && (
                <Badge
                  variant={
                    todo.remaining_time === "Overdue!"
                      ? "destructive"
                      : "outline"
                  }
                >
                  {todo.remaining_time === "Overdue!"
                    ? "Overdue"
                    : todo.remaining_time.includes("d")
                    ? todo.remaining_time
                    : `${todo.remaining_time} remaining`
                  }
                  
                      
                  
                </Badge>
              )}
              <span>Added {todo.created_at}</span>
            </div>
          </li>
        ))}
      </ul>

      {/* Overdue Alert Dialog */}
      {overdueTodo && (
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger asChild>
            <div className="hidden" />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Todo Overdue!</AlertDialogTitle>
              <AlertDialogDescription>
                Your task "{overdueTodo.todo}" is overdue! Would you like to
                mark it as complete?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleToggleCompleted(overdueTodo.id, true)}
              >
                Mark as Complete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
