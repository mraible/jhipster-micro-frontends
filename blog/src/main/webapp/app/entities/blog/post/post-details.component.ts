import { type Ref, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import PostService from './post.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { useDateFormat } from '@/shared/composables';
import { type IPost } from '@/shared/model/blog/post.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'PostDetails',
  setup() {
    const dateFormat = useDateFormat();
    const postService = inject('postService', () => new PostService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const dataUtils = useDataUtils();

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);
    const post: Ref<IPost> = ref({});

    const retrievePost = async postId => {
      try {
        const res = await postService().find(postId);
        post.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.postId) {
      retrievePost(route.params.postId);
    }

    return {
      ...dateFormat,
      alertService,
      post,

      ...dataUtils,

      previousState,
      t$: useI18n().t,
    };
  },
});
