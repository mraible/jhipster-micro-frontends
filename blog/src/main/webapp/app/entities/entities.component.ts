import { defineComponent, provide } from 'vue';

import BlogService from './blog/blog/blog.service';
import PostService from './blog/post/post.service';
import TagService from './blog/tag/tag.service';
import UserService from '@/entities/user/user.service';
// jhipster-needle-add-entity-service-to-entities-component-import - JHipster will import entities services here

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'Entities',
  setup() {
    provide('userService', () => new UserService());
    provide('blogService', () => new BlogService());
    provide('postService', () => new PostService());
    provide('tagService', () => new TagService());
    // jhipster-needle-add-entity-service-to-entities-component - JHipster will import entities services here
  },
});
