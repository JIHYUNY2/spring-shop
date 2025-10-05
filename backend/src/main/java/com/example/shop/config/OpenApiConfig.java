package com.example.shop.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

  // 문서 메타 정보
  @Bean
  public OpenAPI shopOpenAPI() {
    return new OpenAPI().info(
        new Info()
            .title("Spring Shop API")
            .description("상품 CRUD + Mock PG 포트폴리오")
            .version("v1.0.0")
    );
  }

  // 📌 스캔 대상 패키지와 경로를 명확히 지정 (문서 생성 실패 방지)
  @Bean
  public GroupedOpenApi v1Group() {
    return GroupedOpenApi.builder()
        .group("v1")
        .packagesToScan("com.example.shop")   // 컨트롤러 패키지 루트
        .pathsToMatch("/api/**")              // 문서화할 경로
        .build();
  }
}