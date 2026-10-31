package dev.frontendforge.backend.web;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Cache policy for the frontend, as the HTTP lesson teaches: build files with a content hash in
 * the name never change, so they are cached for a year; everything else (index.html and the SPA
 * routes) is revalidated, so a new version reaches everyone. Set before Spring Security writes its
 * default "no-store", which it skips when the header is already present. /api is untouched.
 */
@Component
public class FrontendCacheFilter extends OncePerRequestFilter {

  /** main-JRZ5SSMF.js, chunk-BGm8AK-M.js, styles-AY4PUXBF.css: 8-character hash before the extension. */
  private static final Pattern HASHED = Pattern.compile("^[a-z]+-[A-Za-z0-9_-]{8}\\.(js|css)$");

  static String cacheControlFor(String path) {
    String file = path.substring(path.lastIndexOf('/') + 1);
    return HASHED.matcher(file).matches() ? "public, max-age=31536000, immutable" : "no-cache";
  }

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    // HEAD must answer the same headers as GET (measured: it used to get Spring Security's no-store).
    String method = request.getMethod();
    boolean read = "GET".equals(method) || "HEAD".equals(method);
    return request.getRequestURI().startsWith("/api/") || !read;
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain chain)
      throws ServletException, IOException {
    response.setHeader("Cache-Control", cacheControlFor(request.getRequestURI()));
    chain.doFilter(request, response);
  }
}
