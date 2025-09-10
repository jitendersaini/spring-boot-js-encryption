package com.example.encryptiondemo.controller;

import com.example.encryptiondemo.service.KeyManagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebController {
    
    @Autowired
    private KeyManagementService keyManagementService;
    
    @GetMapping("/")
    public String index(Model model) {
        model.addAttribute("title", "Encryption Demo");
        // Embed the encryption key in the page for security
        model.addAttribute("encryptionKey", keyManagementService.getKeyForClient());
        return "index";
    }
}
