import "dotenv/config";
import express from "express";
import cors from "cors";
import {
  createTodo,
  deleteTodo,
  deleteTodoById,
  editTodo,
  getTodo,
  getTodoById,
  test,
 
} from "./controller/todoController.js";

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// 

//test
app.get("/test", test);
// creat todo
app.post("/todos", createTodo);
// get todo
app.get("/todos", getTodo);
// get todo by id
app.get("/todos/:id", getTodoById);
// edit todo by id
app.put("/todos/:id", editTodo);
// delete todo by id
app.delete("/todos/:id", deleteTodoById);
// delete all todo
app.delete("/todos", deleteTodo);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
