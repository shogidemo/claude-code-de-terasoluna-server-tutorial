package com.example.todoapp.app.todo;

import com.example.todoapp.domain.model.Todo;
import com.example.todoapp.domain.service.TodoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.terasoluna.gfw.common.exception.BusinessException;
import org.terasoluna.gfw.common.exception.ResourceNotFoundException;
import org.terasoluna.gfw.common.message.ResultMessage;
import org.terasoluna.gfw.common.message.ResultMessages;

import java.util.List;

@Controller
@RequestMapping("todo")
public class TodoController {

    @Autowired
    TodoService todoService;

    @ModelAttribute
    public TodoForm setUpForm() {
        TodoForm form = new TodoForm();
        return form;
    }

    @RequestMapping(value = "list")
    public String list(Model model) {
        List<Todo> todos = todoService.findAll();
        model.addAttribute("todos", todos);
        return "todo/list";
    }

    @RequestMapping(value = "create", method = RequestMethod.POST)
    public String create(@Validated({TodoForm.TodoCreate.class}) TodoForm todoForm,
                        BindingResult bindingResult, Model model, RedirectAttributes attributes) {

        if (bindingResult.hasErrors()) {
            return list(model);
        }

        Todo todo = new Todo();
        todo.setTodoTitle(todoForm.getTodoTitle());

        try {
            todoService.create(todo);
        } catch (BusinessException e) {
            model.addAttribute(e.getResultMessages());
            return list(model);
        }

        attributes.addFlashAttribute(ResultMessages.success().add(
                ResultMessage.fromText("Created successfully!")));
        return "redirect:/todo/list";
    }

    @RequestMapping(value = "finish", method = RequestMethod.POST)
    public String finish(@RequestParam("todoId") Long todoId, Model model,
                        RedirectAttributes attributes) {
        try {
            todoService.finish(todoId);
        } catch (BusinessException | ResourceNotFoundException e) {
            model.addAttribute(e.getResultMessages());
            return list(model);
        }

        attributes.addFlashAttribute(ResultMessages.success().add(
                ResultMessage.fromText("Finished successfully!")));
        return "redirect:/todo/list";
    }

    @RequestMapping(value = "delete", method = RequestMethod.POST)
    public String delete(@RequestParam("todoId") Long todoId, Model model,
                        RedirectAttributes attributes) {
        try {
            todoService.delete(todoId);
        } catch (BusinessException | ResourceNotFoundException e) {
            model.addAttribute(e.getResultMessages());
            return list(model);
        }

        attributes.addFlashAttribute(ResultMessages.success().add(
                ResultMessage.fromText("Deleted successfully!")));
        return "redirect:/todo/list";
    }
}