package dev.frontendforge.backend.auth;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;

class LoginThrottleTest {

  /** A clock the test moves by hand. */
  private static final class Relogio extends Clock {
    private Instant agora = Instant.parse("2026-10-30T12:00:00Z");

    @Override
    public Instant instant() {
      return agora;
    }

    @Override
    public ZoneOffset getZone() {
      return ZoneOffset.UTC;
    }

    @Override
    public Clock withZone(java.time.ZoneId zone) {
      return this;
    }

    void avancar(Duration d) {
      agora = agora.plus(d);
    }
  }

  @Test
  void bloqueiaNaQuintaFalhaELiberaQuandoAMaisAntigaSaiDaJanela() {
    Relogio relogio = new Relogio();
    LoginThrottle throttle = new LoginThrottle(relogio);

    for (int i = 0; i < LoginThrottle.MAX_FAILURES - 1; i++) throttle.failed("a@x.com");
    assertThat(throttle.retryAfter("a@x.com")).isEmpty();

    throttle.failed("a@x.com");
    assertThat(throttle.retryAfter("a@x.com")).hasValue(LoginThrottle.WINDOW.toSeconds());

    relogio.avancar(LoginThrottle.WINDOW.minusSeconds(60));
    assertThat(throttle.retryAfter("a@x.com")).hasValue(60L);

    relogio.avancar(Duration.ofSeconds(60));
    assertThat(throttle.retryAfter("a@x.com")).isEmpty();
  }

  @Test
  void sucessoZeraAsFalhasEContasSaoIndependentes() {
    LoginThrottle throttle = new LoginThrottle(new Relogio());
    for (int i = 0; i < LoginThrottle.MAX_FAILURES; i++) throttle.failed("a@x.com");
    assertThat(throttle.retryAfter("b@x.com")).isEmpty();
    throttle.succeeded("a@x.com");
    assertThat(throttle.retryAfter("a@x.com")).isEmpty();
  }
}
