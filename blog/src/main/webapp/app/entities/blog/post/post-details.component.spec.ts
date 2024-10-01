/* tslint:disable max-line-length */
import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import PostDetails from './post-details.vue';
import PostService from './post.service';
import AlertService from '@/shared/alert/alert.service';

type PostDetailsComponentType = InstanceType<typeof PostDetails>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const postSample = { id: 'ABC' };

describe('Component Tests', () => {
  let alertService: AlertService;

  afterEach(() => {
    vitest.resetAllMocks();
  });

  describe('Post Management Detail Component', () => {
    let postServiceStub: SinonStubbedInstance<PostService>;
    let mountOptions: MountingOptions<PostDetailsComponentType>['global'];

    beforeEach(() => {
      route = {};
      postServiceStub = sinon.createStubInstance<PostService>(PostService);

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
          postService: () => postServiceStub,
        },
      };
    });

    describe('Navigate to details', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        postServiceStub.find.resolves(postSample);
        route = {
          params: {
            postId: '' + 'ABC',
          },
        };
        const wrapper = shallowMount(PostDetails, { global: mountOptions });
        const comp = wrapper.vm;
        // WHEN
        await comp.$nextTick();

        // THEN
        expect(comp.post).toMatchObject(postSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        postServiceStub.find.resolves(postSample);
        const wrapper = shallowMount(PostDetails, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
