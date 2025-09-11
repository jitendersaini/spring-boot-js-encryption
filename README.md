# Spring Boot Encryption Demo

A production-ready Spring Boot application that demonstrates secure request payload encryption for non-GET HTTP requests using AES encryption with proper key management.

## 🔐 Features

- **AES-128 Encryption**: All non-GET requests (POST, PUT, DELETE) have their payloads encrypted
- **Secure Key Management**: Dynamic key generation with environment-based configuration
- **Client-side Encryption**: JavaScript encrypts data before sending using embedded keys
- **Server-side Decryption**: Spring Boot filter automatically decrypts incoming requests
- **Thymeleaf Frontend**: Clean, responsive UI for testing the encryption flow
- **Multiple HTTP Methods**: Demonstrates GET, POST, PUT, and DELETE endpoints
- **Production Ready**: Environment-based configuration and secure key handling

## 🏗️ Architecture

1. **Client-side**: JavaScript uses CryptoJS to encrypt JSON payloads with AES-128
2. **Key Management**: Keys are embedded securely in the page during server-side rendering
3. **Network**: Encrypted data is sent over HTTP (visible as encrypted in browser dev tools)
4. **Server-side**: Spring Boot filter intercepts non-GET requests and decrypts the payload
5. **Processing**: Normal Spring Boot controllers receive decrypted data
6. **Response**: Standard JSON responses are sent back to client

## 📁 Project Structure

```
src/main/java/com/example/encryptiondemo/
├── EncryptionDemoApplication.java          # Main Spring Boot application
├── controller/
│   ├── ApiController.java                 # REST API endpoints
│   ├── WebController.java                 # Web controller for Thymeleaf
│   ├── UserController.java                # User-specific endpoints
│   ├── DepartmentController.java          # Department endpoints
│   └── KeyController.java                 # Key management (deprecated for security)
├── dto/
│   ├── UserRequest.java                   # Request DTO
│   └── ApiResponse.java                   # Response DTO
├── filter/
│   ├── EncryptionFilter.java              # Main encryption filter
│   └── DecryptedRequestWrapper.java       # Request wrapper for decrypted data
├── service/
│   └── KeyManagementService.java          # Secure key management
├── util/
│   ├── EncryptionUtil.java                # AES encryption/decryption utility
│   └── KeyGeneratorUtil.java              # Key generation utility
└── config/
    ├── EncryptionProperties.java          # Encryption configuration
    └── FilterConfig.java                  # Filter configuration

src/main/resources/
├── templates/
│   └── index.html                         # Thymeleaf frontend with embedded keys
├── static/js/
│   └── encryption.js                      # Client-side encryption logic
├── application.yml                        # Application configuration
└── application-prod.yml                   # Production configuration
```

## 🚀 Running the Application

### Development Mode

1. **Prerequisites**: Java 17+ and Maven 3.6+

2. **Build and Run**:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

3. **Access the Application**:
   - Open browser to `http://localhost:8080`
   - Test different HTTP methods using the web interface

### Production Mode

1. **Generate Encryption Key**:
   ```bash
   mvn exec:java -Dexec.mainClass="com.example.encryptiondemo.util.KeyGeneratorUtil"
   ```

2. **Set Environment Variable**:
   ```bash
   export ENCRYPTION_KEY="your-generated-key-here"
   ```

3. **Run with Production Profile**:
   ```bash
   mvn spring-boot:run -Dspring.profiles.active=prod
   ```

## 🔌 API Endpoints

- `GET /api/hello` - Simple GET request (no encryption)
- `GET /api/users` - Get all users (DataTable data)
- `POST /api/user` - Create user (encrypted payload)
- `PUT /api/user/{id}` - Update user (encrypted payload)
- `DELETE /api/user/{id}` - Delete user (no payload)
- `POST /api/test-param` - Test @RequestParam vs @RequestBody
- `POST /user/create` - Create user via user controller (encrypted)
- `POST /department/create` - Create department (encrypted)
- `POST /api/encryption-key` - **DEPRECATED** (returns 405 for security)

## 🧪 Testing the Encryption

1. Open browser developer tools (F12)
2. Go to Network tab
3. Click any POST or PUT button on the web page
4. Look at the request payload - it will be encrypted
5. Check server logs to see the decrypted data
6. Test the jQuery override with various data formats
7. Try the DataTable functionality with automatic encryption
8. Verify that `/api/encryption-key` returns 405 Method Not Allowed

### Key Features Fixed
- ✅ **jQuery Override**: Automatic encryption for `data: { 'param': xyz }` format
- ✅ **@RequestParam vs @RequestBody**: Demonstrates the difference with encrypted data
- ✅ **DataTable Integration**: Works seamlessly with encryption

## 🔒 Security Features

### ✅ Implemented Security Measures

- **No Public Key API**: Keys are embedded in the page during server-side rendering
- **Environment-based Configuration**: Keys managed via environment variables
- **Dynamic Key Generation**: Unique keys per application instance
- **Key Rotation Support**: Configurable key rotation intervals
- **Secure Key Embedding**: Keys embedded using Thymeleaf templating

### 🛡️ Production Security Recommendations

- **Use HTTPS**: Always use encrypted connections in production
- **Key Management**: Use proper secret management systems (AWS Secrets Manager, HashiCorp Vault)
- **Authentication**: Implement user authentication before key access
- **Key Rotation**: Regular key rotation for enhanced security
- **Monitoring**: Monitor for suspicious key access patterns

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `ENCRYPTION_KEY` | Base64 encoded AES key | No (prod) | Auto-generated |
| `SPRING_PROFILES_ACTIVE` | Spring profile | No | `default` |

### Application Properties

```properties
# Development
app.encryption.key-rotation-minutes=60

# Production
app.encryption.key=${ENCRYPTION_KEY:}
app.encryption.key-rotation-minutes=60
```

## 🛠️ Technologies Used

- **Backend**: Spring Boot 3.2.0, Maven
- **Frontend**: Thymeleaf, Bootstrap 5, CryptoJS
- **Encryption**: AES-128, Apache Commons Codec
- **Security**: Environment-based configuration, secure key management
