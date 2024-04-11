package org.jhipster.blog.config;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.boot.test.util.TestPropertyValues;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.annotation.AnnotatedElementUtils;
import org.springframework.test.context.ContextConfigurationAttributes;
import org.springframework.test.context.ContextCustomizer;
import org.springframework.test.context.ContextCustomizerFactory;
import org.springframework.test.context.MergedContextConfiguration;

public class Neo4jTestContainersSpringContextCustomizerFactory implements ContextCustomizerFactory {

    private Logger log = LoggerFactory.getLogger(Neo4jTestContainersSpringContextCustomizerFactory.class);

    private static Neo4jTestContainer neo4jBean;

    @Override
    public ContextCustomizer createContextCustomizer(Class<?> testClass, List<ContextConfigurationAttributes> configAttributes) {
        return new ContextCustomizer() {
            @Override
            public void customizeContext(ConfigurableApplicationContext context, MergedContextConfiguration mergedConfig) {
                ConfigurableListableBeanFactory beanFactory = context.getBeanFactory();
                TestPropertyValues testValues = TestPropertyValues.empty();
                EmbeddedNeo4j neo4jAnnotation = AnnotatedElementUtils.findMergedAnnotation(testClass, EmbeddedNeo4j.class);
                if (null != neo4jAnnotation) {
                    log.debug("detected the EmbeddedNeo4j annotation on class {}", testClass.getName());
                    log.info("Warming up the neo4j database");
                    if (null == neo4jBean) {
                        neo4jBean = beanFactory.createBean(Neo4jTestContainer.class);
                        beanFactory.registerSingleton(Neo4jTestContainer.class.getName(), neo4jBean);
                    }

                    String boltUrl = neo4jBean.getNeo4jContainer().getBoltUrl();
                    testValues = testValues.and("spring.neo4j.uri=" + boltUrl);
                }
                testValues.applyTo(context);
            }

            @Override
            public int hashCode() {
                return Neo4jTestContainer.class.getName().hashCode();
            }

            @Override
            public boolean equals(Object obj) {
                return this.hashCode() == obj.hashCode();
            }
        };
    }
}
