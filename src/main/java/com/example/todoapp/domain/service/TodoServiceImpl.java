package com.example.todoapp.domain.service;

import com.example.todoapp.domain.model.Todo;
import com.example.todoapp.domain.repository.TodoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.terasoluna.gfw.common.exception.BusinessException;
import org.terasoluna.gfw.common.exception.ResourceNotFoundException;
import org.terasoluna.gfw.common.message.ResultMessage;
import org.terasoluna.gfw.common.message.ResultMessages;

import java.util.List;

@Service
@Transactional
public class TodoServiceImpl implements TodoService {

    private static final long MAX_UNFINISHED_COUNT = 5;

    @Autowired
    TodoRepository todoRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Todo> findAll() {
        return todoRepository.findAllByOrderByCreatedAtDesc();
    }

    @Override
    public Todo create(Todo todo) {
        long unfinishedCount = todoRepository.countByFinished(false);
        if (unfinishedCount >= MAX_UNFINISHED_COUNT) {
            ResultMessages messages = ResultMessages.error();
            messages.add(ResultMessage.fromText(
                    "[E001] The count of un-finished Todo must not be over " + MAX_UNFINISHED_COUNT + "."));
            throw new BusinessException(messages);
        }
        return todoRepository.save(todo);
    }

    @Override
    public Todo finish(Long todoId) {
        Todo todo = findOne(todoId);
        if (todo.isFinished()) {
            ResultMessages messages = ResultMessages.error();
            messages.add(ResultMessage.fromText("[E002] The requested Todo is already finished. (id=" + todoId + ")"));
            throw new BusinessException(messages);
        }
        todo.setFinished(true);
        return todoRepository.save(todo);
    }

    @Override
    public void delete(Long todoId) {
        Todo todo = findOne(todoId);
        todoRepository.delete(todo);
    }

    private Todo findOne(Long todoId) {
        return todoRepository.findById(todoId).orElseThrow(() -> {
            ResultMessages messages = ResultMessages.error();
            messages.add(ResultMessage.fromText("[E404] The requested Todo is not found. (id=" + todoId + ")"));
            return new ResourceNotFoundException(messages);
        });
    }
}