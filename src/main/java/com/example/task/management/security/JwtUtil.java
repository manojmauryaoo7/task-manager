package com.example.task.management.security;

import io.jsonwebtoken.*;
import org.springframework.stereotype.Component;
import java.util.Date;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import java.nio.charset.StandardCharsets;

@Component
public class JwtUtil {
    @Value("${jwt.secret}")
    private String jwtSecret;
    private final long jwtExpirationMs = 86400000; // 1 day

    public String generateToken(String username, Set<String> roles) {
        return Jwts.builder()
            .setSubject(username)
            .claim("roles", roles)
            .setIssuedAt(new Date())
            .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
            .signWith(SignatureAlgorithm.HS512, jwtSecret.getBytes(StandardCharsets.UTF_8))
            .compact();
    }

    public String getUsernameFromJwt(String token) {
        return Jwts.parser().setSigningKey(jwtSecret.getBytes(StandardCharsets.UTF_8)).parseClaimsJws(token).getBody().getSubject();
    }

    public Set<String> getRolesFromJwt(String token) {
        Object roles = Jwts.parser().setSigningKey(jwtSecret.getBytes(StandardCharsets.UTF_8)).parseClaimsJws(token).getBody().get("roles");
        return ((java.util.List<?>) roles).stream().map(Object::toString).collect(Collectors.toSet());
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parser().setSigningKey(jwtSecret.getBytes(StandardCharsets.UTF_8)).parseClaimsJws(authToken);
            return true;
        } catch (JwtException e) {
            return false;
        }
    }
} 