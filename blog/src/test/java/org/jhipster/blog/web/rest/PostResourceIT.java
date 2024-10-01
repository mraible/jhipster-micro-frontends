package org.jhipster.blog.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.is;
import static org.jhipster.blog.domain.PostAsserts.*;
import static org.jhipster.blog.web.rest.TestUtil.createUpdateProxyForBean;
import static org.springframework.security.test.web.reactive.server.SecurityMockServerConfigurers.csrf;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import org.jhipster.blog.IntegrationTest;
import org.jhipster.blog.domain.Post;
import org.jhipster.blog.repository.PostRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.reactive.server.WebTestClient;

/**
 * Integration tests for the {@link PostResource} REST controller.
 */
@IntegrationTest
@AutoConfigureWebTestClient(timeout = IntegrationTest.DEFAULT_ENTITY_TIMEOUT)
@WithMockUser
class PostResourceIT {

    private static final String DEFAULT_TITLE = "AAAAAAAAAA";
    private static final String UPDATED_TITLE = "BBBBBBBBBB";

    private static final String DEFAULT_CONTENT = "AAAAAAAAAA";
    private static final String UPDATED_CONTENT = "BBBBBBBBBB";

    private static final Instant DEFAULT_DATE = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_DATE = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String ENTITY_API_URL = "/api/posts";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    @Autowired
    private ObjectMapper om;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private WebTestClient webTestClient;

    private Post post;

    private Post insertedPost;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Post createEntity() {
        return new Post().title(DEFAULT_TITLE).content(DEFAULT_CONTENT).date(DEFAULT_DATE);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Post createUpdatedEntity() {
        return new Post().title(UPDATED_TITLE).content(UPDATED_CONTENT).date(UPDATED_DATE);
    }

    @BeforeEach
    public void setupCsrf() {
        webTestClient = webTestClient.mutateWith(csrf());
    }

    @BeforeEach
    public void initTest() {
        post = createEntity();
    }

    @AfterEach
    public void cleanup() {
        if (insertedPost != null) {
            postRepository.delete(insertedPost).block();
            insertedPost = null;
        }
    }

    @Test
    void createPost() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Post
        var returnedPost = webTestClient
            .post()
            .uri(ENTITY_API_URL)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(om.writeValueAsBytes(post))
            .exchange()
            .expectStatus()
            .isCreated()
            .expectBody(Post.class)
            .returnResult()
            .getResponseBody();

        // Validate the Post in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertPostUpdatableFieldsEquals(returnedPost, getPersistedPost(returnedPost));

        insertedPost = returnedPost;
    }

    @Test
    void createPostWithExistingId() throws Exception {
        // Create the Post with an existing ID
        post.setId("existing_id");

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        webTestClient
            .post()
            .uri(ENTITY_API_URL)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(om.writeValueAsBytes(post))
            .exchange()
            .expectStatus()
            .isBadRequest();

        // Validate the Post in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    void checkTitleIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        post.setTitle(null);

        // Create the Post, which fails.

        webTestClient
            .post()
            .uri(ENTITY_API_URL)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(om.writeValueAsBytes(post))
            .exchange()
            .expectStatus()
            .isBadRequest();

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    void checkDateIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        post.setDate(null);

        // Create the Post, which fails.

        webTestClient
            .post()
            .uri(ENTITY_API_URL)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(om.writeValueAsBytes(post))
            .exchange()
            .expectStatus()
            .isBadRequest();

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    void getAllPosts() {
        // Initialize the database
        insertedPost = postRepository.save(post).block();

        // Get all the postList
        webTestClient
            .get()
            .uri(ENTITY_API_URL + "?sort=id,desc")
            .accept(MediaType.APPLICATION_JSON)
            .exchange()
            .expectStatus()
            .isOk()
            .expectHeader()
            .contentType(MediaType.APPLICATION_JSON)
            .expectBody()
            .jsonPath("$.[*].title")
            .value(hasItem(DEFAULT_TITLE))
            .jsonPath("$.[*].content")
            .value(hasItem(DEFAULT_CONTENT.toString()))
            .jsonPath("$.[*].date")
            .value(hasItem(DEFAULT_DATE.toString()));
    }

    @Test
    void getPost() {
        // Initialize the database
        insertedPost = postRepository.save(post).block();

        // Get the post
        webTestClient
            .get()
            .uri(ENTITY_API_URL_ID, post.getId())
            .accept(MediaType.APPLICATION_JSON)
            .exchange()
            .expectStatus()
            .isOk()
            .expectHeader()
            .contentType(MediaType.APPLICATION_JSON)
            .expectBody()
            .jsonPath("$.title")
            .value(is(DEFAULT_TITLE))
            .jsonPath("$.content")
            .value(is(DEFAULT_CONTENT.toString()))
            .jsonPath("$.date")
            .value(is(DEFAULT_DATE.toString()));
    }

    @Test
    void getNonExistingPost() {
        // Get the post
        webTestClient
            .get()
            .uri(ENTITY_API_URL_ID, Long.MAX_VALUE)
            .accept(MediaType.APPLICATION_PROBLEM_JSON)
            .exchange()
            .expectStatus()
            .isNotFound();
    }

    @Test
    void putExistingPost() throws Exception {
        // Initialize the database
        insertedPost = postRepository.save(post).block();

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the post
        Post updatedPost = postRepository.findById(post.getId()).block();
        updatedPost.title(UPDATED_TITLE).content(UPDATED_CONTENT).date(UPDATED_DATE);

        webTestClient
            .put()
            .uri(ENTITY_API_URL_ID, updatedPost.getId())
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(om.writeValueAsBytes(updatedPost))
            .exchange()
            .expectStatus()
            .isOk();

        // Validate the Post in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedPostToMatchAllProperties(updatedPost);
    }

    @Test
    void putNonExistingPost() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        post.setId(UUID.randomUUID().toString());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        webTestClient
            .put()
            .uri(ENTITY_API_URL_ID, post.getId())
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(om.writeValueAsBytes(post))
            .exchange()
            .expectStatus()
            .isBadRequest();

        // Validate the Post in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    void putWithIdMismatchPost() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        post.setId(UUID.randomUUID().toString());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        webTestClient
            .put()
            .uri(ENTITY_API_URL_ID, UUID.randomUUID().toString())
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(om.writeValueAsBytes(post))
            .exchange()
            .expectStatus()
            .isBadRequest();

        // Validate the Post in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    void putWithMissingIdPathParamPost() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        post.setId(UUID.randomUUID().toString());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        webTestClient
            .put()
            .uri(ENTITY_API_URL)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(om.writeValueAsBytes(post))
            .exchange()
            .expectStatus()
            .isEqualTo(405);

        // Validate the Post in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    void partialUpdatePostWithPatch() throws Exception {
        // Initialize the database
        insertedPost = postRepository.save(post).block();

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the post using partial update
        Post partialUpdatedPost = new Post();
        partialUpdatedPost.setId(post.getId());

        webTestClient
            .patch()
            .uri(ENTITY_API_URL_ID, partialUpdatedPost.getId())
            .contentType(MediaType.valueOf("application/merge-patch+json"))
            .bodyValue(om.writeValueAsBytes(partialUpdatedPost))
            .exchange()
            .expectStatus()
            .isOk();

        // Validate the Post in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPostUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedPost, post), getPersistedPost(post));
    }

