package dev.frontendforge.backend.web;

import java.io.IOException;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

/**
 * Serves the Angular build (packaged into the jar under /static) from the same origin as the
 * API, so one process runs everything (D-073). Paths that are not files and not /api get
 * index.html, so links straight to a route (/lessons/...) and reloads work: the SPA rewrite
 * from the CI/CD lesson. Cache headers: FrontendCacheFilter.
 */
@Configuration
public class FrontendConfig implements WebMvcConfigurer {

  private static final Resource INDEX = new ClassPathResource("static/index.html");

  @Override
  public void addResourceHandlers(ResourceHandlerRegistry registry) {
    registry
        .addResourceHandler("/**")
        .addResourceLocations("classpath:/static/")
        .resourceChain(true)
        .addResolver(
            new PathResourceResolver() {
              @Override
              protected Resource getResource(String path, Resource location) throws IOException {
                if (path.startsWith("api/")) return null; // the API never falls back to the page
                Resource file = location.createRelative(path);
                if (file.exists() && file.isReadable() && !path.isEmpty()) return file;
                return INDEX.exists() ? INDEX : null;
              }
            });
  }
}
