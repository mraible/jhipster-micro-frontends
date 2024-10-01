<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <form name="editForm" novalidate @submit.prevent="save()">
        <h2
          id="blogApp.blogPost.home.createOrEditLabel"
          data-cy="PostCreateUpdateHeading"
          v-text="t$('blogApp.blogPost.home.createOrEditLabel')"
        ></h2>
        <div>
          <div class="form-group" v-if="post.id">
            <label for="id" v-text="t$('global.field.id')"></label>
            <input type="text" class="form-control" id="id" name="id" v-model="post.id" readonly />
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('blogApp.blogPost.title')" for="post-title"></label>
            <input
              type="text"
              class="form-control"
              name="title"
              id="post-title"
              data-cy="title"
              :class="{ valid: !v$.title.$invalid, invalid: v$.title.$invalid }"
              v-model="v$.title.$model"
              required
            />
            <div v-if="v$.title.$anyDirty && v$.title.$invalid">
              <small class="form-text text-danger" v-for="error of v$.title.$errors" :key="error.$uid">{{ error.$message }}</small>
            </div>
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('blogApp.blogPost.content')" for="post-content"></label>
            <textarea
              class="form-control"
              name="content"
              id="post-content"
              data-cy="content"
              :class="{ valid: !v$.content.$invalid, invalid: v$.content.$invalid }"
              v-model="v$.content.$model"
              required
            ></textarea>
            <div v-if="v$.content.$anyDirty && v$.content.$invalid">
              <small class="form-text text-danger" v-for="error of v$.content.$errors" :key="error.$uid">{{ error.$message }}</small>
            </div>
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('blogApp.blogPost.date')" for="post-date"></label>
            <div class="d-flex">
              <input
                id="post-date"
                data-cy="date"
                type="datetime-local"
                class="form-control"
                name="date"
                :class="{ valid: !v$.date.$invalid, invalid: v$.date.$invalid }"
                required
                :value="convertDateTimeFromServer(v$.date.$model)"
                @change="updateInstantField('date', $event)"
              />
            </div>
            <div v-if="v$.date.$anyDirty && v$.date.$invalid">
              <small class="form-text text-danger" v-for="error of v$.date.$errors" :key="error.$uid">{{ error.$message }}</small>
            </div>
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('blogApp.blogPost.blog')" for="post-blog"></label>
            <select class="form-control" id="post-blog" data-cy="blog" name="blog" v-model="post.blog">
              <option :value="null"></option>
              <option
                :value="post.blog && blogOption.id === post.blog.id ? post.blog : blogOption"
                v-for="blogOption in blogs"
                :key="blogOption.id"
              >
                {{ blogOption.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label v-text="t$('blogApp.blogPost.tag')" for="post-tag"></label>
            <select
              class="form-control"
              id="post-tags"
              data-cy="tag"
              multiple
              name="tag"
              v-if="post.tags !== undefined"
              v-model="post.tags"
            >
              <option :value="getSelected(post.tags, tagOption, 'id')" v-for="tagOption in tags" :key="tagOption.id">
                {{ tagOption.name }}
              </option>
            </select>
          </div>
        </div>
        <div>
          <button type="button" id="cancel-save" data-cy="entityCreateCancelButton" class="btn btn-secondary" @click="previousState()">
            <font-awesome-icon icon="ban"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.cancel')"></span>
          </button>
          <button
            type="submit"
            id="save-entity"
            data-cy="entityCreateSaveButton"
            :disabled="v$.$invalid || isSaving"
            class="btn btn-primary"
          >
            <font-awesome-icon icon="save"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.save')"></span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
<script lang="ts" src="./post-update.component.ts"></script>
