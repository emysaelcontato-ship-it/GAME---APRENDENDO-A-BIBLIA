import './style.css'
import { proverbiosData } from './proverbios.js'
import confetti from 'canvas-confetti'

const app = document.querySelector('#app')

// State management
let progress = JSON.parse(localStorage.getItem('daviProgressV4')) || {}
let weekData = JSON.parse(localStorage.getItem('daviTrafficWeekV1')) || [null, null, null, null, null]
let activeEditIndex = weekData.findIndex(x => x === null)
if (activeEditIndex === -1) activeEditIndex = 4

const characters = {
  'owl': { name: 'Coruja Sábia', image: '/owl.webp', welcome: 'Huu-huu, Davi! Vamos pensar?' },
  'lion': { name: 'Leão Corajoso', image: '/lion.webp', welcome: 'Raurrr! Hora da ação, Davi!' },
  'doctor': { name: 'Dr. Gotinha', image: '/doctor.webp', welcome: 'Olá campeão! Vamos cuidar da saúde.' }
}

function render() {
  const completedCount = Object.keys(progress).length
  const progressPercent = (completedCount / 31) * 100

  app.innerHTML = `
    <div class="main-layout">
      <!-- Seção do Jogo -->
      <section class="game-section">
        <header class="title-section">
          <h1>🏰 Jornada da Sabedoria</h1>
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
      </section>

      <!-- Seção do Semáforo -->
      <section class="semaforo-section">
        <div class="traffic-panel">
          <h2>🚦 Semáforo do Davi</h2>
          
          <div class="light-display">
            <div id="light-red" class="bulb red"></div>
            <div id="light-yellow" class="bulb yellow"></div>
            <div id="light-green" class="bulb green"></div>
          </div>

          <p style="font-size: 14px; margin-bottom: 5px;">Como foi o comportamento hoje?</p>
          <div class="control-btns">
            <button class="btn-sem btn-red" id="btn-red">🔴 Ruim</button>
            <button class="btn-sem btn-yel" id="btn-yellow">🟡 M/M</button>
            <button class="btn-sem btn-gre" id="btn-green">🟢 Bom</button>
          </div>

          <hr style="border: 0; border-top: 2px solid #37474F; margin: 15px 0;">
          <p style="font-size: 14px;">Placar da Semana</p>
          <div class="weekly-history" id="weekSlots"></div>
          <button class="reset-btn" id="resetWeek">Nova Semana ✨</button>
        </div>
      </section>
    </div>

    <div id="modal" class="modal">
      <div class="modal-content" id="cardRenderArea"></div>
    </div>
  `

  setupEventListeners()
  renderTrafficHistory()
}

function setupEventListeners() {
  // Game Cards
  document.querySelectorAll('.day-card').forEach(card => {
    card.addEventListener('click', () => {
      const day = parseInt(card.dataset.day)
      openDay(day)
    })
  })

  // Traffic Light Controls
  document.getElementById('btn-red').addEventListener('click', () => setTraffic('red'))
  document.getElementById('btn-yellow').addEventListener('click', () => setTraffic('yellow'))
  document.getElementById('btn-green').addEventListener('click', () => setTraffic('green'))
  
  // Reset Week
  document.getElementById('resetWeek').addEventListener('click', resetWeek)

  // Modal close
  window.addEventListener('click', (e) => {
    if (e.target.id === 'modal') closeModal()
  })
}

// --- Traffic Light Logic ---
function setTraffic(color) {
  // Update lights
  document.querySelectorAll('.bulb').forEach(b => b.classList.remove('active'))
  document.getElementById(`light-${color}`).classList.add('active')

  // Save to state
  weekData[activeEditIndex] = color
  localStorage.setItem('daviTrafficWeekV1', JSON.stringify(weekData))

  // Feedback animation
  if (color === 'green') {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { x: 0.8, y: 0.5 },
      colors: ['#00E676']
    })
  }

  renderTrafficHistory()
  
  // Progress to next day if not friday
  if (activeEditIndex < 4) {
    activeEditIndex++
    renderTrafficHistory() // re-render to show next active slot
  }
}

function renderTrafficHistory() {
  const container = document.getElementById('weekSlots')
  if (!container) return
  
  container.innerHTML = ''
  const dayNames = ['S', 'T', 'Q', 'Q', 'S']
  
  weekData.forEach((status, index) => {
    const slot = document.createElement('div')
    slot.className = `day-slot ${index === activeEditIndex ? 'active-day' : ''}`
    slot.innerText = dayNames[index]
    
    if (status === 'red') slot.style.backgroundColor = '#FF1744'
    if (status === 'yellow') slot.style.backgroundColor = '#FFEA00'
    if (status === 'green') slot.style.backgroundColor = '#00E676'
    
    if (status) {
      slot.style.color = status === 'yellow' ? '#333' : 'white'
    }

    slot.addEventListener('click', () => {
      activeEditIndex = index
      renderTrafficHistory()
      // Highlight existing light if any
      document.querySelectorAll('.bulb').forEach(b => b.classList.remove('active'))
      if (weekData[index]) {
        document.getElementById(`light-${weekData[index]}`).classList.add('active')
      }
    })
    
    container.appendChild(slot)
  })
}

function resetWeek() {
  if (confirm("Davi, vamos começar um novo treino da semana?")) {
    weekData = [null, null, null, null, null]
    localStorage.setItem('daviTrafficWeekV1', JSON.stringify(weekData))
    activeEditIndex = 0
    document.querySelectorAll('.bulb').forEach(b => b.classList.remove('active'))
    renderTrafficHistory()
  }
}

// --- Game Logic ---
function openDay(dayNumber) {
  const data = proverbiosData.find(d => d.day === dayNumber)
  const modal = document.querySelector('#modal')
  const renderArea = document.querySelector('#cardRenderArea')

  if (!data) {
    renderArea.innerHTML = `
      <span class="close-btn" onclick="document.querySelector('#modal').style.display='none'">&times;</span>
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

  setTimeout(() => {
    alert("Parabéns Davi! Você é um campeão da sabedoria! ⭐")
    closeModal()
    render()
  }, 500)
}

render()
