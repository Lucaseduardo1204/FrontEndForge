package dev.frontendforge.backend.progress;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
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
import org.springframework.test.web.servlet.ResultActions;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = "spring.datasource.url=jdbc:h2:mem:progress-test;DB_CLOSE_DELAY=-1")
class ProgressControllerTest {

  private static final String VALID = "{\"schemaVersion\":4,\"lessons\":{}}";

  @Autowired private MockMvc mvc;
  @Autowired private JdbcClient jdbc;
  private MockHttpSession ana;

  @BeforeEach
  void preparar() throws Exception {
    jdbc.sql("DELETE FROM progress").update();
    jdbc.sql("DELETE FROM users").update();
    ana = TestAccounts.register(mvc, "ana@exemplo.com");
  }

  private ResultActions salvar(MockHttpSession sessao, String corpo) throws Exception {
    return mvc.perform(
        put("/api/progress").session(sessao).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(corpo));
  }

  @Test
  void semSessaoResponde401() throws Exception {
    mvc.perform(get("/api/progress")).andExpect(status().isUnauthorized());
    mvc.perform(put("/api/progress").with(csrf()).contentType(MediaType.APPLICATION_JSON).content(VALID))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void semProgressoResponde204SemCache() throws Exception {
    mvc.perform(get("/api/progress").session(ana))
        .andExpect(status().isNoContent())
        .andExpect(header().string("Cache-Control", "no-store"));
  }

  @Test
  void salvaEDevolveOMesmoDocumentoComEtag() throws Exception {
    salvar(ana, VALID).andExpect(status().isNoContent()).andExpect(header().string("ETag", "\"v1\""));
    mvc.perform(get("/api/progress").session(ana))
        .andExpect(status().isOk())
        .andExpect(header().string("ETag", "\"v1\""))
        .andExpect(content().json(VALID));
  }

  @Test
  void cadaContaVeSoOProprioProgresso() throws Exception {
    MockHttpSession bia = TestAccounts.register(mvc, "bia@exemplo.com");
    salvar(ana, "{\"schemaVersion\":4,\"dona\":\"ana\"}");

    mvc.perform(get("/api/progress").session(bia)).andExpect(status().isNoContent());
    salvar(bia, "{\"schemaVersion\":4,\"dona\":\"bia\"}");
    mvc.perform(get("/api/progress").session(ana)).andExpect(jsonPath("$.dona").value("ana"));
    mvc.perform(get("/api/progress").session(bia)).andExpect(jsonPath("$.dona").value("bia"));

    mvc.perform(delete("/api/progress").session(bia).with(csrf())).andExpect(status().isNoContent());
    mvc.perform(get("/api/progress").session(ana)).andExpect(status().isOk());
  }

  @Test
  void escritaSemTokenCsrfERecusada() throws Exception {
    mvc.perform(put("/api/progress").session(ana).contentType(MediaType.APPLICATION_JSON).content(VALID))
        .andExpect(status().isForbidden());
    mvc.perform(get("/api/progress").session(ana)).andExpect(status().isNoContent());
  }

  @Test
  void ifMatchComVersaoAntigaRecusaCom412ENaoSobrescreve() throws Exception {
    salvar(ana, VALID);
    String outro = "{\"schemaVersion\":4,\"lessons\":{\"x\":{}}}";
    salvar(ana, outro);
    mvc.perform(
            put("/api/progress")
                .session(ana)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .header("If-Match", "\"v1\"")
                .content(VALID))
        .andExpect(status().isPreconditionFailed());
    mvc.perform(get("/api/progress").session(ana))
        .andExpect(header().string("ETag", "\"v2\""))
        .andExpect(content().json(outro));
  }

  @Test
  void ifMatchComVersaoAtualGrava() throws Exception {
    salvar(ana, VALID);
    mvc.perform(
            put("/api/progress")
                .session(ana)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .header("If-Match", "\"v1\"")
                .content(VALID))
        .andExpect(status().isNoContent())
        .andExpect(header().string("ETag", "\"v2\""));
  }

  @Test
  void documentosInvalidosSaoRecusadosSemAlterarOGuardado() throws Exception {
    salvar(ana, VALID);
    salvar(ana, "{schemaVersion:").andExpect(status().isBadRequest()).andExpect(jsonPath("$.erro").exists());
    salvar(ana, "   ").andExpect(status().isBadRequest());
    salvar(ana, "[1,2,3]").andExpect(status().isUnprocessableContent());
    salvar(ana, "{\"lessons\":{}}").andExpect(status().isUnprocessableContent());
    salvar(ana, "{\"schemaVersion\":5}").andExpect(status().isUnprocessableContent());
    salvar(ana, "{\"schemaVersion\":0}").andExpect(status().isUnprocessableContent());
    salvar(ana, "{\"schemaVersion\":\"4\"}").andExpect(status().isUnprocessableContent());
    salvar(ana, "{\"schemaVersion\":4.5}").andExpect(status().isUnprocessableContent());
    String grande = "{\"schemaVersion\":4,\"x\":\"" + "a".repeat(ProgressValidator.MAX_BYTES) + "\"}";
    salvar(ana, grande).andExpect(status().is(413));

    mvc.perform(get("/api/progress").session(ana))
        .andExpect(header().string("ETag", "\"v1\""))
        .andExpect(content().json(VALID));
  }
}
