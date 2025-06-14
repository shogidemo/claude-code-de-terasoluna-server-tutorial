package com.example.todoapp.app.todo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.io.Serializable;

public class TodoForm implements Serializable {

    public interface TodoCreate {}
    public interface TodoFinish {}
    public interface TodoDelete {}

    @NotBlank(groups = {TodoCreate.class})
    @Size(min = 1, max = 30, groups = {TodoCreate.class})
    private String todoTitle;

    public String getTodoTitle() {
        return todoTitle;
    }

    public void setTodoTitle(String todoTitle) {
        this.todoTitle = todoTitle;
    }

    @Override
    public String toString() {
        return "TodoForm{" +
                "todoTitle='" + todoTitle + '\'' +
                '}';
    }
}