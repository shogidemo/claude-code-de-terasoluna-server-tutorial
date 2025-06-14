package com.example.todoapp.app.todo;

import com.example.todoapp.domain.model.Todo;
import com.example.todoapp.domain.service.TodoService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import org.terasoluna.gfw.common.exception.BusinessException;
import org.terasoluna.gfw.common.exception.ResourceNotFoundException;
import org.terasoluna.gfw.common.message.ResultMessage;
import org.terasoluna.gfw.common.message.ResultMessages;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.model;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;

@WebMvcTest(TodoController.class)
class TodoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TodoService todoService;

    @Test
    void list_returnsListView() throws Exception {
        // Given
        List<Todo> todos = Arrays.asList(createSampleTodo());
        when(todoService.findAll()).thenReturn(todos);

        // When & Then
        mockMvc.perform(get("/todo/list"))
                .andExpect(status().isOk())
                .andExpect(view().name("todo/list"))
                .andExpect(model().attributeExists("todos"))
                .andExpect(model().attributeExists("todoForm"));

        verify(todoService).findAll();
    }

    @Test
    void create_redirectsToList_whenValidInput() throws Exception {
        // Given
        Todo createdTodo = createSampleTodo();
        when(todoService.create(any(Todo.class))).thenReturn(createdTodo);

        // When & Then
        mockMvc.perform(post("/todo/create")
                .param("todoTitle", "Test Todo"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/todo/list"));

        verify(todoService).create(any(Todo.class));
    }

    @Test
    void create_returnsListView_whenValidationError() throws Exception {
        // Given
        List<Todo> todos = Arrays.asList(createSampleTodo());
        when(todoService.findAll()).thenReturn(todos);

        // When & Then
        mockMvc.perform(post("/todo/create")
                .param("todoTitle", "")) // Empty title should cause validation error
                .andExpect(status().isOk())
                .andExpect(view().name("todo/list"))
                .andExpect(model().hasErrors());

        verify(todoService, never()).create(any(Todo.class));
        verify(todoService).findAll();
    }

    @Test
    void create_returnsListView_whenBusinessException() throws Exception {
        // Given
        List<Todo> todos = Arrays.asList(createSampleTodo());
        when(todoService.findAll()).thenReturn(todos);
        
        ResultMessages messages = ResultMessages.error();
        messages.add(ResultMessage.fromText("Business error"));
        BusinessException exception = new BusinessException(messages);
        when(todoService.create(any(Todo.class))).thenThrow(exception);

        // When & Then
        mockMvc.perform(post("/todo/create")
                .param("todoTitle", "Test Todo"))
                .andExpect(status().isOk())
                .andExpect(view().name("todo/list"));

        verify(todoService).create(any(Todo.class));
        verify(todoService).findAll();
    }

    @Test
    void finish_redirectsToList_whenSuccess() throws Exception {
        // Given
        Todo finishedTodo = createSampleTodo();
        finishedTodo.setFinished(true);
        when(todoService.finish(1L)).thenReturn(finishedTodo);

        // When & Then
        mockMvc.perform(post("/todo/finish")
                .param("todoId", "1"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/todo/list"));

        verify(todoService).finish(1L);
    }

    @Test
    void finish_returnsListView_whenBusinessException() throws Exception {
        // Given
        List<Todo> todos = Arrays.asList(createSampleTodo());
        when(todoService.findAll()).thenReturn(todos);
        
        ResultMessages messages = ResultMessages.error();
        messages.add(ResultMessage.fromText("Already finished"));
        BusinessException exception = new BusinessException(messages);
        when(todoService.finish(1L)).thenThrow(exception);

        // When & Then
        mockMvc.perform(post("/todo/finish")
                .param("todoId", "1"))
                .andExpect(status().isOk())
                .andExpect(view().name("todo/list"));

        verify(todoService).finish(1L);
        verify(todoService).findAll();
    }

    @Test
    void delete_redirectsToList_whenSuccess() throws Exception {
        // Given
        doNothing().when(todoService).delete(1L);

        // When & Then
        mockMvc.perform(post("/todo/delete")
                .param("todoId", "1"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/todo/list"));

        verify(todoService).delete(1L);
    }

    @Test
    void delete_returnsListView_whenResourceNotFoundException() throws Exception {
        // Given
        List<Todo> todos = Arrays.asList(createSampleTodo());
        when(todoService.findAll()).thenReturn(todos);
        
        ResultMessages messages = ResultMessages.error();
        messages.add(ResultMessage.fromText("Todo not found"));
        ResourceNotFoundException exception = new ResourceNotFoundException(messages);
        doThrow(exception).when(todoService).delete(1L);

        // When & Then
        mockMvc.perform(post("/todo/delete")
                .param("todoId", "1"))
                .andExpect(status().isOk())
                .andExpect(view().name("todo/list"));

        verify(todoService).delete(1L);
        verify(todoService).findAll();
    }

    private Todo createSampleTodo() {
        Todo todo = new Todo();
        todo.setTodoId(1L);
        todo.setTodoTitle("Sample Todo");
        todo.setFinished(false);
        todo.setCreatedAt(LocalDateTime.now());
        return todo;
    }
}