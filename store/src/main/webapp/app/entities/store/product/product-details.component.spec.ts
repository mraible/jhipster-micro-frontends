/* tslint:disable max-line-length */
import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import ProductDetails from './product-details.vue';
import ProductService from './product.service';
import AlertService from '@/shared/alert/alert.service';

type ProductDetailsComponentType = InstanceType<typeof ProductDetails>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const productSample = { id: 'ABC' };

describe('Component Tests', () => {
  let alertService: AlertService;

  afterEach(() => {
    vitest.resetAllMocks();
  });

  describe('Product Management Detail Component', () => {
    let productServiceStub: SinonStubbedInstance<ProductService>;
    let mountOptions: MountingOptions<ProductDetailsComponentType>['global'];

    beforeEach(() => {
      route = {};
      productServiceStub = sinon.createStubInstance<ProductService>(ProductService);

      alertService = new AlertService({
        i18n: { t: vitest.fn() } as any,
        bvToast: {
          toast: vitest.fn(),
        } as any,
      });

      mountOptions = {
        stubs: {
          'font-awesome-icon': true,
          'router-link': true,
        },
        provide: {
          alertService,
          productService: () => productServiceStub,
        },
      };
    });

    describe('Navigate to details', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        productServiceStub.find.resolves(productSample);
        route = {
          params: {
            productId: '' + 'ABC',
          },
        };
        const wrapper = shallowMount(ProductDetails, { global: mountOptions });
        const comp = wrapper.vm;
        // WHEN
        await comp.$nextTick();

        // THEN
        expect(comp.product).toMatchObject(productSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        productServiceStub.find.resolves(productSample);
        const wrapper = shallowMount(ProductDetails, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
