package com.example.encryptiondemo.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class KeyManagementService {
    
    @Value("${app.encryption.key:VRYnbfWvjr0j4K9iZDnvjQ==}")
    private String encryptionKey;
    
    public String getCurrentKey() {
        if (encryptionKey == null || encryptionKey.trim().isEmpty()) {
            throw new RuntimeException("Encryption key not configured. Please set app.encryption.key property or ENCRYPTION_KEY environment variable.");
        }
        return encryptionKey.trim();
    }
    
    public String getKeyForClient() {
        return getCurrentKey();
    }
    
    public boolean validateKey(String key) {
        return getCurrentKey().equals(key);
    }
}
