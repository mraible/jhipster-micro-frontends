import { type Ref, computed, defineAsyncComponent, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { importRemote } from '@module-federation/utilities';
import type LoginService from '@/account/login.service';
import type AccountService from '@/account/account.service';
import languages from '@/shared/config/languages';
import EntitiesMenu from '@/entities/entities-menu.vue';

import { useStore } from '@/store';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'JhiNavbar',
  components: {
    'entities-menu': EntitiesMenu,
    'blog-menu': defineAsyncComponent(() => {
      return importRemote<any>({
        url: `./services/blog`,
        scope: 'blog',
        module: './entities-menu',
      }).catch(() => import('@/core/error/error-loading.vue'));
    }),
    'store-menu': defineAsyncComponent(() => {
      return importRemote<any>({
        url: `./services/store`,
        scope: 'store',
        module: './entities-menu',
      }).catch(() => import('@/core/error/error-loading.vue'));
    }),
  },
  setup() {
    const loginService = inject<LoginService>('loginService');
    const accountService = inject<AccountService>('accountService');
    const currentLanguage = inject('currentLanguage', () => computed(() => navigator.language ?? 'en'), true);
    const changeLanguage = inject<(string) => Promise<void>>('changeLanguage');

    const isActiveLanguage = (key: string) => {
      return key === currentLanguage.value;
    };

    const router = useRouter();
    const store = useStore();

    const version = `v${APP_VERSION}`;
    const hasAnyAuthorityValues: Ref<any> = ref({});

    const openAPIEnabled = computed(() => store.activeProfiles.indexOf('api-docs') > -1);
    const inProduction = computed(() => store.activeProfiles.indexOf('prod') > -1);
    const authenticated = computed(() => store.authenticated);

    const openLogin = () => {
      loginService.login();
    };

    const subIsActive = (input: string | string[]) => {
      const paths = Array.isArray(input) ? input : [input];
      return paths.some(path => {
        return router.currentRoute.value.path.indexOf(path) === 0; // current path starts with this path string
      });
    };

    const logout = async () => {
      const response = await loginService.logout();
      store.logout();
      window.location.href = response.data.logoutUrl;
      const next = response.data?.logoutUrl ?? '/';
      if (router.currentRoute.value.path !== next) {
        await router.push(next);
      }
    };

    return {
      logout,
      subIsActive,
      accountService,
      openLogin,
      changeLanguage,
      languages: languages(),
      isActiveLanguage,
      version,
      currentLanguage,
      hasAnyAuthorityValues,
      openAPIEnabled,
      inProduction,
      authenticated,
      t$: useI18n().t,
    };
  },
  methods: {
    hasAnyAuthority(authorities: any): boolean {
      this.accountService.hasAnyAuthorityAndCheckAuth(authorities).then(value => {
        if (this.hasAnyAuthorityValues[authorities] !== value) {
          this.hasAnyAuthorityValues = { ...this.hasAnyAuthorityValues, [authorities]: value };
        }
      });
      return this.hasAnyAuthorityValues[authorities] ?? false;
    },
  },
});
