/**
 * Application-specific JavaScript for Spring Boot Encryption Demo
 * This file contains jQuery overrides, test functions, and DataTable logic
 * Dependencies: jQuery, CryptoJS, DataTables, and encryption.js
 */

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
        
        // Show key status
        encryptionClient.showKeyStatus('✅ Key refreshed successfully: ' + newKey.substring(0, 20) + '...');
        
        alert('Encryption key refreshed successfully!');
    } catch (error) {
        console.error('Failed to refresh encryption key:', error);
        alert('Failed to refresh encryption key: ' + error.message);
    }
}

/**
 * jQuery AJAX Override for Automatic Encryption
 * This section overrides jQuery's ajax method to automatically encrypt request bodies
 */
(function($) {
    // Store the original ajax method
    const originalAjax = $.ajax;
    
    // Function to encrypt data and send the request
    function encryptAndSend(options, originalAjax, originalSuccess, originalError) {
        // Get encryption key synchronously
        const encryptionKey = encryptionClient.getEncryptionKeySync();
        
        if (!encryptionKey) {
            console.error('Encryption key not available');
            if (originalError) {
                originalError.call(this, null, 'error', 'Encryption key not available');
            }
            return $.Deferred().reject(null, 'error', 'Encryption key not available').promise();
        }
        
        try {
            // Convert data to JSON string using utility function
            const jsonData = EncryptionUtils.dataToJsonString(options.data);
            
            console.log('jQuery Override Debug - Original data:', options.data);
            console.log('jQuery Override Debug - JSON data to encrypt:', jsonData);
            
            // Encrypt the data synchronously
            const encryptedData = encryptionClient.encryptSync(jsonData, encryptionKey);
            
            console.log('jQuery Override Debug - Encrypted data:', encryptedData.substring(0, 50) + '...');
            
            // Create encrypted options using utility function
            const encryptedOptions = EncryptionUtils.createEncryptedOptions(options, encryptedData);
            
            console.log('jQuery Override Debug - Final options:', {
                url: encryptedOptions.url,
                method: encryptedOptions.method,
                contentType: encryptedOptions.contentType,
                processData: encryptedOptions.processData,
                dataLength: encryptedData.length
            });
            
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
                originalError.call(this, null, 'error', 'Encryption failed: ' + error.message);
            }
            
            // Return a rejected promise that maintains jQuery AJAX structure
            return $.Deferred().reject(null, 'error', 'Encryption failed: ' + error.message).promise();
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
                hasData: !!options.data,
                dataType: typeof options.data,
                contentType: options.contentType
            });
        }
        
        // Also check if it's a POST request by default (when no method is specified)
        const isPostRequest = httpMethod === 'POST' || 
                             (httpMethod === 'GET' && options.data && !options.method && !options.type);
        
        if (options.data && 
            (['POST', 'PUT', 'PATCH', 'DELETE'].includes(httpMethod) || isPostRequest)) {
            
            // Check if the request should be encrypted (based on URL patterns)
            const shouldEncrypt = EncryptionUtils.shouldEncryptUrl(options.url);
            
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

/**
 * Test Functions for jQuery Override Functionality
 */
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

// Test function specifically for the data: { 'param': xyz } issue
function testJQueryParamIssue() {
    console.log('Testing jQuery AJAX with data: { "param": "xyz" } format...');
    
    $.ajax({
        url: '/api/user',
        method: 'POST',
        data: {
            'param': 'xyz',
            'name': 'Param Test User',
            'email': 'param@test.com',
            'message': 'This tests the specific param issue you mentioned!'
        },
        success: function(response) {
            console.log('✅ Param test successful:', response);
            showJQueryResponse('✅ Param Test (data: { "param": "xyz" }) - Success', response);
        },
        error: function(xhr, status, error) {
            console.error('❌ Param test failed:', error);
            showJQueryResponse('❌ Param Test (data: { "param": "xyz" }) - Error', { error: error, status: status });
        }
    });
}

// Test function to demonstrate @RequestParam vs @RequestBody issue
function testRequestParamVsRequestBody() {
    console.log('Testing @RequestParam vs @RequestBody with encrypted data...');
    
    // Test 1: @RequestBody endpoint (should work with encrypted data)
    $.ajax({
        url: '/api/user',
        method: 'POST',
        data: {
            'param': 'xyz',
            'name': 'RequestBody Test',
            'email': 'requestbody@test.com',
            'message': 'This should work with @RequestBody!'
        },
        success: function(response) {
            console.log('✅ @RequestBody test successful:', response);
            showJQueryResponse('✅ @RequestBody Test - Success (encrypted data works)', response);
        },
        error: function(xhr, status, error) {
            console.error('❌ @RequestBody test failed:', error);
            showJQueryResponse('❌ @RequestBody Test - Error', { error: error, status: status });
        }
    });
    
    // Test 2: @RequestParam endpoint (will fail with encrypted data)
    setTimeout(() => {
        $.ajax({
            url: '/api/test-param',
            method: 'POST',
            data: {
                'param': 'xyz',
                'name': 'RequestParam Test',
                'email': 'requestparam@test.com'
            },
            success: function(response) {
                console.log('⚠️ @RequestParam test result:', response);
                showJQueryResponse('⚠️ @RequestParam Test - Result (params will be null with encrypted data)', response);
            },
            error: function(xhr, status, error) {
                console.error('❌ @RequestParam test failed:', error);
                showJQueryResponse('❌ @RequestParam Test - Error', { error: error, status: status });
            }
        });
    }, 1000);
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

/**
 * DataTable Functionality
 */
let usersTable = null;

// Initialize DataTable when page loads
$(document).ready(function() {
    initializeDataTable();
    // Show key status when page loads
    const key = encryptionClient.getEncryptionKeySync();
    if (key) {
        encryptionClient.showKeyStatus('✅ Key loaded successfully: ' + key.substring(0, 20) + '...');
    }
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
