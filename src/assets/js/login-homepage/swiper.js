import { nextTick } from 'vue'
import Swiper from 'swiper/bundle'
import 'swiper/css/bundle'

export function initSwiper() {
  nextTick(() => {
    if (document.querySelector('.first-swiper-container')) {
      const firstSwiper = new Swiper('.first-swiper-container', {
        direction: 'horizontal',
        loop: true,
        speed: 400,
        spaceBetween: 20,
        autoplay: {
          delay: 3000,
        },
        slidesPerView: 1.3,
        centeredSlides: true,
        breakpoints: {
          1440: {
            slidesPerView: 1.5,
          },
          1200: {
            slidesPerView: 1.3,
          },
          1024: {
            slidesPerView: 1.3,
          },
          768: {
            slidesPerView: 1.2,
          },
          0: {
            slidesPerView: 1.2,
          },
        },
      })
    }

    if (document.querySelector('.second-swiper-container')) {
      const secondSwiper = new Swiper('.second-swiper-container', {
        speed: 400,
        autoplay: {
          delay: 3000,
        },
        effect: 'cards',
        grabCursor: true,
      })
    }

    if (document.querySelector('.third-swiper-container')) {
      const thirdSwiper = new Swiper('.third-swiper-container', {
        direction: 'horizontal',
        loop: true,
        speed: 400,
        spaceBetween: 20,
        autoplay: {
          delay: 3000,
        },
        breakpoints: {
          1440: {
            slidesPerView: 6,
          },
          1200: {
            slidesPerView: 4,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 15,
          },
          768: {
            slidesPerView: 1.5,
            centeredSlides: true,
            spaceBetween: 15,
          },
          0: {
            slidesPerView: 1.3,
            centeredSlides: true,
            spaceBetween: 15,
          },
        },
      })
    }
  })
}
