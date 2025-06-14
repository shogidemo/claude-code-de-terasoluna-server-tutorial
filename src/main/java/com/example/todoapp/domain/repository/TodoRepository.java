package com.example.todoapp.domain.repository;

import com.example.todoapp.domain.model.Todo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TodoRepository extends JpaRepository<Todo, Long> {

    @Query("SELECT COUNT(t) FROM Todo t WHERE t.finished = :finished")
    long countByFinished(@Param("finished") boolean finished);

    List<Todo> findAllByOrderByCreatedAtDesc();

    List<Todo> findByFinishedOrderByCreatedAtDesc(boolean finished);
}