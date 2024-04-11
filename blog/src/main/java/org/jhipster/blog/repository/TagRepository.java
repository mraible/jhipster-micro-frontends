package org.jhipster.blog.repository;

import org.jhipster.blog.domain.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.data.neo4j.repository.ReactiveNeo4jRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

/**
 * Spring Data Neo4j reactive repository for the Tag entity.
 */
@Repository
public interface TagRepository extends ReactiveNeo4jRepository<Tag, String> {
    Flux<Tag> findAllBy(Pageable pageable);
}
