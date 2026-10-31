package dev.frontendforge.backend.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import dev.frontendforge.backend.TestAccounts;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

/**
 * The flow an Angular SPA really uses, without spring-security-test's csrf() helper (which
 * replaces the CSRF repository of the shared context, D-071): read the XSRF-TOKEN cookie and
 * send it back as the X-XSRF-TOKEN header. Its own context, so no other test touches it.
 */
@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = "spring.datasource.url=jdbc:h2:mem:csrf-flow-test;DB_CLOSE_DELAY=-1")
class CsrfCookieFlowTest {

  @Autowired private MockMvc mvc;

  @Test
  void oPrimeiroGetEntregaOCookieEElePermiteOCadastro() throws Exception {
    MvcResult primeiro = mvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized()).andReturn();
    Cookie xsrf = primeiro.getResponse().getCookie("XSRF-TOKEN");
    assertThat(xsrf).as("o primeiro GET entrega o cookie XSRF-TOKEN").isNotNull();
    assertThat(xsrf.isHttpOnly()).as("o JavaScript precisa ler este cookie").isFalse();

    String corpo = "{\"email\":\"ana@exemplo.com\",\"password\":\"" + TestAccounts.PASSWORD + "\"}";
    mvc.perform(post("/api/auth/register").cookie(xsrf).contentType(MediaType.APPLICATION_JSON).content(corpo))
        .andExpect(status().isForbidden()); // cookie sem o header: recusado
    mvc.perform(
            post("/api/auth/register")
                .cookie(xsrf)
                .header("X-XSRF-TOKEN", "valor-inventado")
                .contentType(MediaType.APPLICATION_JSON)
                .content(corpo))
        .andExpect(status().isForbidden()); // header que não bate com o cookie: recusado
    mvc.perform(
            post("/api/auth/register")
                .cookie(xsrf)
                .header("X-XSRF-TOKEN", xsrf.getValue())
                .contentType(MediaType.APPLICATION_JSON)
                .content(corpo))
        .andExpect(status().isCreated());
  }
}
