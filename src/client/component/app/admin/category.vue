<template>
  <form @submit.prevent="submit">
    <div class="uk-margin">
      <input
        v-model="category.title"
        type="text"
        placeholder="title"
        class="uk-input"
      >
    </div>
    <div class="uk-margin">
      <app-category-option v-model="category.parent_id" />
    </div>
    <div class="uk-margin">
      <textarea
        v-model="category.description"
        placeholder="description"
        class="uk-textarea"
      />
    </div>
    <div class="uk-margin uk-flex">
      <div uk-form-custom>
        <input
          ref="coverImage"
          type="file"
          @change="uploadCoverImage"
        >
        <button class="uk-button uk-button-default">Select Cover Image</button>
      </div>
      <no-ssr>
        <viewer
          :images="coverImages"
          class="uk-margin-left"
        >
          <img
            v-for="(src, index) in coverImages"
            :key="index"
            :src="src"
            width="40"
            height="40"
            alt="cover image"
          >
        </viewer>
      </no-ssr>
    </div>
    <div
      v-show="isShowAdvanced"
      class="uk-margin"
    >
      <app-theme-option v-model="category.theme" />
    </div>
    <div class="uk-margin">
      <a @click="showAdvanced">
        advanced setting
      </a>
    </div>
    <div class="uk-margin">
      <div class="uk-button-group">
        <button
          class="uk-button uk-button-primary"
          type="submit"
        >submit</button>
        <div class="uk-inline">
          <button
            class="uk-button uk-button-default"
            type="button"
          ><span uk-icon="icon:  triangle-down" /></button>
          <div uk-dropdown="mode: click; animation: uk-animation-slide-top-small; duration: 200">
            <ul class="uk-nav uk-dropdown-nav">
              <li @click="del"><a href="#">delete</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </form>
</template>
<script>
import NoSsr from 'vue-no-ssr';
import AppCategoryOption from './category-option';
import AppThemeOption from './theme-option';
import { NOTICE_SEND } from '../../../store';
import config from '../../../config';

const { db } = config;

let isNew = true;

export default {
  components: {
    AppCategoryOption,
    AppThemeOption,
    NoSsr,
  },
  props: {
    id: {
      type: Number,
      default: 0,
    },
    parentId: {
      type: Number,
      default: db.rootId,
    },
  },
  data() {
    return {
      category: { parent_id: this.parentId },
      isShowAdvanced: false,
      submitReady: true,
      imgUploadPromises: [],
    };
  },
  computed: {
    coverImages: {
      get() {
        return this.category.image_url ? [this.category.image_url] : [];
      },
      set(value) {
        if (!value || !value.length) {
          return;
        }
        [this.category.image_url] = [value];
      },
    },
  },
  watch: {
    id: {
      handler() {
        this.setForm();
      },
      immediate: true,
    },
    parentId: {
      handler() {
        this.setForm();
      },
    },
  },
  created() {
  },
  mounted() {
  },
  methods: {
    submit() {
      if (!this.submitReady) {
        this.$store.dispatch(NOTICE_SEND, 'please wait for images are all uploaded');
        return;
      }
      const method = isNew ? 'save' : 'update';
      this.$store.getters.Category[method](this.category).then((res) => {
        this.$store.dispatch(NOTICE_SEND, 'updated');
        this.$emit('updated', res.data);
        if (isNew) {
          this.category = {};
        }
      }, (err) => {
        this.$store.dispatch(NOTICE_SEND, err.response.data);
      });
    },
    del() {
      const { Category } = this.$store.getters;
      Category.del(this.category).then((res) => {
        this.$store.dispatch(NOTICE_SEND, 'deleted');
        this.$emit('deleted', res.data);
        this.category = {};
      });
    },
    setForm() {
      const { Category } = this.$store.getters;
      // get category info if not new
      const id = this.id || this.$route.params.id;
      if (id) {
        Category.get(id)
          .then((res) => {
            this.category = res.data;
            isNew = false;
          });
      } else {
        isNew = true;
        this.category = {
          parent_id: this.parentId,
          image_url: null,
        };
      }
    },
    showAdvanced() {
      this.isShowAdvanced = !this.isShowAdvanced;
    },
    uploadCoverImage() {
      const data = new FormData();
      data.append('file', this.$refs.coverImage.files[0]);
      const uploaded = this.$store.getters.Common.upload(data);
      this.imgUploadPromises.push(uploaded);
      this.category.image_url = null;
      uploaded.then((res) => {
        this.coverImages = [res.data.url];
      });
      this.submitReady = false;
      Promise.all(this.imgUploadPromises).then(() => {
        this.submitReady = true;
      });
    },
  },
};
</script>
<style lang="scss" scoped>
</style>
