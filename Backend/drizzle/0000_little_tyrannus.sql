CREATE TABLE "todolist" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "todolist_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"todo" varchar(255) NOT NULL,
	"todo_completed" boolean DEFAULT false
);
