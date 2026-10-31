package dev.frontendforge.backend.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  private static final String WRONG_CREDENTIALS = "E-mail ou senha incorretos.";

  private final AccountStore accounts;
  private final PasswordEncoder encoder;
  private final AuthenticationManager authentication;
  private final SecurityContextRepository contexts;
  private final LoginThrottle throttle;

  public AuthController(
      AccountStore accounts,
      PasswordEncoder encoder,
      AuthenticationManager authentication,
      SecurityContextRepository contexts,
      LoginThrottle throttle) {
    this.accounts = accounts;
    this.encoder = encoder;
    this.authentication = authentication;
    this.contexts = contexts;
    this.throttle = throttle;
  }

  /** Who is signed in. 401 when nobody is; also issues the CSRF cookie the SPA needs first. */
  @GetMapping("/me")
  public ResponseEntity<Map<String, Object>> me(@AuthenticationPrincipal Account account) {
    if (account == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    return ResponseEntity.ok(Map.of("email", account.email()));
  }

  @PostMapping("/register")
  public ResponseEntity<Map<String, Object>> register(
      @RequestBody Credentials credentials, HttpServletRequest request, HttpServletResponse response) {
    String problem = credentials.problemForRegistration();
    if (problem != null) return ResponseEntity.badRequest().body(Map.of("erro", problem));
    String email = Credentials.normalizeEmail(credentials.email());
    var created = accounts.create(email, encoder.encode(credentials.password()));
    if (created.isEmpty()) {
      return ResponseEntity.status(HttpStatus.CONFLICT)
          .body(Map.of("erro", "Já existe uma conta com este e-mail. Entre com ela."));
    }
    signIn(email, credentials.password(), request, response);
    return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("email", email));
  }

  @PostMapping("/login")
  public ResponseEntity<Map<String, Object>> login(
      @RequestBody Credentials credentials, HttpServletRequest request, HttpServletResponse response) {
    String email = Credentials.normalizeEmail(credentials.email());
    var wait = throttle.retryAfter(email);
    if (wait.isPresent()) {
      return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
          .header("Retry-After", String.valueOf(wait.get()))
          .body(Map.of("erro", "Muitas tentativas. Tente de novo em alguns minutos."));
    }
    try {
      signIn(email, credentials.password() == null ? "" : credentials.password(), request, response);
    } catch (AuthenticationException e) {
      throttle.failed(email);
      // Same answer for unknown e-mail and wrong password: no hint about which accounts exist.
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("erro", WRONG_CREDENTIALS));
    }
    throttle.succeeded(email);
    return ResponseEntity.ok(Map.of("email", email));
  }

  /** Authenticates and stores the context in the session (a new session id: no fixation). */
  private void signIn(String email, String password, HttpServletRequest request, HttpServletResponse response) {
    Authentication result =
        authentication.authenticate(UsernamePasswordAuthenticationToken.unauthenticated(email, password));
    // A new session id on every sign-in (no session fixation); a first visit simply gets a new one.
    if (request.getSession(false) != null) request.changeSessionId();
    else request.getSession(true);
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(result);
    SecurityContextHolder.setContext(context);
    contexts.saveContext(context, request, response);
  }
}
