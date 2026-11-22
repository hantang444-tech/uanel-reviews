(function(){
  if (window.__uanRv) return; window.__uanRv = 1;
  var me = document.currentScript;
  var BASE = window.UANEL_REVIEW_BASE || (me && me.src ? me.src.replace(/[^/]*$/, '') : '');
  var A = 'https://assets6.cre.ma/p/uanel-imweb-me/', V = 'https://d2q2zwuq6juvrx.cloudfront.net/uanel.imweb.me/';
  var STAR_P = 'M12 2.5l2.9 6.2 6.6.7-5 4.5 1.4 6.6L12 17.2l-5.9 3.3 1.4-6.6-5-4.5 6.6-.7z';
  function star(c, s){ return '<svg viewBox="0 0 24 24" width="' + (s || 18) + '" height="' + (s || 18) + '"><path fill="' + c + '" d="' + STAR_P + '"/></svg>'; }
  function stars(n, s){ var h = ''; for (var k = 1; k <= 5; k++) h += star(k <= n ? '#14161a' : '#e1e4e8', s); return h; }
  var INFO = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#bcc2cc"><circle cx="6" cy="6" r="5.5"/><path d="M6 5.2v3.3M6 3.4v.1" stroke-linecap="round"/></svg>';
  var THUMB = '<svg viewBox="0 0 24 24"><path d="M7 10v11H3V10zM7 10l4-8c1.7 0 3 1.3 3 3v4h5.5a2 2 0 012 2.3l-1.4 8A2 2 0 0118.1 21H7"/></svg>';
  var THUMB_D = '<svg viewBox="0 0 24 24" style="transform:scaleY(-1)"><path d="M7 10v11H3V10zM7 10l4-8c1.7 0 3 1.3 3 3v4h5.5a2 2 0 012 2.3l-1.4 8A2 2 0 0118.1 21H7"/></svg>';
  var CMT = '<svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z"/></svg>';
  var LABEL = {5:'아주 좋아요', 4:'맘에 들어요', 3:'보통이에요', 2:'그냥 그래요', 1:'별로예요'};
  function u(p){ return !p ? '' : p.indexOf('A/') === 0 ? A + p.slice(2) : p.indexOf('V/') === 0 ? V + p.slice(2) : p; }
  function gal(p){ var s = u(p), i = s.lastIndexOf('/'); return s.slice(0, i + 1) + 'gallery_' + s.slice(i + 1); }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  var cache = {};
  function getJSON(f){ if (!cache[f]) cache[f] = fetch(BASE + f).then(function(r){ if (!r.ok) throw new Error(f + ' ' + r.status); return r.json(); }).catch(function(e){ delete cache[f]; throw e; }); return cache[f]; }
  function chunk(n){ return getJSON('c' + ('00' + n).slice(-3) + '.json'); }
  var base = null;
  function load(){ if (!base) base = Promise.all([getJSON('meta.json'), getJSON('idx.json'), getJSON('prod.json')]).then(function(x){
    var byId = {}; x[1].forEach(function(r){ byId[r[0]] = r; });
    return {meta:x[0], idx:x[1], prod:x[2], byId:byId};
  }); return base; }
  // idx row: [id, score, prodCode, yyyymmdd, likes, media(0/1/2), aiRank(-1), chunk, pos]
  function fetchRows(rows){
    var need = {}; rows.forEach(function(r){ need[r[7]] = 1; });
    return Promise.all(Object.keys(need).map(function(n){ return chunk(+n).then(function(c){ return [n, c]; }); })).then(function(res){
      var map = {}; res.forEach(function(x){ map[x[0]] = x[1]; });
      return rows.map(function(r){ return map[r[7]][r[8]]; });
    });
  }
  function aiCmp(a, b){ return (a[6] < 0) - (b[6] < 0) || (a[6] >= 0 ? a[6] - b[6] : 0) || (b[5] > 0) - (a[5] > 0) || b[4] - a[4] || b[3] - a[3] || b[0] - a[0]; }
  function mediaItems(v){ return (v.v || []).map(function(x){ return {v:u(x[0] || x[1]), p:u(x[2]), pv:u(x[3] || x[1])}; }).concat((v.i || []).map(function(x){ return {i:u(x[0]), g:gal(x[0])}; })); }

  // ---------- lightbox ----------
  var lb, cur = [], at = 0;
  function lbInit(){
    if (lb) return; lb = document.getElementById('uan-rv-lb');
    if (!lb){ lb = document.createElement('div'); lb.id = 'uan-rv-lb'; lb.setAttribute('role','dialog'); lb.setAttribute('aria-modal','true');
      lb.innerHTML = '<div class="st"></div><button type="button" class="x" aria-label="닫기">×</button><button type="button" class="pv" aria-label="이전">‹</button><button type="button" class="nx" aria-label="다음">›</button><div class="ct"></div>';
      document.body.appendChild(lb); }
    lb.addEventListener('click', function(e){ if (e.target === lb || e.target.closest('.x')) close(); else if (e.target.closest('.pv')) step(-1); else if (e.target.closest('.nx')) step(1); });
    document.addEventListener('keydown', function(e){ if (!lb.classList.contains('on')) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') step(-1); if (e.key === 'ArrowRight') step(1); });
  }
  function show(){ var x = cur[at]; lb.querySelector('.st').innerHTML = x.v ? '<video src="' + esc(x.v) + '" poster="' + esc(x.p) + '" controls autoplay playsinline></video>' : '<img src="' + esc(x.i) + '" alt="">'; lb.querySelector('.ct').textContent = (at + 1) + ' / ' + cur.length; lb.querySelector('.pv').style.display = lb.querySelector('.nx').style.display = cur.length > 1 ? '' : 'none'; }
  function step(d){ at = (at + cur.length + d) % cur.length; show(); }
  function open(items, s){ lbInit(); if (!items.length) return; cur = items; at = s || 0; show(); lb.classList.add('on'); }
  function close(){ lb.classList.remove('on'); lb.querySelector('.st').innerHTML = ''; }
  function openReview(id, k){ load().then(function(D){ var r = D.byId[id]; if (!r) return; fetchRows([r]).then(function(vs){ var v = vs[0], items = mediaItems(v), s = 0;
    if (k){ s = k[0] === 'v' ? +k.slice(1) : (v.v || []).length + +k.slice(1); } open(items, s); }); }); }
  function thumbs(v, size){
    return (v.v || []).map(function(x, j){ return '<button type="button" class="t" data-id="' + v.id + '" data-k="v' + j + '"><video src="' + esc(u(x[3] || x[1])) + '" poster="' + esc(u(x[2])) + '" muted loop playsinline autoplay preload="metadata"></video><span class="play"></span></button>'; })
      .concat((v.i || []).map(function(x, j){ return '<button type="button" class="t" data-id="' + v.id + '" data-k="i' + j + '"><img src="' + esc(gal(x[0])) + '" alt="" loading="lazy"></button>'; })).join('');
  }
  function firstThumb(v){
    if (v.v && v.v.length){ var x = v.v[0]; return '<video src="' + esc(u(x[3] || x[1])) + '" poster="' + esc(u(x[2])) + '" muted loop playsinline autoplay preload="metadata"></video><span class="play"></span>'; }
    if (v.i && v.i.length) return '<img src="' + esc(gal(v.i[0][0])) + '" alt="" loading="lazy">';
    return '';
  }

  // ---------- list ----------
  function mountList(root){
    if (root.dataset.ready) return; root.dataset.ready = '1'; root.classList.add('uan-rv');
    var fixed = root.getAttribute('data-product') || '';
    if (fixed === 'auto'){ var mm = location.search.match(/[?&]idx=(\d+)/); fixed = mm ? mm[1] : ''; if (fixed !== '10' && fixed !== '13'){ (root.closest('[doz_type=widget]') || root).style.display = 'none'; return; } }
    var product = !!fixed;
    if (product) root.classList.add('pm');
    root.innerHTML = (product ? '<div class="rv-title">REVIEW<span class="op">' + INFO + '리뷰 운영방식</span></div><div class="rv-sum"></div><div class="rv-strip"></div>' : '<div class="rv-title">REVIEW</div>')
      + '<div class="rv-bar"><div class="rv-sort">' + (product ? '<button type="button" class="ai on" data-sort="ai">AI 추천순</button><button type="button" class="star" data-sort="score">별점순</button><select class="rv-sel" aria-label="리뷰 정렬"><option value="ai">AI 추천순</option><option value="score">별점순</option></select>' : '<button type="button" class="star" data-sort="score">별점순</button><button type="button" class="ai on" data-sort="ai">AI 추천순</button>') + '</div>'
      + '<button type="button" class="rv-media"><i></i>포토/동영상 먼저 보기</button>'
      + '<label class="rv-search"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#bcc2cc" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><span class="lbl">검색</span><input type="search" placeholder="리뷰 키워드 검색" enterkeyhint="search"></label></div>'
      + (product ? '' : '<div class="rv-cat"><select aria-label="카테고리"><option value="">카테고리: 전체</option><option value="10">카테고리: 풋 케어</option><option value="13">카테고리: 네일·핸드 케어</option></select></div>')
      + '<div class="rv-list"><div class="rv-empty">리뷰를 불러오는 중입니다.</div></div><div class="rv-pg"></div>';
    var PER = product ? 5 : 20, D, state = {sort:'ai', media:false, cat:fixed, q:'', page:1, hit:null}, rank = {}, pinned = {};
    function view(){
      var rows = D.idx.filter(function(r){ return (!state.cat || String(r[2]) === state.cat) && (!state.hit || state.hit[r[0]]); });
      var cmp = product ? function(a, b){ var ra = rank[a[0]], rb = rank[b[0]]; return (ra == null) - (rb == null) || (ra != null ? ra - rb : 0) || aiCmp(a, b); } : aiCmp;
      rows.sort(state.sort === 'score' ? function(a, b){ return b[1] - a[1] || cmp(a, b); } : cmp);
      if (state.media) rows = rows.filter(function(r){ return r[5]; }).concat(rows.filter(function(r){ return !r[5]; }));
      return rows;
    }
    function render(){
      var rows = view(), pages = Math.max(1, Math.ceil(rows.length / PER)); if (state.page > pages) state.page = pages;
      var slice = rows.slice((state.page - 1) * PER, state.page * PER), list = root.querySelector('.rv-list');
      if (!slice.length){ list.innerHTML = '<div class="rv-empty">' + (state.q ? '검색 결과가 없습니다.' : '등록된 리뷰가 없습니다.') + '</div>'; pager(pages); return; }
      fetchRows(slice).then(function(vs){ list.innerHTML = vs.map(item).join(''); pager(pages); })
        .catch(function(){ list.innerHTML = '<div class="rv-empty">리뷰를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</div>'; });
    }
    function item(v){
      if (product) return pitem(v);
      var p = D.meta.products[v.p] || {}, d = String(v.d), media = thumbs(v);
      var grade = esc(D.meta.grades[v.g] || D.meta.grades.def), name = esc(v.n), date = d.slice(0,4) + '.' + d.slice(4,6) + '.' + d.slice(6,8);
      var long = (v.m || '').length > 40 || /\n/.test(v.m || '');
      return '<div class="rv-item"><div class="rv-main">'
        + '<a class="rv-prod" href="' + esc(p.url) + '"><img src="' + esc(p.img) + '" alt=""><div style="min-width:0"><div class="nm">' + esc(p.name) + '</div><div class="mt">' + star('#14161a', 14) + '<b>' + esc(p.score) + '</b> 리뷰 ' + Number(p.count || 0).toLocaleString() + '</div></div></a>'
        + '<div class="rv-who"><b>' + name + '</b>작성자 등급 ' + grade + '</div>'
        + '<div class="rv-body">'
        + '<div class="rv-stars" aria-label="별점 ' + v.s + '점">' + stars(v.s) + '</div>'
        + '<div class="rv-msg' + (long ? ' clamp' : '') + '">' + esc(v.m) + '</div>'
        + (long ? '<button type="button" class="rv-more">리뷰 더보기</button>' : '')
        + (media ? '<div class="rv-thumbs">' + media + '</div>' : '')
        + '<div class="rv-like"><span><svg viewBox="0 0 24 24"><path d="M7 10v11H3V10zM7 10l4-8c1.7 0 3 1.3 3 3v4h5.5a2 2 0 012 2.3l-1.4 8A2 2 0 0118.1 21H7"/></svg>도움돼요 ' + (v.l ? '<b>' + v.l + '</b>' : '') + '</span><span class="cm">댓글 <b>' + (v.c || 0) + '</b></span><span style="margin-left:auto">' + date + '</span></div></div>'
        + '</div><div class="rv-side"><b>' + name + '</b><span>작성자 등급</span> <em>' + grade + '</em></div></div>';
    }
    function pitem(v){
      var media = thumbs(v), grade = esc(D.meta.grades[v.g] || D.meta.grades.def), name = esc(v.n);
      var long = (v.m || '').length > 60 || ((v.m || '').match(/\n/g) || []).length > 1;
      var who = '<b>' + name + '</b><span class="g"><span>작성자 등급</span> ' + grade + '</span>';
      return '<div class="rv-item"><div class="rv-main">'
        + (pinned[v.id] ? '<span class="rv-tag">쇼핑몰 추천</span>' : '')
        + '<div class="rv-who">' + who + '</div>'
        + '<div class="rv-stars" aria-label="별점 ' + v.s + '점">' + stars(v.s, 16) + '</div>'
        + '<div class="rv-msg' + (long ? ' clamp' : '') + '">' + esc(v.m) + '</div>'
        + (long ? '<button type="button" class="rv-more">리뷰 더보기</button>' : '')
        + (media ? '<div class="rv-thumbs">' + media + '</div>' : '')
        + '<div class="rv-like"><span>' + THUMB + '도움돼요' + (v.l ? ' <b>' + v.l + '</b>' : '') + '</span><span>' + THUMB_D + '도움안돼요</span><span>' + CMT + '댓글 <b>' + (v.c || 0) + '</b></span></div>'
        + '</div><div class="rv-side">' + who + '</div></div>';
    }
    function pager(pages){
      var G = product && window.innerWidth < 768 ? 4 : 5, g = Math.floor((state.page - 1) / G) * G, h = '<button type="button" data-p="' + Math.max(1, g) + '"' + (g ? '' : ' disabled') + '>‹</button>';
      for (var i = g + 1; i <= Math.min(pages, g + G); i++) h += '<button type="button" data-p="' + i + '"' + (i === state.page ? ' class="on"' : '') + '>' + i + '</button>';
      h += '<button type="button" data-p="' + (g + G + 1) + '"' + (g + G < pages ? '' : ' disabled') + '>›</button>';
      root.querySelector('.rv-pg').innerHTML = pages > 1 ? h : '';
    }
    function go(p, noScroll){ state.page = p; render(); if (!noScroll) window.scrollTo(0, root.getBoundingClientRect().top + window.pageYOffset - 80); }
    function summary(){
      var P = D.prod[fixed] || {}, meta = D.meta.products[fixed] || {}, dist = P.dist || [0,0,0,0,0], tot = dist.reduce(function(a, b){ return a + b; }, 0) || 1;
      var bars = [5,4,3,2,1].map(function(s, i){ return '<li' + (i === 0 ? ' class="top"' : '') + '><span class="l">' + LABEL[s] + '</span><span class="b"><i style="width:' + (dist[i] / tot * 100).toFixed(1) + '%"></i></span><span class="n">' + dist[i] + '</span></li>'; }).join('');
      root.querySelector('.rv-sum').innerHTML = '<div class="avg"><div class="sc">' + star('#14161a', 40) + '<b>' + esc(meta.score) + '</b></div><p class="pct">' + (P.pct || 0) + '%가 <b>아주 좋아요</b> 라고 평가했습니다.</p><p class="cnt">리뷰 ' + Number(meta.count || 0).toLocaleString() + '개</p></div><i class="dv"></i><ul class="dist">' + bars + '</ul>';
      var ids = (P.gal || []).map(function(x){ return D.byId[x[0]]; }).filter(Boolean).slice(0, 20);
      fetchRows(ids).then(function(vs){
        root.querySelector('.rv-strip').innerHTML = '<div class="hd"><b>포토&amp;동영상</b><button type="button" class="all">전체보기 ›</button></div><div class="row">'
          + vs.map(function(v, i){ return '<button type="button" class="t" data-id="' + v.id + '">' + firstThumb(v) + (i === vs.length - 1 ? '<span class="more">전체보기</span>' : '') + '</button>'; }).join('') + '</div>';
      });
    }
    load().then(function(x){
      D = x;
      if (product){ (D.prod[fixed] && D.prod[fixed].lst || []).forEach(function(p, i){ rank[p[0]] = i; if (p[1]) pinned[p[0]] = 1; }); summary(); }
      render();
    }).catch(function(){ root.querySelector('.rv-list').innerHTML = '<div class="rv-empty">리뷰를 불러오지 못했습니다.</div>'; });
    root.querySelector('.rv-pg').addEventListener('click', function(e){ var b = e.target.closest('button'); if (b && !b.disabled) go(+b.dataset.p); });
    root.querySelector('.rv-sort').addEventListener('click', function(e){ var b = e.target.closest('button'); if (!b) return; state.sort = b.dataset.sort; root.querySelectorAll('.rv-sort button').forEach(function(x){ x.classList.toggle('on', x === b); }); go(1); });
    var rs = root.querySelector('.rv-sel'); if (rs) rs.addEventListener('change', function(){ state.sort = rs.value; root.querySelectorAll('.rv-sort button').forEach(function(x){ x.classList.toggle('on', x.dataset.sort === rs.value); }); go(1); });
    var mb = root.querySelector('.rv-media');
    function setMedia(on){ state.media = on; mb.classList.toggle('on', on); }
    mb.addEventListener('click', function(){ setMedia(!state.media); go(1); });
    var sel = root.querySelector('.rv-cat select'); if (sel) sel.addEventListener('change', function(){ state.cat = sel.value; go(1); });
    var box = root.querySelector('.rv-search'), inp = box.querySelector('input');
    box.addEventListener('click', function(){ box.classList.add('open'); inp.focus(); });
    inp.addEventListener('keydown', function(e){ if (e.key !== 'Enter') return; e.preventDefault(); search(inp.value.trim()); });
    inp.addEventListener('search', function(){ if (!inp.value) search(''); });
    function search(q){
      state.q = q; if (!q){ state.hit = null; go(1); return; }
      root.querySelector('.rv-list').innerHTML = '<div class="rv-empty">검색 중입니다.</div>'; root.querySelector('.rv-pg').innerHTML = '';
      var all = []; for (var n = 0; n < D.meta.chunks; n++) all.push(chunk(n));
      Promise.all(all).then(function(cs){ var hit = {}, k = q.toLowerCase(); cs.forEach(function(c){ c.forEach(function(v){ if ((v.m || '').toLowerCase().indexOf(k) > -1) hit[v.id] = 1; }); }); state.hit = hit; go(1); });
    }
    root.addEventListener('click', function(e){
      var m = e.target.closest('.rv-more');
      if (m){ var msg = m.previousElementSibling; msg.classList.toggle('clamp'); m.textContent = msg.classList.contains('clamp') ? '리뷰 더보기' : '접기'; return; }
      if (e.target.closest('.rv-strip .all') || e.target.closest('.rv-strip .more')){ setMedia(true); go(1); return; }
      var t = e.target.closest('.t'); if (t){ openReview(+t.dataset.id, t.dataset.k); }
    });
  }

  var MEDIA_IC = '<svg class="mi" width="20" height="20" viewBox="0 0 20 20" fill="none"><g stroke="#fff" stroke-linejoin="round" style="filter:drop-shadow(1px 1px 1px rgba(0,0,0,.4))"><rect x="4.625" y="6.625" width="8.75" height="8.75" rx=".775" fill="#fff" stroke-width="1.25"/><path d="M8.421 4h5.053A2.526 2.526 0 0116 6.526v5.053" stroke-width="1.263" stroke-linecap="round"/></g></svg>';
  function galThumb(v){
    var n = (v.v || []).length + (v.i || []).length, h;
    if (v.v && v.v.length){ var x = v.v[0]; h = '<video src="' + esc(u(x[3] || x[1])) + '" poster="' + esc(u(x[2])) + '" muted loop playsinline autoplay preload="metadata"></video>'; }
    else h = v.i && v.i.length ? '<img src="' + esc(gal(v.i[0][0])) + '" alt="" loading="lazy">' : '';
    return h + (n > 1 ? MEDIA_IC : v.v && v.v.length ? '<span class="play"></span>' : '');
  }
  // ---------- gallery (product page) ----------
  function mountGallery(root, pc, per){
    if (root.dataset.ready) return; root.dataset.ready = '1'; root.classList.add('uan-rv-gal');
    root.innerHTML = '<div class="op">' + INFO + '리뷰 운영방식</div><div class="cards"></div><div class="rv-pg"></div>';
    var page = 1, list = [];
    function render(){
      var pages = Math.ceil(list.length / per), slice = list.slice((page - 1) * per, page * per);
      fetchRows(slice.map(function(x){ return x.r; })).then(function(vs){
        root.querySelector('.cards').innerHTML = vs.map(function(v, i){ return '<button type="button" class="card" data-id="' + v.id + '"><span class="ph">' + galThumb(v) + '</span><span class="tx">' + esc(v.m) + '</span><span class="st">' + stars(v.s, 14) + '</span><span class="nm">' + esc(v.n) + '</span>' + (slice[i].pin ? '<span class="rv-pin">쇼핑몰 추천</span>' : '') + '</button>'; }).join('');
      });
      var G = per < 8 ? 4 : 5, g = Math.floor((page - 1) / G) * G, h = '<button type="button" data-p="' + Math.max(1, g) + '"' + (g ? '' : ' disabled') + '>‹</button>';
      for (var i = g + 1; i <= Math.min(pages, g + G); i++) h += '<button type="button" data-p="' + i + '"' + (i === page ? ' class="on"' : '') + '>' + i + '</button>';
      h += '<button type="button" data-p="' + (g + G + 1) + '"' + (g + G < pages ? '' : ' disabled') + '>›</button>';
      root.querySelector('.rv-pg').innerHTML = pages > 1 ? h : '';
    }
    load().then(function(D){ list = ((D.prod[pc] || {}).gal || []).map(function(x){ return {r:D.byId[x[0]], pin:x[1]}; }).filter(function(x){ return x.r; }); render(); });
    root.addEventListener('click', function(e){ var b = e.target.closest('.rv-pg button'); if (b && !b.disabled){ page = +b.dataset.p; render(); return; } var c = e.target.closest('.card'); if (c) openReview(+c.dataset.id); });
  }

  // ---------- option box (product page, PC) ----------
  function mountOptions(root, pc){
    if (root.dataset.ready) return; root.dataset.ready = '1'; root.classList.add('uan-rv-opt');
    load().then(function(D){
      var P = D.prod[pc] || {}, rows = (P.opt || []).map(function(id){ return D.byId[id]; }).filter(Boolean), at = 0;
      root.innerHTML = '<div class="hd"><b>구매옵션별 리뷰 모아보기</b><span>' + INFO + '리뷰 운영방식</span></div><select aria-label="구매옵션"><option>전체 ' + esc(P.optTitle || '상품 구성(선택)') + '</option>' + (P.optNames || []).map(function(n){ return '<option>' + esc(n) + '</option>'; }).join('') + '</select><div class="bd"></div><div class="nav"><button type="button" class="p" aria-label="이전">‹</button><span class="c"></span><button type="button" class="n" aria-label="다음">›</button></div>';
      fetchRows(rows).then(function(vs){
        function show(){ var v = vs[at]; if (!v) return; root.querySelector('.bd').innerHTML = '<button type="button" class="ph" data-id="' + v.id + '">' + firstThumb(v) + '</button><div class="tx"><div class="st">' + stars(v.s, 14) + '<b>' + LABEL[v.s] + '</b></div><p>' + esc(v.m) + '</p></div>'; root.querySelector('.c').textContent = (at + 1) + '/' + vs.length; }
        root.querySelector('.p').onclick = function(){ at = (at + vs.length - 1) % vs.length; show(); };
        root.querySelector('.n').onclick = function(){ at = (at + 1) % vs.length; show(); };
        root.querySelector('.bd').onclick = function(e){ var b = e.target.closest('.ph'); if (b) openReview(+b.dataset.id); };
        show();
      });
    });
  }

  // ---------- horizontal scroll (home) ----------
  function mountHS(root){
    if (root.dataset.ready) return; root.dataset.ready = '1'; root.classList.add('uan-rv-hs');
    var pc = root.getAttribute('data-product'), N = +(root.getAttribute('data-count') || 6);
    root.innerHTML = '<div class="op">' + INFO + '리뷰 운영방식</div><div class="nav"><button type="button" class="p" aria-label="이전">‹</button><span class="c"></span><button type="button" class="n" aria-label="다음">›</button></div><div class="vp"><div class="row"></div></div>';
    var row = root.querySelector('.row'), page = 0, pages = 1;
    function per(){ return window.innerWidth < 768 ? 0 : 3; }
    function paint(){ var k = per(); if (!k){ row.style.transform = ''; return; } pages = Math.max(1, Math.ceil(row.children.length / k)); if (page >= pages) page = pages - 1; row.style.transform = 'translateX(calc(' + (-page * 100) + '% - ' + (page * 20) + 'px))'; root.querySelector('.c').textContent = (page + 1) + '/' + pages; }
    load().then(function(D){
      var list = ((D.prod[pc] || {}).gal || []).slice(0, N).map(function(x){ return {r:D.byId[x[0]], pin:x[1]}; }).filter(function(x){ return x.r; });
      fetchRows(list.map(function(x){ return x.r; })).then(function(vs){
        row.innerHTML = vs.map(function(v, i){ return '<button type="button" class="card" data-id="' + v.id + '"><span class="ph">' + galThumb(v) + '</span><span class="tx">' + esc(v.m) + '</span><span class="st">' + stars(v.s, 14) + '</span><span class="nm">' + esc(v.n) + '</span>' + (list[i].pin ? '<span class="rv-pin">쇼핑몰 추천</span>' : '') + '</button>'; }).join('');
        paint();
      });
    });
    root.querySelector('.p').onclick = function(){ page = (page + pages - 1) % pages; paint(); };
    root.querySelector('.n').onclick = function(){ page = (page + 1) % pages; paint(); };
    window.addEventListener('resize', paint);
    row.addEventListener('click', function(e){ var c = e.target.closest('.card'); if (c) openReview(+c.dataset.id); });
  }

  // ---------- product page wiring ----------
  function productPage(){
    var mm = location.search.match(/[?&]idx=(\d+)/), pc = mm && mm[1];
    if (pc !== '10' && pc !== '13') return;
    if (!document.querySelector('#prod_goods_form')) return;
    load().then(function(D){
      var cnt = Number((D.meta.products[pc] || {}).count || 0).toLocaleString();
      document.querySelectorAll('._review_count_text').forEach(function(b){ b.textContent = cnt; });
      document.querySelectorAll('a._review .braket-badge, a._review .badge').forEach(function(b){ if (!b.querySelector('.crema-product-reviews-count')) b.innerHTML = '<span class="crema-product-reviews-count">' + cnt + '</span>'; });
    });
    var form = document.querySelector('#prod_goods_form');
    // option box: same slot as main (_external_widget_button_pc_position: after .opt-group, before .buy_btns.holder.pc)
    var pcBtns = form && form.querySelector(':scope > .buy_btns.holder.pc');
    if (pcBtns && !document.querySelector('.uan-rv-opt-wrap')){ var o = document.createElement('div'); o.className = 'uan-rv-opt-wrap'; pcBtns.parentNode.insertBefore(o, pcBtns); var oi = document.createElement('div'); o.appendChild(oi); mountOptions(oi, pc); }
    // PC gallery: after .row.goods_wrapper (main: _external_widget_tap_pc_position)
    var gw = document.querySelector('#prod_detail .row.goods_wrapper');
    if (gw && !document.querySelector('.uan-rv-gal.pc')){ var g1 = document.createElement('div'); g1.className = 'pc'; gw.parentNode.insertBefore(g1, gw.nextSibling); mountGallery(g1, pc, 8); }
    // mobile gallery: after ._today_arrival_wrap, before .categorize-mobile._categorize_mobile (main: _external_widget_tap_mo_position)
    var cm = form && form.querySelector(':scope > .categorize-mobile._categorize_mobile');
    if (cm && !document.querySelector('.uan-rv-gal.mo')){ var g2 = document.createElement('div'); g2.className = 'mo'; cm.parentNode.insertBefore(g2, cm); mountGallery(g2, pc, 3); }
    // PC review tab: main keeps only the crema list inside #first_review._detail_review_wrap
    var pw = document.querySelector('.categorize.review-box #first_review._detail_review_wrap, #first_review._detail_review_wrap');
    if (pw && !pw.querySelector('.uan-rv-host')){
      [].forEach.call(pw.children, function(c){ if (!c.classList.contains('_prod_detail_tab_target')) c.style.display = 'none'; });
      var d1 = document.createElement('div'); d1.className = 'uan-rv-host pc'; d1.setAttribute('data-product', pc); pw.appendChild(d1); mountList(d1);
    }
    // mobile review tab: main keeps only the crema list inside .detail_review_wrap_mobile
    var mw = document.querySelector('.detail_review_wrap_mobile');
    if (mw && !mw.querySelector('.uan-rv-host')){
      [].forEach.call(mw.children, function(c){ if (!c.classList.contains('_prod_detail_tab_target')) c.style.display = 'none'; });
      var d2 = document.createElement('div'); d2.className = 'uan-rv-host mo'; d2.setAttribute('data-product', pc); mw.appendChild(d2); mountList(d2);
    }
  }

  function boot(){
    var r = document.getElementById('uan-rv'); if (r) mountList(r);
    document.querySelectorAll('.uan-rv[data-product]').forEach(function(x){ mountList(x); });
    document.querySelectorAll('.uan-rv-hs-host[data-product]').forEach(function(x){ mountHS(x); });
    productPage();
  }
  var tries = 0;
  (function wait(){ if (document.getElementById('uan-rv') || document.querySelector('#prod_goods_form') || document.querySelector('.uan-rv-hs-host') || tries > 40) boot(); else { tries++; setTimeout(wait, 250); } })();
})();
