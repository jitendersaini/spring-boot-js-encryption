package com.example.encryptiondemo.controller;

import com.example.encryptiondemo.dto.ApiResponse;
import com.example.encryptiondemo.dto.UserRequest;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class GeneralController {
    
    @GetMapping("/general/hello")
    public ApiResponse getGeneralHello() {
        return new ApiResponse(true, "Hello from general GET endpoint!", 
            Map.of("timestamp", LocalDateTime.now(), "method", "GET", "path", "/general/hello"));
    }
    
    @PostMapping("/general/user")
    public ApiResponse createGeneralUser(@RequestBody UserRequest userRequest) {
        System.out.println("Received general user data: " + userRequest);
        
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("user", userRequest);
        responseData.put("timestamp", LocalDateTime.now());
        responseData.put("method", "POST");
        responseData.put("path", "/general/user");
        
        return new ApiResponse(true, "General user created successfully!", responseData);
    }
    
    @PutMapping("/general/user/{id}")
    public ApiResponse updateGeneralUser(@PathVariable Long id, @RequestBody UserRequest userRequest) {
        System.out.println("Updating general user " + id + " with data: " + userRequest);
        
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("userId", id);
        responseData.put("user", userRequest);
        responseData.put("timestamp", LocalDateTime.now());
        responseData.put("method", "PUT");
        responseData.put("path", "/general/user/" + id);
        
        return new ApiResponse(true, "General user updated successfully!", responseData);
    }
    
    @DeleteMapping("/general/user/{id}")
    public ApiResponse deleteGeneralUser(@PathVariable Long id) {
        System.out.println("Deleting general user: " + id);
        
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("deletedUserId", id);
        responseData.put("timestamp", LocalDateTime.now());
        responseData.put("method", "DELETE");
        responseData.put("path", "/general/user/" + id);
        
        return new ApiResponse(true, "General user deleted successfully!", responseData);
    }
    
    @PostMapping("/admin/settings")
    public ApiResponse updateAdminSettings(@RequestBody Map<String, Object> settings) {
        System.out.println("Received admin settings: " + settings);
        
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("settings", settings);
        responseData.put("timestamp", LocalDateTime.now());
        responseData.put("method", "POST");
        responseData.put("path", "/admin/settings");
        
        return new ApiResponse(true, "Admin settings updated successfully!", responseData);
    }
    
    @PostMapping("/reports/generate")
    public ApiResponse generateReport(@RequestBody Map<String, Object> reportRequest) {
        System.out.println("Received report request: " + reportRequest);
        
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("reportRequest", reportRequest);
        responseData.put("timestamp", LocalDateTime.now());
        responseData.put("method", "POST");
        responseData.put("path", "/reports/generate");
        
        return new ApiResponse(true, "Report generated successfully!", responseData);
    }
}
