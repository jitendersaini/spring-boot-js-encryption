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
        
        // Only process non-GET requests for API endpoints
        if (!"GET".equalsIgnoreCase(httpRequest.getMethod()) && 
            httpRequest.getRequestURI().startsWith("/api/")) {
            
            // Decrypt request body
            String encryptedBody = StreamUtils.copyToString(httpRequest.getInputStream(), StandardCharsets.UTF_8);
            if (!encryptedBody.isEmpty()) {
                try {
                    String decryptedBody = encryptionUtil.decrypt(encryptedBody);
                    System.out.println("Decrypted request body: " + decryptedBody);
                    
                    // Create a new request wrapper with decrypted body
                    DecryptedRequestWrapper requestWrapper = new DecryptedRequestWrapper(httpRequest, decryptedBody);
                    chain.doFilter(requestWrapper, response);
                    return;
                } catch (Exception e) {
                    System.err.println("Decryption failed: " + e.getMessage());
                    httpResponse.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    httpResponse.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    httpResponse.getWriter().write("{\"success\":false,\"message\":\"Decryption failed\"}");
                    return;
                }
            }
        }
        
        chain.doFilter(request, response);
    }
}
