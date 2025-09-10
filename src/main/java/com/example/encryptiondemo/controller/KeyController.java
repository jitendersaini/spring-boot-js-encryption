package com.example.encryptiondemo.controller;

import com.example.encryptiondemo.service.KeyManagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class KeyController {
    
    @Autowired
    private KeyManagementService keyManagementService;
    
    /**
     * Get encryption key for client-side encryption
     * This endpoint provides the encryption key to the frontend
     */
    @GetMapping("/key")
    public Map<String, String> getEncryptionKey() {
        Map<String, String> response = new HashMap<>();
        try {
            String key = keyManagementService.getKeyForClient();
            response.put("key", key);
            response.put("status", "success");
        } catch (Exception e) {
            response.put("error", "Failed to retrieve encryption key: " + e.getMessage());
            response.put("status", "error");
        }
        return response;
    }
}
