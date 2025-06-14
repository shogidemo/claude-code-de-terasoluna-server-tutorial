package com.example.todoapp.app.common.error;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.terasoluna.gfw.common.exception.BusinessException;
import org.terasoluna.gfw.common.exception.ResourceNotFoundException;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;

@Controller
public class TodoErrorController implements ErrorController {

    @RequestMapping("/error")
    public String handleError(HttpServletRequest request, Model model) {
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        Object exception = request.getAttribute(RequestDispatcher.ERROR_EXCEPTION);
        
        if (status != null) {
            int statusCode = Integer.parseInt(status.toString());
            
            switch (statusCode) {
                case 404:
                    model.addAttribute("errorMessage", "お探しのページは見つかりませんでした。");
                    return "error/404";
                case 500:
                    model.addAttribute("errorMessage", "サーバー内部エラーが発生しました。");
                    return "error/500";
                default:
                    model.addAttribute("errorMessage", "予期しないエラーが発生しました。");
                    return "error/error";
            }
        }
        
        return "error/error";
    }
}