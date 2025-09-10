package com.example.encryptiondemo.util;

import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Utility class for generating encryption keys
 * Use this to generate keys for production deployment
 */
public class KeyGeneratorUtil {
    
    public static void main(String[] args) {
        try {
            String key = generateAESKey();
            System.out.println("Generated AES-128 Key (Base64): " + key);
            System.out.println();
            System.out.println("To use this key in production:");
            System.out.println("1. Set environment variable: export ENCRYPTION_KEY=\"" + key + "\"");
            System.out.println("2. Or add to application-prod.properties: app.encryption.key=" + key);
            System.out.println();
            System.out.println("Security Note: Keep this key secure and never commit it to version control!");
        } catch (Exception e) {
            System.err.println("Failed to generate key: " + e.getMessage());
        }
    }
    
    public static String generateAESKey() throws NoSuchAlgorithmException {
        KeyGenerator keyGenerator = KeyGenerator.getInstance("AES");
        keyGenerator.init(128, new SecureRandom());
        SecretKey secretKey = keyGenerator.generateKey();
        return Base64.getEncoder().encodeToString(secretKey.getEncoded());
    }
}
