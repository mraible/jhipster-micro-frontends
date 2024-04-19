package org.jhipster.blog.repository;

import org.jhipster.blog.domain.Blog;
import org.springframework.data.neo4j.repository.ReactiveNeo4jRepository;
import org.springframework.stereotype.Repository;

/**
 * Spring Data Neo4j reactive repository for the Blog entity.
 */
@Repository
public interface BlogRepository extends ReactiveNeo4jRepository<Blog, String> {}
