let events = JSON.parse(localStorage.getItem('nova_events') || '[]');
let regs = JSON.parse(localStorage.getItem('nova_regs') || '[]');
let hovers = JSON.parse(localStorage.getItem('nova_hovers') || '{}');
let totalHover = parseInt(localStorage.getItem('nova_hover_total') || '0');
const $ = id => document.getElementById(id);
const STU = 'STU001';
const todayISO = () => new Date().toISOString().split('T')[0];

if (events.length === 0) {
    events = [
        { id: 'EVT101', title: 'CodeStorm Hackathon 2026', date: '2026-11-15', venue: 'Main Auditorium', category: 'Technical', capacity: 120, desc: '24-hour national hackathon with FAANG mentors. Build, pitch, win 1L prize.', organizer: 'CSE Dept', time: '9:00 AM', allowCancel: true },
        { id: 'EVT102', title: 'Rhythm & Beats Cultural Fest', date: '2026-11-20', venue: 'Open Air Theatre', category: 'Cultural', capacity: 300, desc: 'Music, dance, drama. 50k cash prize. Celebrity judge.', organizer: 'Cultural Club', time: '5:00 PM', allowCancel: true },
        { id: 'EVT103', title: 'AI Workshop: Build Your Own LLM', date: '2026-11-18', venue: 'Lab 301', category: 'Workshop', capacity: 40, desc: 'Hands-on transformers, fine-tuning. Certificate + internship.', organizer: 'AI Cell', time: '10:00 AM', allowCancel: false },
        { id: 'EVT104', title: 'Inter-College Football Championship', date: '2026-11-25', venue: 'College Ground', category: 'Sports', capacity: 200, desc: '16 colleges knockout. Team or individual entry.', organizer: 'Sports Dept', time: '7:00 AM', allowCancel: true },
        { id: 'EVT105', title: 'Future of Startups Seminar', date: '2026-11-22', venue: 'Seminar Hall 2', category: 'Seminar', capacity: 150, desc: '3 unicorn founders share journey. Q&A + networking.', organizer: 'EDC', time: '2:00 PM', allowCancel: true },
        { id: 'EVT106', title: 'Photography Walk & Contest', date: '2026-12-02', venue: 'Campus Wide', category: 'Cultural', capacity: 60, desc: 'Theme: Campus Life. Exhibition + prizes.', organizer: 'Media Club', time: '6:30 AM', allowCancel: true }
    ];
    localStorage.setItem('nova_events', JSON.stringify(events));
}
function save() { localStorage.setItem('nova_events', JSON.stringify(events)); localStorage.setItem('nova_regs', JSON.stringify(regs)); localStorage.setItem('nova_hovers', JSON.stringify(hovers)); localStorage.setItem('nova_hover_total', totalHover); }
function getCount(id) { return regs.filter(r => r.eventId === id).length; }
function isReg(id) { return regs.some(r => r.eventId === id && r.studentId === STU); }
function isFull(ev) { return getCount(ev.id) >= ev.capacity; }

