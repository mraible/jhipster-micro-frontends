import { defineComponent, provide } from 'vue';

import ProductService from './store/product/product.service';
// jhipster-needle-add-entity-service-to-entities-component-import - JHipster will import entities services here

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'Entities',
  setup() {
    provide('productService', () => new ProductService());
    // jhipster-needle-add-entity-service-to-entities-component - JHipster will import entities services here
  },
});
