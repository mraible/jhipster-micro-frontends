import { type Ref, computed, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';

import PostService from './post.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { useDateFormat, useValidation } from '@/shared/composables';
import { useAlertService } from '@/shared/alert/alert.service';

import BlogService from '@/entities/blog/blog/blog.service';
import { type IBlog } from '@/shared/model/blog/blog.model';
import TagService from '@/entities/blog/tag/tag.service';
import { type ITag } from '@/shared/model/blog/tag.model';
import { type IPost, Post } from '@/shared/model/blog/post.model';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'PostUpdate',
  setup() {
    const postService = inject('postService', () => new PostService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const post: Ref<IPost> = ref(new Post());

    const blogService = inject('blogService', () => new BlogService());

    const blogs: Ref<IBlog[]> = ref([]);

    const tagService = inject('tagService', () => new TagService());

    const tags: Ref<ITag[]> = ref([]);
    const isSaving = ref(false);
    const currentLanguage = inject('currentLanguage', () => computed(() => navigator.language ?? 'en'), true);

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);

    const retrievePost = async postId => {
      try {
        const res = await postService().find(postId);
        res.date = new Date(res.date);
        post.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.postId) {
      retrievePost(route.params.postId);
    }

    const initRelationships = () => {
      blogService()
        .retrieve()
        .then(res => {
          blogs.value = res.data;
        });
      tagService()
        .retrieve()
        .then(res => {
          tags.value = res.data;
        });
    };

    initRelationships();

    const dataUtils = useDataUtils();

    const { t: t$ } = useI18n();
    const validations = useValidation();
    const validationRules = {
      title: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
      content: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
      date: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
      blog: {},
      tags: {},
    };
    const v$ = useVuelidate(validationRules, post as any);
    v$.value.$validate();

    return {
      postService,
      alertService,
      post,
      previousState,
      isSaving,
      currentLanguage,
      blogs,
      tags,
      ...dataUtils,
      v$,
      ...useDateFormat({ entityRef: post }),
      t$,
    };
  },
  created(): void {
    this.post.tags = [];
  },
  methods: {
    save(): void {
      this.isSaving = true;
      if (this.post.id) {
        this.postService()
          .update(this.post)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showInfo(this.t$('blogApp.blogPost.updated', { param: param.id }));
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      } else {
        this.postService()
          .create(this.post)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showSuccess(this.t$('blogApp.blogPost.created', { param: param.id }).toString());
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      }
    },

    getSelected(selectedVals, option, pkField = 'id'): any {
      if (selectedVals) {
        return selectedVals.find(value => option[pkField] === value[pkField]) ?? option;
      }
      return option;
    },
  },
});
