import { eq, sql, and, gt, exists } from "drizzle-orm";
import db from "../db/db.connect.js";
import { todolist } from "../db/schema.js";
import { format, toZonedTime } from 'date-fns-tz'; 
import { addHours, } from 'date-fns';
const date = new Date();
console.log(date.toString());
// Helper function to format date in IST
function toISTString(date: Date): string {
  return format(toZonedTime(date, 'Asia/Kolkata'), 'dd/MM/yyyy HH:mm:ss');
}
// \\\\\\\\\\\\\\
// function returning( 
//   id: number,
//   todo: string,
//   todo_completed: boolean,
//   created_at: string,
//   deadline: string | null,
//   remaining_time: string | null,
//   duration_hours: number | null) 
// {
//   return {
//     id:id,
//     todo: todo,
//     todo_completed:todo_completed,
//     created_at: toISTString(created_at),
//     deadline: duration_hours 
//       ? toISTString(addHours(created_at, duration_hours))
//       : null,
//     remaining_time: calculateRemainingTime(created_at, duration_hours),
//     duration_hours
//   };
  
// }
// \\\\\\\\\\\\\\\\\\
// test overdue
// function calculateRemainingTime(createdAt: Date, durationHours: number | null) {
//   if (!durationHours) return null;
  
//   const now = new Date();
//   const deadline = createdAt
  
//   // Get total difference in milliseconds
//   const remainingMs = deadline.getTime() - now.getTime();
  
//   if (remainingMs <= 0) return "Overdue!";
  
//   // Convert milliseconds to seconds
//   const totalSeconds = Math.floor(remainingMs / 1000);
  
//   // Calculate components
//   const days = Math.floor(totalSeconds / (3600 * 24));
//   const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
//   const minutes = Math.floor((totalSeconds % 3600) / 60);
  
//   return `${days}d ${hours}h ${minutes}m remaining`;
// }
// \\\\\\\\\\\\\\\\
// Calculate remaining time
function calculateRemainingTime(createdAt: Date, durationHours: number | null) {
  if (!durationHours) return null;
  
  const now = new Date();
  const deadline = addHours(createdAt, durationHours);
  
  // Get total difference in milliseconds
  const remainingMs = deadline.getTime() - now.getTime();
  
  if (remainingMs <= 0) return "Overdue!";
  
  // Convert milliseconds to seconds
  const totalSeconds = Math.floor(remainingMs / 1000);
  
  // Calculate components
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  
  return `${days}d ${hours}h ${minutes}m remaining`;
}

// Create todo
export const createTodo = async (req, res) => {
  try {
    const { todo, duration_hours,todo_completed } = req.body;
    if (!todo||!duration_hours) {
      return res.status(400).json({ error: "both Todo and durationhours is required" });
    }
    // Check if duration_hours is positive
    if (duration_hours && duration_hours <= 0) {
      return res.status(400).json({ error: "Duration must be positive" });
    }
    const newTodo = await db.insert(todolist).values({
      todo:todo,
      todo_completed: todo_completed|| false,
      duration_hours: duration_hours || null,
      created_at: new Date()
    }).returning();
    res.json({
      id: newTodo[0].id,
      todo: newTodo[0].todo,
      todo_completed: newTodo[0].todo_completed,
      created_at: toISTString(newTodo[0].created_at),
      deadline: duration_hours 
        ? toISTString(addHours(newTodo[0].created_at, duration_hours))
        : null,
      remaining_time: calculateRemainingTime(newTodo[0].created_at, duration_hours),
      duration_hours
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};


// Get all todos with IST formatting
export const getTodo = async (req, res) => {
  try {
    const todos = await db.select().from(todolist);
    
    const formattedTodos = todos.map(todo => ({
      id: todo.id,
      todo: todo.todo,
      todo_completed: todo.todo_completed,
      created_at: toISTString(todo.created_at),
      deadline: todo.duration_hours 
        ? toISTString(addHours(todo.created_at, todo.duration_hours))
        : null,
      remaining_time: calculateRemainingTime(todo.created_at, todo.duration_hours),
      duration_hours: todo.duration_hours
    }));
    
    res.json(formattedTodos);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get single todo by ID
export const getTodoById = async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await db.select()
      .from(todolist)
      .where(eq(todolist.id, id))
      .then(rows => rows[0]);

    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json({
      id: todo.id,
      todo: todo.todo,
      todo_completed: todo.todo_completed,
      created_at: toISTString(todo.created_at),
      deadline: todo.duration_hours 
        ? toISTString(addHours(todo.created_at, todo.duration_hours))
        : null,
      remaining_time: calculateRemainingTime(todo.created_at, todo.duration_hours),
      duration_hours: todo.duration_hours
    });

  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Edit todo
export const editTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { todo, duration_hours, todo_completed } = req.body;

    // Check if duration_hours is positive
    if (duration_hours && duration_hours <= 0) {
      return res.status(400).json({ error: "Duration must be positive" });
    }

    // First get the current todo to compare duration_hours
    const currentTodo = await db.select()
      .from(todolist)
      .where(eq(todolist.id, id))
      .then(rows => rows[0]);

    if (!currentTodo) {
      return res.status(404).json({ error: "Todo not found" });
    }

    // Prepare update data with explicit type
    const updateData: {
      todo: any;
      todo_completed: any;
      duration_hours: any;
      created_at?: Date; // Mark as optional
    } = {
      todo: todo,
      todo_completed: todo_completed,
      duration_hours: duration_hours,
    };

    // Only update created_at if duration_hours is being changed
    if (duration_hours !== undefined && duration_hours !== currentTodo.duration_hours) {
      updateData.created_at = new Date();
    }

    const updatedTodo = await db.update(todolist)
      .set(updateData)
      .where(eq(todolist.id, id))
      .returning()
      .then(rows => rows[0]);

    res.json({
      id: updatedTodo.id,
      todo: updatedTodo.todo,
      todo_completed: updatedTodo.todo_completed,
      created_at: toISTString(updatedTodo.created_at),
      deadline: updatedTodo.duration_hours 
        ? toISTString(addHours(updatedTodo.created_at, updatedTodo.duration_hours))
        : null,
      remaining_time: calculateRemainingTime(updatedTodo.created_at, updatedTodo.duration_hours),
      duration_hours: updatedTodo.duration_hours
    });

  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
// delete todo by id
export const deleteTodoById = async (req, res) => {
  try {
    const { id } = req.params;
    const deletebyid = await db
      .delete(todolist)
      .where(eq(todolist.id, id))
      .returning();
    res.json("row deleted successfully", deletebyid);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
// delete all todo
export const deleteTodo = async (req, res) => {
  try {
    await db.delete(todolist);
    // reset the id to 1
    await db.execute(sql`ALTER SEQUENCE "todolist_id_seq" RESTART WITH 1`);
    res.json("all rows are deleted");
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
// test route
export const test = (req, res) => {
  console.log("Test route hit!");
  res.json({ message: "Test is successful" });
};
