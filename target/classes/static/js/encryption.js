/**
 * Client-side encryption utility for Spring Boot Encryption Demo
 * This file handles dynamic key retrieval and encryption
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
        
        // Show key status
        const keyStatus = document.getElementById('keyStatus');
        if (keyStatus) {
            keyStatus.style.display = 'block';
            keyStatus.textContent = '✅ Key loaded successfully: ' + this.encryptionKey.substring(0, 20) + '...';
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
            // The key from server is Base64 encoded, so we need to parse it as Base64
            const keyBytes = CryptoJS.enc.Base64.parse(key);
            const encrypted = CryptoJS.AES.encrypt(text, keyBytes, {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.Pkcs7
            });
            return encrypted.toString();
        } catch (error) {
            console.error('Encryption failed:', error);
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
}

// Global encryption client instance
const encryptionClient = new EncryptionClient();

/**
 * Make GET request (no encryption needed)
 */
async function makeGetRequest() {
    try {
        const response = await fetch('/api/hello');
        const data = await response.json();
        document.getElementById('getResponse').style.display = 'block';
        document.getElementById('getResponse').textContent = JSON.stringify(data, null, 2);
    } catch (error) {
        document.getElementById('getResponse').style.display = 'block';
        document.getElementById('getResponse').textContent = 'Error: ' + error.message;
    }
}

/**
 * Make POST request with encrypted payload
 */
async function makePostRequest() {
    try {
        const userData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            message: document.getElementById('message').value
        };

        const jsonData = JSON.stringify(userData);
        const encryptedData = await encryptionClient.encrypt(jsonData);

        // Show encrypted payload
        document.getElementById('postEncryptedPayload').style.display = 'block';
        document.getElementById('postEncryptedPayload').textContent = 'Encrypted Payload: ' + encryptedData;

        const response = await fetch('/api/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: encryptedData
        });

        const data = await response.json();
        document.getElementById('postResponse').style.display = 'block';
        document.getElementById('postResponse').textContent = JSON.stringify(data, null, 2);
    } catch (error) {
        document.getElementById('postResponse').style.display = 'block';
        document.getElementById('postResponse').textContent = 'Error: ' + error.message;
    }
}

/**
 * Make PUT request with encrypted payload
 */
async function makePutRequest() {
    try {
        const userId = document.getElementById('putId').value;
        const userData = {
            name: document.getElementById('putName').value,
            email: document.getElementById('putEmail').value,
            message: document.getElementById('putMessage').value
        };

        const jsonData = JSON.stringify(userData);
        const encryptedData = await encryptionClient.encrypt(jsonData);

        // Show encrypted payload
        document.getElementById('putEncryptedPayload').style.display = 'block';
        document.getElementById('putEncryptedPayload').textContent = 'Encrypted Payload: ' + encryptedData;

        const response = await fetch('/api/user/' + userId, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: encryptedData
        });

        const data = await response.json();
        document.getElementById('putResponse').style.display = 'block';
        document.getElementById('putResponse').textContent = JSON.stringify(data, null, 2);
    } catch (error) {
        document.getElementById('putResponse').style.display = 'block';
        document.getElementById('putResponse').textContent = 'Error: ' + error.message;
    }
}

/**
 * Make DELETE request (no payload)
 */
async function makeDeleteRequest() {
    try {
        const userId = document.getElementById('deleteId').value;

        const response = await fetch('/api/user/' + userId, {
            method: 'DELETE'
        });

        const data = await response.json();
        document.getElementById('deleteResponse').style.display = 'block';
        document.getElementById('deleteResponse').textContent = JSON.stringify(data, null, 2);
    } catch (error) {
        document.getElementById('deleteResponse').style.display = 'block';
        document.getElementById('deleteResponse').textContent = 'Error: ' + error.message;
    }
}

/**
 * Refresh encryption key (for testing key rotation)
 */
async function refreshEncryptionKey() {
    try {
        encryptionClient.resetKey();
        const newKey = await encryptionClient.getEncryptionKey();
        console.log('New encryption key loaded:', newKey.substring(0, 20) + '...');
        alert('Encryption key refreshed successfully!');
    } catch (error) {
        console.error('Failed to refresh encryption key:', error);
        alert('Failed to refresh encryption key: ' + error.message);
    }
}

// Override jQuery's ajax method to automatically encrypt request bodies
(function($) {
    // Store the original ajax method
    const originalAjax = $.ajax;
    
    // Override the ajax method
    $.ajax = function(options) {
        // If it's a POST, PUT, PATCH, or DELETE request with data
        if (options.data && 
            ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method?.toUpperCase() || 'GET')) {
            
            // Check if the request should be encrypted (based on URL patterns)
            const shouldEncrypt = shouldEncryptRequest(options.url);
            
            if (shouldEncrypt) {
                // Store original success and error callbacks
                const originalSuccess = options.success;
                const originalError = options.error;
                
                // Override success callback to handle encryption
                options.success = function(data, textStatus, jqXHR) {
                    if (originalSuccess) {
                        originalSuccess.call(this, data, textStatus, jqXHR);
                    }
                };
                
                // Override error callback to handle encryption errors
                options.error = function(jqXHR, textStatus, errorThrown) {
                    if (originalError) {
                        originalError.call(this, jqXHR, textStatus, errorThrown);
                    }
                };
                
                // Encrypt the data
                return encryptAndSend(options, originalAjax);
            }
        }
        
        // If no encryption needed, call original ajax method
        return originalAjax.call(this, options);
    };
    
    // Function to determine if a request should be encrypted
    function shouldEncryptRequest(url) {
        if (!url) return false;
        
        // List of URL patterns that require encryption
        const encryptedPatterns = [
            '/api/',
            '/user/',
            '/department/',
            '/admin/'
        ];
        
        return encryptedPatterns.some(pattern => url.includes(pattern));
    }
    
    // Function to encrypt data and send the request
    async function encryptAndSend(options, originalAjax) {alert("hello");
        try {
            // Get encryption key
            const encryptionKey = await encryptionClient.getEncryptionKey();
            
            // Convert data to JSON string if it's an object
            let jsonData;
            if (typeof options.data === 'object') {
                jsonData = JSON.stringify(options.data);
            } else {
                jsonData = options.data;
            }
            
            // Encrypt the data
            const encryptedData = await encryptionClient.encrypt(jsonData);
            
            // Update options with encrypted data
            const encryptedOptions = {
                ...options,
                data: encryptedData,
                contentType: 'text/plain' // Change content type for encrypted data
            };
            
            // Send the encrypted request
            return originalAjax.call(this, encryptedOptions);
            
        } catch (error) {
            console.error('Encryption failed:', error);
            
            // Call error callback if provided
            if (options.error) {
                options.error.call(this, null, 'error', 'Encryption failed');
            }
            
            return Promise.reject(error);
        }
    }
    
})(jQuery);