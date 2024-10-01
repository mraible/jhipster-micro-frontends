package org.jhipster.blog;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.jhipster.blog.config.AsyncSyncConfiguration;
import org.jhipster.blog.config.EmbeddedNeo4j;
import org.jhipster.blog.config.JacksonConfiguration;
import org.jhipster.blog.config.TestSecurityConfiguration;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Base composite annotation for integration tests.
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@SpringBootTest(classes = { BlogApp.class, JacksonConfiguration.class, AsyncSyncConfiguration.class, TestSecurityConfiguration.class })
@EmbeddedNeo4j
public @interface IntegrationTest {
}
