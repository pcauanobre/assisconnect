package com.assisconnect.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("/")
    public String index() {
        // Redireciona para o index.html que está em /static
        return "forward:/login.html";
    }
}
