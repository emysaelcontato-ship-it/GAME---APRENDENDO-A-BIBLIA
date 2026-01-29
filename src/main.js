import './style.css'
import { proverbiosData } from './proverbios.js'
import confetti from 'canvas-confetti'

const app = document.querySelector('#app')

let progress = JSON.parse(localStorage.getItem('daviProgressV4')) || {}

const characters = {
  'owl': { name: 'Coruja Sábia', image: '/owl.webp', welcome: 'Huu-huu, Davi! Vamos pensar?' },
  'lion': { name: 'Leão Corajoso', image: '/lion.webp', welcome: 'Raurrr! Hora da ação, Davi!' },
  'doctor': { name: 'Dr. Gotinha', image: '/doctor.webp', welcome: 'Olá campeão! Vamos cuidar da saúde.' }
}

function render() {
  const completedCount = Object.keys(progress).length
  const progressPercent = (completedCount / 31) * 100

  app.innerHTML = `
    <div class="container">
      <header class="title-section">
        <h1>🏰 A Turma da Sabedoria</h1>
        <p>Vamos treinar hoje, Davi?</p>
        <div id="progress-bar">
          <div id="progress-fill" style="width: ${progressPercent}%"></div>
        </div>
      </header>

      <main class="grid-container" id="daysGrid">
        ${Array.from({ length: 31 }, (_, i) => {
          const day = i + 1
          const isCompleted = progress[day]
          return `
            <div class="day-card ${isCompleted ? 'completed' : ''}" data-day="${day}">
              ${day}
            </div>
          `
        }).join('')}
      </main>
    </div>

    <div id="modal" class="modal">
      <div class="modal-content" id="cardRenderArea"></div>
    </div>
  `

  setupEventListeners()
}

function setupEventListeners() {
  document.querySelectorAll('.day-card').forEach(card => {
    card.addEventListener('click', () => {
      const day = parseInt(card.dataset.day)
      openDay(day)
    })
  })

  window.addEventListener('click', (e) => {
    if (e.target.id === 'modal') closeModal()
  })
}

function openDay(dayNumber) {
  const data = proverbiosData.find(d => d.day === dayNumber)
  const modal = document.querySelector('#modal')
  const renderArea = document.querySelector('#cardRenderArea')

  if (!data) {
    renderArea.innerHTML = `
      <span class="close-btn" onclick="closeModal()">&times;</span>
      <div class="no-content">
        <h2>🛠️ Em construção!</h2>
        <p>A Turma da Sabedoria está preparando o treino do dia ${dayNumber}!</p>
      </div>
    `
  } else {
    const charInfo = characters[data.mascot] || characters['owl']
    renderArea.innerHTML = `
      <span class="close-btn">&times;</span>
      <h2 class="card-title">Dia ${data.day}: ${data.title}</h2>
      
      <div class="story-container" style="background-image: url('${data.bg}')">
        <div class="character-box">
          <img src="${charInfo.image}" class="char-image">
          <span class="char-name">${charInfo.name}</span>
        </div>
        <div class="dialogue-box">
          <strong>${charInfo.welcome}</strong><br><br>
          ${data.story}
          <br><br>
          <span class="question-text">❓ ${data.question}</span>
        </div>
      </div>

      <div class="mission-box">
        <span class="section-title">⚔️ MISSÃO DO DIA:</span>
        <p class="mission-text">${data.mission}</p>
        <span class="mantra">✨ O SÁBIO TREINA. ✨</span>
        <hr class="divider">
        <span class="section-title small-title">🙏 Oração:</span>
        <p class="prayer-text">"${data.prayer}"</p>
      </div>
      <button class="action-btn" id="finish-btn">Treinei e cumpri a missão! ⭐</button>
    `
    document.querySelector('.close-btn').addEventListener('click', closeModal)
    document.getElementById('finish-btn').addEventListener('click', () => completeMission(dayNumber))
  }

  modal.style.display = 'flex'
  setTimeout(() => modal.classList.add('active'), 10)
}

function closeModal() {
  const modal = document.querySelector('#modal')
  modal.classList.remove('active')
  setTimeout(() => modal.style.display = 'none', 300)
}

function completeMission(day) {
  progress[day] = true
  localStorage.setItem('daviProgressV4', JSON.stringify(progress))
  
  confetti({
    particleCount: 200,
    spread: 80,
    origin: { y: 0.6 },
    colors: ['#00C853', '#00ACC1', '#FFC107', '#FF6F00', '#FF3D00']
  })

  // Short delay before showing the alert to let confetti fly
  setTimeout(() => {
    alert("Parabéns Davi! Você é um campeão da sabedoria! ⭐")
    closeModal()
    render()
  }, 500)
}

render()
