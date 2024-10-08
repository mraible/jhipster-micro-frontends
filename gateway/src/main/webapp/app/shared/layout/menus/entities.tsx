import React, { Suspense } from 'react';
import { translate } from 'react-jhipster';
import { importRemote } from '@module-federation/utilities';
import { NavDropdown } from './menu-components';

const EntitiesMenuItems = React.lazy(() => import('app/entities/menu').catch(() => import('app/shared/error/error-loading')));

const BlogEntitiesMenuItems = React.lazy(async () =>
  importRemote<any>({
    url: `./services/blog`,
    scope: 'blog',
    module: './entities-menu',
  }).catch(() => import('app/shared/error/error-loading')),
);

const StoreEntitiesMenuItems = React.lazy(async () =>
  importRemote<any>({
    url: `./services/store`,
    scope: 'store',
    module: './entities-menu',
  }).catch(() => import('app/shared/error/error-loading')),
);

export const EntitiesMenu = () => (
  <NavDropdown
    icon="th-list"
    name={translate('global.menu.entities.main')}
    id="entity-menu"
    data-cy="entity"
    style={{ maxHeight: '80vh', overflow: 'auto' }}
  >
    <Suspense fallback={<div>loading...</div>}>
      <EntitiesMenuItems />
    </Suspense>
    <Suspense fallback={<div>loading...</div>}>
      <BlogEntitiesMenuItems />
    </Suspense>
    <Suspense fallback={<div>loading...</div>}>
      <StoreEntitiesMenuItems />
    </Suspense>
  </NavDropdown>
);
