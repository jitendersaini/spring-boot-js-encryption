package com.example.encryptiondemo.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@ConfigurationProperties(prefix = "app.encryption")
public class EncryptionProperties {
    
    /**
     * List of URL patterns that should be encrypted.
     * Supports wildcards like /api/*, /user/*, /department/*
     */
    private List<String> encryptedPaths = List.of("/api/*");
    
    /**
     * Whether encryption is enabled globally
     */
    private boolean enabled = true;
    
    public List<String> getEncryptedPaths() {
        return encryptedPaths;
    }
    
    public void setEncryptedPaths(List<String> encryptedPaths) {
        this.encryptedPaths = encryptedPaths;
    }
    
    public boolean isEnabled() {
        return enabled;
    }
    
    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
}
