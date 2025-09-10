package com.example.encryptiondemo.controller;

import com.example.encryptiondemo.dto.ApiResponse;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/department")
@CrossOrigin(origins = "*")
public class DepartmentController {
    
    @GetMapping("/list")
    public ApiResponse getDepartments() {
        return new ApiResponse(true, "Departments retrieved successfully!", 
            Map.of("departments", new String[]{"IT", "HR", "Finance", "Marketing"}, 
                   "timestamp", LocalDateTime.now(), 
                   "method", "GET", 
                   "path", "/department/list"));
    }
    
    @PostMapping("/create")
    public ApiResponse createDepartment(@RequestBody Map<String, Object> departmentData) {
        System.out.println("Received department creation data: " + departmentData);
        
        Map<String, Object> responseData = Map.of(
            "department", departmentData,
            "timestamp", LocalDateTime.now(),
            "method", "POST",
            "path", "/department/create"
        );
        
        return new ApiResponse(true, "Department created successfully!", responseData);
    }
    
    @PutMapping("/update/{id}")
    public ApiResponse updateDepartment(@PathVariable Long id, @RequestBody Map<String, Object> departmentData) {
        System.out.println("Updating department " + id + " with data: " + departmentData);
        
        Map<String, Object> responseData = Map.of(
            "departmentId", id,
            "department", departmentData,
            "timestamp", LocalDateTime.now(),
            "method", "PUT",
            "path", "/department/update/" + id
        );
        
        return new ApiResponse(true, "Department updated successfully!", responseData);
    }
}
