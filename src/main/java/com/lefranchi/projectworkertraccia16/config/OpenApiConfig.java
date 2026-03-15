package com.lefranchi.projectworkertraccia16.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Leonardo Franchi - ProjectWorkerTraccia16")
                        .version("1.0")
                        .description("Documentazione delle API RESTful per il ProjectWorkerTraccia16.")
                        .contact(new Contact().name("Leonardo Franchi").email("leonardo.franchi@studenti.unipegaso.it")));
    }
}
