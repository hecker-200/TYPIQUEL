const txt = document.getElementById('text-display');
const input = document.getElementById('ipt');
let text = "";  // will be set from array
const final = document.getElementById('final');

/* -----------------------------------------
   700-SENTENCE ARRAY (sample 20 included)
   You will paste all 700 here later
------------------------------------------ */
let sentences = [
  "The sun dipped behind the mountains as the sky turned orange.",
  "He opened the old diary and found a faded picture inside.",
  "Success is the sum of small efforts repeated daily.",
  "Courage is not the absence of fear but the mastery of it.",
  "Dreams don’t work unless you do.",
  "The wind carried the scent of rain across the quiet fields.",
  "She stared at the blinking cursor, unsure how to begin.",
  "Technology moves fast, but curiosity moves faster.",
  "He picked up the guitar and played his favorite tune.",
  "The room fell silent when the lights suddenly went out.",
  "The stars above shimmered like scattered diamonds.",
  "Confidence is built, not gifted.",
  "Challenge your limits before life challenges you.",
  "Small steps every day become giant leaps over time.",
  "He laughed at the joke even though he didn’t understand it.",
  "Her eyes sparkled with a story she never told.",
  "Every moment is a fresh beginning.",
  "The coffee smelled stronger than his motivation.",
  "Learning to code opens the door to infinite possibilities.",
  "She whispered a promise into the cold night air."
];

// pick random sentence
function getNewSentence() {
  return sentences[Math.floor(Math.random() * sentences.length)];
}

// Try to fetch meaningful random sentences from Quotable (fallback to local sample)
async function loadSentences(count = 30) {
  const api = `https://api.quotable.io/quotes?limit=${count}`;
  try {
    const resp = await fetch(api);
    if (!resp.ok) throw new Error('Network response not ok');
    const data = await resp.json();
    if (data && Array.isArray(data.results) && data.results.length > 0) {
      // map to content strings and filter very short entries
      const fetched = data.results
        .map(r => (r && r.content) ? r.content.trim() : '')
        .filter(s => s.length > 20 && s.length < 240);
      if (fetched.length) {
        sentences = fetched;
        console.info(`Loaded ${fetched.length} sentences from Quotable`);
        return;
      }
    }
    console.warn('Quotable returned no usable sentences, using fallback samples.');
  } catch (err) {
    console.warn('Failed to load sentences from API, using fallback samples.', err);
  }
}

// initialize text with typewriter intro
function animateSentence(sentence, cb){
  txt.classList.add('typewriter');
  txt.innerText = '';
  input.disabled = true;
  let i = 0;
  const speed = 24; // ms per char
  const typer = setInterval(() => {
    // append as HTML and convert spaces to non-breaking spaces so they appear during animation
    const ch = sentence.charAt(i) === ' ' ? '&nbsp;' : sentence.charAt(i);
    txt.innerHTML += ch;
    i++;
    if(i >= sentence.length){
      clearInterval(typer);
      // remove typewriter caret after short delay
      setTimeout(()=>{
        txt.classList.remove('typewriter');
        if(cb) cb();
        input.disabled = false;
        input.focus();
      }, 220);
    }
  }, speed);
}

// Load sentences from API, then start the game. If fetching fails, fallback samples are used.
loadSentences(50).then(() => {
  text = getNewSentence();
  animateSentence(text);
}).catch(() => {
  text = getNewSentence();
  animateSentence(text);
});

/* ----------------------------------------- */

let startTime = null;
let timer = false;

// Accuracy tracking variables
let totalTyped = 0;   
let mistakes = 0;     

// persistent per-index mistake tracking: once an index is marked wrong,
// it contributes to final mistakes even if corrected later
let wrongMarked = [];
let persistentMistakes = 0;
let prevTyped = "";


