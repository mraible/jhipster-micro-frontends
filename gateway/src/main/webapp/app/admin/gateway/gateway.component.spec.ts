import { vitest } from 'vitest';
import { shallowMount } from '@vue/test-utils';

import Gateway from './gateway.vue';
import GatewayService from './gateway.service';

type GatewayComponentType = InstanceType<typeof Gateway>;

describe('Gateway Component', () => {
  let wrapper;
  let comp: GatewayComponentType;

  beforeEach(() => {
    const gatewayService = new GatewayService();
    vitest.spyOn(gatewayService, 'findAll').mockResolvedValue({ data: [] });
    wrapper = shallowMount(Gateway, {
      global: {
        stubs: {
          'font-awesome-icon': true,
        },
        provide: { gatewayService },
      },
    });
    comp = wrapper.vm;
  });

  it('should be a Vue instance', () => {
    expect(wrapper.get('#gateway-page-heading'));
  });
});
