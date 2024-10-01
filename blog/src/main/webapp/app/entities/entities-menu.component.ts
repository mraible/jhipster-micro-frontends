import { type ComputedRef, defineComponent, inject, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type TranslationService from '@/locale/translation.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'EntitiesMenu',
  setup() {
    const i18n = useI18n();
    const microfrontendI18n = inject('microfrontendI18n', true);
    const translationService = inject<TranslationService>('translationService');
    const currentLanguage = inject<ComputedRef<string>>('currentLanguage');

    const loadLanguage = async () => {
      if (microfrontendI18n) {
        const languageToLoad = currentLanguage.value;
        await translationService.loadTranslations({ currentLanguage: languageToLoad, urlPrefix: 'services/blog/', hash: I18N_HASH });
      }
    };

    onMounted(() => loadLanguage());
    watch(
      () => i18n.locale,
      () => loadLanguage(),
    );

    return {
      t$: i18n.t,
    };
  },
});
