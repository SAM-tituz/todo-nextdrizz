import { getTodos } from "./actions";
import TodoList from "./TodoList";

export default async function Home() {
 
  // fetch all todos
  const  alltodos:Promise<Todo[]>=getTodos()
const todos=await alltodos;

  return <TodoList initialTodos={todos}/>
}
