package com.example.todoapp.domain.service;

import com.example.todoapp.domain.model.Todo;
import java.util.List;

public interface TodoService {
    
    List<Todo> findAll();
    
    Todo create(Todo todo);
    
    Todo finish(Long todoId);
    
    void delete(Long todoId);
}