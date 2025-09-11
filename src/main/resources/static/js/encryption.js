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
            // The key from server is Base64 encoded, so we need to parse it as Base64
            const keyBytes = CryptoJS.enc.Base64.parse(key);
            
            // Generate random IV
            const iv = CryptoJS.lib.WordArray.random(16);
            
            const encrypted = CryptoJS.AES.encrypt(text, keyBytes, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });
            
            // Prepend IV to encrypted data (same as backend)
            const encryptedWithIv = iv.concat(encrypted.ciphertext);
            return CryptoJS.enc.Base64.stringify(encryptedWithIv);
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
            
            // Generate random IV
            const iv = CryptoJS.lib.WordArray.random(16);
            
            const encrypted = CryptoJS.AES.encrypt(text, keyBytes, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });
            
            // Prepend IV to encrypted data (same as backend)
            const encryptedWithIv = iv.concat(encrypted.ciphertext);
            return CryptoJS.enc.Base64.stringify(encryptedWithIv);
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
}

// Global encryption client instance
const encryptionClient = new EncryptionClient();

/**
 * Update the encryption status display
 */
function updateEncryptionStatus() {
    const statusElement = document.getElementById('encryptionStatusText');
    const statusContainer = document.getElementById('encryptionStatus');
    
    if (typeof window.ENCRYPTION_ENABLED !== 'undefined') {
        if (window.ENCRYPTION_ENABLED) {
            statusElement.textContent = '✅ Enabled - Requests will be encrypted';
            statusContainer.className = 'alert alert-success';
        } else {
            statusElement.textContent = '❌ Disabled - Requests will be sent as plain text';
            statusContainer.className = 'alert alert-warning';
        }
    } else {
        statusElement.textContent = '⚠️ Unknown - Using fallback behavior';
        statusContainer.className = 'alert alert-info';
    }
}

