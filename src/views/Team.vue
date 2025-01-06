<script setup>
import SidebarGrid from '@/components/home/SidebarGrid.vue'
import MainFooter from '@/components/home/MainFooter.vue'
import NavLoginBtn from '@/components/login/NavLoginBtn.vue'
import Notice from '@/components/notice/Notice.vue'
import AngleL from '@/components/svg/AngleL.vue'
import Human from '@/components/svg/Human.vue'
import AngleD from '@/components/svg/AngleD.vue'
const goBack = () => {
  if (window.history.length > 1) {
    window.history.back()
  } else {
    router.push('/')
  }
}
</script>

<template>
  <div class="overall-situation">
    <SidebarGrid />
    <div class="team">
      <nav class="navbar">
        <button class="page-btn" @click="goBack">
          <AngleL class="h-6 w-6 text-white" />
        </button>
        <div class="import-bar">
          <Notice />
          <NavLoginBtn />
        </div>
      </nav>
      <section class="question-section">
        <h2>團隊成員</h2>
        <div class="question-area">
          <div>
            <input type="checkbox" id="question1" class="all-question" />
            <label for="question1" class="question question1">
              <Human class="m-1 text-zinc-200" />
              <h3>吳宗倫</h3>
              <AngleD class="dropdown-icon" />
            </label>
            <p class="answer">
              連絡信箱：allen84324@gmail.com <br />
              GitHub：
              <a href="https://github.com/allen84324"
                >https://github.com/allen84324</a
              >
            </p>
          </div>
          <div>
            <input type="checkbox" id="question2" class="all-question" />
            <label for="question2" class="question question2">
              <Human class="m-1 text-zinc-200" />
              <h3>柯昱丞</h3>
              <AngleD class="dropdown-icon" />
            </label>
            <p class="answer">
              連絡信箱：aa139532058@gmail.com <br />
              GitHub：
              <a href="https://github.com/YuCheng07"
                >https://github.com/YuCheng07</a
              >
            </p>
          </div>
          <div>
            <input type="checkbox" id="question3" class="all-question" />
            <label for="question3" class="question question3">
              <Human class="m-1 text-zinc-200" />
              <h3>萬代賢</h3>
              <AngleD class="dropdown-icon" />
            </label>
            <p class="answer">
              連絡信箱：graywolf7235@gmail.com <br />
              GitHub：
              <a href="https://github.com/Wandaihsien"
                >https://github.com/Wandaihsien</a
              >
            </p>
          </div>
          <div>
            <input type="checkbox" id="question4" class="all-question" />
            <label for="question4" class="question question4">
              <Human class="m-1 text-zinc-200" />
              <h3>張景淵</h3>
              <AngleD class="dropdown-icon" />
            </label>
            <p class="answer">
              連絡信箱：kennych063@gmail.com <br />
              GitHub：
              <a href="https://github.com/Kenny1238"
                >https://github.com/Kenny1238</a
              >
            </p>
          </div>
          <div>
            <input type="checkbox" id="question5" class="all-question" />
            <label for="question5" class="question question5">
              <Human class="m-1 text-zinc-200" />
              <h3>吳宜臻</h3>
              <AngleD class="dropdown-icon" />
            </label>
            <p class="answer">
              連絡信箱：enyawu0119@gmail.com <br />
              GitHub：
              <a href="https://github.com/Enya-Wu"
                >https://github.com/Enya-Wu</a
              >
            </p>
          </div>
          <div>
            <input type="checkbox" id="question6" class="all-question" />
            <label for="question6" class="question question6">
              <Human class="m-1 text-zinc-200" />
              <h3>呂旻叡</h3>
              <AngleD class="dropdown-icon" />
            </label>
            <p class="answer">
              連絡信箱：miranda880502@gmail.com <br />
              GitHub：
              <a href="https://github.com/minjuilu"
                >https://github.com/minjuilu</a
              >
            </p>
          </div>
          <div>
            <input type="checkbox" id="question7" class="all-question" />
            <label for="question7" class="question question7">
              <Human class="m-1 text-zinc-200" />
              <h3>吳佳樺</h3>
              <AngleD class="dropdown-icon" />
            </label>
            <p class="answer">
              連絡信箱：miku071522@gmail.com <br />
              GitHub：
              <a href="https://github.com/wuuhua">https://github.com/wuuhua</a>
            </p>
          </div>
        </div>
      </section>
      <MainFooter />
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/base.css';
.all-question {
  display: none;
}
.overall-situation {
  display: flex;
  position: relative;
}
.team {
  position: absolute;
  top: 0;
  left: 270px;
  background-color: #121212;
  padding: 10px;
  box-sizing: border-box;
  margin: 8px 8px 8px 0;
  border-radius: 10px;
  width: calc(100% - 278px);
}
.navbar {
  display: flex;
  align-items: center;
  /* background-color: wheat; */
  gap: 0.5rem;
  padding: 0.5rem;
  justify-content: space-between;
}
.import-bar {
  display: flex;
}
.page-btn {
  border: 0px;
  padding: 0.25rem;
  border-radius: 9999px;
  background-color: #000000;
}
.page-btn:hover {
  background-color: #3d3d3dbe;
}

.question-section {
  margin: 0 auto;
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #121212;
  margin-left: 53.5px;
  margin-right: 53.5px;
  margin-left: 125.45px;
  margin-right: 125.45px;
}
.question-section h2 {
  color: white;
  font-size: 1.875rem;
  line-height: 2.25rem;
  font-weight: 900;
  text-align: center;
  margin-bottom: 2rem;
  width: 200px;
}

.question-area > div {
  display: flex;
  flex-direction: column;
  background-color: rgba(39, 39, 42, 0.8);
  border-radius: 0.75rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.75rem;
  margin-bottom: 0.5rem;
}

.question-area > div svg {
  width: 32px;
  height: 32px;
  stroke: white;
}
.question {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  position: relative;
}

.question h3 {
  font-weight: 900;
  font-size: 1.125rem;
  line-height: 2.75rem;
}
.answer {
  margin-left: 1rem;
  font-size: 20px;
  cursor: pointer;
  color: white;
  line-height: 1.5;
  height: 0;
  overflow: hidden;
  transition: height 3s ease;
}
.answer a {
  text-decoration: none;
  color: rgb(59 130 246);
}
.dropdown-icon {
  width: 24px;
  height: 24px;
  cursor: pointer;
  margin-left: auto;
  position: absolute;
  right: 0;
  background-color: rgba(24, 24, 27, 0.5);
  border-radius: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4px;
}
#question1:checked ~ .answer {
  height: auto;
}

#question2:checked ~ .answer {
  height: auto;
}

#question3:checked ~ .answer {
  height: auto;
}

#question4:checked ~ .answer {
  height: auto;
}

#question5:checked ~ .answer {
  height: auto;
}

#question6:checked ~ .answer {
  height: auto;
}

#question7:checked ~ .answer {
  height: auto;
}

#question8:checked ~ .answer {
  height: auto;
}
@media screen and (width < 1200px) {
  .team {
    width: 100%;
    left: 0;
  }
}
</style>
