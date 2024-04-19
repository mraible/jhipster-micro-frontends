package org.jhipster.blog.repository;

import org.jhipster.blog.domain.User;
import org.springframework.data.domain.*;
import org.springframework.data.neo4j.repository.ReactiveNeo4jRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Spring Data Neo4j reactive repository for the {@link User} entity.
 */
@Repository
public interface UserRepository extends ReactiveNeo4jRepository<User, String> {
    Mono<User> findOneByLogin(String login);

    Flux<User> findAll();

    Flux<User> findAllByIdNotNull(Pageable pageable);

    Flux<User> findAllByIdNotNullAndActivatedIsTrue(Pageable pageable);

    Mono<Long> count();
}
