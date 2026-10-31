package dev.frontendforge.backend.auth;

import java.util.Locale;
import java.util.regex.Pattern;

/** Rules for the e-mail and password sent by the client; the server never trusts its checks. */
public record Credentials(String email, String password) {

  public static final int MIN_PASSWORD = 12;
  public static final int MAX_PASSWORD = 128;
  private static final Pattern EMAIL = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");

  public static String normalizeEmail(String email) {
    return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
  }

  /** Returns a message for the student, or null when the credentials are acceptable. */
  public String problemForRegistration() {
    String e = normalizeEmail(email);
    if (e.length() > 254 || !EMAIL.matcher(e).matches()) return "Informe um e-mail válido.";
    if (password == null || password.length() < MIN_PASSWORD) {
      return "A senha precisa ter pelo menos " + MIN_PASSWORD + " caracteres.";
    }
    if (password.length() > MAX_PASSWORD) {
      return "A senha pode ter no máximo " + MAX_PASSWORD + " caracteres.";
    }
    return null;
  }
}
