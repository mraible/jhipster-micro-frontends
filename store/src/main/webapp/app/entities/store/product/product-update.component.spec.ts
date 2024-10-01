/* tslint:disable max-line-length */
import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import ProductUpdate from './product-update.vue';
import ProductService from './product.service';
import AlertService from '@/shared/alert/alert.service';

type ProductUpdateComponentType = InstanceType<typeof ProductUpdate>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const productSample = { id: 'ABC' };

describe('Component Tests', () => {
  let mountOptions: MountingOptions<ProductUpdateComponentType>['global'];
  let alertService: AlertService;

  describe('Product Management Update Component', () => {
    let comp: ProductUpdateComponentType;
    let productServiceStub: SinonStubbedInstance<ProductService>;

    beforeEach(() => {
      route = {};
      productServiceStub = sinon.createStubInstance<ProductService>(ProductService);
      productServiceStub.retrieve.onFirstCall().resolves(Promise.resolve([]));

      alertService = new AlertService({
        i18n: { t: vitest.fn() } as any,
        bvToast: {
          toast: vitest.fn(),
        } as any,
      });

      mountOptions = {
        stubs: {
          'font-awesome-icon': true,
          'b-input-group': true,
          'b-input-group-prepend': true,
          'b-form-datepicker': true,
          'b-form-input': true,
        },
        provide: {
          alertService,
          productService: () => productServiceStub,
        },
      };
    });

    afterEach(() => {
      vitest.resetAllMocks();
    });

    describe('save', () => {
      it('Should call update service on save for existing entity', async () => {
        // GIVEN
        const wrapper = shallowMount(ProductUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.product = productSample;
        productServiceStub.update.resolves(productSample);

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(productServiceStub.update.calledWith(productSample)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });

      it('Should call create service on save for new entity', async () => {
        // GIVEN
        const entity = {};
        productServiceStub.create.resolves(entity);
        const wrapper = shallowMount(ProductUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.product = entity;

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(productServiceStub.create.calledWith(entity)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });
    });

    describe('Before route enter', () => {
      it('Should retrieve data', async () => {
        // GIVEN
        productServiceStub.find.resolves(productSample);
        productServiceStub.retrieve.resolves([productSample]);

        // WHEN
        route = {
          params: {
            productId: `${productSample.id}`,
          },
        };
        const wrapper = shallowMount(ProductUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(comp.product).toMatchObject(productSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        productServiceStub.find.resolves(productSample);
        const wrapper = shallowMount(ProductUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
