package org.jhipster.blog.repository;

import org.jhipster.blog.domain.Authority;
import org.springframework.data.neo4j.repository.ReactiveNeo4jRepository;
import org.springframework.stereotype.Repository;

/**
 * Spring Data Neo4j reactive repository for the Authority entity.
 */
@Repository
public interface AuthorityRepository extends ReactiveNeo4jRepository<Authority, String> {}
