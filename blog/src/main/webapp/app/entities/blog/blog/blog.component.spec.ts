/* tslint:disable max-line-length */
import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';

import Blog from './blog.vue';
import BlogService from './blog.service';
import AlertService from '@/shared/alert/alert.service';

type BlogComponentType = InstanceType<typeof Blog>;

const bModalStub = {
  render: () => {},
  methods: {
    hide: () => {},
    show: () => {},
  },
};

describe('Component Tests', () => {
  let alertService: AlertService;

  describe('Blog Management Component', () => {
    let blogServiceStub: SinonStubbedInstance<BlogService>;
    let mountOptions: MountingOptions<BlogComponentType>['global'];

    beforeEach(() => {
      blogServiceStub = sinon.createStubInstance<BlogService>(BlogService);
      blogServiceStub.retrieve.resolves({ headers: {} });

      alertService = new AlertService({
        i18n: { t: vitest.fn() } as any,
        bvToast: {
          toast: vitest.fn(),
        } as any,
      });

      mountOptions = {
        stubs: {
          bModal: bModalStub as any,
          'font-awesome-icon': true,
          'b-badge': true,
          'b-button': true,
          'router-link': true,
        },
        directives: {
          'b-modal': {},
        },
        provide: {
          alertService,
          blogService: () => blogServiceStub,
        },
      };
    });

    describe('Mount', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        blogServiceStub.retrieve.resolves({ headers: {}, data: [{ id: 'ABC' }] });

        // WHEN
        const wrapper = shallowMount(Blog, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(blogServiceStub.retrieve.calledOnce).toBeTruthy();
        expect(comp.blogs[0]).toEqual(expect.objectContaining({ id: 'ABC' }));
      });
    });
    describe('Handles', () => {
      let comp: BlogComponentType;

      beforeEach(async () => {
        const wrapper = shallowMount(Blog, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();
        blogServiceStub.retrieve.reset();
        blogServiceStub.retrieve.resolves({ headers: {}, data: [] });
      });

      it('Should call delete service on confirmDelete', async () => {
        // GIVEN
        blogServiceStub.delete.resolves({});

        // WHEN
        comp.prepareRemove({ id: 'ABC' });

        comp.removeBlog();
        await comp.$nextTick(); // clear components

        // THEN
        expect(blogServiceStub.delete.called).toBeTruthy();

        // THEN
        await comp.$nextTick(); // handle component clear watch
        expect(blogServiceStub.retrieve.callCount).toEqual(1);
      });
    });
  });
});
