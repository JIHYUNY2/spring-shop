package com.example.shop;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
  @Override
  public void addCorsMappings(CorsRegistry reg) {
    reg.addMapping("/api/**")
      .allowedOrigins("http://localhost:5173") // 프론트 개발 포트
      .allowedMethods("GET","POST","PATCH","DELETE","OPTIONS")
      .allowCredentials(false);
  }
}