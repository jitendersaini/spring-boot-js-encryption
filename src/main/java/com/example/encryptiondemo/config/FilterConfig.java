package com.example.encryptiondemo.config;

import com.example.encryptiondemo.filter.EncryptionFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FilterConfig {
    
    @Autowired
    private EncryptionFilter encryptionFilter;
    
    @Autowired
    private EncryptionProperties encryptionProperties;
    
    @Bean
    public FilterRegistrationBean<EncryptionFilter> encryptionFilterRegistration() {
        FilterRegistrationBean<EncryptionFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(encryptionFilter);
        
        // Apply to configurable paths
        if (encryptionProperties.isEnabled() && !encryptionProperties.getEncryptedPaths().isEmpty()) {
            registration.addUrlPatterns(encryptionProperties.getEncryptedPaths().toArray(new String[0]));
        } else {
            // Fallback to /api/* if no paths configured
            registration.addUrlPatterns("/api/*");
        }
        
        registration.setName("encryptionFilter");
        registration.setOrder(1);
        return registration;
    }
}
