package dev.frontendforge.backend.auth;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.CookieManager;
import java.net.CookiePolicy;
import java.net.HttpCookie;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.TestPropertySource;

/**
 * Real Tomcat on a random port: errors go through the container's /error dispatch, which MockMvc
 * does not do. Measured before the fix: a CSRF refusal reached the client as 401 (D-071).
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(
    properties = {
      "spring.datasource.url=jdbc:h2:mem:real-server-test;DB_CLOSE_DELAY=-1",
      "server.address=127.0.0.1"
    })
class RealServerSecurityTest {

  @LocalServerPort private int port;

  private final CookieManager cookies = new CookieManager(null, CookiePolicy.ACCEPT_ALL);
  private final HttpClient http = HttpClient.newBuilder().cookieHandler(cookies).build();

  private URI url(String path) {
    return URI.create("http://127.0.0.1:" + port + path);
  }

  private HttpResponse<String> send(HttpRequest.Builder request) throws Exception {
    return http.send(request.build(), HttpResponse.BodyHandlers.ofString());
  }

  private String xsrf() {
    return cookies.getCookieStore().getCookies().stream()
        .filter(c -> c.getName().equals("XSRF-TOKEN"))
        .map(HttpCookie::getValue)
        .findFirst()
        .orElseThrow();
  }

  private HttpRequest.Builder register(String email) {
    return HttpRequest.newBuilder(url("/api/auth/register"))
        .header("Content-Type", "application/json")
        .POST(HttpRequest.BodyPublishers.ofString(
            "{\"email\":\"" + email + "\",\"password\":\"senha-bem-longa-123\"}"));
  }

  @Test
  void csrfRecusadoChegaComo403EFaltaDeSessaoComo401() throws Exception {
    assertThat(send(HttpRequest.newBuilder(url("/api/auth/me"))).statusCode()).isEqualTo(401);

    assertThat(send(register("ana@exemplo.com")).statusCode()).isEqualTo(403);
    assertThat(send(HttpRequest.newBuilder(url("/api/progress"))).statusCode()).isEqualTo(401);
  }

  @Test
  void fluxoCompletoComCookieDeSessaoHttpOnly() throws Exception {
    send(HttpRequest.newBuilder(url("/api/auth/me")));
    HttpResponse<String> cadastro = send(register("bia@exemplo.com").header("X-XSRF-TOKEN", xsrf()));
    assertThat(cadastro.statusCode()).isEqualTo(201);
    assertThat(cadastro.headers().allValues("Set-Cookie"))
        .anyMatch(c -> c.startsWith("JSESSIONID=") && c.contains("HttpOnly") && c.contains("SameSite=Lax"));

    HttpResponse<String> salvar =
        send(
            HttpRequest.newBuilder(url("/api/progress"))
                .header("Content-Type", "application/json")
                .header("X-XSRF-TOKEN", xsrf())
                .PUT(HttpRequest.BodyPublishers.ofString("{\"schemaVersion\":4}")));
    assertThat(salvar.statusCode()).isEqualTo(204);
    assertThat(send(HttpRequest.newBuilder(url("/api/progress"))).body()).contains("\"schemaVersion\":4");
  }
}
