package dev.frontendforge.backend.progress;

import java.nio.charset.StandardCharsets;
import org.springframework.stereotype.Component;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/**
 * The backend is a trust boundary: nothing the client sends is accepted without checks. The
 * frontend validates the document deeply when it loads it; here we reject anything that is not a
 * plausible progress document before storing it.
 */
@Component
public class ProgressValidator {

  /** Keep in sync with CURRENT_SCHEMA_VERSION in the frontend (checked by a frontend test). */
  public static final int CURRENT_SCHEMA_VERSION = 4;

  public static final int MAX_BYTES = 512 * 1024;

  private final ObjectMapper mapper;

  public ProgressValidator(ObjectMapper mapper) {
    this.mapper = mapper;
  }

  /** Returns the canonical JSON to store, or throws {@link InvalidProgressException}. */
  public String validate(String body) {
    if (body == null || body.isBlank()) {
      throw new InvalidProgressException(Problem.EMPTY, "O corpo da requisição está vazio.");
    }
    if (body.getBytes(StandardCharsets.UTF_8).length > MAX_BYTES) {
      throw new InvalidProgressException(
          Problem.TOO_LARGE, "O progresso passa do limite de " + MAX_BYTES / 1024 + " KiB.");
    }
    JsonNode document;
    try {
      document = mapper.readTree(body);
    } catch (JacksonException e) {
      throw new InvalidProgressException(Problem.NOT_JSON, "O corpo não é um JSON válido.");
    }
    if (document == null || !document.isObject()) {
      throw new InvalidProgressException(Problem.NOT_OBJECT, "O progresso precisa ser um objeto JSON.");
    }
    JsonNode version = document.get("schemaVersion");
    if (version == null || !version.isIntegralNumber()) {
      throw new InvalidProgressException(
          Problem.BAD_VERSION, "schemaVersion ausente ou não é um número inteiro.");
    }
    int v = version.asInt();
    if (v < 1 || v > CURRENT_SCHEMA_VERSION) {
      throw new InvalidProgressException(
          Problem.BAD_VERSION,
          "schemaVersion " + v + " não é suportada (1 a " + CURRENT_SCHEMA_VERSION + ").");
    }
    return mapper.writeValueAsString(document);
  }

  public enum Problem {
    EMPTY,
    TOO_LARGE,
    NOT_JSON,
    NOT_OBJECT,
    BAD_VERSION
  }

  public static class InvalidProgressException extends RuntimeException {
    private final Problem problem;

    public InvalidProgressException(Problem problem, String message) {
      super(message);
      this.problem = problem;
    }

    public Problem problem() {
      return problem;
    }
  }
}
