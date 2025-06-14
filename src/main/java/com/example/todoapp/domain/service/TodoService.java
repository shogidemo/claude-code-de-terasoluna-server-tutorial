package com.example.todoapp.domain.service;

import com.example.todoapp.domain.model.Todo;
import java.util.Collection;

public interface TodoService {
    
    Collection<Todo> findAll();
    
    Todo create(Todo todo);
    
    Todo finish(Long todoId);
    
    void delete(Long todoId);
}