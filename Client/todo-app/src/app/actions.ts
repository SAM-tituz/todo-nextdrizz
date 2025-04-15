"use server";
import { revalidateTag } from "next/cache";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
axios.defaults.baseURL = process.env.DATABASE_URLS;



// get todo
export async function getTodos() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
  }
  const res = await fetch(process.env.DATABASE_URL, {
    next: { tags: ["todos"] },
  });
  if (!res.ok) throw new Error("Failed to fetch todos");
  return res.json();
}


// add todo
export async function addTodo(task: string,duration_hours: number ) {
  const newtodo = {
    todo: task,
    todo_completed: false,
    duration_hours: duration_hours,
  };
  await axios.post("/todos", newtodo);
  revalidateTag("todos");
}
// delete single todo
export async function deltodobyid(id: number) {
  await axios.delete(`/todos/${id}`);
  revalidateTag("todos");
}
// delete all todo
export async function deltodo() {
  await axios.delete("/todos");
  revalidateTag("todos");
}
// edit todo
export async function edittodo(id: number, task: string,duration_hours?: number) {
  const updated = {
    todo: task,
    ...(duration_hours !== undefined && { duration_hours: duration_hours }),
  };

  await axios.put(`/todos/${id}`, updated);
  revalidateTag("todos");
}
// toogle
export async function toggle(id: number, newStatus: boolean) {
  await axios.put(`/todos/${id}`, { todo_completed: newStatus });
  revalidateTag("todos");
}
