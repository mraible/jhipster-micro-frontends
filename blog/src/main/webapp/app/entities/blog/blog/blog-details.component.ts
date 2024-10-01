import { type Ref, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import BlogService from './blog.service';
import { type IBlog } from '@/shared/model/blog/blog.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'BlogDetails',
  setup() {
    const blogService = inject('blogService', () => new BlogService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);
    const blog: Ref<IBlog> = ref({});

    const retrieveBlog = async blogId => {
      try {
        const res = await blogService().find(blogId);
        blog.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.blogId) {
      retrieveBlog(route.params.blogId);
    }

    return {
      alertService,
      blog,

      previousState,
      t$: useI18n().t,
    };
  },
});
