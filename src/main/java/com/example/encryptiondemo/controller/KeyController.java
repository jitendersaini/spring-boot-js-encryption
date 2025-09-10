// package com.example.encryptiondemo.controller;

// import com.example.encryptiondemo.service.KeyManagementService;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.web.bind.annotation.*;

// import java.util.HashMap;
// import java.util.Map;

// @RestController
// @RequestMapping("/api")
// @CrossOrigin(origins = "*")
// public class KeyController {
    
//     @Autowired
//     private KeyManagementService keyManagementService;
    
//     /**
//      * SECURITY WARNING: This endpoint exposes the encryption key publicly!
//      * This is a major security vulnerability and should NEVER be used in production.
//      * The key should only be embedded in server-side rendered templates.
//      */
//     @Deprecated
//     @GetMapping("/key")
//     public Map<String, String> getEncryptionKey() {
//         // This endpoint is disabled for security reasons
//         throw new SecurityException("This endpoint is disabled for security reasons. Keys should not be exposed via public API.");
//     }
// }
