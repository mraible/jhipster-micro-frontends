/* tslint:disable max-line-length */
import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import TagUpdate from './tag-update.vue';
import TagService from './tag.service';
import AlertService from '@/shared/alert/alert.service';

import PostService from '@/entities/blog/post/post.service';

type TagUpdateComponentType = InstanceType<typeof TagUpdate>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const tagSample = { id: 'ABC' };

describe('Component Tests', () => {
  let mountOptions: MountingOptions<TagUpdateComponentType>['global'];
  let alertService: AlertService;

  describe('Tag Management Update Component', () => {
    let comp: TagUpdateComponentType;
    let tagServiceStub: SinonStubbedInstance<TagService>;

    beforeEach(() => {
      route = {};
      tagServiceStub = sinon.createStubInstance<TagService>(TagService);
      tagServiceStub.retrieve.onFirstCall().resolves(Promise.resolve([]));

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
          tagService: () => tagServiceStub,
          postService: () =>
            sinon.createStubInstance<PostService>(PostService, {
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
        const wrapper = shallowMount(TagUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.tag = tagSample;
        tagServiceStub.update.resolves(tagSample);

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(tagServiceStub.update.calledWith(tagSample)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });

      it('Should call create service on save for new entity', async () => {
        // GIVEN
        const entity = {};
        tagServiceStub.create.resolves(entity);
        const wrapper = shallowMount(TagUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.tag = entity;

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(tagServiceStub.create.calledWith(entity)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });
    });

    describe('Before route enter', () => {
      it('Should retrieve data', async () => {
        // GIVEN
        tagServiceStub.find.resolves(tagSample);
        tagServiceStub.retrieve.resolves([tagSample]);

        // WHEN
        route = {
          params: {
            tagId: `${tagSample.id}`,
          },
        };
        const wrapper = shallowMount(TagUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(comp.tag).toMatchObject(tagSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        tagServiceStub.find.resolves(tagSample);
        const wrapper = shallowMount(TagUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
