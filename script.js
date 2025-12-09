// Elements
const envelope = document.getElementById("envelope")
const openingScreen = document.getElementById("openingScreen")
const letterScreen = document.getElementById("letterScreen")
const tapButton = document.getElementById("tapButton")
const modal = document.getElementById("modal")
const modalOverlay = document.getElementById("modalOverlay")
const modalClose = document.getElementById("modalClose")

// ===== ENVELOPE INTERACTION =====
envelope.addEventListener("click", () => {
  // Add open class to animate envelope
  envelope.classList.add("open")

  // Delay screen transition for better visual effect
  setTimeout(() => {
    openingScreen.classList.add("hidden")
    letterScreen.classList.remove("hidden")
  }, 600)
})

// ===== TAP BUTTON INTERACTION =====
tapButton.addEventListener("click", () => {
  modal.classList.remove("hidden")
  initScratchCard()
})

// ===== MODAL CLOSE INTERACTIONS =====
modalClose.addEventListener("click", () => {
  modal.classList.add("hidden")
})

modalOverlay.addEventListener("click", () => {
  modal.classList.add("hidden")
})

// Close modal on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    modal.classList.add("hidden")
  }
})

// ===== PREVENT SCROLL ON BODY WHEN MODAL IS OPEN =====
const observer = new MutationObserver(() => {
  if (!modal.classList.contains("hidden")) {
    document.body.style.overflow = "hidden"
  } else {
    document.body.style.overflow = "auto"
  }
})

observer.observe(modal, { attributes: true })

// ===== SCRATCH CARD FUNCTIONALITY =====
let scratchCanvas = null
let scratchContext = null
let isDrawing = false

function initScratchCard() {
  scratchCanvas = document.getElementById("scratchCanvas")
  scratchContext = scratchCanvas.getContext("2d")

  // Set canvas size
  const card = scratchCanvas.parentElement
  scratchCanvas.width = card.offsetWidth
  scratchCanvas.height = card.offsetHeight

  // Create scratch surface (pink gradient)
  const gradient = scratchContext.createLinearGradient(0, 0, scratchCanvas.width, scratchCanvas.height)
  gradient.addColorStop(0, "#ffb3d9")
  gradient.addColorStop(1, "#ff9bcb")
  scratchContext.fillStyle = gradient
  scratchContext.fillRect(0, 0, scratchCanvas.width, scratchCanvas.height)

  // Add text to scratch surface
  scratchContext.fillStyle = "rgba(255, 255, 255, 0.6)"
  scratchContext.font = 'bold 16px "Pangolin", cursive'
  scratchContext.textAlign = "center"
  scratchContext.textBaseline = "middle"
  scratchContext.fillText("Scratch Here!", scratchCanvas.width / 2, scratchCanvas.height / 2)

  // Add mouse events
  scratchCanvas.addEventListener("mousedown", startScratch)
  scratchCanvas.addEventListener("mousemove", scratch)
  scratchCanvas.addEventListener("mouseup", stopScratch)
  scratchCanvas.addEventListener("mouseleave", stopScratch)

  // Add touch events for mobile
  scratchCanvas.addEventListener("touchstart", startScratch)
  scratchCanvas.addEventListener("touchmove", scratch)
  scratchCanvas.addEventListener("touchend", stopScratch)
}

function startScratch(e) {
  isDrawing = true
  scratch(e)
}

function stopScratch() {
  isDrawing = false
}

function scratch(e) {
  if (!isDrawing) return

  // Get canvas position
  const rect = scratchCanvas.getBoundingClientRect()
  let x, y

  if (e.touches) {
    // Touch event
    x = e.touches[0].clientX - rect.left
    y = e.touches[0].clientY - rect.top
  } else {
    // Mouse event
    x = e.clientX - rect.left
    y = e.clientY - rect.top
  }

  // Scratch effect: erase canvas using destination-out
  scratchContext.globalCompositeOperation = "destination-out"
  scratchContext.beginPath()
  scratchContext.arc(x, y, 20, 0, Math.PI * 2)
  scratchContext.fill()

  // Check if enough area has been scratched (30%)
  checkScratchProgress()
}

function checkScratchProgress() {
  const imageData = scratchContext.getImageData(0, 0, scratchCanvas.width, scratchCanvas.height)
  const data = imageData.data
  let transparentPixels = 0

  // Count transparent pixels
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 128) {
      transparentPixels++
    }
  }

  const totalPixels = scratchCanvas.width * scratchCanvas.height
  const scratchPercentage = (transparentPixels / totalPixels) * 100

  // If 30% or more is scratched, fully reveal the message
  if (scratchPercentage > 30) {
    revealMessage()
  }
}

function revealMessage() {
  // Clear the canvas to reveal the message below
  scratchContext.clearRect(0, 0, scratchCanvas.width, scratchCanvas.height)

  // Remove event listeners
  scratchCanvas.removeEventListener("mousedown", startScratch)
  scratchCanvas.removeEventListener("mousemove", scratch)
  scratchCanvas.removeEventListener("mouseup", stopScratch)
  scratchCanvas.removeEventListener("mouseleave", stopScratch)
  scratchCanvas.removeEventListener("touchstart", startScratch)
  scratchCanvas.removeEventListener("touchmove", scratch)
  scratchCanvas.removeEventListener("touchend", stopScratch)

  scratchCanvas.style.opacity = "0"
  scratchCanvas.style.transition = "opacity 0.5s ease"
}