// Hover Tracking + Cursor
const tip = $('hoverTip'), cursor = $('cursor');
document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX - 4 + 'px'; cursor.style.top = e.clientY - 4 + 'px';
});
function trackHover(id, e) {
    hovers[id] = (hovers[id] || 0) + 1; totalHover++; save(); updateHover();
    const ev = events.find(x => x.id === id);
    tip.innerHTML = `<div class="font-bold text-[13px]">${ev.title}</div><div class="opacity-70 mt-1 text-[11px]">${ev.date} • ${ev.venue} • ${ev.category}</div><div class="mt-2 flex gap-2"><span class="bg-white/15 px-2.5 py-1 rounded-full text-[11px]">${getCount(id)}/${ev.capacity} • ${Math.round((getCount(id) / ev.capacity) * 100)}% filled</span><span class="bg-violet-500 px-2.5 py-1 rounded-full text-[11px]">${hovers[id]} hovers</span></div><div class="opacity-60 mt-2 text-[11px]">Glassy hover + 3D tilt active → Click for details</div>`;
    tip.style.left = (e.clientX + 16) + 'px'; tip.style.top = (e.clientY + 16) + 'px'; tip.classList.add('show');
    cursor.style.transform = 'scale(4)'; cursor.style.opacity = '0.15';
}
function hideHover() { tip.classList.remove('show'); cursor.style.transform = 'scale(1)'; cursor.style.opacity = '0.6'; }
function updateHover() {
    $('totalHover').textContent = totalHover;
    let most = Object.entries(hovers).sort((a, b) => b[1] - a[1])[0];
    $('mostHover').textContent = most ? `${events.find(x => x.id === most[0])?.title.slice(0, 20)}... (${most[1]})` : '--';
    $('liveHover').innerHTML = Object.entries(hovers).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([id, c]) => `<div class="flex justify-between"><span>• ${events.find(x => x.id === id)?.title.slice(0, 18)}</span><span class="font-bold">${c}x</span></div>`).join('') || '<div class="opacity-50">Hover on event cards</div>';
}

function setView(v) {
    $('vExplore').className = v === 'explore' ? 'nav-btn active' : 'nav-btn';
    $('vMy').className = v === 'my' ? 'nav-btn active' : 'nav-btn';
    $('grid').classList.toggle('hidden', v === 'my');
    $('myView').classList.toggle('hidden', v !== 'my');
    $('empty').classList.add('hidden');
    if (v === 'my') renderMy(); else render();
}

