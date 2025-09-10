package com.example.encryptiondemo.controller;

import com.example.encryptiondemo.dto.ApiResponse;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "*")
public class AdminController {
    
    @GetMapping("/dashboard")
    public ApiResponse getDashboard() {
        return new ApiResponse(true, "Admin dashboard data retrieved!", 
            Map.of("stats", Map.of("users", 150, "departments", 5, "activeSessions", 23), 
                   "timestamp", LocalDateTime.now(), 
                   "method", "GET", 
                   "path", "/admin/dashboard"));
    }
    
    @PostMapping("/settings")
    public ApiResponse updateSettings(@RequestBody Map<String, Object> settingsData) {
        System.out.println("Received admin settings data: " + settingsData);
        
        Map<String, Object> responseData = Map.of(
            "settings", settingsData,
            "timestamp", LocalDateTime.now(),
            "method", "POST",
            "path", "/admin/settings"
        );
        
        return new ApiResponse(true, "Settings updated successfully!", responseData);
    }
    
    @PutMapping("/user/{id}/role")
    public ApiResponse updateUserRole(@PathVariable Long id, @RequestBody Map<String, Object> roleData) {
        System.out.println("Updating user " + id + " role with data: " + roleData);
        
        Map<String, Object> responseData = Map.of(
            "userId", id,
            "role", roleData,
            "timestamp", LocalDateTime.now(),
            "method", "PUT",
            "path", "/admin/user/" + id + "/role"
        );
        
        return new ApiResponse(true, "User role updated successfully!", responseData);
    }
}
