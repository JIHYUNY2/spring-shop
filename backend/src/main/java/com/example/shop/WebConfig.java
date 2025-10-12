package com.example.shop;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry reg) {
        reg.addMapping("/api/**")
            // 로컬에서 다른 호스트로 접속할 수도 있으니 패턴/여러 개 허용
            .allowedOrigins("http://localhost:5173", "http://127.0.0.1:5173")
            // 또는 개발 중엔 아래처럼 패턴으로 열어도 됨(운영에선 제한 권장)
            // .allowedOriginPatterns("http://localhost:*", "http://127.0.0.1:*")

            // PUT 추가
            .allowedMethods("GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS")

            // 헤더는 보통 전부 허용(개발 용이)
            .allowedHeaders("*")
            .exposedHeaders("*")

            // 쿠키/세션을 쓰지 않으면 false로 OK
            .allowCredentials(false)

            // 프리플라이트 캐시 시간(초)
            .maxAge(3600);
    }
}