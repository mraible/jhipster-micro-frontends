package org.jhipster.blog.config.neo4j;

import ac.simons.neo4j.migrations.core.JavaBasedMigration;
import ac.simons.neo4j.migrations.core.MigrationContext;
import ac.simons.neo4j.migrations.core.MigrationsException;
import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.neo4j.driver.Session;
import org.neo4j.driver.Values;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.core.io.support.ResourcePatternResolver;

/**
 * Initial database setup for Neo4j.
 */
final class Neo4jMigrations {

    /**
     * Load users including authorities from JSON files.
     */
    static class V0001__CreateUsers implements JavaBasedMigration {

        @Override
        public void apply(MigrationContext context) {
            ObjectMapper om = new ObjectMapper();
            ResourcePatternResolver resourcePatternResolver = new PathMatchingResourcePatternResolver();
            Resource[] resources;
            try {
                resources = resourcePatternResolver.getResources("classpath:config/neo4j/migrations/user__*.json");
            } catch (IOException e) {
                throw new MigrationsException("Could not load user definition resources.", e);
            }

            JavaType type = om.getTypeFactory().constructMapType(Map.class, String.class, Object.class);

            String userLabel = "jhi_user";
            String authorityLabel = "jhi_authority";

            String query = String.format(
                "CREATE (u:%s) SET u = $user WITH u " +
                "UNWIND $authorities AS authority " +
                "MERGE (a:%s {name: authority}) " +
                "CREATE (u) - [:HAS_AUTHORITY] -> (a) ",
                userLabel,
                authorityLabel
            );

            try (Session session = context.getSession()) {
                for (Resource resource : resources) {
                    try {
                        Map<String, Object> user = om.readValue(resource.getInputStream(), type);
                        user.put("user_id", UUID.randomUUID().toString());
                        @SuppressWarnings("unchecked")
                        List<String> authorities = (List<String>) user.remove("authorities");
                        user.remove("_class");

                        session.executeWrite(t -> t.run(query, Values.parameters("user", user, "authorities", authorities)).consume());
                    } catch (IOException e) {
                        throw new MigrationsException("Could not load resource " + resource.getDescription() + ".", e);
                    }
                }
            }
        }
    }

    private Neo4jMigrations() {}
}
