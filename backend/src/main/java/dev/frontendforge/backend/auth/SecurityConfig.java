package dev.frontendforge.backend.auth;

import jakarta.servlet.DispatcherType;
import java.time.Clock;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;

/**
 * Session cookie (HttpOnly) + CSRF protection for a single-page app: the token travels in the
 * XSRF-TOKEN cookie and comes back in the X-XSRF-TOKEN header, which Angular's HttpClient sends
 * on same-origin requests. Everything under /api needs a signed-in student, except signing in;
 * the frontend served from the same jar (D-073) is public.
 */
@Configuration
public class SecurityConfig {

  @Bean
  SecurityFilterChain api(HttpSecurity http, SecurityContextRepository contexts) throws Exception {
    http.csrf(csrf -> csrf.spa())
        .securityContext(c -> c.securityContextRepository(contexts))
        .authorizeHttpRequests(
            a ->
                // The container forwards errors (403, 404...) to /error: without this, a CSRF
                // refusal reached the client as 401 on the real server (D-071).
                a.dispatcherTypeMatchers(DispatcherType.ERROR)
                    .permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/auth/register", "/api/auth/login")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/auth/me")
                    .permitAll()
                    .requestMatchers("/api/**")
                    .authenticated()
                    // The frontend itself (pages, scripts, styles) is public; only data is protected.
                    .anyRequest()
                    .permitAll())
        .exceptionHandling(e -> e.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
        .logout(
            l ->
                l.logoutUrl("/api/auth/logout")
                    .logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler(HttpStatus.NO_CONTENT)))
        // csrf().spa() defers the token: without this filter, the first GET sets no cookie (D-071).
        .addFilterAfter(new CsrfCookieFilter(), BasicAuthenticationFilter.class)
        .formLogin(AbstractHttpConfigurer::disable)
        .httpBasic(AbstractHttpConfigurer::disable);
    return http.build();
  }

  @Bean
  SecurityContextRepository securityContextRepository() {
    return new HttpSessionSecurityContextRepository();
  }

  @Bean
  PasswordEncoder passwordEncoder() {
    return PasswordEncoderFactories.createDelegatingPasswordEncoder();
  }

  @Bean
  AuthenticationManager authenticationManager(AccountStore accounts, PasswordEncoder encoder) {
    DaoAuthenticationProvider provider = new DaoAuthenticationProvider(accounts);
    provider.setPasswordEncoder(encoder);
    return new ProviderManager(provider);
  }

  @Bean
  Clock clock() {
    return Clock.systemUTC();
  }
}
