package com.example.todoapp.domain.service;

import com.example.todoapp.domain.model.Todo;
import com.example.todoapp.domain.repository.TodoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.terasoluna.gfw.common.exception.BusinessException;
import org.terasoluna.gfw.common.exception.ResourceNotFoundException;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collection;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TodoServiceImplTest {

    @Mock
    private TodoRepository todoRepository;

    @InjectMocks
    private TodoServiceImpl todoService;

    private Todo sampleTodo;

    @BeforeEach
    void setUp() {
        sampleTodo = new Todo();
        sampleTodo.setTodoId(1L);
        sampleTodo.setTodoTitle("Test Todo");
        sampleTodo.setFinished(false);
        sampleTodo.setCreatedAt(LocalDateTime.now());
    }

    @Test
    void findAll_returnsAllTodos() {
        // Given
        Collection<Todo> expectedTodos = Arrays.asList(sampleTodo);
        when(todoRepository.findAllByOrderByCreatedAtDesc()).thenReturn(expectedTodos);

        // When
        Collection<Todo> actualTodos = todoService.findAll();

        // Then
        assertThat(actualTodos).isEqualTo(expectedTodos);
        verify(todoRepository).findAllByOrderByCreatedAtDesc();
    }

    @Test
    void create_savesTodo_whenUnfinishedCountIsLessThanMax() {
        // Given
        when(todoRepository.countByFinished(false)).thenReturn(4L);
        when(todoRepository.save(any(Todo.class))).thenReturn(sampleTodo);

        // When
        Todo result = todoService.create(sampleTodo);

        // Then
        assertThat(result).isEqualTo(sampleTodo);
        verify(todoRepository).countByFinished(false);
        verify(todoRepository).save(sampleTodo);
    }

    @Test
    void create_throwsBusinessException_whenUnfinishedCountReachesMax() {
        // Given
        when(todoRepository.countByFinished(false)).thenReturn(5L);

        // When & Then
        assertThatThrownBy(() -> todoService.create(sampleTodo))
                .isInstanceOf(BusinessException.class);
        
        verify(todoRepository).countByFinished(false);
        verify(todoRepository, never()).save(any(Todo.class));
    }

    @Test
    void finish_marksTodoAsFinished_whenTodoExistsAndNotFinished() {
        // Given
        when(todoRepository.findById(1L)).thenReturn(Optional.of(sampleTodo));
        when(todoRepository.save(any(Todo.class))).thenReturn(sampleTodo);

        // When
        Todo result = todoService.finish(1L);

        // Then
        assertThat(result.isFinished()).isTrue();
        verify(todoRepository).findById(1L);
        verify(todoRepository).save(sampleTodo);
    }

    @Test
    void finish_throwsBusinessException_whenTodoIsAlreadyFinished() {
        // Given
        sampleTodo.setFinished(true);
        when(todoRepository.findById(1L)).thenReturn(Optional.of(sampleTodo));

        // When & Then
        assertThatThrownBy(() -> todoService.finish(1L))
                .isInstanceOf(BusinessException.class);
        
        verify(todoRepository).findById(1L);
        verify(todoRepository, never()).save(any(Todo.class));
    }

    @Test
    void finish_throwsResourceNotFoundException_whenTodoNotFound() {
        // Given
        when(todoRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> todoService.finish(1L))
                .isInstanceOf(ResourceNotFoundException.class);
        
        verify(todoRepository).findById(1L);
        verify(todoRepository, never()).save(any(Todo.class));
    }

    @Test
    void delete_removesTodo_whenTodoExists() {
        // Given
        when(todoRepository.findById(1L)).thenReturn(Optional.of(sampleTodo));

        // When
        todoService.delete(1L);

        // Then
        verify(todoRepository).findById(1L);
        verify(todoRepository).delete(sampleTodo);
    }

    @Test
    void delete_throwsResourceNotFoundException_whenTodoNotFound() {
        // Given
        when(todoRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> todoService.delete(1L))
                .isInstanceOf(ResourceNotFoundException.class);
        
        verify(todoRepository).findById(1L);
        verify(todoRepository, never()).delete(any(Todo.class));
    }
}