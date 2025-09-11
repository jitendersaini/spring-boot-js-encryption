package com.example.encryptiondemo.util;

import com.example.encryptiondemo.service.KeyManagementService;
import org.apache.commons.codec.binary.Base64;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;

@Component
public class EncryptionUtil {
    
    private static final String ALGORITHM = "AES";
    private static final String TRANSFORMATION = "AES/CBC/PKCS5Padding";
    private static final int IV_LENGTH = 16; // AES block size
    
    @Autowired
    private KeyManagementService keyManagementService;
    
    private SecretKeySpec getSecretKey() {
        String key = keyManagementService.getCurrentKey();
        byte[] keyBytes = Base64.decodeBase64(key);
        return new SecretKeySpec(keyBytes, ALGORITHM);
    }
    
    public String encrypt(String plainText) {
        try {
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            
            // Generate random IV
            byte[] iv = new byte[IV_LENGTH];
            new SecureRandom().nextBytes(iv);
            IvParameterSpec ivSpec = new IvParameterSpec(iv);
            
            cipher.init(Cipher.ENCRYPT_MODE, getSecretKey(), ivSpec);
            byte[] encryptedBytes = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
            
            // Prepend IV to encrypted data
            byte[] encryptedWithIv = new byte[IV_LENGTH + encryptedBytes.length];
            System.arraycopy(iv, 0, encryptedWithIv, 0, IV_LENGTH);
            System.arraycopy(encryptedBytes, 0, encryptedWithIv, IV_LENGTH, encryptedBytes.length);
            
            return Base64.encodeBase64String(encryptedWithIv);
        } catch (Exception e) {
            throw new RuntimeException("Encryption failed", e);
        }
    }
    
    public String decrypt(String encryptedText) {
        try {
            byte[] encryptedWithIv = Base64.decodeBase64(encryptedText);
            
            // Extract IV from the beginning of encrypted data
            byte[] iv = new byte[IV_LENGTH];
            System.arraycopy(encryptedWithIv, 0, iv, 0, IV_LENGTH);
            IvParameterSpec ivSpec = new IvParameterSpec(iv);
            
            // Extract encrypted data (without IV)
            byte[] encryptedBytes = new byte[encryptedWithIv.length - IV_LENGTH];
            System.arraycopy(encryptedWithIv, IV_LENGTH, encryptedBytes, 0, encryptedBytes.length);
            
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.DECRYPT_MODE, getSecretKey(), ivSpec);
            byte[] decryptedBytes = cipher.doFinal(encryptedBytes);
            return new String(decryptedBytes, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Decryption failed", e);
        }
    }
}
