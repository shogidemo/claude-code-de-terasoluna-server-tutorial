package com.example.todoapp.domain.repository;

import com.example.todoapp.domain.model.Todo;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class TodoRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private TodoRepository todoRepository;

    @Test
    void countByFinished_returnsCorrectCount() {
        // Given
        Todo finishedTodo = new Todo("Finished Todo");
        finishedTodo.setFinished(true);
        entityManager.persist(finishedTodo);

        Todo unfinishedTodo = new Todo("Unfinished Todo");
        unfinishedTodo.setFinished(false);
        entityManager.persist(unfinishedTodo);

        entityManager.flush();

        // When
        long finishedCount = todoRepository.countByFinished(true);
        long unfinishedCount = todoRepository.countByFinished(false);

        // Then
        assertThat(finishedCount).isEqualTo(1);
        assertThat(unfinishedCount).isEqualTo(1);
    }

    @Test
    void findAllByOrderByCreatedAtDesc_returnsInDescendingOrder() {
        // Given
        Todo oldTodo = new Todo("Old Todo");
        entityManager.persist(oldTodo);
        entityManager.flush();

        Todo newTodo = new Todo("New Todo");
        entityManager.persist(newTodo);
        entityManager.flush();

        // When
        List<Todo> todos = todoRepository.findAllByOrderByCreatedAtDesc();

        // Then
        assertThat(todos).hasSize(2);
        assertThat(todos.get(0).getTodoTitle()).isEqualTo("New Todo");
        assertThat(todos.get(1).getTodoTitle()).isEqualTo("Old Todo");
    }

    @Test
    void findByFinishedOrderByCreatedAtDesc_returnsFilteredTodos() {
        // Given
        Todo finishedTodo = new Todo("Finished Todo");
        finishedTodo.setFinished(true);
        entityManager.persist(finishedTodo);

        Todo unfinishedTodo = new Todo("Unfinished Todo");
        unfinishedTodo.setFinished(false);
        entityManager.persist(unfinishedTodo);

        entityManager.flush();

        // When
        List<Todo> finishedTodos = todoRepository.findByFinishedOrderByCreatedAtDesc(true);
        List<Todo> unfinishedTodos = todoRepository.findByFinishedOrderByCreatedAtDesc(false);

        // Then
        assertThat(finishedTodos).hasSize(1);
        assertThat(finishedTodos.get(0).getTodoTitle()).isEqualTo("Finished Todo");
        
        assertThat(unfinishedTodos).hasSize(1);
        assertThat(unfinishedTodos.get(0).getTodoTitle()).isEqualTo("Unfinished Todo");
    }
}