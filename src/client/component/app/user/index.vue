<template>
  <component :is="indexThemeComponet" />
</template>
<script>
import Vue from 'vue';
import { THEME_SET } from '../../../store';
import { err } from '../../../helper/logger';
import config from '../../../config';

export default {
  components: {
  },
  data() {
    return {
      indexThemeComponet: 'vms-index',
    };
  },
  async asyncData({ store, route }) {
    let theme = store.getters.indexTheme;
    if (!theme) {
      const res = await store.getters.Common.get({ id: 1 });
      const data = res.data[0];
      theme = data.index_theme;
      store.dispatch(THEME_SET, { index: theme });
    }
    let themeComponent;
    try {
      themeComponent = (await import(`../../../theme/${theme}/index.vue`)).default;
    } catch (e) {
      const configTheme = config.theme;
      themeComponent = (await import(`../../../theme/${configTheme}/index.vue`)).default;
    }
    if (themeComponent.asyncData) {
      try {
        await themeComponent.asyncData({ store, route });
      } catch (e) {
        err(e);
      }
    }
    Vue.component('vms-index', themeComponent);
  },
};
</script>