// Update status when page loads
document.addEventListener('DOMContentLoaded', function() {
    updateEncryptionStatus();
});

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
        
        // Check if encryption is enabled globally
        let requestBody, payloadDisplay;
        if (typeof window.ENCRYPTION_ENABLED !== 'undefined' && !window.ENCRYPTION_ENABLED) {
            console.log('Encryption disabled globally, sending plain text');
            requestBody = jsonData;
            payloadDisplay = 'Plain Text Payload: ' + jsonData;
        } else {
            const encryptedData = await encryptionClient.encrypt(jsonData);
            requestBody = encryptedData;
            payloadDisplay = 'Encrypted Payload: ' + encryptedData;
        }

        // Show payload
        document.getElementById('postEncryptedPayload').style.display = 'block';
        document.getElementById('postEncryptedPayload').textContent = payloadDisplay;

        const response = await fetch('/api/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: requestBody
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
        
        // Check if encryption is enabled globally
        let requestBody, payloadDisplay;
        if (typeof window.ENCRYPTION_ENABLED !== 'undefined' && !window.ENCRYPTION_ENABLED) {
            console.log('Encryption disabled globally, sending plain text');
            requestBody = jsonData;
            payloadDisplay = 'Plain Text Payload: ' + jsonData;
        } else {
            const encryptedData = await encryptionClient.encrypt(jsonData);
            requestBody = encryptedData;
            payloadDisplay = 'Encrypted Payload: ' + encryptedData;
        }

        // Show payload
        document.getElementById('putEncryptedPayload').style.display = 'block';
        document.getElementById('putEncryptedPayload').textContent = payloadDisplay;

        const response = await fetch('/api/user/' + userId, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: requestBody
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
    
    // Function to determine if a request should be encrypted
    function shouldEncryptRequest(url) {
        if (!url) return false;
        
        // Check if encryption is enabled globally
        if (typeof window.ENCRYPTION_ENABLED !== 'undefined' && !window.ENCRYPTION_ENABLED) {
            console.log('Encryption disabled globally, skipping encryption for:', url);
            return false;
        }
        
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
    function encryptAndSend(options, originalAjax, originalSuccess, originalError) {
        // Get encryption key synchronously (it should be available from window.ENCRYPTION_KEY)
        const encryptionKey = encryptionClient.getEncryptionKeySync();
        
        if (!encryptionKey) {
            console.error('Encryption key not available');
            if (originalError) {
                originalError.call(this, null, 'error', 'Encryption key not available');
            }
            return $.Deferred().reject(null, 'error', 'Encryption key not available').promise();
        }
        
        try {
            // Convert data to JSON string if it's an object
            let jsonData;
            if (typeof options.data === 'object') {
                jsonData = JSON.stringify(options.data);
            } else {
                jsonData = options.data;
            }
            
            // Encrypt the data synchronously
            const encryptedData = encryptionClient.encryptSync(jsonData, encryptionKey);
            
            // Update options with encrypted data
            const encryptedOptions = {
                ...options,
                data: encryptedData,
                contentType: 'application/json' // Keep as JSON for Spring Boot compatibility
            };
            
            // Send the encrypted request using original ajax
            const jqXHR = originalAjax.call(this, encryptedOptions);
            
            // Handle success/error callbacks if provided
            if (originalSuccess || originalError) {
                jqXHR.done(function(data, textStatus, jqXHR) {
                    if (originalSuccess) {
                        originalSuccess.call(this, data, textStatus, jqXHR);
                    }
                });
                
                jqXHR.fail(function(jqXHR, textStatus, errorThrown) {
                    if (originalError) {
                        originalError.call(this, jqXHR, textStatus, errorThrown);
                    }
                });
            }
            
            // Return the original jqXHR object to maintain all jQuery AJAX functionality including .abort()
            return jqXHR;
            
        } catch (error) {
            console.error('Encryption failed:', error);
            
            // Call error callback if provided
            if (originalError) {
                originalError.call(this, null, 'error', 'Encryption failed');
            }
            
            // Return a rejected promise that maintains jQuery AJAX structure
            return $.Deferred().reject(null, 'error', 'Encryption failed').promise();
        }
    }
    
    // Override the ajax method
    $.ajax = function(options) {
        // If it's a POST, PUT, PATCH, or DELETE request with data
        // Check both options.method and options.type for HTTP method
        const httpMethod = (options.method || options.type || 'GET').toUpperCase();
        
        // Debug logging for production troubleshooting
        if (options.data) {
            console.log('jQuery Override Debug:', {
                url: options.url,
                method: options.method,
                type: options.type,
                httpMethod: httpMethod,
                hasData: !!options.data
            });
        }
        
        // Also check if it's a POST request by default (when no method is specified)
        const isPostRequest = httpMethod === 'POST' || 
                             (httpMethod === 'GET' && options.data && !options.method && !options.type);
        
        if (options.data && 
            (['POST', 'PUT', 'PATCH', 'DELETE'].includes(httpMethod) || isPostRequest)) {
            
            // Check if the request should be encrypted (based on URL patterns)
            const shouldEncrypt = shouldEncryptRequest(options.url);
            
            if (shouldEncrypt) {
                console.log('jQuery override: Encrypting request to', options.url, 'Method:', httpMethod);
                
                // Store original success and error callbacks
                const originalSuccess = options.success;
                const originalError = options.error;
                
                // Encrypt the data and send the request - return the promise
                return encryptAndSend(options, originalAjax, originalSuccess, originalError);
            }
        }
        
        // If no encryption needed, call original ajax method
        return originalAjax.call(this, options);
    };
    
})(jQuery);

// Test functions for jQuery override functionality
function testJQueryAjax() {
    $.ajax({
        url: '/api/user',
        method: 'POST',
        data: {
            name: 'jQuery Test User',
            email: 'jquery@test.com',
            message: 'This is automatically encrypted by jQuery override!'
        },
        success: function(response) {
            showJQueryResponse('✅ /api/user (POST) - Success', response);
        },
        error: function(xhr, status, error) {
            showJQueryResponse('❌ /api/user (POST) - Error', { error: error, status: status });
        }
    });
}

function testJQueryUser() {
    $.ajax({
        url: '/user/create',
        method: 'POST',
        data: {
            name: 'jQuery User Test',
            email: 'user@test.com',
            message: 'This should be automatically encrypted!'
        },
        success: function(response) {
            showJQueryResponse('✅ /user/create (POST) - Success', response);
        },
        error: function(xhr, status, error) {
            showJQueryResponse('❌ /user/create (POST) - Error', { error: error, status: status });
        }
    });
}

function testJQueryDepartment() {
    $.ajax({
        url: '/department/create',
        method: 'POST',
        data: {
            name: 'jQuery Department',
            description: 'This should be automatically encrypted!'
        },
        success: function(response) {
            showJQueryResponse('✅ /department/create (POST) - Success', response);
        },
        error: function(xhr, status, error) {
            showJQueryResponse('❌ /department/create (POST) - Error', { error: error, status: status });
        }
    });
}

// Test function to demonstrate .done() method works correctly
function testJQueryDoneMethod() {
    console.log('Testing jQuery .done() method...');
    
    $.ajax({
        url: '/api/user',
        method: 'POST',
        data: {
            name: 'Done Method Test',
            email: 'done@test.com',
            message: 'Testing .done() method with encryption!'
        }
    })
    .done(function(data, textStatus, jqXHR) {
        console.log('Data received:', data);
        console.log('Status:', textStatus);
        console.log('jqXHR object:', jqXHR);
        showJQueryResponse('✅ .done() method works! Data: ' + JSON.stringify(data, null, 2));
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
        console.error('Request failed:', errorThrown);
        showJQueryResponse('❌ Request failed: ' + errorThrown);
    });
}

// Test function to demonstrate .abort() method works correctly (DataTables compatibility)
function testJQueryAbortMethod() {
    console.log('Testing jQuery .abort() method (DataTables compatibility)...');
    
    const jqXHR = $.ajax({
        url: '/api/user',
        method: 'POST',
        data: {
            name: 'Abort Method Test',
            email: 'abort@test.com',
            message: 'Testing .abort() method with encryption!'
        }
    });
    
    // Test if abort method exists (DataTables compatibility)
    if (typeof jqXHR.abort === 'function') {
        console.log('✅ .abort() method exists - DataTables compatible!');
        showJQueryResponse('✅ .abort() Method Test - DataTables Compatible', { 
            message: 'jqXHR object has .abort() method',
            hasAbort: true,
            jqXHRType: typeof jqXHR,
            jqXHRMethods: Object.getOwnPropertyNames(jqXHR).filter(name => typeof jqXHR[name] === 'function')
        });
        
        // Test the abort functionality
        setTimeout(() => {
            console.log('Calling .abort() method...');
            jqXHR.abort();
            console.log('✅ .abort() method called successfully!');
        }, 100);
        
    } else {
        console.log('❌ .abort() method missing - DataTables will break!');
        showJQueryResponse('❌ .abort() Method Test - DataTables Incompatible', { 
            message: 'jqXHR object missing .abort() method',
            hasAbort: false,
            jqXHRType: typeof jqXHR,
            jqXHRMethods: Object.getOwnPropertyNames(jqXHR).filter(name => typeof jqXHR[name] === 'function')
        });
    }
}

function showJQueryResponse(title, data) {
    const responseDiv = document.getElementById('jqueryResponse');
    responseDiv.style.display = 'block';
    responseDiv.innerHTML = '<strong>' + title + '</strong><br>' + JSON.stringify(data, null, 2);
}

// DataTable functionality
let usersTable = null;

// Initialize DataTable when page loads
$(document).ready(function() {
    initializeDataTable();
});

function initializeDataTable() {
    usersTable = $('#usersTable').DataTable({
        "processing": true,
        "serverSide": false,
        "ajax": {
            "url": "/api/users",
            "type": "GET",
            "dataSrc": "data", // Tell DataTable to look for data in the 'data' property
            "error": function(xhr, error, thrown) {
                console.error('DataTable AJAX error:', error);
                showDataTableResponse('❌ DataTable AJAX Error', { error: error, status: xhr.status });
            }
        },
        "columns": [
            { "data": "id" },
            { "data": "name" },
            { "data": "email" },
            { "data": "message" },
            { "data": "created" }
        ],
        "pageLength": 10,
        "responsive": true,
        "order": [[0, "desc"]]
    });
}

function reloadDataTable() {
    console.log('Reloading DataTable...');
    
    if (usersTable) {
        // Test if the table has the reload method and if it works with our jQuery override
        try {
            usersTable.ajax.reload();
            // usersTable.ajax.reload(function(json) {
            //     console.log('✅ DataTable reloaded successfully!', json);
            //     showDataTableResponse('✅ DataTable Reloaded Successfully', { 
            //         message: 'DataTable reload worked with jQuery override',
            //         recordCount: json.data ? json.data.length : 0
            //     });
            // });
        } catch (error) {
            console.error('❌ DataTable reload failed:', error);
            showDataTableResponse('❌ DataTable Reload Failed', { error: error.message });
        }
    } else {
        console.error('DataTable not initialized');
        showDataTableResponse('❌ DataTable Not Initialized', { error: 'DataTable not initialized' });
    }
}

function addNewRecord() {
    console.log('Adding new record via encrypted AJAX...');
    
    const newUser = {
        name: 'DataTable Test User',
        email: 'datatable@test.com',
        message: 'This record was added via DataTable test with encryption!'
    };
    
    // This should be automatically encrypted by our jQuery override
    $.ajax({
        url: '/api/user',
        method: 'POST',
        data: newUser,
        contentType: 'application/json'
    })
    .done(function(data, textStatus, jqXHR) {
        console.log('✅ New record added successfully!', data);
        showDataTableResponse('✅ New Record Added Successfully', data);
        
        // Reload the DataTable to show the new record
        setTimeout(() => {
            reloadDataTable();
        }, 1000);
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
        console.error('❌ Failed to add new record:', errorThrown);
        showDataTableResponse('❌ Failed to Add New Record', { error: errorThrown, status: textStatus });
    });
}

function showDataTableResponse(title, data) {
    const responseDiv = document.getElementById('datatableResponse');
    responseDiv.style.display = 'block';
    responseDiv.innerHTML = '<strong>' + title + '</strong><br>' + JSON.stringify(data, null, 2);
}

/**
 * Test function to demonstrate encryption status
 */
function testEncryptionStatus() {
    const status = {
        encryptionEnabled: typeof window.ENCRYPTION_ENABLED !== 'undefined' ? window.ENCRYPTION_ENABLED : 'undefined',
        encryptionKey: typeof window.ENCRYPTION_KEY !== 'undefined' ? window.ENCRYPTION_KEY.substring(0, 20) + '...' : 'undefined',
        clientBehavior: typeof window.ENCRYPTION_ENABLED !== 'undefined' && !window.ENCRYPTION_ENABLED ? 'Will send plain text' : 'Will encrypt requests'
    };
    
    console.log('Encryption Status Test:', status);
    showJQueryResponse('🔍 Encryption Status Test', status);
}