function render() {
    const q = $('search').value.toLowerCase().trim(), cat = $('catFilter').value, date = $('dateFilter').value;
    let filtered = events.filter(ev => {
        if (q && !(ev.title.toLowerCase().includes(q) || ev.venue.toLowerCase().includes(q) || ev.desc.toLowerCase().includes(q))) return false;
        if (cat && ev.category !== cat) return false;
        if (date && ev.date !== date) return false;
        return true;
    });
    const grid = $('grid'); grid.innerHTML = '';
    if (filtered.length === 0) { $('empty').classList.remove('hidden'); updateStats(); return; }
    $('empty').classList.add('hidden');

    filtered.forEach((ev, i) => {
        const count = getCount(ev.id), reg = isReg(ev.id), full = isFull(ev), perc = Math.round((count / ev.capacity) * 100);
        const card = document.createElement('div');
        card.className = `glass-card event-card rounded-[26px] p-5 cursor-pointer reveal`;
        card.style.animationDelay = `${i * 0.08}s`;
        card.onmouseenter = (e) => trackHover(ev.id, e);
        card.onmousemove = (e) => { tip.style.left = (e.clientX + 16) + 'px'; tip.style.top = (e.clientY + 16) + 'px'; card.style.transform = `perspective(800px) rotateX(${(e.clientY - card.getBoundingClientRect().top - 100) / 15}deg) rotateY(${-(e.clientX - card.getBoundingClientRect().left - 150) / 15}deg) translateY(-8px)`; };
        card.onmouseleave = () => { hideHover(); card.style.transform = ''; };
        card.onclick = () => openDetail(ev.id);
        card.innerHTML = `
  <div class="flex justify-between"><span class="text-[10px] font-bold tracking-[1px] px-2.5 py-1 rounded-full ${ev.category === 'Technical' ? 'bg-violet-500 text-white' : ev.category === 'Cultural' ? 'bg-pink-500 text-white' : 'bg-black text-white'}">${ev.category.toUpperCase()}</span><span class="text-[11px] opacity-60">👁 ${hovers[ev.id] || 0} hovers</span></div>
  <h3 class="font-black text-[17px] mt-3 leading-[1.15]" style="font-family:Syne">${ev.title}</h3>
  <p class="text-[12px] opacity-60 mt-2 line-clamp-2">${ev.desc}</p>
  <div class="mt-4 grid grid-cols-2 gap-2">
   <div class="bg-white/60 rounded-xl p-2.5 border border-white/50"><p class="text-[10px] opacity-60 font-bold">DATE • TIME</p><p class="text-[12px] font-semibold mt-1">${ev.date}<br>${ev.time}</p></div>
   <div class="bg-white/60 rounded-xl p-2.5 border border-white/50"><p class="text-[10px] opacity-60 font-bold">VENUE</p><p class="text-[12px] font-semibold mt-1">${ev.venue}</p></div>
  </div>
  <div class="mt-4"><div class="flex justify-between text-[11px] mb-1.5"><span class="opacity-60">Registrations: ${count}/${ev.capacity}</span><span class="font-bold">${perc}%</span></div><div class="progress"><div style="width:${perc}%"></div></div></div>
  <div class="mt-4 flex gap-2">
   ${reg ? '<div class="flex-1 py-2.5 bg-emerald-500 text-white rounded-full text-center text-[12px] font-bold animate-pulse">✓ Registered</div>' : full ? '<div class="flex-1 py-2.5 bg-red-500 text-white rounded-full text-center text-[12px] font-bold">FULL</div>' : `<button onclick="event.stopPropagation(); register('${ev.id}')" class="flex-1 py-2.5 bg-black text-white rounded-full text-[12px] font-bold hover:scale-[1.03] transition">Register Now →</button>`}
   <button onclick="event.stopPropagation(); openDetail('${ev.id}')" class="px-4 py-2.5 bg-white/70 border border-white/60 rounded-full text-[12px] font-bold">Details</button>
  </div>`;
        grid.appendChild(card);
    });
    updateStats();
}
function renderMy() {
    const myIds = regs.filter(r => r.studentId === STU).map(r => r.eventId);
    const myEvents = events.filter(ev => myIds.includes(ev.id));
    const grid = $('myGrid'); grid.innerHTML = '';
    if (myEvents.length === 0) { grid.innerHTML = '<div class="col-span-3 glass-card rounded-[20px] p-12 text-center reveal">No registrations yet<br><span class="text-[13px] opacity-60">Hover and register from Explore</span></div>'; return; }
    myEvents.forEach(ev => {
        const div = document.createElement('div');
        div.className = 'glass-card rounded-[24px] p-5 hover-tilt reveal';
        div.onmouseenter = (e) => trackHover(ev.id, e); div.onmousemove = (e) => { tip.style.left = (e.clientX + 16) + 'px'; tip.style.top = (e.clientY + 16) + 'px'; }; div.onmouseleave = hideHover;
        div.innerHTML = `<h3 class="font-bold" style="font-family:Syne">${ev.title}</h3><p class="text-[11px] opacity-60 mt-1">${ev.date} • ${ev.venue}</p><div class="mt-4 flex gap-2">${ev.allowCancel ? `<button onclick="cancelReg('${ev.id}')" class="flex-1 py-2.5 bg-red-500 text-white rounded-full text-[12px] font-bold">Cancel</button>` : '<span class="flex-1 py-2.5 bg-gray-200 text-gray-500 rounded-full text-center text-[12px]">Non-cancellable</span>'}<button onclick="openDetail('${ev.id}')" class="px-4 py-2.5 bg-white/70 border border-white/60 rounded-full text-[12px]">Details</button></div>`;
        grid.appendChild(div);
    });
}
function register(id) {
    const ev = events.find(x => x.id === id);
    if (isReg(id)) { alert('Already registered! Duplicate prevented.'); return; }
    if (isFull(ev)) { alert('Event is full! Capacity validated.'); return; }
    regs.push({ eventId: id, studentId: STU, date: todayISO() }); save(); render(); renderMy();
    // micro animation
    const badge = $('myBadge'); badge.style.transform = 'scale(1.5)'; setTimeout(() => badge.style.transform = 'scale(1)', 200);
}
function cancelReg(id) {
    const ev = events.find(x => x.id === id);
    if (!ev.allowCancel) { alert('Cancellation not allowed'); return; }
    if (!confirm(`Cancel ${ev.title}?`)) return;
    regs = regs.filter(r => !(r.eventId === id && r.studentId === STU)); save(); render(); renderMy(); updateStats();
}
function openDetail(id) {
    const ev = events.find(x => x.id === id), count = getCount(id), reg = isReg(id), full = isFull(ev);
    $('detailBody').innerHTML = `
 <div class="flex justify-between"><span class="text-[10px] font-bold tracking-[1px] px-3 py-1 rounded-full bg-black text-white">${ev.category}</span><button onclick="closeDetail()" class="w-8 h-8 rounded-full bg-black/5">✕</button></div>
 <h2 class="font-black text-[28px] mt-4 leading-[1.1]" style="font-family:Syne">${ev.title}</h2>
 <p class="text-[13px] opacity-70 mt-3 leading-[1.5]">${ev.desc}</p>
 <div class="mt-6 grid grid-cols-2 gap-3">
  <div class="bg-white/60 border border-white/60 rounded-2xl p-4"><p class="text-[10px] font-bold opacity-60 tracking-[1px]">DATE & TIME</p><p class="font-bold mt-1">${ev.date}</p><p class="text-[12px] opacity-60">${ev.time}</p></div>
  <div class="bg-white/60 border border-white/60 rounded-2xl p-4"><p class="text-[10px] font-bold opacity-60 tracking-[1px]">VENUE & ORGANIZER</p><p class="font-bold mt-1">${ev.venue}</p><p class="text-[12px] opacity-60">${ev.organizer}</p></div>
  <div class="bg-white/60 border border-white/60 rounded-2xl p-4"><p class="text-[10px] font-bold opacity-60 tracking-[1px]">CAPACITY STATUS</p><p class="font-bold mt-1">${count} / ${ev.capacity}</p><div class="progress mt-2"><div style="width:${Math.round((count / ev.capacity) * 100)}%"></div></div></div>
  <div class="bg-white/60 border border-white/60 rounded-2xl p-4"><p class="text-[10px] font-bold opacity-60 tracking-[1px]">HOVER TRACKING</p><p class="font-bold mt-1">${hovers[id] || 0} hovers on this card</p><p class="text-[12px] opacity-60">${totalHover} total • Most hovered tracked</p></div>
 </div>
 <div class="mt-6">
  ${reg ? '<div class="w-full py-3.5 bg-emerald-500 text-white rounded-full text-center font-bold">✓ You are registered - Duplicate prevented</div>' : full ? '<div class="w-full py-3.5 bg-red-500 text-white rounded-full text-center font-bold">Event Full - Registration Blocked by Capacity Validation</div>' : `<button onclick="register('${id}'); closeDetail();" class="w-full py-3.5 bg-black text-white rounded-full font-bold hover:scale-[1.02] transition">Register Now</button>`}
  <p class="text-[11px] opacity-50 text-center mt-3">LocalStorage • Registration counts • Glassmorphism • Animations • Hover Tracking</p>
 </div>`;
    $('detail').classList.remove('hidden');
}
function closeDetail() { $('detail').classList.add('hidden'); }
function clearFilters() { $('search').value = ''; $('catFilter').value = ''; $('dateFilter').value = ''; render(); }
function updateStats() {
    $('statTotal').textContent = events.length;
    $('statRegs').textContent = regs.length;
    $('statMy').textContent = regs.filter(r => r.studentId === STU).length;
    $('myBadge').textContent = regs.filter(r => r.studentId === STU).length;
    $('statFull').textContent = events.filter(ev => getCount(ev.id) >= ev.capacity).length;
}
$('search').addEventListener('input', render);
$('catFilter').addEventListener('change', render);
$('dateFilter').addEventListener('change', render);
render();
updateHover();