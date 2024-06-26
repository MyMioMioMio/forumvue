import Vue from 'vue'
import VueRouter from 'vue-router'
// import HomeView from '../views/HomeView.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'index',
    component: () => import(/* webpackChunkName: "about" */ '../views/index/IndexView.vue')
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  },
  {
    path: '/section',
    name: 'section',
    component: () => import(/* webpackChunkName: "about" */ '../views/section/SectionView.vue')
  },
  {
    path: '/post',
    name: 'post',
    component: () => import(/* webpackChunkName: "about" */ '../views/post/PostView.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import(/* webpackChunkName: "about" */ '../views/user/LoginView.vue')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import(/* webpackChunkName: "about" */ '../views/user/RegisterView.vue')
  },
  {
    path: '/personal',
    name: 'personal',
    component: () => import(/* webpackChunkName: "about" */ '../views/user/PersonalView.vue')
  },
  {
    path: '/sections',
    name: 'sections',
    component: () => import(/* webpackChunkName: "about" */ '../views/section/SectionsView.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