input.addEventListener('input', function(event){
  const typed = input.value;
  let displayHTML = '';

  if (event.inputType !== "deleteContentBackward") {
    totalTyped++;
  }

  if(!timer){
    start();
    timer = true;
  } 

  for(let i = 0; i < text.length; i++){
    if(i < typed.length){

      // escape HTML special chars and preserve spaces as &nbsp;
      const ch = text[i] === ' ' ? '&nbsp;' : text[i]
      if(typed[i] === text[i]){
        displayHTML += `<span class="correct">${ch}</span>`;
      }
      else{
        displayHTML += `<span class="wrong">${ch}</span>`;
      }

    } else {
      const ch = text[i] === ' ' ? '&nbsp;' : text[i]
      displayHTML += `<span class="pending">${ch}</span>`;
    }
  }

  txt.innerHTML = displayHTML;
  // Recalculate stats based on current typed input
  const result = check();

  // --- Persistent mistake tracking ---
  // initialize wrongMarked on first use / new sentence
  if (!Array.isArray(wrongMarked) || wrongMarked.length !== text.length) {
    wrongMarked = new Array(text.length).fill(false);
    persistentMistakes = 0;
  }

  // Detect changes between prevTyped and current typed to find newly entered characters
  if (typed.length > prevTyped.length) {
    // insertion(s) occurred
    let firstDiff = typed.length - 1;
    for (let i = 0; i < prevTyped.length; i++) {
      if (prevTyped[i] !== typed[i]) { firstDiff = i; break; }
    }
    for (let j = firstDiff; j < typed.length; j++) {
      if (j >= text.length) break; // ignore overflow
      if (typed[j] !== text[j] && !wrongMarked[j]) {
        wrongMarked[j] = true;
        persistentMistakes++;
      }
    }
  } else if (typed.length === prevTyped.length) {
    // possible replacement (e.g., paste or overwrite)
    for (let i = 0; i < typed.length; i++) {
      if (prevTyped[i] !== typed[i]) {
        if (i >= text.length) continue;
        if (typed[i] !== text[i] && !wrongMarked[i]) {
          wrongMarked[i] = true;
          persistentMistakes++;
        }
      }
    }
  } else {
    // deletion/backspace -> do not reduce persistentMistakes or unmark indices
    // nothing to do here
  }

  // update prevTyped for next input event
  prevTyped = typed;

  // compute current (visible) mistakes that are not already counted in persistentMistakes
  let currentUnmarkedMistakes = 0;
  for (let i = 0; i < typed.length; i++) {
    if (i >= text.length) break;
    if (typed[i] !== text[i] && !wrongMarked[i]) {
      currentUnmarkedMistakes++;
    }
  }
  const currentTyped = typed.length;

  if(result !== null){
    const time = (result / 1000);
    // total unique mistakes = persistent mistakes + any current unmarked mistakes
    const totalMistakes = persistentMistakes + currentUnmarkedMistakes;
    const correctChars = Math.max(0, text.length - totalMistakes);
    const words = correctChars / 5;
    const minutes = time / 60;
    const WPM = minutes > 0 ? words / minutes : 0;
    // accuracy based on total mistakes relative to total characters typed for the sentence
    const accuracy = text.length > 0 ? ((text.length - totalMistakes) / text.length) * 100 : 100;

    final.innerText = `Speed: ${WPM.toFixed()} WPM | Accuracy: ${accuracy.toFixed(2)}%`;

    reset();
    return;
  }
});

function start(){
  startTime = Date.now();
}

function check(){
  const typed = input.value;

  if(typed.length === text.length){
    return Date.now() - startTime;
  }
  return null;
}

function reset() {
  input.value = "";
  timer = false;
  startTime = null;

  // RESET counters
  totalTyped = 0;
  mistakes = 0;
  // reset persistent mistake tracking
  wrongMarked = new Array(text.length).fill(false);
  persistentMistakes = 0;
  prevTyped = "";
    // keep `final.innerText` visible so user can see WPM/accuracy until next action

  // NEW SENTENCE
  text = getNewSentence();
  // animate next sentence
  animateSentence(text);
}
