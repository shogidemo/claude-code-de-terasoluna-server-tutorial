package com.example.todoapp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@Profile("dev")
public class DevSecurityConfig {

    @Bean
    public SecurityFilterChain devFilterChain(HttpSecurity http) throws Exception {
        http
            // 認証設定（開発環境）
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/h2-console/**").permitAll() // H2 Console許可
                .requestMatchers("/css/**", "/js/**", "/images/**").permitAll() // 静的リソース
                .requestMatchers("/error").permitAll() // エラーページ
                .anyRequest().permitAll() // 開発環境では全て許可
            )
            
            // CSRF設定（開発環境）
            .csrf(csrf -> csrf
                .ignoringRequestMatchers("/h2-console/**") // H2 Console除外
                .csrfTokenRepository(org.springframework.security.web.csrf.CookieCsrfTokenRepository.withHttpOnlyFalse())
            )
            
            // セキュリティヘッダー設定（開発環境）
            .headers(headers -> headers
                .frameOptions(frameOptions -> frameOptions.disable()) // H2 Console用にフレーム許可
                .contentTypeOptions(contentTypeOptions -> {}) // MIME type sniffing防止
                .httpStrictTransportSecurity(hstsConfig -> hstsConfig.disable()) // 開発環境ではHSTS無効
            )
            
            // セッション管理
            .sessionManagement(session -> session
                .maximumSessions(5) // 開発環境では多めに許可
                .maxSessionsPreventsLogin(false)
            );

        return http.build();
    }
}