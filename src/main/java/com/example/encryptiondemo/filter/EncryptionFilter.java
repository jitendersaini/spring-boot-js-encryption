package com.example.encryptiondemo.filter;

import com.example.encryptiondemo.util.EncryptionUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Component
public class EncryptionFilter implements Filter {
    
    @Autowired
    private EncryptionUtil encryptionUtil;
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        String requestURI = httpRequest.getRequestURI();
        String method = httpRequest.getMethod();
        
        // Skip encryption for:
        // 1. GET requests (no body to encrypt)
        // 2. Static resources (CSS, JS, images, etc.)
        // 3. Health check endpoints
        // 4. WebSocket connections
        // 5. Favicon requests
        if (shouldSkipEncryption(requestURI, method)) {
            chain.doFilter(request, response);
            return;
        }
        
        // Process all non-GET requests across the entire application
        if (!"GET".equalsIgnoreCase(method)) {
            
            // Decrypt request body
            String encryptedBody = StreamUtils.copyToString(httpRequest.getInputStream(), StandardCharsets.UTF_8);
            if (!encryptedBody.isEmpty()) {
                try {
                    String decryptedBody = encryptionUtil.decrypt(encryptedBody);
                    System.out.println("Decrypted request body for " + method + " " + requestURI + ": " + decryptedBody);
                    
                    // Create a new request wrapper with decrypted body
                    DecryptedRequestWrapper requestWrapper = new DecryptedRequestWrapper(httpRequest, decryptedBody);
                    chain.doFilter(requestWrapper, response);
                    return;
                } catch (Exception e) {
                    System.err.println("Decryption failed for " + method + " " + requestURI + ": " + e.getMessage());
                    httpResponse.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    httpResponse.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    httpResponse.getWriter().write("{\"success\":false,\"message\":\"Decryption failed\"}");
                    return;
                }
            }
        }
        
        chain.doFilter(request, response);
    }
    
    /**
     * Determine if encryption should be skipped for this request
     */
    private boolean shouldSkipEncryption(String requestURI, String method) {
        // Skip GET requests
        if ("GET".equalsIgnoreCase(method)) {
            return true;
        }
        
        // Skip static resources
        if (requestURI.startsWith("/static/") || 
            requestURI.startsWith("/css/") || 
            requestURI.startsWith("/js/") || 
            requestURI.startsWith("/images/") || 
            requestURI.startsWith("/webjars/") ||
            requestURI.endsWith(".css") || 
            requestURI.endsWith(".js") || 
            requestURI.endsWith(".png") || 
            requestURI.endsWith(".jpg") || 
            requestURI.endsWith(".jpeg") || 
            requestURI.endsWith(".gif") || 
            requestURI.endsWith(".ico") ||
            requestURI.endsWith(".svg")) {
            return true;
        }
        
        // Skip health check and monitoring endpoints
        if (requestURI.startsWith("/actuator/") || 
            requestURI.startsWith("/health") || 
            requestURI.startsWith("/metrics") ||
            requestURI.startsWith("/info")) {
            return true;
        }
        
        // Skip WebSocket connections
        if (requestURI.startsWith("/ws/") || 
            requestURI.startsWith("/websocket/")) {
            return true;
        }
        
        // Skip favicon and other browser requests
        if (requestURI.equals("/favicon.ico") || 
            requestURI.startsWith("/.well-known/")) {
            return true;
        }
        
        return false;
    }
}
