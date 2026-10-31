package dev.frontendforge.backend.auth;

import java.util.Collection;
import java.util.List;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

/** The signed-in student. Only the id and e-mail leave the server; the hash never does. */
public record Account(long id, String email, String passwordHash) implements UserDetails {

  @Override
  public String getUsername() {
    return email;
  }

  @Override
  public String getPassword() {
    return passwordHash;
  }

  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    return List.of();
  }
}
