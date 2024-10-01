<template>
  <b-navbar data-cy="navbar" toggleable="md" type="dark" class="bg-dark">
    <b-navbar-brand class="logo" b-link to="/">
      <span class="logo-img"></span>
      <span v-text="t$('global.title')" class="navbar-title"></span> <span class="navbar-version">{{ version }}</span>
    </b-navbar-brand>
    <b-navbar-toggle
      right
      class="jh-navbar-toggler d-lg-none"
      href="javascript:void(0);"
      data-toggle="collapse"
      target="header-tabs"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <font-awesome-icon icon="bars" />
    </b-navbar-toggle>

    <b-collapse is-nav id="header-tabs">
      <b-navbar-nav class="ml-auto">
        <b-nav-item to="/" exact>
          <span>
            <font-awesome-icon icon="home" />
            <span v-text="t$('global.menu.home')"></span>
          </span>
        </b-nav-item>
        <b-nav-item-dropdown right id="entity-menu" v-if="authenticated" active-class="active" class="pointer" data-cy="entity">
          <template #button-content>
            <span class="navbar-dropdown-menu">
              <font-awesome-icon icon="th-list" />
              <span class="no-bold" v-text="t$('global.menu.entities.main')"></span>
            </span>
          </template>
          <entities-menu></entities-menu>
          <blog-menu></blog-menu>
          <store-menu></store-menu>
          <!-- jhipster-needle-add-entity-to-menu - JHipster will add entities to the menu here -->
        </b-nav-item-dropdown>
        <b-nav-item-dropdown
          right
          id="admin-menu"
          v-if="hasAnyAuthority('ROLE_ADMIN') && authenticated"
          :class="{ 'router-link-active': subIsActive('/admin') }"
          active-class="active"
          class="pointer"
          data-cy="adminMenu"
        >
          <template #button-content>
            <span class="navbar-dropdown-menu">
              <font-awesome-icon icon="users-cog" />
              <span class="no-bold" v-text="t$('global.menu.admin.main')"></span>
            </span>
          </template>
          <b-dropdown-item to="/admin/gateway" active-class="active">
            <font-awesome-icon icon="road" />
            <span v-text="t$('global.menu.admin.gateway')"></span>
          </b-dropdown-item>
          <b-dropdown-item to="/admin/metrics" active-class="active">
            <font-awesome-icon icon="tachometer-alt" />
            <span v-text="t$('global.menu.admin.metrics')"></span>
          </b-dropdown-item>
          <b-dropdown-item to="/admin/health" active-class="active">
            <font-awesome-icon icon="heart" />
            <span v-text="t$('global.menu.admin.health')"></span>
          </b-dropdown-item>
          <b-dropdown-item to="/admin/configuration" active-class="active">
            <font-awesome-icon icon="cogs" />
            <span v-text="t$('global.menu.admin.configuration')"></span>
          </b-dropdown-item>
          <b-dropdown-item to="/admin/logs" active-class="active">
            <font-awesome-icon icon="tasks" />
            <span v-text="t$('global.menu.admin.logs')"></span>
          </b-dropdown-item>
          <b-dropdown-item v-if="openAPIEnabled" to="/admin/docs" active-class="active">
            <font-awesome-icon icon="book" />
            <span v-text="t$('global.menu.admin.apidocs')"></span>
          </b-dropdown-item>
        </b-nav-item-dropdown>
        <b-nav-item-dropdown id="languagesnavBarDropdown" right v-if="languages && Object.keys(languages).length > 1">
          <template #button-content>
            <font-awesome-icon icon="flag" />
            <span class="no-bold" v-text="t$('global.menu.language')"></span>
          </template>
          <b-dropdown-item
            v-for="(value, key) in languages"
            :key="`lang-${key}`"
            @click="changeLanguage(key)"
            :class="{ active: isActiveLanguage(key) }"
          >
            {{ value.name }}
          </b-dropdown-item>
        </b-nav-item-dropdown>
        <b-nav-item-dropdown
          right
          href="javascript:void(0);"
          id="account-menu"
          :class="{ 'router-link-active': subIsActive('/account') }"
          active-class="active"
          class="pointer"
          data-cy="accountMenu"
        >
          <template #button-content>
            <span class="navbar-dropdown-menu">
              <font-awesome-icon icon="user" />
              <span class="no-bold" v-text="t$('global.menu.account.main')"></span>
            </span>
          </template>
          <b-dropdown-item data-cy="logout" v-if="authenticated" @click="logout()" id="logout" active-class="active">
            <font-awesome-icon icon="sign-out-alt" />
            <span v-text="t$('global.menu.account.logout')"></span>
          </b-dropdown-item>
          <b-dropdown-item data-cy="login" v-if="!authenticated" @click="openLogin()" id="login" active-class="active">
            <font-awesome-icon icon="sign-in-alt" />
            <span v-text="t$('global.menu.account.login')"></span>
          </b-dropdown-item>
        </b-nav-item-dropdown>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<script lang="ts" src="./jhi-navbar.component.ts"></script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
/* ==========================================================================
    Navbar
    ========================================================================== */
.navbar-version {
  font-size: 0.65em;
}

@media screen and (min-width: 768px) {
  .jh-navbar-toggler {
    display: none;
  }
}

@media screen and (min-width: 768px) and (max-width: 1150px) {
  span span {
    display: none;
  }
}

.navbar-title {
  display: inline-block;
}

/* ==========================================================================
    Logo styles
    ========================================================================== */
.navbar-brand.logo {
  padding: 0 7px;
}

.logo .logo-img {
  height: 45px;
  display: inline-block;
  vertical-align: middle;
  width: 45px;
}

.logo-img {
  height: 100%;
  background: url('/content/images/logo-jhipster.png') no-repeat center center;
  background-size: contain;
  width: 100%;
  filter: drop-shadow(0 0 0.05rem white);
  margin: 0 5px;
}
</style>
