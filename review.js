(function(){
  var me = document.currentScript, BASE = window.UANEL_REVIEW_BASE || (me && me.src ? me.src.replace(/[^/]*$/, '') : '');
  var tries = 0;
  (function wait(){ var r = document.getElementById('uan-rv'); if (r) start(r); else if (tries++ < 60) setTimeout(wait, 250); })();
  function start(root){
  if (root.dataset.ready) return; root.dataset.ready = '1';
  root.innerHTML = "<div class=\"rv-title\">REVIEW</div>\n  <div class=\"rv-bar\">\n    <div class=\"rv-sort\"><button type=\"button\" class=\"star\" data-sort=\"score\">\ubcc4\uc810\uc21c</button><button type=\"button\" class=\"ai on\" data-sort=\"ai\">AI \ucd94\ucc9c\uc21c</button></div>\n    <button type=\"button\" class=\"rv-media\"><i></i>\ud3ec\ud1a0/\ub3d9\uc601\uc0c1 \uba3c\uc800 \ubcf4\uae30</button>\n    <label class=\"rv-search\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#bcc2cc\" stroke-width=\"2\"><circle cx=\"11\" cy=\"11\" r=\"7\"/><path d=\"M20 20l-4-4\"/></svg><span class=\"lbl\">\uac80\uc0c9</span><input type=\"search\" placeholder=\"\ub9ac\ubdf0 \ud0a4\uc6cc\ub4dc \uac80\uc0c9\" enterkeyhint=\"search\"></label>\n  </div>\n  <div class=\"rv-cat\"><select aria-label=\"\uce74\ud14c\uace0\ub9ac\"><option value=\"\">\uce74\ud14c\uace0\ub9ac: \uc804\uccb4</option><option value=\"10\">\uce74\ud14c\uace0\ub9ac: \ud48b \ucf00\uc5b4</option><option value=\"13\">\uce74\ud14c\uace0\ub9ac: \ub124\uc77c\u00b7\ud578\ub4dc \ucf00\uc5b4</option></select></div>\n  <div class=\"rv-list\"><div class=\"rv-empty\">\ub9ac\ubdf0\ub97c \ubd88\ub7ec\uc624\ub294 \uc911\uc785\ub2c8\ub2e4.</div></div>\n  <div class=\"rv-pg\"></div>";
  var lb = document.getElementById('uan-rv-lb');
  if (!lb){ lb = document.createElement('div'); lb.id = 'uan-rv-lb'; lb.setAttribute('role','dialog'); lb.setAttribute('aria-modal','true'); lb.innerHTML = "<div class=\"st\"></div><button type=\"button\" class=\"x\" aria-label=\"\ub2eb\uae30\">\u00d7</button><button type=\"button\" class=\"pv\" aria-label=\"\uc774\uc804\">\u2039</button><button type=\"button\" class=\"nx\" aria-label=\"\ub2e4\uc74c\">\u203a</button><div class=\"ct\"></div>"; document.body.appendChild(lb); }
  var fixed = root.getAttribute('data-product') || '';
  if (fixed === 'auto'){ var mm = location.search.match(/[?&]idx=(\d+)/); fixed = mm ? mm[1] : ''; if (fixed !== '10' && fixed !== '13'){ var wrap = root.closest('[doz_type=widget]') || root; wrap.style.display = 'none'; return; } }
  var PER = 20, A = 'https://assets6.cre.ma/p/uanel-imweb-me/', V = 'https://d2q2zwuq6juvrx.cloudfront.net/uanel.imweb.me/';
  var meta, idx, chunks = {}, state = {sort:'ai', media:false, cat:fixed, q:'', page:1};
  var STAR = '<svg viewBox="0 0 24 24"><path fill="#14161a" d="M12 2.5l2.9 6.2 6.6.7-5 4.5 1.4 6.6L12 17.2l-5.9 3.3 1.4-6.6-5-4.5 6.6-.7z"/></svg>';
  var STAR0 = STAR.replace('#14161a', '#e1e4e8');
  function u(p){ return !p ? '' : p.indexOf('A/') === 0 ? A + p.slice(2) : p.indexOf('V/') === 0 ? V + p.slice(2) : p; }
  function gal(p){ var s = u(p), i = s.lastIndexOf('/'); return s.slice(0, i + 1) + 'gallery_' + s.slice(i + 1); }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function getJSON(f){ return fetch(BASE + f).then(function(r){ if (!r.ok) throw new Error(f + ' ' + r.status); return r.json(); }); }
  function chunk(n){ if (!chunks[n]) chunks[n] = getJSON('c' + ('00' + n).slice(-3) + '.json').catch(function(e){ delete chunks[n]; throw e; }); return chunks[n]; }
  // idx row: [id, score, prodCode, yyyymmdd, likes, media(0 none,1 photo,2 video), aiRank(-1 none), chunk, pos]
  function view(){
    var rows = idx.filter(function(r){ return (!state.cat || String(r[2]) === state.cat) && (!state.hit || state.hit[r[0]]); });
    var ai = function(a, b){ return (a[6] < 0) - (b[6] < 0) || (a[6] >= 0 ? a[6] - b[6] : 0) || (b[5] > 0) - (a[5] > 0) || b[4] - a[4] || b[3] - a[3] || b[0] - a[0]; };
    rows.sort(state.sort === 'score' ? function(a, b){ return b[1] - a[1] || ai(a, b); } : ai);
    if (state.media) rows = rows.filter(function(r){ return r[5]; }).concat(rows.filter(function(r){ return !r[5]; }));
    return rows;
  }
  function render(){
    var rows = view(), pages = Math.max(1, Math.ceil(rows.length / PER));
    if (state.page > pages) state.page = pages;
    var slice = rows.slice((state.page - 1) * PER, state.page * PER), list = root.querySelector('.rv-list');
    if (!slice.length){ list.innerHTML = '<div class="rv-empty">' + (state.q ? '검색 결과가 없습니다.' : '등록된 리뷰가 없습니다.') + '</div>'; pager(pages); return; }
    var need = {}; slice.forEach(function(r){ need[r[7]] = 1; });
    Promise.all(Object.keys(need).map(function(n){ return chunk(+n).then(function(c){ return [n, c]; }); })).then(function(res){
      var map = {}; res.forEach(function(x){ map[x[0]] = x[1]; });
      list.innerHTML = slice.map(function(r){ return item(map[r[7]][r[8]]); }).join('');
      pager(pages);
    }).catch(function(){ list.innerHTML = '<div class="rv-empty">리뷰를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</div>'; });
  }
  function item(v){
    var p = meta.products[v.p] || {}, st = '', k, d = String(v.d);
    for (k = 1; k <= 5; k++) st += k <= v.s ? STAR : STAR0;
    var media = (v.v || []).map(function(x, j){ return '<button type="button" class="t" data-id="' + v.id + '" data-k="v' + j + '"><video src="' + esc(u(x[3] || x[1])) + '" poster="' + esc(u(x[2])) + '" muted loop playsinline autoplay preload="metadata"></video><span class="play"></span></button>'; })
      .concat((v.i || []).map(function(x, j){ return '<button type="button" class="t" data-id="' + v.id + '" data-k="i' + j + '"><img src="' + esc(gal(x[0])) + '" alt="" loading="lazy"></button>'; })).join('');
    var grade = esc(meta.grades[v.g] || meta.grades.def), name = esc(v.n), date = d.slice(0,4) + '.' + d.slice(4,6) + '.' + d.slice(6,8);
    var long = (v.m || '').length > 40 || /\n/.test(v.m || '');
    return '<div class="rv-item"><div class="rv-main">'
      + '<a class="rv-prod" href="' + esc(p.url) + '"><img src="' + esc(p.img) + '" alt=""><div style="min-width:0"><div class="nm">' + esc(p.name) + '</div><div class="mt"><svg width="14" height="14" viewBox="0 0 24 24" style="vertical-align:-2px"><path fill="#14161a" d="M12 2.5l2.9 6.2 6.6.7-5 4.5 1.4 6.6L12 17.2l-5.9 3.3 1.4-6.6-5-4.5 6.6-.7z"/></svg><b>' + esc(p.score) + '</b> 리뷰 ' + Number(p.count || 0).toLocaleString() + '</div></div></a>'
      + '<div class="rv-who"><b>' + name + '</b>작성자 등급 ' + grade + '</div>'
      + '<div class="rv-body"><div class="rv-stars" aria-label="별점 ' + v.s + '점">' + st + '</div>'
      + '<div class="rv-msg' + (long ? ' clamp' : '') + '">' + esc(v.m) + '</div>'
      + (long ? '<button type="button" class="rv-more">리뷰 더보기</button>' : '')
      + (media ? '<div class="rv-thumbs">' + media + '</div>' : '')
      + '<div class="rv-like"><span><svg viewBox="0 0 24 24"><path d="M7 10v11H3V10zM7 10l4-8c1.7 0 3 1.3 3 3v4h5.5a2 2 0 012 2.3l-1.4 8A2 2 0 0118.1 21H7"/></svg>도움돼요 ' + (v.l ? '<b>' + v.l + '</b>' : '') + '</span><span class="cm">댓글 <b>' + (v.c || 0) + '</b></span><span style="margin-left:auto">' + date + '</span></div></div>'
      + '</div><div class="rv-side"><b>' + name + '</b><span>작성자 등급</span> <em>' + grade + '</em></div></div>';
  }
  function pager(pages){
    var pg = root.querySelector('.rv-pg'), g = Math.floor((state.page - 1) / 5) * 5, h = '';
    h += '<button type="button" data-p="' + Math.max(1, g) + '"' + (g ? '' : ' disabled') + '>‹</button>';
    for (var i = g + 1; i <= Math.min(pages, g + 5); i++) h += '<button type="button" data-p="' + i + '"' + (i === state.page ? ' class="on"' : '') + '>' + i + '</button>';
    h += '<button type="button" data-p="' + (g + 6) + '"' + (g + 5 < pages ? '' : ' disabled') + '>›</button>';
    pg.innerHTML = pages > 1 ? h : '';
  }
  function go(p){ state.page = p; render(); var t = root.getBoundingClientRect().top + window.pageYOffset - 80; window.scrollTo(0, t); }
  root.querySelector('.rv-pg').addEventListener('click', function(e){ var b = e.target.closest('button'); if (b && !b.disabled) go(+b.dataset.p); });
  root.querySelector('.rv-sort').addEventListener('click', function(e){ var b = e.target.closest('button'); if (!b) return; state.sort = b.dataset.sort; root.querySelectorAll('.rv-sort button').forEach(function(x){ x.classList.toggle('on', x === b); }); go(1); });
  root.querySelector('.rv-media').addEventListener('click', function(){ state.media = !state.media; this.classList.toggle('on', state.media); go(1); });
  var sel = root.querySelector('.rv-cat select');
  if (fixed){ root.querySelector('.rv-cat').style.display = 'none'; } else sel.addEventListener('change', function(){ state.cat = sel.value; go(1); });
  var box = root.querySelector('.rv-search'), inp = box.querySelector('input');
  box.addEventListener('click', function(){ box.classList.add('open'); inp.focus(); });
  inp.addEventListener('keydown', function(e){ if (e.key !== 'Enter') return; e.preventDefault(); search(inp.value.trim()); });
  inp.addEventListener('search', function(){ if (!inp.value) search(''); });
  function search(q){
    state.q = q; if (!q){ state.hit = null; go(1); return; }
    root.querySelector('.rv-list').innerHTML = '<div class="rv-empty">검색 중입니다.</div>'; root.querySelector('.rv-pg').innerHTML = '';
    var all = []; for (var n = 0; n < meta.chunks; n++) all.push(chunk(n));
    Promise.all(all).then(function(cs){ var hit = {}, k = q.toLowerCase(); cs.forEach(function(c){ c.forEach(function(v){ if ((v.m || '').toLowerCase().indexOf(k) > -1) hit[v.id] = 1; }); }); state.hit = hit; go(1); });
  }
  root.querySelector('.rv-list').addEventListener('click', function(e){
    var m = e.target.closest('.rv-more');
    if (m){ var msg = m.previousElementSibling; msg.classList.toggle('clamp'); m.textContent = msg.classList.contains('clamp') ? '리뷰 더보기' : '접기'; return; }
    var t = e.target.closest('.t'); if (!t) return;
    var row = idx.find(function(r){ return r[0] === +t.dataset.id; });
    chunk(row[7]).then(function(c){ var v = c[row[8]], items = (v.v || []).map(function(x){ return {v:u(x[0] || x[1]), p:u(x[2])}; }).concat((v.i || []).map(function(x){ return {i:u(x[0])}; }));
      var k = t.dataset.k, start = k[0] === 'v' ? +k.slice(1) : (v.v || []).length + +k.slice(1); open(items, start); });
  });
  var cur = [], at = 0;
  function show(){ var x = cur[at]; lb.querySelector('.st').innerHTML = x.v ? '<video src="' + esc(x.v) + '" poster="' + esc(x.p) + '" controls autoplay playsinline></video>' : '<img src="' + esc(x.i) + '" alt="">'; lb.querySelector('.ct').textContent = (at + 1) + ' / ' + cur.length; lb.querySelector('.pv').style.display = lb.querySelector('.nx').style.display = cur.length > 1 ? '' : 'none'; }
  function open(items, s){ cur = items; at = s; show(); lb.classList.add('on'); }
  function close(){ lb.classList.remove('on'); lb.querySelector('.st').innerHTML = ''; }
  lb.addEventListener('click', function(e){ if (e.target === lb || e.target.closest('.x')) close(); else if (e.target.closest('.pv')){ at = (at + cur.length - 1) % cur.length; show(); } else if (e.target.closest('.nx')){ at = (at + 1) % cur.length; show(); } });
  document.addEventListener('keydown', function(e){ if (!lb.classList.contains('on')) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft'){ at = (at + cur.length - 1) % cur.length; show(); } if (e.key === 'ArrowRight'){ at = (at + 1) % cur.length; show(); } });
  Promise.all([getJSON('meta.json'), getJSON('idx.json')]).then(function(x){ meta = x[0]; idx = x[1]; render(); })
    .catch(function(){ root.querySelector('.rv-list').innerHTML = '<div class="rv-empty">리뷰를 불러오지 못했습니다.</div>'; });
  }
})();
