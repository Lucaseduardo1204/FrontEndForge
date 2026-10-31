package dev.frontendforge.backend.progress;

import dev.frontendforge.backend.auth.Account;
import dev.frontendforge.backend.progress.ProgressValidator.InvalidProgressException;
import java.util.Map;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Progress of the signed-in account: the user id comes from the session, never from the request.
 * GET returns the stored progress (204 when there is none) with an ETag. PUT validates and
 * stores it; with If-Match, a stale version is rejected with 412 instead of overwriting newer
 * progress saved elsewhere. DELETE removes it.
 */
@RestController
@RequestMapping("/api/progress")
public class ProgressController {

  private final ProgressStore store;
  private final ProgressValidator validator;

  public ProgressController(ProgressStore store, ProgressValidator validator) {
    this.store = store;
    this.validator = validator;
  }

  @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<String> get(@AuthenticationPrincipal Account account) {
    return store
        .find(account.id())
        .map(
            s ->
                ResponseEntity.ok()
                    .eTag(etag(s.version()))
                    .header("Cache-Control", "no-store")
                    .body(s.document()))
        .orElseGet(() -> ResponseEntity.noContent().header("Cache-Control", "no-store").build());
  }

  @PutMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<Void> put(
      @AuthenticationPrincipal Account account,
      @RequestBody(required = false) String body,
      @RequestHeader(name = "If-Match", required = false) String ifMatch) {
    String document = validator.validate(body);
    Optional<Long> expected = Optional.ofNullable(ifMatch).map(ProgressController::parseEtag);
    return store
        .save(account.id(), document, expected)
        .map(v -> ResponseEntity.noContent().eTag(etag(v)).<Void>build())
        .orElseGet(() -> ResponseEntity.status(HttpStatus.PRECONDITION_FAILED).build());
  }

  @DeleteMapping
  public ResponseEntity<Void> delete(@AuthenticationPrincipal Account account) {
    store.clear(account.id());
    return ResponseEntity.noContent().build();
  }

  @ExceptionHandler(InvalidProgressException.class)
  public ResponseEntity<Map<String, String>> invalid(InvalidProgressException e) {
    HttpStatus status =
        switch (e.problem()) {
          case TOO_LARGE -> HttpStatus.CONTENT_TOO_LARGE;
          case NOT_JSON, EMPTY -> HttpStatus.BAD_REQUEST;
          case NOT_OBJECT, BAD_VERSION -> HttpStatus.UNPROCESSABLE_CONTENT;
        };
    return ResponseEntity.status(status).body(Map.of("erro", e.getMessage()));
  }

  private static String etag(long version) {
    return "\"v" + version + "\"";
  }

  /** Accepts "v3" or W/"v3"; anything else can never match a stored version. */
  private static Long parseEtag(String header) {
    String value = header.trim().replaceFirst("^W/", "").replace("\"", "");
    if (value.startsWith("v")) {
      try {
        return Long.parseLong(value.substring(1));
      } catch (NumberFormatException ignored) {
        // fall through: an unparseable tag never matches
      }
    }
    return -1L;
  }
}
