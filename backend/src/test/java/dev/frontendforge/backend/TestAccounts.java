package dev.frontendforge.backend;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;

/** Registers an account through the real endpoint and returns its signed-in session. */
public final class TestAccounts {

  public static final String PASSWORD = "senha-bem-longa-123";

  private TestAccounts() {}

  public static MockHttpSession register(MockMvc mvc, String email) throws Exception {
    return (MockHttpSession)
        mvc.perform(
                post("/api/auth/register")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"email\":\"" + email + "\",\"password\":\"" + PASSWORD + "\"}"))
            .andExpect(status().isCreated())
            .andReturn()
            .getRequest()
            .getSession(false);
  }
}
