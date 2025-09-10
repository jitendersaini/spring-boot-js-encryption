package com.example.encryptiondemo.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
public class KeyManagementService {
    
    @Value("${app.encryption.key:}")
    private String configuredKey;
    
    @Value("${app.encryption.key-rotation-minutes:60}")
    private int keyRotationMinutes;
    
    private final ConcurrentHashMap<String, String> activeKeys = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    
    public KeyManagementService() {
        // Start key rotation if configured
        if (keyRotationMinutes > 0) {
            scheduler.scheduleAtFixedRate(this::rotateKeys, keyRotationMinutes, keyRotationMinutes, TimeUnit.MINUTES);
        }
    }
    
    public String getCurrentKey() {
        if (configuredKey != null && !configuredKey.isEmpty()) {
            return configuredKey;
        }
        
        // Use the first key if it exists, otherwise generate a new one
        if (activeKeys.isEmpty()) {
            String keyId = generateKeyId();
            String key = generateAESKey();
            activeKeys.put(keyId, key);
        }
        
        // Return the first (and only) key
        return activeKeys.values().iterator().next();
    }
    
    public String getKeyForClient() {
        // For production, you might want to return a different key or use key exchange
        return getCurrentKey();
    }
    
    public boolean validateKey(String key) {
        if (configuredKey != null && !configuredKey.isEmpty()) {
            return configuredKey.equals(key);
        }
        return activeKeys.containsValue(key);
    }
    
    private String generateKeyId() {
        return "key_" + System.currentTimeMillis();
    }
    
    private String generateAESKey() {
        try {
            KeyGenerator keyGenerator = KeyGenerator.getInstance("AES");
            keyGenerator.init(128, new SecureRandom());
            SecretKey secretKey = keyGenerator.generateKey();
            return Base64.getEncoder().encodeToString(secretKey.getEncoded());
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Failed to generate AES key", e);
        }
    }
    
    private void rotateKeys() {
        // Clean up old keys and generate new ones
        activeKeys.clear();
        System.out.println("Keys rotated at: " + java.time.LocalDateTime.now());
    }
    
    public void shutdown() {
        scheduler.shutdown();
    }
}
