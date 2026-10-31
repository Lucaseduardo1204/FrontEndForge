package dev.frontendforge.backend.auth;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.Optional;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Repository;

@Repository
public class AccountStore implements UserDetailsService {

  private final JdbcClient jdbc;

  public AccountStore(JdbcClient jdbc) {
    this.jdbc = jdbc;
  }

  public Optional<Account> findByEmail(String email) {
    return jdbc.sql("SELECT id, email, password_hash FROM users WHERE email = :email")
        .param("email", email)
        .query((rs, row) -> new Account(rs.getLong("id"), rs.getString("email"), rs.getString("password_hash")))
        .optional();
  }

  /** Returns empty when the e-mail is already registered. */
  public Optional<Account> create(String email, String passwordHash) {
    try {
      jdbc.sql("INSERT INTO users (email, password_hash, created_at) VALUES (:email, :hash, :now)")
          .param("email", email)
          .param("hash", passwordHash)
          .param("now", Timestamp.from(Instant.now()))
          .update();
    } catch (DuplicateKeyException e) {
      return Optional.empty();
    }
    return findByEmail(email);
  }

  @Override
  public Account loadUserByUsername(String email) {
    return findByEmail(Credentials.normalizeEmail(email))
        .orElseThrow(() -> new UsernameNotFoundException("not found"));
  }
}
