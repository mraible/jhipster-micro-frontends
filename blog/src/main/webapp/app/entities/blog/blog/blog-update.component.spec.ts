/* tslint:disable max-line-length */
import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import BlogUpdate from './blog-update.vue';
import BlogService from './blog.service';
import AlertService from '@/shared/alert/alert.service';

import UserService from '@/entities/user/user.service';

type BlogUpdateComponentType = InstanceType<typeof BlogUpdate>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const blogSample = { id: 'ABC' };

describe('Component Tests', () => {
  let mountOptions: MountingOptions<BlogUpdateComponentType>['global'];
  let alertService: AlertService;

  describe('Blog Management Update Component', () => {
    let comp: BlogUpdateComponentType;
    let blogServiceStub: SinonStubbedInstance<BlogService>;

    beforeEach(() => {
      route = {};
      blogServiceStub = sinon.createStubInstance<BlogService>(BlogService);
      blogServiceStub.retrieve.onFirstCall().resolves(Promise.resolve([]));

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
          blogService: () => blogServiceStub,

          userService: () =>
            sinon.createStubInstance<UserService>(UserService, {
              retrieve: sinon.stub().resolves({}),
            } as any),
        },
      };
    });

    afterEach(() => {
      vitest.resetAllMocks();
    });

    describe('save', () => {
      it('Should call update service on save for existing entity', async () => {
        // GIVEN
        const wrapper = shallowMount(BlogUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.blog = blogSample;
        blogServiceStub.update.resolves(blogSample);

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(blogServiceStub.update.calledWith(blogSample)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });

      it('Should call create service on save for new entity', async () => {
        // GIVEN
        const entity = {};
        blogServiceStub.create.resolves(entity);
        const wrapper = shallowMount(BlogUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.blog = entity;

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(blogServiceStub.create.calledWith(entity)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });
    });

    describe('Before route enter', () => {
      it('Should retrieve data', async () => {
        // GIVEN
        blogServiceStub.find.resolves(blogSample);
        blogServiceStub.retrieve.resolves([blogSample]);

        // WHEN
        route = {
          params: {
            blogId: `${blogSample.id}`,
          },
        };
        const wrapper = shallowMount(BlogUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(comp.blog).toMatchObject(blogSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        blogServiceStub.find.resolves(blogSample);
        const wrapper = shallowMount(BlogUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
