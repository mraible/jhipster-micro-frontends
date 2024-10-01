package org.jhipster.blog.repository;

import org.jhipster.blog.domain.Blog;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.stereotype.Repository;

/**
 * Spring Data Neo4j repository for the Blog entity.
 */
@Repository
public interface BlogRepository extends Neo4jRepository<Blog, String> {}
