<template>
  <div>
    <b-dropdown-item to="/blog/blog">
      <font-awesome-icon icon="asterisk" />
      <span v-text="t$('global.menu.entities.blogBlog')"></span>
    </b-dropdown-item>
    <b-dropdown-item to="/blog/post">
      <font-awesome-icon icon="asterisk" />
      <span v-text="t$('global.menu.entities.blogPost')"></span>
    </b-dropdown-item>
    <b-dropdown-item to="/blog/tag">
      <font-awesome-icon icon="asterisk" />
      <span v-text="t$('global.menu.entities.blogTag')"></span>
    </b-dropdown-item>
    <!-- jhipster-needle-add-entity-to-menu - JHipster will add entities to the menu here -->
  </div>
</template>

<script lang="ts" src="./entities-menu.component.ts"></script>
