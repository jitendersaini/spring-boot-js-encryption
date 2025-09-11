/**
 * Core Encryption Client for Spring Boot Encryption Demo
 * This file contains the core encryption logic and utilities
 * Dependencies: CryptoJS library must be loaded before this file
 */

/**
 * EncryptionClient class handles all encryption operations
 * This is a pure encryption utility with no DOM dependencies
 */
class EncryptionClient {
    constructor() {
        this.encryptionKey = null;
        this.keyPromise = null;
    }

    /**
     * Get encryption key from embedded page data (secure approach)
     * @returns {Promise<string>} Base64 encoded encryption key
     */
    async getEncryptionKey() {
        if (this.encryptionKey) {
            return this.encryptionKey;
        }

        // SECURITY: Only use key embedded in server-side template
        // Never fetch keys from public API endpoints
        if (window.ENCRYPTION_KEY && window.ENCRYPTION_KEY !== 'fallback-key') {
            this.encryptionKey = window.ENCRYPTION_KEY;
        } else {
            // Fallback: Use hardcoded key for development only
            this.encryptionKey = 'VRYnbfWvjr0j4K9iZDnvjQ==';
            console.warn('Using hardcoded development key. In production, ensure ENCRYPTION_KEY is properly set in the template.');
        }
        
        return this.encryptionKey;
    }

    /**
     * Get encryption key synchronously (for jQuery override)
     * @returns {string|null} Base64 encoded encryption key or null if not available
     */
    getEncryptionKeySync() {
        if (this.encryptionKey) {
            return this.encryptionKey;
        }

        // SECURITY: Only use key embedded in server-side template
        // Never fetch keys from public API endpoints
        if (window.ENCRYPTION_KEY && window.ENCRYPTION_KEY !== 'fallback-key') {
            this.encryptionKey = window.ENCRYPTION_KEY;
        } else {
            // Fallback: Use hardcoded key for development only
            this.encryptionKey = 'VRYnbfWvjr0j4K9iZDnvjQ==';
            console.warn('Using hardcoded development key. In production, ensure ENCRYPTION_KEY is properly set in the template.');
        }
        
        return this.encryptionKey;
    }

    /**
     * Encrypt text using AES encryption
     * @param {string} text - Text to encrypt
     * @returns {Promise<string>} Encrypted text
     */
    async encrypt(text) {
        try {
            const key = await this.getEncryptionKey();
            return this.encryptSync(text, key);
        } catch (error) {
            console.error('Encryption failed:', error);
            throw error;
        }
    }

    /**
     * Synchronous encryption method for jQuery override
     * @param {string} text - Text to encrypt
     * @param {string} key - Base64 encoded encryption key
     * @returns {string} Encrypted text
     */
    encryptSync(text, key) {
        try {
            // The key from server is Base64 encoded, so we need to parse it as Base64
            const keyBytes = CryptoJS.enc.Base64.parse(key);
            const encrypted = CryptoJS.AES.encrypt(text, keyBytes, {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.Pkcs7
            });
            return encrypted.toString();
        } catch (error) {
            console.error('Synchronous encryption failed:', error);
            throw error;
        }
    }

    /**
     * Reset the cached key (useful for key rotation)
     */
    resetKey() {
        this.encryptionKey = null;
        this.keyPromise = null;
    }

    /**
     * Show key status in the UI (optional DOM interaction)
     * @param {string} keyStatus - Status message to display
     */
    showKeyStatus(keyStatus) {
        const keyStatusElement = document.getElementById('keyStatus');
        if (keyStatusElement) {
            keyStatusElement.style.display = 'block';
            keyStatusElement.textContent = keyStatus;
        }
    }
}

/**
 * Utility functions for encryption operations
 */
const EncryptionUtils = {
    /**
     * Check if a URL should be encrypted based on patterns
     * @param {string} url - URL to check
     * @param {Array<string>} patterns - Array of URL patterns to match
     * @returns {boolean} True if URL should be encrypted
     */
    shouldEncryptUrl(url, patterns = ['/api/', '/user/', '/department/', '/admin/']) {
        if (!url) return false;
        return patterns.some(pattern => url.includes(pattern));
    },

    /**
     * Convert data to JSON string for encryption
     * @param {any} data - Data to convert
     * @returns {string} JSON string
     */
    dataToJsonString(data) {
        if (typeof data === 'object' && data !== null) {
            if (typeof data === 'string') {
                return data;
            } else {
                return JSON.stringify(data);
            }
        } else if (typeof data === 'string') {
            return data;
        } else {
            return '';
        }
    },

    /**
     * Create encrypted AJAX options
     * @param {Object} originalOptions - Original jQuery AJAX options
     * @param {string} encryptedData - Encrypted data string
     * @returns {Object} Modified options for encrypted request
     */
    createEncryptedOptions(originalOptions, encryptedData) {
        return {
            ...originalOptions,
            data: encryptedData,
            contentType: 'application/json',
            processData: false
        };
    }
};

// Global encryption client instance
const encryptionClient = new EncryptionClient();

// Export for use in other modules (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EncryptionClient, EncryptionUtils, encryptionClient };
}