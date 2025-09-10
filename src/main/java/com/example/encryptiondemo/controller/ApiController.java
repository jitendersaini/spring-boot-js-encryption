package com.example.encryptiondemo.controller;

import com.example.encryptiondemo.dto.ApiResponse;
import com.example.encryptiondemo.dto.UserRequest;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ApiController {
    
    @GetMapping("/hello")
    public ApiResponse getHello() {
        return new ApiResponse(true, "Hello from GET endpoint!", 
            Map.of("timestamp", LocalDateTime.now(), "method", "GET"));
    }

    @GetMapping("/users")
    public Map<String, Object> getUsers() {
        List<Map<String, Object>> users = new ArrayList<>();
        
        // Sample data for DataTable
        for (int i = 1; i <= 10; i++) {
            Map<String, Object> user = new HashMap<>();
            user.put("id", i);
            user.put("name", "User " + i);
            user.put("email", "user" + i + "@example.com");
            user.put("message", "Sample message for user " + i);
            user.put("created", LocalDateTime.now().minusDays(i).format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            users.add(user);
        }
        
        // Return data in DataTables expected format
        Map<String, Object> response = new HashMap<>();
        response.put("data", users);
        response.put("recordsTotal", users.size());
        response.put("recordsFiltered", users.size());
        response.put("draw", 1);
        
        return response;
    }
    
    @PostMapping("/user")
    public ApiResponse createUser(@RequestBody UserRequest userRequest) {
        System.out.println("Received user data: " + userRequest);
        
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("user", userRequest);
        responseData.put("timestamp", LocalDateTime.now());
        responseData.put("method", "POST");
        
        return new ApiResponse(true, "User created successfully!", responseData);
    }
    
    @PutMapping("/user/{id}")
    public ApiResponse updateUser(@PathVariable Long id, @RequestBody UserRequest userRequest) {
        System.out.println("Updating user " + id + " with data: " + userRequest);
        
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("userId", id);
        responseData.put("user", userRequest);
        responseData.put("timestamp", LocalDateTime.now());
        responseData.put("method", "PUT");
        
        return new ApiResponse(true, "User updated successfully!", responseData);
    }
    
    @DeleteMapping("/user/{id}")
    public ApiResponse deleteUser(@PathVariable Long id) {
        System.out.println("Deleting user: " + id);
        
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("deletedUserId", id);
        responseData.put("timestamp", LocalDateTime.now());
        responseData.put("method", "DELETE");
        
        return new ApiResponse(true, "User deleted successfully!", responseData);
    }
}
