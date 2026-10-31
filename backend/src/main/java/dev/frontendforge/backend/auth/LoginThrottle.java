package dev.frontendforge.backend.auth;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;

/**
 * Limits failed sign-ins per e-mail: after MAX_FAILURES within WINDOW, further attempts are
 * refused until the oldest failure leaves the window. In memory: enough for a single local
 * server; a deployed backend needs a shared store (D-071).
 */
@Component
public class LoginThrottle {

  public static final int MAX_FAILURES = 5;
  public static final Duration WINDOW = Duration.ofMinutes(15);

  private final Clock clock;
  private final Map<String, Deque<Instant>> failures = new ConcurrentHashMap<>();

  public LoginThrottle(Clock clock) {
    this.clock = clock;
  }

  /** Seconds to wait before trying again, or empty when an attempt is allowed. */
  public Optional<Long> retryAfter(String email) {
    Deque<Instant> recent = prune(email);
    if (recent.size() < MAX_FAILURES) return Optional.empty();
    Instant freeAt = recent.peekFirst().plus(WINDOW);
    return Optional.of(Math.max(1, Duration.between(clock.instant(), freeAt).toSeconds()));
  }

  public void failed(String email) {
    prune(email).addLast(clock.instant());
  }

  public void succeeded(String email) {
    failures.remove(email);
  }

  private Deque<Instant> prune(String email) {
    Deque<Instant> recent = failures.computeIfAbsent(email, k -> new ArrayDeque<>());
    synchronized (recent) {
      Instant limit = clock.instant().minus(WINDOW);
      while (!recent.isEmpty() && !recent.peekFirst().isAfter(limit)) recent.pollFirst();
    }
    return recent;
  }
}
