<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <div v-if="product">
        <h2 class="jh-entity-heading" data-cy="productDetailsHeading">
          <span v-text="t$('storeApp.storeProduct.detail.title')"></span> {{ product.id }}
        </h2>
        <dl class="row jh-entity-details">
          <dt>
            <span v-text="t$('storeApp.storeProduct.title')"></span>
          </dt>
          <dd>
            <span>{{ product.title }}</span>
          </dd>
          <dt>
            <span v-text="t$('storeApp.storeProduct.price')"></span>
          </dt>
          <dd>
            <span>{{ product.price }}</span>
          </dd>
          <dt>
            <span v-text="t$('storeApp.storeProduct.image')"></span>
          </dt>
          <dd>
            <div v-if="product.image">
              <a @click="openFile(product.imageContentType, product.image)">
                <img :src="'data:' + product.imageContentType + ';base64,' + product.image" style="max-width: 100%" alt="product" />
              </a>
              {{ product.imageContentType }}, {{ byteSize(product.image) }}
            </div>
          </dd>
        </dl>
        <button type="submit" @click.prevent="previousState()" class="btn btn-info" data-cy="entityDetailsBackButton">
          <font-awesome-icon icon="arrow-left"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.back')"></span>
        </button>
        <router-link v-if="product.id" :to="{ name: 'ProductEdit', params: { productId: product.id } }" custom v-slot="{ navigate }">
          <button @click="navigate" class="btn btn-primary">
            <font-awesome-icon icon="pencil-alt"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.edit')"></span>
          </button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./product-details.component.ts"></script>
