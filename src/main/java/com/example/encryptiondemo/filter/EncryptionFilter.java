package com.example.encryptiondemo.filter;

import com.example.encryptiondemo.config.EncryptionProperties;
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
import java.util.List;
import java.util.Map;

@Component
public class EncryptionFilter implements Filter {
    
    @Autowired
    private EncryptionUtil encryptionUtil;
    
    @Autowired
    private EncryptionProperties encryptionProperties;
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        // Check if encryption is enabled and if this request matches any encrypted paths
        if (encryptionProperties.isEnabled() && 
            !"GET".equalsIgnoreCase(httpRequest.getMethod()) && 
            matchesEncryptedPath(httpRequest.getRequestURI())) {
            
            // Decrypt request body
            String encryptedBody = StreamUtils.copyToString(httpRequest.getInputStream(), StandardCharsets.UTF_8);
            if (!encryptedBody.isEmpty()) {
                try {
                    String decryptedBody = encryptionUtil.decrypt(encryptedBody);
                    System.out.println("Decrypted request body for " + httpRequest.getMethod() + " " + httpRequest.getRequestURI() + ": " + decryptedBody);
                    
                    // Create a new request wrapper with decrypted body
                    DecryptedRequestWrapper wrappedRequest = new DecryptedRequestWrapper(httpRequest, decryptedBody);
                    chain.doFilter(wrappedRequest, response);
                    return;
                } catch (Exception e) {
                    System.err.println("Decryption failed for " + httpRequest.getMethod() + " " + httpRequest.getRequestURI() + ": " + e.getMessage());
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
     * Check if the given URI matches any of the configured encrypted paths
     */
    private boolean matchesEncryptedPath(String requestURI) {
        List<String> encryptedPaths = encryptionProperties.getEncryptedPaths();
        if (encryptedPaths == null || encryptedPaths.isEmpty()) {
            return false;
        }
        
        for (String path : encryptedPaths) {
            if (path.endsWith("/*")) {
                // Handle wildcard patterns like /api/*, /user/*
                String prefix = path.substring(0, path.length() - 2);
                if (requestURI.startsWith(prefix)) {
                    return true;
                }
            } else if (path.equals(requestURI)) {
                // Handle exact matches
                return true;
            }
        }
        
        return false;
    }
}
