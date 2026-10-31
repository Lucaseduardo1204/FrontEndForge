package dev.frontendforge.backend.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Loads the deferred CSRF token on every request, so the XSRF-TOKEN cookie is written before the
 * SPA needs it. Measured: without this, the first GET returned no cookie, and the first write
 * (sign-in or sign-up) would be refused with 403.
 */
public class CsrfCookieFilter extends OncePerRequestFilter {

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain chain)
      throws ServletException, IOException {
    CsrfToken token = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
    if (token != null) token.getToken();
    chain.doFilter(request, response);
  }
}
