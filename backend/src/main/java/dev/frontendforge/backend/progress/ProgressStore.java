package dev.frontendforge.backend.progress;

import java.time.Instant;
import java.util.Optional;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

/**
 * Stores one progress document per account. The version increases on every write and is
 * exposed as an ETag, so concurrent writers can be detected (412).
 */
@Repository
public class ProgressStore {

  private final JdbcClient jdbc;

  public ProgressStore(JdbcClient jdbc) {
    this.jdbc = jdbc;
  }

  public record Stored(String document, long version, Instant updatedAt) {}

  public Optional<Stored> find(long userId) {
    return jdbc.sql("SELECT document, version, updated_at FROM progress WHERE user_id = :id")
        .param("id", userId)
        .query(
            (rs, row) ->
                new Stored(
                    rs.getString("document"),
                    rs.getLong("version"),
                    rs.getTimestamp("updated_at").toInstant()))
        .optional();
  }

  /**
   * Saves the document. When {@code expectedVersion} is present and differs from the stored one,
   * nothing is written and the result is empty (the caller answers 412).
   */
  @Transactional
  public Optional<Long> save(long userId, String document, Optional<Long> expectedVersion) {
    Optional<Stored> current = find(userId);
    if (expectedVersion.isPresent()
        && current.map(Stored::version).orElse(0L).longValue() != expectedVersion.get()) {
      return Optional.empty();
    }
    long next = current.map(Stored::version).orElse(0L) + 1;
    int updated =
        jdbc.sql(
                "UPDATE progress SET document = :doc, version = :next, updated_at = :now"
                    + " WHERE user_id = :id")
            .param("doc", document)
            .param("next", next)
            .param("now", java.sql.Timestamp.from(Instant.now()))
            .param("id", userId)
            .update();
    if (updated == 0) {
      jdbc.sql(
              "INSERT INTO progress (user_id, document, version, updated_at)"
                  + " VALUES (:id, :doc, :next, :now)")
          .param("id", userId)
          .param("doc", document)
          .param("next", next)
          .param("now", java.sql.Timestamp.from(Instant.now()))
          .update();
    }
    return Optional.of(next);
  }

  public void clear(long userId) {
    jdbc.sql("DELETE FROM progress WHERE user_id = :id").param("id", userId).update();
  }
}
