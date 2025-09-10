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
     * DEPRECATED: This endpoint is no longer used for security reasons.
     * Keys are now embedded in the page during server-side rendering.
     * 
     * This endpoint is kept for backward compatibility but should be removed in production.
     */
    @Deprecated
    @PostMapping("/encryption-key")
    public Map<String, String> getEncryptionKey(@RequestHeader(value = "X-Client-Id", required = false) String clientId) {
        // This endpoint is deprecated for security reasons
        throw new SecurityException("This endpoint is deprecated. Keys are now embedded in the page.");
    }
}
