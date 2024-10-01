package org.jhipster.blog.web.rest;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import org.jhipster.blog.domain.Blog;
import org.jhipster.blog.repository.BlogRepository;
import org.jhipster.blog.repository.UserRepository;
import org.jhipster.blog.web.rest.errors.BadRequestAlertException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.reactive.ResponseUtil;

/**
 * REST controller for managing {@link org.jhipster.blog.domain.Blog}.
 */
@RestController
@RequestMapping("/api/blogs")
public class BlogResource {

    private static final Logger LOG = LoggerFactory.getLogger(BlogResource.class);

    private static final String ENTITY_NAME = "blogBlog";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final BlogRepository blogRepository;

    private final UserRepository userRepository;

    public BlogResource(BlogRepository blogRepository, UserRepository userRepository) {
        this.blogRepository = blogRepository;
        this.userRepository = userRepository;
    }

    /**
     * {@code POST  /blogs} : Create a new blog.
     *
     * @param blog the blog to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new blog, or with status {@code 400 (Bad Request)} if the blog has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public Mono<ResponseEntity<Blog>> createBlog(@Valid @RequestBody Blog blog) throws URISyntaxException {
        LOG.debug("REST request to save Blog : {}", blog);
        if (blog.getId() != null) {
            throw new BadRequestAlertException("A new blog cannot already have an ID", ENTITY_NAME, "idexists");
        }

        if (blog.getUser() != null) {
            // Save user in case it's new and only exists in gateway
            userRepository.save(blog.getUser());
        }

        return blogRepository
            .save(blog)
            .map(result -> {
                try {
                    return ResponseEntity.created(new URI("/api/blogs/" + result.getId()))
                        .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId()))
                        .body(result);
                } catch (URISyntaxException e) {
                    throw new RuntimeException(e);
                }
            });
    }

    /**
     * {@code PUT  /blogs/:id} : Updates an existing blog.
     *
     * @param id the id of the blog to save.
     * @param blog the blog to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated blog,
     * or with status {@code 400 (Bad Request)} if the blog is not valid,
     * or with status {@code 500 (Internal Server Error)} if the blog couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public Mono<ResponseEntity<Blog>> updateBlog(
        @PathVariable(value = "id", required = false) final String id,
        @Valid @RequestBody Blog blog
    ) throws URISyntaxException {
        LOG.debug("REST request to update Blog : {}, {}", id, blog);
        if (blog.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, blog.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        return blogRepository
            .existsById(id)
            .flatMap(exists -> {
                if (!exists) {
                    return Mono.error(new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound"));
                }

                if (blog.getUser() != null) {
                    // Save user in case it's new and only exists in gateway
                    userRepository.save(blog.getUser());
                }

                return blogRepository
                    .save(blog)
                    .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND)))
                    .map(result ->
                        ResponseEntity.ok()
                            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, result.getId()))
                            .body(result)
                    );
            });
    }

    /**
     * {@code PATCH  /blogs/:id} : Partial updates given fields of an existing blog, field will ignore if it is null
     *
     * @param id the id of the blog to save.
     * @param blog the blog to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated blog,
     * or with status {@code 400 (Bad Request)} if the blog is not valid,
     * or with status {@code 404 (Not Found)} if the blog is not found,
     * or with status {@code 500 (Internal Server Error)} if the blog couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public Mono<ResponseEntity<Blog>> partialUpdateBlog(
        @PathVariable(value = "id", required = false) final String id,
        @NotNull @RequestBody Blog blog
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update Blog partially : {}, {}", id, blog);
        if (blog.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, blog.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        return blogRepository
            .existsById(id)
            .flatMap(exists -> {
                if (!exists) {
                    return Mono.error(new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound"));
                }

                if (blog.getUser() != null) {
                    // Save user in case it's new and only exists in gateway
                    userRepository.save(blog.getUser());
                }

                Mono<Blog> result = blogRepository
                    .findById(blog.getId())
                    .map(existingBlog -> {
                        if (blog.getName() != null) {
                            existingBlog.setName(blog.getName());
                        }
                        if (blog.getHandle() != null) {
                            existingBlog.setHandle(blog.getHandle());
                        }

                        return existingBlog;
                    })
                    .flatMap(blogRepository::save);

                return result
                    .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND)))
                    .map(res ->
                        ResponseEntity.ok()
                            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, res.getId()))
                            .body(res)
                    );
            });
    }

    /**
     * {@code GET  /blogs} : get all the blogs.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of blogs in body.
     */
    @GetMapping(value = "", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<List<Blog>> getAllBlogs() {
        LOG.debug("REST request to get all Blogs");
        return blogRepository.findAll().collectList();
    }

    /**
     * {@code GET  /blogs} : get all the blogs as a stream.
     * @return the {@link Flux} of blogs.
     */
    @GetMapping(value = "", produces = MediaType.APPLICATION_NDJSON_VALUE)
    public Flux<Blog> getAllBlogsAsStream() {
        LOG.debug("REST request to get all Blogs as a stream");
        return blogRepository.findAll();
    }

    /**
     * {@code GET  /blogs/:id} : get the "id" blog.
     *
     * @param id the id of the blog to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the blog, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public Mono<ResponseEntity<Blog>> getBlog(@PathVariable("id") String id) {
        LOG.debug("REST request to get Blog : {}", id);
        Mono<Blog> blog = blogRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(blog);
    }

    /**
     * {@code DELETE  /blogs/:id} : delete the "id" blog.
     *
     * @param id the id of the blog to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<Void>> deleteBlog(@PathVariable("id") String id) {
        LOG.debug("REST request to delete Blog : {}", id);
        return blogRepository
            .deleteById(id)
            .then(
                Mono.just(
                    ResponseEntity.noContent().headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id)).build()
                )
            );
    }
}
