package org.jhipster.blog.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.is;
import static org.jhipster.blog.domain.BlogAsserts.*;
import static org.jhipster.blog.web.rest.TestUtil.createUpdateProxyForBean;
import static org.springframework.security.test.web.reactive.server.SecurityMockServerConfigurers.csrf;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Duration;
import java.util.List;
import java.util.UUID;
import org.jhipster.blog.IntegrationTest;
import org.jhipster.blog.domain.Blog;
import org.jhipster.blog.repository.BlogRepository;
import org.jhipster.blog.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.reactive.server.WebTestClient;

/**
 * Integration tests for the {@link BlogResource} REST controller.
 */
@IntegrationTest
@AutoConfigureWebTestClient(timeout = IntegrationTest.DEFAULT_ENTITY_TIMEOUT)
@WithMockUser
class BlogResourceIT {

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_HANDLE = "AAAAAAAAAA";
    private static final String UPDATED_HANDLE = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/blogs";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    @Autowired
    private ObjectMapper om;

    @Autowired
    private BlogRepository blogRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WebTestClient webTestClient;

    private Blog blog;

    private Blog insertedBlog;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Blog createEntity() {
        return new Blog().name(DEFAULT_NAME).handle(DEFAULT_HANDLE);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Blog createUpdatedEntity() {
        return new Blog().name(UPDATED_NAME).handle(UPDATED_HANDLE);
    }

    @BeforeEach
    public void setupCsrf() {
        webTestClient = webTestClient.mutateWith(csrf());
    }

    @BeforeEach
    public void initTest() {
        blog = createEntity();
    }

    @AfterEach
    public void cleanup() {
        if (insertedBlog != null) {
            blogRepository.delete(insertedBlog).block();
            insertedBlog = null;
        }
        userRepository.deleteAll().block();
    }

    @Test
    void createBlog() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Blog
        var returnedBlog = webTestClient
            .post()
            .uri(ENTITY_API_URL)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(om.writeValueAsBytes(blog))
            .exchange()
            .expectStatus()
            .isCreated()
            .expectBody(Blog.class)
            .returnResult()
            .getResponseBody();

        // Validate the Blog in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertBlogUpdatableFieldsEquals(returnedBlog, getPersistedBlog(returnedBlog));

        insertedBlog = returnedBlog;
    }

    @Test
    void createBlogWithExistingId() throws Exception {
        // Create the Blog with an existing ID
        blog.setId("existing_id");

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        webTestClient
            .post()
            .uri(ENTITY_API_URL)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(om.writeValueAsBytes(blog))
            .exchange()
            .expectStatus()
            .isBadRequest();

        // Validate the Blog in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    void checkNameIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        blog.setName(null);

        // Create the Blog, which fails.

        webTestClient
            .post()
            .uri(ENTITY_API_URL)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(om.writeValueAsBytes(blog))
            .exchange()
            .expectStatus()
            .isBadRequest();

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    void checkHandleIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        blog.setHandle(null);

        // Create the Blog, which fails.

        webTestClient
            .post()
            .uri(ENTITY_API_URL)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(om.writeValueAsBytes(blog))
            .exchange()
            .expectStatus()
            .isBadRequest();

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    void getAllBlogsAsStream() {
        // Initialize the database
        blogRepository.save(blog).block();

        List<Blog> blogList = webTestClient
            .get()
            .uri(ENTITY_API_URL)
            .accept(MediaType.APPLICATION_NDJSON)
            .exchange()
            .expectStatus()
            .isOk()
            .expectHeader()
            .contentTypeCompatibleWith(MediaType.APPLICATION_NDJSON)
            .returnResult(Blog.class)
            .getResponseBody()
            .filter(blog::equals)
            .collectList()
            .block(Duration.ofSeconds(5));

        assertThat(blogList).isNotNull();
        assertThat(blogList).hasSize(1);
        Blog testBlog = blogList.get(0);

        assertBlogAllPropertiesEquals(blog, testBlog);
    }

    @Test
    void getAllBlogs() {
        // Initialize the database
        insertedBlog = blogRepository.save(blog).block();

        // Get all the blogList
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
            .jsonPath("$.[*].name")
            .value(hasItem(DEFAULT_NAME))
            .jsonPath("$.[*].handle")
            .value(hasItem(DEFAULT_HANDLE));
    }

    @Test
    void getBlog() {
        // Initialize the database
        insertedBlog = blogRepository.save(blog).block();

        // Get the blog
        webTestClient
            .get()
            .uri(ENTITY_API_URL_ID, blog.getId())
            .accept(MediaType.APPLICATION_JSON)
            .exchange()
            .expectStatus()
            .isOk()
            .expectHeader()
            .contentType(MediaType.APPLICATION_JSON)
            .expectBody()
            .jsonPath("$.name")
            .value(is(DEFAULT_NAME))
            .jsonPath("$.handle")
            .value(is(DEFAULT_HANDLE));
    }

    @Test
    void getNonExistingBlog() {
        // Get the blog
        webTestClient
            .get()
            .uri(ENTITY_API_URL_ID, Long.MAX_VALUE)
            .accept(MediaType.APPLICATION_PROBLEM_JSON)
            .exchange()
            .expectStatus()
            .isNotFound();
    }

    @Test
    void putExistingBlog() throws Exception {
        // Initialize the database
        insertedBlog = blogRepository.save(blog).block();

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the blog
        Blog updatedBlog = blogRepository.findById(blog.getId()).block();
        updatedBlog.name(UPDATED_NAME).handle(UPDATED_HANDLE);

        webTestClient
            .put()
            .uri(ENTITY_API_URL_ID, updatedBlog.getId())
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(om.writeValueAsBytes(updatedBlog))
            .exchange()
            .expectStatus()
            .isOk();

        // Validate the Blog in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedBlogToMatchAllProperties(updatedBlog);
    }

    @Test
    void putNonExistingBlog() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        blog.setId(UUID.randomUUID().toString());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        webTestClient
            .put()
            .uri(ENTITY_API_URL_ID, blog.getId())
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(om.writeValueAsBytes(blog))
            .exchange()
            .expectStatus()
            .isBadRequest();

        // Validate the Blog in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    void putWithIdMismatchBlog() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        blog.setId(UUID.randomUUID().toString());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        webTestClient
            .put()
            .uri(ENTITY_API_URL_ID, UUID.randomUUID().toString())
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(om.writeValueAsBytes(blog))
            .exchange()
            .expectStatus()
            .isBadRequest();

        // Validate the Blog in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    void putWithMissingIdPathParamBlog() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        blog.setId(UUID.randomUUID().toString());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        webTestClient
            .put()
            .uri(ENTITY_API_URL)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(om.writeValueAsBytes(blog))
            .exchange()
            .expectStatus()
            .isEqualTo(405);

        // Validate the Blog in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    void partialUpdateBlogWithPatch() throws Exception {
        // Initialize the database
        insertedBlog = blogRepository.save(blog).block();

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the blog using partial update
        Blog partialUpdatedBlog = new Blog();
        partialUpdatedBlog.setId(blog.getId());

        webTestClient
            .patch()
            .uri(ENTITY_API_URL_ID, partialUpdatedBlog.getId())
            .contentType(MediaType.valueOf("application/merge-patch+json"))
            .bodyValue(om.writeValueAsBytes(partialUpdatedBlog))
            .exchange()
            .expectStatus()
            .isOk();

        // Validate the Blog in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertBlogUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedBlog, blog), getPersistedBlog(blog));
    }

