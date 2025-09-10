package com.example.encryptiondemo.controller;

import com.example.encryptiondemo.dto.ApiResponse;
import com.example.encryptiondemo.dto.UserRequest;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/user")
@CrossOrigin(origins = "*")
public class UserController {
    
    @GetMapping("/hello")
    public ApiResponse getHello() {
        return new ApiResponse(true, "Hello from User GET endpoint!", 
            Map.of("timestamp", LocalDateTime.now(), "method", "GET", "path", "/user/hello"));
    }
    
    @PostMapping("/create")
    public ApiResponse createUser(@RequestBody UserRequest userRequest) {
        System.out.println("Received user creation data: " + userRequest);
        
        Map<String, Object> responseData = Map.of(
            "user", userRequest,
            "timestamp", LocalDateTime.now(),
            "method", "POST",
            "path", "/user/create"
        );
        
        return new ApiResponse(true, "User created successfully!", responseData);
    }
    
    @PutMapping("/update/{id}")
    public ApiResponse updateUser(@PathVariable Long id, @RequestBody UserRequest userRequest) {
        System.out.println("Updating user " + id + " with data: " + userRequest);
        
        Map<String, Object> responseData = Map.of(
            "userId", id,
            "user", userRequest,
            "timestamp", LocalDateTime.now(),
            "method", "PUT",
            "path", "/user/update/" + id
        );
        
        return new ApiResponse(true, "User updated successfully!", responseData);
    }
}
