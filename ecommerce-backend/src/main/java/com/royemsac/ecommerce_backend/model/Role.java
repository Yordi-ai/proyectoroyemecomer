package com.royemsac.ecommerce_backend.model;

public enum Role {
    CLIENTE("ROLE_CLIENTE"),
    ADMIN("ROLE_ADMIN");
    
    private final String authority;
    
    Role(String authority) {
        this.authority = authority;
    }
    
    public String getAuthority() {
        return authority;
    }
}