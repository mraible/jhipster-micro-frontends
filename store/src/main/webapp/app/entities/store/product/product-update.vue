<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <form name="editForm" novalidate @submit.prevent="save()">
        <h2
          id="storeApp.storeProduct.home.createOrEditLabel"
          data-cy="ProductCreateUpdateHeading"
          v-text="t$('storeApp.storeProduct.home.createOrEditLabel')"
        ></h2>
        <div>
          <div class="form-group" v-if="product.id">
            <label for="id" v-text="t$('global.field.id')"></label>
            <input type="text" class="form-control" id="id" name="id" v-model="product.id" readonly />
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('storeApp.storeProduct.title')" for="product-title"></label>
            <input
              type="text"
              class="form-control"
              name="title"
              id="product-title"
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
            <label class="form-control-label" v-text="t$('storeApp.storeProduct.price')" for="product-price"></label>
            <input
              type="number"
              class="form-control"
              name="price"
              id="product-price"
              data-cy="price"
              :class="{ valid: !v$.price.$invalid, invalid: v$.price.$invalid }"
              v-model.number="v$.price.$model"
              required
            />
            <div v-if="v$.price.$anyDirty && v$.price.$invalid">
              <small class="form-text text-danger" v-for="error of v$.price.$errors" :key="error.$uid">{{ error.$message }}</small>
            </div>
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('storeApp.storeProduct.image')" for="product-image"></label>
            <div>
              <img
                :src="'data:' + product.imageContentType + ';base64,' + product.image"
                style="max-height: 100px"
                v-if="product.image"
                alt="product"
              />
              <div v-if="product.image" class="form-text text-danger clearfix">
                <span class="pull-left">{{ product.imageContentType }}, {{ byteSize(product.image) }}</span>
                <button
                  type="button"
                  @click="clearInputImage('image', 'imageContentType', 'file_image')"
                  class="btn btn-secondary btn-xs pull-right"
                >
                  <font-awesome-icon icon="times"></font-awesome-icon>
                </button>
              </div>
              <label for="file_image" v-text="t$('entity.action.addimage')" class="btn btn-primary pull-right"></label>
              <input
                type="file"
                ref="file_image"
                id="file_image"
                style="display: none"
                data-cy="image"
                @change="setFileData($event, product, 'image', true)"
                accept="image/*"
              />
            </div>
            <input
              type="hidden"
              class="form-control"
              name="image"
              id="product-image"
              data-cy="image"
              :class="{ valid: !v$.image.$invalid, invalid: v$.image.$invalid }"
              v-model="v$.image.$model"
            />
            <input
              type="hidden"
              class="form-control"
              name="imageContentType"
              id="product-imageContentType"
              v-model="product.imageContentType"
            />
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
<script lang="ts" src="./product-update.component.ts"></script>