    @Test
    void fullUpdateBlogWithPatch() throws Exception {
        // Initialize the database
        insertedBlog = blogRepository.save(blog).block();

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the blog using partial update
        Blog partialUpdatedBlog = new Blog();
        partialUpdatedBlog.setId(blog.getId());

        partialUpdatedBlog.name(UPDATED_NAME).handle(UPDATED_HANDLE);

        webTestClient
            .patch()
            .uri(ENTITY_API_URL_ID, partialUpdatedBlog.getId())
            .contentType(MediaType.valueOf("application/merge-patch+json"))
            .bodyValue(om.writeValueAsBytes(partialUpdatedBlog))
            .exchange()
            .expectStatus()
            .isOk();

        // Validate the Blog in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertBlogUpdatableFieldsEquals(partialUpdatedBlog, getPersistedBlog(partialUpdatedBlog));
    }

    @Test
    void patchNonExistingBlog() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        blog.setId(UUID.randomUUID().toString());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        webTestClient
            .patch()
            .uri(ENTITY_API_URL_ID, blog.getId())
            .contentType(MediaType.valueOf("application/merge-patch+json"))
            .bodyValue(om.writeValueAsBytes(blog))
            .exchange()
            .expectStatus()
            .isBadRequest();

        // Validate the Blog in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    void patchWithIdMismatchBlog() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        blog.setId(UUID.randomUUID().toString());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        webTestClient
            .patch()
            .uri(ENTITY_API_URL_ID, UUID.randomUUID().toString())
            .contentType(MediaType.valueOf("application/merge-patch+json"))
            .bodyValue(om.writeValueAsBytes(blog))
            .exchange()
            .expectStatus()
            .isBadRequest();

        // Validate the Blog in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    void patchWithMissingIdPathParamBlog() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        blog.setId(UUID.randomUUID().toString());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        webTestClient
            .patch()
            .uri(ENTITY_API_URL)
            .contentType(MediaType.valueOf("application/merge-patch+json"))
            .bodyValue(om.writeValueAsBytes(blog))
            .exchange()
            .expectStatus()
            .isEqualTo(405);

        // Validate the Blog in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    void deleteBlog() {
        // Initialize the database
        insertedBlog = blogRepository.save(blog).block();

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the blog
        webTestClient
            .delete()
            .uri(ENTITY_API_URL_ID, blog.getId())
            .accept(MediaType.APPLICATION_JSON)
            .exchange()
            .expectStatus()
            .isNoContent();

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return blogRepository.count().block();
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

    protected Blog getPersistedBlog(Blog blog) {
        return blogRepository.findById(blog.getId()).block();
    }

    protected void assertPersistedBlogToMatchAllProperties(Blog expectedBlog) {
        assertBlogAllPropertiesEquals(expectedBlog, getPersistedBlog(expectedBlog));
    }

    protected void assertPersistedBlogToMatchUpdatableProperties(Blog expectedBlog) {
        assertBlogAllUpdatablePropertiesEquals(expectedBlog, getPersistedBlog(expectedBlog));
    }
}
