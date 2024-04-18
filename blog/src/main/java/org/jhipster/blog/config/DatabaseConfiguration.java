package org.jhipster.blog.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.neo4j.repository.config.EnableNeo4jRepositories;

@Configuration
@EnableNeo4jRepositories("org.jhipster.blog.repository")
public class DatabaseConfiguration {}
