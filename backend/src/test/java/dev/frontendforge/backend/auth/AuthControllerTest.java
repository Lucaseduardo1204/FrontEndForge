package dev.frontendforge.backend.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import dev.frontendforge.backend.TestAccounts;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = "spring.datasource.url=jdbc:h2:mem:auth-test;DB_CLOSE_DELAY=-1")
class AuthControllerTest {

  @Autowired private MockMvc mvc;
  @Autowired private JdbcClient jdbc;
  @Autowired private LoginThrottle throttle;

  @BeforeEach
  void limpar() {
    jdbc.sql("DELETE FROM progress").update();
    jdbc.sql("DELETE FROM users").update();
    throttle.succeeded("ana@exemplo.com");
  }

  private ResultActions entrar(String email, String senha) throws Exception {
    return mvc.perform(
        post("/api/auth/login")
            .with(csrf())
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"email\":\"" + email + "\",\"password\":\"" + senha + "\"}"));
  }

  @Test
  void cadastroEntraNaContaENormalizaOEmail() throws Exception {
    MockHttpSession sessao = TestAccounts.register(mvc, "  Ana@Exemplo.COM ");
    mvc.perform(get("/api/auth/me").session(sessao))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.email").value("ana@exemplo.com"));
  }

  @Test
  void semSessaoMeResponde401() throws Exception {
    mvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());
  }

  @Test
  void aSenhaEGuardadaComHashENuncaEmTexto() throws Exception {
    TestAccounts.register(mvc, "ana@exemplo.com");
    String hash =
        jdbc.sql("SELECT password_hash FROM users WHERE email = 'ana@exemplo.com'").query(String.class).single();
    assertThat(hash).startsWith("{bcrypt}").doesNotContain(TestAccounts.PASSWORD);
  }

  @Test
  void cadastroValidaEmailESenha() throws Exception {
    for (String corpo :
        new String[] {
          "{\"email\":\"sem-arroba\",\"password\":\"senha-bem-longa-123\"}",
          "{\"email\":\"ana@exemplo.com\",\"password\":\"curta\"}",
          "{\"email\":\"ana@exemplo.com\",\"password\":\"" + "a".repeat(129) + "\"}",
          "{}"
        }) {
      mvc.perform(post("/api/auth/register").with(csrf()).contentType(MediaType.APPLICATION_JSON).content(corpo))
          .andExpect(status().isBadRequest())
          .andExpect(jsonPath("$.erro").exists());
    }
  }

  @Test
  void emailRepetidoResponde409() throws Exception {
    TestAccounts.register(mvc, "ana@exemplo.com");
    mvc.perform(
            post("/api/auth/register")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"ANA@exemplo.com\",\"password\":\"outra-senha-longa-9\"}"))
        .andExpect(status().isConflict());
  }

  @Test
  void loginCertoEntraEErradoRespondeOMesmoParaSenhaEContaInexistente() throws Exception {
    TestAccounts.register(mvc, "ana@exemplo.com");
    entrar("ana@exemplo.com", TestAccounts.PASSWORD).andExpect(status().isOk());

    String senhaErrada =
        entrar("ana@exemplo.com", "senha-errada-123").andExpect(status().isUnauthorized()).andReturn().getResponse().getContentAsString();
    String contaInexistente =
        entrar("ninguem@exemplo.com", "senha-errada-123").andExpect(status().isUnauthorized()).andReturn().getResponse().getContentAsString();
    assertThat(senhaErrada).isEqualTo(contaInexistente);
  }

  @Test
  void loginTrocaOIdDaSessao() throws Exception {
    TestAccounts.register(mvc, "ana@exemplo.com");
    MockHttpSession anonima = new MockHttpSession();
    String antes = anonima.getId();
    MvcResult r =
        mvc.perform(
                post("/api/auth/login")
                    .session(anonima)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"email\":\"ana@exemplo.com\",\"password\":\"" + TestAccounts.PASSWORD + "\"}"))
            .andExpect(status().isOk())
            .andReturn();
    assertThat(r.getRequest().getSession(false).getId()).isNotEqualTo(antes);
  }

  @Test
  void cincoFalhasBloqueiamComRetryAfter() throws Exception {
    TestAccounts.register(mvc, "ana@exemplo.com");
    for (int i = 0; i < LoginThrottle.MAX_FAILURES; i++) {
      entrar("ana@exemplo.com", "errada-" + i + "-xxxxxxx").andExpect(status().isUnauthorized());
    }
    entrar("ana@exemplo.com", TestAccounts.PASSWORD)
        .andExpect(status().isTooManyRequests())
        .andExpect(header().exists("Retry-After"));
  }

  @Test
  void logoutEncerraASessao() throws Exception {
    MockHttpSession sessao = TestAccounts.register(mvc, "ana@exemplo.com");
    mvc.perform(post("/api/auth/logout").session(sessao).with(csrf())).andExpect(status().isNoContent());
    mvc.perform(get("/api/auth/me").session(sessao)).andExpect(status().isUnauthorized());
  }

  @Test
  void loginSemTokenCsrfERecusado() throws Exception {
    mvc.perform(
            post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"ana@exemplo.com\",\"password\":\"x\"}"))
        .andExpect(status().isForbidden());
  }
}
