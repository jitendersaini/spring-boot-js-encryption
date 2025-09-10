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
    
    @Bean
    public FilterRegistrationBean<EncryptionFilter> encryptionFilterRegistration() {
        FilterRegistrationBean<EncryptionFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(encryptionFilter);
        registration.addUrlPatterns("/api/*");
        registration.setName("encryptionFilter");
        registration.setOrder(1);
        return registration;
    }
}
