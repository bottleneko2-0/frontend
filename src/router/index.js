import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import WorkShop from '@/views/WorkShop.vue'
import HeroMember from '@/views/HeroMember.vue'
import OfficialProduct from '@/views/OfficialProduct.vue'
import Series from '@/views/Series.vue'
import User from '@/views/User.vue'
import DailyCard from '@/views/DailyCard.vue'
import Faq from '@/views/Faq.vue'
import FaqInfo from '@/views/FaqInfo.vue'
import Login from '@/views/Login.vue'
import Signup from '@/views/Signup.vue'
import CardSeries from '@/views/CardSeries.vue'
import AddArticle from '@/views/AddArticle.vue'
import Social from '@/views/Social.vue'
import MyCard from '@/views/MyCard.vue'
import AuthSuccess from '@/views/AuthSuccess.vue'
import MyArticle from '@/views/MyArticle.vue'
import Team from '@/views/Team.vue'
import Contact from '@/views/Contact.vue'
import SocialPost from '@/components/post/SocialPost.vue'
import EditPost from '@/components/post/EditPost.vue'
import FindCard from '@/components/card/FindCard.vue'
import RemitCard from '@/components/card/RemitCard.vue'
import DeckPage from '@/components/deck/DeckPage.vue'
import AddPostDeck from '@/components/deck/AddPostDeck.vue'
import Notice from '@/components/notice/Notice.vue'
import Notification from '@/components/notice/Notification.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/workshop',
      name: 'workshop',
      component: WorkShop,
    },
    {
      path: '/hero-member',
      name: 'hero-member',
      component: HeroMember,
    },
    {
      path: '/products',
      name: 'products',
      component: OfficialProduct,
    },
    {
      path: '/series',
      name: 'series',
      component: Series,
    },
    {
      path: '/daily-card',
      name: 'daily-card',
      component: DailyCard,
    },
    {
      path: '/faq',
      name: 'faq',
      component: Faq,
    },
    {
      path: '/faq/:id',
      name: 'FaqInfo',
      component: FaqInfo,
    },
    {
      path: '/user',
      name: 'user',
      component: User,
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/signup',
      name: 'signup',
      component: Signup,
    },
    {
      path: '/card-series/:series_id',
      component: CardSeries,
    },
    {
      path: '/social/:post_code',
      component: SocialPost,
    },
    {
      path: '/add',
      name: 'add-article',
      component: AddArticle,
    },
    {
      path: '/social',
      name: 'social',
      component: Social,
    },
    {
      path: '/findcard',
      name: 'find-card',
      component: FindCard,
    },
    {
      path: '/remitcard',
      name: 'remit-card',
      component: RemitCard,
    },
    {
      path: '/deck',
      name: 'deck',
      component: MyCard,
    },
    {
      path: '/auth-success',
      name: 'auth-success',
      component: AuthSuccess,
    },
    {
      path: '/social/my',
      name: 'my-article',
      component: MyArticle,
    },
    {
      path: '/deck/:deck_id',
      name: 'deckPage',
      component: DeckPage,
    },
    {
      path: '/add/:deck_id',
      name: 'add-post-deck',
      component: AddPostDeck,
    },
    {
      path: '/notice',
      name: 'notice',
      component: Notice,
    },
    {
      path: '/notification',
      name: 'notification',
      component: Notification,
    },
    {
      path: '/team',
      name: 'team',
      component: Team,
    },
    {
      path: '/contact',
      name: 'contact',
      component: Contact,
    },
    {
      path: '/edit/:post_code',
      name: 'EditPost',
      component: EditPost,
    },
  ],
})

export default router
