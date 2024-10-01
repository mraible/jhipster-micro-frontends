/* tslint:disable max-line-length */
import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import dayjs from 'dayjs';
import PostUpdate from './post-update.vue';
import PostService from './post.service';
import { DATE_TIME_LONG_FORMAT } from '@/shared/composables/date-format';
import AlertService from '@/shared/alert/alert.service';

import BlogService from '@/entities/blog/blog/blog.service';
import TagService from '@/entities/blog/tag/tag.service';

type PostUpdateComponentType = InstanceType<typeof PostUpdate>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const postSample = { id: 'ABC' };

describe('Component Tests', () => {
  let mountOptions: MountingOptions<PostUpdateComponentType>['global'];
  let alertService: AlertService;

  describe('Post Management Update Component', () => {
    let comp: PostUpdateComponentType;
    let postServiceStub: SinonStubbedInstance<PostService>;

    beforeEach(() => {
      route = {};
      postServiceStub = sinon.createStubInstance<PostService>(PostService);
      postServiceStub.retrieve.onFirstCall().resolves(Promise.resolve([]));

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
          postService: () => postServiceStub,
          blogService: () =>
            sinon.createStubInstance<BlogService>(BlogService, {
              retrieve: sinon.stub().resolves({}),
            } as any),
          tagService: () =>
            sinon.createStubInstance<TagService>(TagService, {
              retrieve: sinon.stub().resolves({}),
            } as any),
        },
      };
    });

    afterEach(() => {
      vitest.resetAllMocks();
    });

    describe('load', () => {
      beforeEach(() => {
        const wrapper = shallowMount(PostUpdate, { global: mountOptions });
        comp = wrapper.vm;
      });
      it('Should convert date from string', () => {
        // GIVEN
        const date = new Date('2019-10-15T11:42:02Z');

        // WHEN
        const convertedDate = comp.convertDateTimeFromServer(date);

        // THEN
        expect(convertedDate).toEqual(dayjs(date).format(DATE_TIME_LONG_FORMAT));
      });

      it('Should not convert date if date is not present', () => {
        expect(comp.convertDateTimeFromServer(null)).toBeNull();
      });
    });

    describe('save', () => {
      it('Should call update service on save for existing entity', async () => {
        // GIVEN
        const wrapper = shallowMount(PostUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.post = postSample;
        postServiceStub.update.resolves(postSample);

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(postServiceStub.update.calledWith(postSample)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });

      it('Should call create service on save for new entity', async () => {
        // GIVEN
        const entity = {};
        postServiceStub.create.resolves(entity);
        const wrapper = shallowMount(PostUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.post = entity;

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(postServiceStub.create.calledWith(entity)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });
    });

    describe('Before route enter', () => {
      it('Should retrieve data', async () => {
        // GIVEN
        postServiceStub.find.resolves(postSample);
        postServiceStub.retrieve.resolves([postSample]);

        // WHEN
        route = {
          params: {
            postId: `${postSample.id}`,
          },
        };
        const wrapper = shallowMount(PostUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(comp.post).toMatchObject(postSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        postServiceStub.find.resolves(postSample);
        const wrapper = shallowMount(PostUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
