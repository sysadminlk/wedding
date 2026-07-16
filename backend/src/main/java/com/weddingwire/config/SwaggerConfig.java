package com.weddingwire.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI weddingWireOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("weddingWire API")
                        .version("1.0.0")
                        .description("Wedding planning SaaS backend API"));
    }
}
