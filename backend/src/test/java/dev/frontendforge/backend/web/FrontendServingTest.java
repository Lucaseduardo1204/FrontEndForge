package dev.frontendforge.backend.web;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.head;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.forwardedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

/** The frontend is served from the same jar; fixtures in src/test/resources/static stand in for the build. */
@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = "spring.datasource.url=jdbc:h2:mem:frontend-test;DB_CLOSE_DELAY=-1")
class FrontendServingTest {

  @Autowired private MockMvc mvc;

  /** "/" is Spring Boot's welcome page: a forward to index.html (MockMvc does not follow it). */
  @Test
  void aRaizEncaminhaParaOIndexSemCacheLongo() throws Exception {
    mvc.perform(get("/"))
        .andExpect(status().isOk())
        .andExpect(forwardedUrl("index.html"))
        .andExpect(header().string("Cache-Control", "no-cache"));
  }

  @Test
  void rotasDoAngularEntregamOIndexParaOLinkDiretoEORecarregamento() throws Exception {
    for (String rota : new String[] {"/lessons/js-closures-01", "/settings", "/academy/phases/phase-00-web"}) {
      mvc.perform(get(rota))
          .andExpect(status().isOk())
          .andExpect(content().string(org.hamcrest.Matchers.containsString("INDEX-FIXTURE")))
          .andExpect(header().string("Cache-Control", "no-cache"));
    }
  }

  @Test
  void arquivosComHashTemCacheDeUmAno() throws Exception {
    mvc.perform(get("/main-AB12CD34.js"))
        .andExpect(status().isOk())
        .andExpect(content().string(org.hamcrest.Matchers.containsString("fixture")))
        .andExpect(header().string("Cache-Control", "public, max-age=31536000, immutable"));
  }

  @Test
  void headRespondeOsMesmosCabecalhosDeCacheQueGet() throws Exception {
    mvc.perform(head("/main-AB12CD34.js"))
        .andExpect(header().string("Cache-Control", "public, max-age=31536000, immutable"));
    mvc.perform(head("/lessons/js-closures-01")).andExpect(header().string("Cache-Control", "no-cache"));
  }

  @Test
  void aApiNuncaCaiNaPaginaEContinuaProtegida() throws Exception {
    mvc.perform(get("/api/progress")).andExpect(status().isUnauthorized());
    mvc.perform(get("/api/nao-existe")).andExpect(status().isUnauthorized());
  }

  @Test
  void politicaDeCachePorNome() {
    assertThat(FrontendCacheFilter.cacheControlFor("/chunk-BGm8AK-M.js")).contains("immutable");
    assertThat(FrontendCacheFilter.cacheControlFor("/styles-AY4PUXBF.css")).contains("immutable");
    assertThat(FrontendCacheFilter.cacheControlFor("/index.html")).isEqualTo("no-cache");
    assertThat(FrontendCacheFilter.cacheControlFor("/favicon.ico")).isEqualTo("no-cache");
    assertThat(FrontendCacheFilter.cacheControlFor("/lessons/js-closures-01")).isEqualTo("no-cache");
  }
}
