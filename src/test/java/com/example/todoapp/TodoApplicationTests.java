package com.example.todoapp;

import com.example.todoapp.domain.model.Todo;
import com.example.todoapp.domain.repository.TodoRepository;
import com.example.todoapp.domain.service.TodoService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@Transactional
class TodoApplicationTests {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private TodoService todoService;

    @Autowired
    private TodoRepository todoRepository;

    @Test
    void contextLoads() {
        assertThat(todoService).isNotNull();
        assertThat(todoRepository).isNotNull();
    }

    @Test
    void rootPathRedirectsToTodoList() {
        ResponseEntity<String> response = restTemplate.getForEntity(
                "http://localhost:" + port + "/", String.class);
        
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).contains("TODO List");
    }

    @Test
    void todoListPageIsAccessible() {
        ResponseEntity<String> response = restTemplate.getForEntity(
                "http://localhost:" + port + "/todo/list", String.class);
        
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).contains("TODO List");
    }

    @Test
    void todoServiceCanCreateAndRetrieveTodos() {
        // Given
        Todo todo = new Todo("Integration Test Todo");
        
        // When
        Todo createdTodo = todoService.create(todo);
        
        // Then
        assertThat(createdTodo).isNotNull();
        assertThat(createdTodo.getTodoId()).isNotNull();
        assertThat(createdTodo.getTodoTitle()).isEqualTo("Integration Test Todo");
        assertThat(createdTodo.isFinished()).isFalse();
        
        // Verify it can be retrieved
        assertThat(todoService.findAll()).contains(createdTodo);
    }

    @Test
    void todoServiceCanFinishTodo() {
        // Given
        Todo todo = new Todo("Todo to be finished");
        Todo createdTodo = todoService.create(todo);
        
        // When
        Todo finishedTodo = todoService.finish(createdTodo.getTodoId());
        
        // Then
        assertThat(finishedTodo.isFinished()).isTrue();
    }

    @Test
    void todoServiceCanDeleteTodo() {
        // Given
        Todo todo = new Todo("Todo to be deleted");
        Todo createdTodo = todoService.create(todo);
        
        // When
        todoService.delete(createdTodo.getTodoId());
        
        // Then
        assertThat(todoService.findAll()).doesNotContain(createdTodo);
    }
}