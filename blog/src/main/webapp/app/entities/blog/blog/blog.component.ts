import { type Ref, defineComponent, inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import BlogService from './blog.service';
import { type IBlog } from '@/shared/model/blog/blog.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'Blog',
  setup() {
    const { t: t$ } = useI18n();
    const blogService = inject('blogService', () => new BlogService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const blogs: Ref<IBlog[]> = ref([]);

    const isFetching = ref(false);

    const clear = () => {};

    const retrieveBlogs = async () => {
      isFetching.value = true;
      try {
        const res = await blogService().retrieve();
        blogs.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const handleSyncList = () => {
      retrieveBlogs();
    };

    onMounted(async () => {
      await retrieveBlogs();
    });

    const removeId: Ref<string> = ref(null);
    const removeEntity = ref<any>(null);
    const prepareRemove = (instance: IBlog) => {
      removeId.value = instance.id;
      removeEntity.value.show();
    };
    const closeDialog = () => {
      removeEntity.value.hide();
    };
    const removeBlog = async () => {
      try {
        await blogService().delete(removeId.value);
        const message = t$('blogApp.blogBlog.deleted', { param: removeId.value }).toString();
        alertService.showInfo(message, { variant: 'danger' });
        removeId.value = null;
        retrieveBlogs();
        closeDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    return {
      blogs,
      handleSyncList,
      isFetching,
      retrieveBlogs,
      clear,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeBlog,
      t$,
    };
  },
});
