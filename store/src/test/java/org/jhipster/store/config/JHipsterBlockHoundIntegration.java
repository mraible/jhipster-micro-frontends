package org.jhipster.store.config;

import reactor.blockhound.BlockHound;
import reactor.blockhound.integration.BlockHoundIntegration;

public class JHipsterBlockHoundIntegration implements BlockHoundIntegration {

    @Override
    public void applyTo(BlockHound.Builder builder) {
        builder.allowBlockingCallsInside("org.springframework.validation.beanvalidation.SpringValidatorAdapter", "validate");
        builder.allowBlockingCallsInside("org.jhipster.store.service.MailService", "sendEmailFromTemplate");
        builder.allowBlockingCallsInside("org.jhipster.store.security.DomainUserDetailsService", "createSpringSecurityUser");
        builder.allowBlockingCallsInside("org.springframework.web.reactive.result.method.InvocableHandlerMethod", "invoke");
        builder.allowBlockingCallsInside("org.springdoc.core.service.OpenAPIService", "build");
        builder.allowBlockingCallsInside("org.springdoc.core.service.AbstractRequestService", "build");
        builder.allowBlockingCallsInside("com.mongodb.internal.Locks", "checkedWithLock");
        // jhipster-needle-blockhound-integration - JHipster will add additional gradle plugins here
    }
}
