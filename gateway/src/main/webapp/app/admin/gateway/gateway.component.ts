import { type Ref, defineComponent, inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import GatewayService from './gateway.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'JhiGatewayComponent',
  setup() {
    const gatewayService = inject('gatewayService', () => new GatewayService(), true);

    const gatewayRoutes: Ref<any[]> = ref([]);
    const updatingRoutes = ref(false);

    const refresh = () => {
      updatingRoutes.value = true;
      gatewayService.findAll().then(res => {
        gatewayRoutes.value = res.data.map(gatewayRoute => {
          gatewayRoute.serviceInstances = gatewayRoute.serviceInstances.map(serviceInstance => {
            if (serviceInstance.healthService && serviceInstance.healthService.checks) {
              if (
                serviceInstance.healthService.checks.filter((check: any) => check.status === 'PASSING').length ===
                serviceInstance.healthService.checks.length
              ) {
                serviceInstance.instanceInfo = { status: 'UP' };
              } else {
                serviceInstance.instanceInfo = { status: 'DOWN' };
              }
            }
            return serviceInstance;
          });
          return gatewayRoute;
        });
        updatingRoutes.value = false;
      });
    };

    onMounted(() => {
      refresh();
    });

    return {
      gatewayRoutes,
      updatingRoutes,
      gatewayService,
      refresh,
      t$: useI18n().t,
    };
  },
});
