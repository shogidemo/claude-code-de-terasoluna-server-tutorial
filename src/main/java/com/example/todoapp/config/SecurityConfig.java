package com.example.todoapp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;

@Configuration
@EnableWebSecurity
@org.springframework.context.annotation.Profile("prod")
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 認証設定（本番環境）
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/css/**", "/js/**", "/images/**").permitAll() // 静的リソース
                .requestMatchers("/error").permitAll() // エラーページ
                .anyRequest().permitAll() // TODO: 将来的には認証を有効化
            )
            
            // CSRF設定（本番環境）
            .csrf(csrf -> csrf
                .csrfTokenRepository(org.springframework.security.web.csrf.CookieCsrfTokenRepository.withHttpOnlyFalse())
            )
            
            // セキュリティヘッダー設定
            .headers(headers -> headers
                .frameOptions(frameOptions -> frameOptions.deny()) // Clickjacking保護
                .contentTypeOptions(contentTypeOptions -> {}) // MIME type sniffing防止
                .httpStrictTransportSecurity(hstsConfig -> hstsConfig
                    .maxAgeInSeconds(31536000)
                    .includeSubDomains(true)
                ) // HSTS
                .referrerPolicy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN)
            )
            
            // セッション管理
            .sessionManagement(session -> session
                .maximumSessions(1) // 同時ログイン数制限
                .maxSessionsPreventsLogin(false) // 新しいセッションを優先
            );

        return http.build();
    }
}