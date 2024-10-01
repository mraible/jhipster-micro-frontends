<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <div v-if="tag">
        <h2 class="jh-entity-heading" data-cy="tagDetailsHeading">
          <span v-text="t$('blogApp.blogTag.detail.title')"></span> {{ tag.id }}
        </h2>
        <dl class="row jh-entity-details">
          <dt>
            <span v-text="t$('blogApp.blogTag.name')"></span>
          </dt>
          <dd>
            <span>{{ tag.name }}</span>
          </dd>
          <dt>
            <span v-text="t$('blogApp.blogTag.post')"></span>
          </dt>
          <dd>
            <span v-for="(post, i) in tag.posts" :key="post.id"
              >{{ i > 0 ? ', ' : '' }}
              <router-link :to="{ name: 'PostView', params: { postId: post.id } }">{{ post.id }}</router-link>
            </span>
          </dd>
        </dl>
        <button type="submit" @click.prevent="previousState()" class="btn btn-info" data-cy="entityDetailsBackButton">
          <font-awesome-icon icon="arrow-left"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.back')"></span>
        </button>
        <router-link v-if="tag.id" :to="{ name: 'TagEdit', params: { tagId: tag.id } }" custom v-slot="{ navigate }">
          <button @click="navigate" class="btn btn-primary">
            <font-awesome-icon icon="pencil-alt"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.edit')"></span>
          </button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./tag-details.component.ts"></script>
