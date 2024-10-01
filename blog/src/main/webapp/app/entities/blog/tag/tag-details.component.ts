import { type Ref, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import TagService from './tag.service';
import { type ITag } from '@/shared/model/blog/tag.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'TagDetails',
  setup() {
    const tagService = inject('tagService', () => new TagService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);
    const tag: Ref<ITag> = ref({});

    const retrieveTag = async tagId => {
      try {
        const res = await tagService().find(tagId);
        tag.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.tagId) {
      retrieveTag(route.params.tagId);
    }

    return {
      alertService,
      tag,

      previousState,
      t$: useI18n().t,
    };
  },
});
