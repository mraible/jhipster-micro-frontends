/* tslint:disable max-line-length */
import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import BlogDetails from './blog-details.vue';
import BlogService from './blog.service';
import AlertService from '@/shared/alert/alert.service';

type BlogDetailsComponentType = InstanceType<typeof BlogDetails>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const blogSample = { id: 'ABC' };

describe('Component Tests', () => {
  let alertService: AlertService;

  afterEach(() => {
    vitest.resetAllMocks();
  });

  describe('Blog Management Detail Component', () => {
    let blogServiceStub: SinonStubbedInstance<BlogService>;
    let mountOptions: MountingOptions<BlogDetailsComponentType>['global'];

    beforeEach(() => {
      route = {};
      blogServiceStub = sinon.createStubInstance<BlogService>(BlogService);

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
          blogService: () => blogServiceStub,
        },
      };
    });

    describe('Navigate to details', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        blogServiceStub.find.resolves(blogSample);
        route = {
          params: {
            blogId: '' + 'ABC',
          },
        };
        const wrapper = shallowMount(BlogDetails, { global: mountOptions });
        const comp = wrapper.vm;
        // WHEN
        await comp.$nextTick();

        // THEN
        expect(comp.blog).toMatchObject(blogSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        blogServiceStub.find.resolves(blogSample);
        const wrapper = shallowMount(BlogDetails, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
