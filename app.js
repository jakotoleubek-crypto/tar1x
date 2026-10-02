const $ = id => document.getElementById(id);
const LETTERS = ['A', 'B', 'C', 'D', 'E'];
let topic = null, qs = [], answers = [], idx = 0;

const shuffle = arr => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

function show(name) {
  ['home', 'quiz', 'result'].forEach(n => $(n).classList.toggle('hidden', n !== name));
  window.scrollTo({ top: 0 });
}

function buildMenu() {
  const ul = $('topicList');
  TOPICS.forEach(t => {
    const li = document.createElement('li');
    li.innerHTML = `<button data-id="${t.id}">${t.title}<small>${t.sub} · ${t.questions.length} сұрақ</small></button>`;
    li.firstChild.onclick = () => { startTopic(t.id); $('menu').classList.remove('open'); };
    ul.appendChild(li);
  });
}

function mark(id) {
  document.querySelectorAll('#topicList button').forEach(b => b.classList.toggle('active', b.dataset.id === id));
}

function startTopic(id) {
  topic = TOPICS.find(t => t.id === id);
  qs = shuffle(topic.questions).map(q => ({ q: q.q, a: q.a, opts: shuffle([q.a, ...q.w]) }));
  answers = new Array(qs.length).fill(null);
  idx = 0;
  mark(id);
  show('quiz');
  renderQ();
}

function renderQ() {
  const q = qs[idx], n = qs.length;
  const done = answers.filter(a => a !== null).length;
  $('quiz').innerHTML = `
  <div class="card">
    <div class="qhead"><h2>${topic.title}</h2><span>Сұрақ ${idx + 1} / ${n} · жауап берілді: ${done}</span></div>
    <div class="bar"><i style="width:${(idx + 1) / n * 100}%"></i></div>
    <p class="qtext">${q.q}</p>
    <div class="opts">${q.opts.map((o, i) =>
      `<button class="opt ${answers[idx] === i ? 'sel' : ''}" data-i="${i}"><b>${LETTERS[i]}</b><span>${o}</span></button>`).join('')}</div>
    <div class="grid">${qs.map((_, i) =>
      `<button data-go="${i}" class="${answers[i] !== null ? 'done' : ''} ${i === idx ? 'cur' : ''}" aria-label="Сұрақ ${i + 1}">${i + 1}</button>`).join('')}</div>
    <div class="nav">
      <button class="btn" id="prev" ${idx === 0 ? 'disabled' : ''}>Артқа</button>
      <button class="btn end" id="finish">Аяқтау</button>
      <button class="btn main" id="next" ${idx === n - 1 ? 'disabled' : ''}>Алға</button>
    </div>
  </div>`;
  document.querySelectorAll('.opt').forEach(b => b.onclick = () => { answers[idx] = +b.dataset.i; renderQ(); });
  document.querySelectorAll('[data-go]').forEach(b => b.onclick = () => { idx = +b.dataset.go; renderQ(); });
  $('prev').onclick = () => { idx--; renderQ(); };
  $('next').onclick = () => { idx++; renderQ(); };
  $('finish').onclick = finish;
}

function finish() {
  const left = answers.filter(a => a === null).length;
  if (left && !confirm(`Жауап берілмеген сұрақ: ${left}. Тестті аяқтайсыз ба?`)) return;
  const right = qs.filter((q, i) => answers[i] !== null && q.opts[answers[i]] === q.a).length;
  const pct = Math.round(right / qs.length * 100);
  const praise = pct >= 85 ? 'Тамаша! Тарихты жақсы білесіз.' : pct >= 60 ? 'Жақсы нәтиже. Қателерді қайталап шығыңыз.' : 'Тақырыпты қайта оқып, тағы бір рет тапсырып көріңіз.';
  $('result').innerHTML = `
  <div class="card">
    <h2>${topic.title}: нәтиже</h2>
    <div class="score">${right} / ${qs.length} (${pct}%)</div>
    <p>${praise}</p>
    <ul class="rev">${qs.map((q, i) => {
      const got = answers[i] === null ? null : q.opts[answers[i]];
      const ok = got === q.a;
      return `<li class="${ok ? 'ok' : ''}"><p><b>${i + 1}.</b> ${q.q}</p>` +
        (ok ? `<p class="right">✔ ${q.a}</p>` :
          `<p class="yours">Сіздің жауабыңыз: ${got ?? 'жауап берілмеген'}</p><p class="right">Дұрысы: ${q.a}</p>`) + '</li>';
    }).join('')}</ul>
    <div class="nav">
      <button class="btn" id="back">Тестке оралу</button>
      <button class="btn main" id="again">Қайта тапсыру</button>
    </div>
  </div>`;
  $('back').onclick = () => { show('quiz'); renderQ(); };
  $('again').onclick = () => startTopic(topic.id);
  show('result');
}

$('menuBtn').onclick = () => $('menu').classList.toggle('open');
$('homeLink').onclick = e => { e.preventDefault(); mark(null); show('home'); };
buildMenu();
