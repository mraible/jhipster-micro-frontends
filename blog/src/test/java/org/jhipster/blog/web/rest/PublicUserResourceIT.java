package org.jhipster.blog.web.rest;

import static org.springframework.security.test.web.reactive.server.SecurityMockServerConfigurers.csrf;

import java.util.Set;
import org.jhipster.blog.IntegrationTest;
import org.jhipster.blog.domain.User;
import org.jhipster.blog.repository.UserRepository;
import org.jhipster.blog.security.AuthoritiesConstants;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.reactive.server.WebTestClient;

/**
 * Integration tests for the {@link PublicUserResource} REST controller.
 */
@AutoConfigureWebTestClient(timeout = IntegrationTest.DEFAULT_TIMEOUT)
@WithMockUser(authorities = AuthoritiesConstants.ADMIN)
@IntegrationTest
class PublicUserResourceIT {

    private static final String DEFAULT_LOGIN = "johndoe";

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WebTestClient webTestClient;

    private User user;

    @BeforeEach
    public void setupCsrf() {
        webTestClient = webTestClient.mutateWith(csrf());
    }

    @BeforeEach
    public void initTest() {
        user = UserResourceIT.initTestUser();
    }

    @AfterEach
    public void cleanupAndCheck() {
        userRepository.deleteAll().block();
    }

    @Test
    void getAllPublicUsers() {
        // Initialize the database
        userRepository.save(user).block();

        // Get all the users
        webTestClient
            .get()
            .uri("/api/users?sort=id,desc")
            .accept(MediaType.APPLICATION_JSON)
            .exchange()
            .expectStatus()
            .isOk()
            .expectHeader()
            .contentType(MediaType.APPLICATION_JSON)
            .expectBody()
            .jsonPath("$.[?(@.id == '%s')].login", user.getId())
            .isEqualTo(user.getLogin())
            .jsonPath("$.[?(@.id == '%s')].keys()", user.getId())
            .isEqualTo(Set.of("id", "login"))
            .jsonPath("$.[*].email")
            .doesNotHaveJsonPath()
            .jsonPath("$.[*].imageUrl")
            .doesNotHaveJsonPath()
            .jsonPath("$.[*].langKey")
            .doesNotHaveJsonPath();
    }
}