    @Test
    void fullUpdatePostWithPatch() throws Exception {
        // Initialize the database
        insertedPost = postRepository.save(post).block();

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the post using partial update
        Post partialUpdatedPost = new Post();
        partialUpdatedPost.setId(post.getId());

        partialUpdatedPost.title(UPDATED_TITLE).content(UPDATED_CONTENT).date(UPDATED_DATE);

        webTestClient
            .patch()
            .uri(ENTITY_API_URL_ID, partialUpdatedPost.getId())
            .contentType(MediaType.valueOf("application/merge-patch+json"))
            .bodyValue(om.writeValueAsBytes(partialUpdatedPost))
            .exchange()
            .expectStatus()
            .isOk();

        // Validate the Post in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPostUpdatableFieldsEquals(partialUpdatedPost, getPersistedPost(partialUpdatedPost));
    }

    @Test
    void patchNonExistingPost() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        post.setId(UUID.randomUUID().toString());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        webTestClient
            .patch()
            .uri(ENTITY_API_URL_ID, post.getId())
            .contentType(MediaType.valueOf("application/merge-patch+json"))
            .bodyValue(om.writeValueAsBytes(post))
            .exchange()
            .expectStatus()
            .isBadRequest();

        // Validate the Post in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    void patchWithIdMismatchPost() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        post.setId(UUID.randomUUID().toString());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        webTestClient
            .patch()
            .uri(ENTITY_API_URL_ID, UUID.randomUUID().toString())
            .contentType(MediaType.valueOf("application/merge-patch+json"))
            .bodyValue(om.writeValueAsBytes(post))
            .exchange()
            .expectStatus()
            .isBadRequest();

        // Validate the Post in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    void patchWithMissingIdPathParamPost() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        post.setId(UUID.randomUUID().toString());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        webTestClient
            .patch()
            .uri(ENTITY_API_URL)
            .contentType(MediaType.valueOf("application/merge-patch+json"))
            .bodyValue(om.writeValueAsBytes(post))
            .exchange()
            .expectStatus()
            .isEqualTo(405);

        // Validate the Post in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    void deletePost() {
        // Initialize the database
        insertedPost = postRepository.save(post).block();

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the post
        webTestClient
            .delete()
            .uri(ENTITY_API_URL_ID, post.getId())
            .accept(MediaType.APPLICATION_JSON)
            .exchange()
            .expectStatus()
            .isNoContent();

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return postRepository.count().block();
    }

    protected void assertIncrementedRepositoryCount(long countBefore) {
        assertThat(countBefore + 1).isEqualTo(getRepositoryCount());
    }

    protected void assertDecrementedRepositoryCount(long countBefore) {
        assertThat(countBefore - 1).isEqualTo(getRepositoryCount());
    }

    protected void assertSameRepositoryCount(long countBefore) {
        assertThat(countBefore).isEqualTo(getRepositoryCount());
    }

    protected Post getPersistedPost(Post post) {
        return postRepository.findById(post.getId()).block();
    }

    protected void assertPersistedPostToMatchAllProperties(Post expectedPost) {
        assertPostAllPropertiesEquals(expectedPost, getPersistedPost(expectedPost));
    }

    protected void assertPersistedPostToMatchUpdatableProperties(Post expectedPost) {
        assertPostAllUpdatablePropertiesEquals(expectedPost, getPersistedPost(expectedPost));
    }
}
