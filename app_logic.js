// অনুশীলন (ONUSHILON) - Complete Client Application Logic
(function() {
  'use strict';

  // State Store
  const APP_STORAGE_KEY = 'onushilon_app_data_v1';
  const ACTIVE_PRACTICE_KEY = 'onushilon_active_practice';
  const ACTIVE_EXAM_KEY = 'onushilon_active_exam';

  let state = {
    banks: window.EMBEDDED_QUESTION_BANKS || [],
    bookmarks: {},
    wrongQuestions: {},
    practiceHistory: [],
    examHistory: [],
    settings: {
      theme: 'system',
      questionFontSize: 'medium', // small (16px), medium (18px), large (22px)
      defaultPracticeMode: 'instant', // 'instant' or 'submit'
      defaultQuestionCount: 20,
      defaultExamDuration: 15, // minutes
      negativeMarking: false,
      negativePerWrong: 0.25,
      soundEnabled: true,
      focusMode: false
    }
  };

  let activePractice = null;
  let activeExam = null;
  let examTimerInterval = null;
  let practiceTimerInterval = null;
  let lastExamResult = null;

  // Sound Synthesizer via Web Audio API (Zero external dependencies)
  function playAudioChime(isCorrect) {
    if (!state.settings.soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (isCorrect) {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.25);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch (e) {
      // Audio not permitted or supported
    }
  }

  // Load from LocalStorage
  function loadState() {
    try {
      const saved = localStorage.getItem(APP_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.settings) state.settings = { ...state.settings, ...parsed.settings };
        if (parsed.bookmarks) state.bookmarks = parsed.bookmarks;
        if (parsed.wrongQuestions) state.wrongQuestions = parsed.wrongQuestions;
        if (parsed.practiceHistory) state.practiceHistory = parsed.practiceHistory;
        if (parsed.examHistory) state.examHistory = parsed.examHistory;
        if (parsed.customBanks && Array.isArray(parsed.customBanks)) {
          // Merge custom imported banks with embedded banks
          const embeddedIds = (window.EMBEDDED_QUESTION_BANKS || []).map(b => b.bankId);
          state.banks = [...(window.EMBEDDED_QUESTION_BANKS || [])];
          parsed.customBanks.forEach(cb => {
            if (!embeddedIds.includes(cb.bankId)) {
              state.banks.push(cb);
            }
          });
        }
      }
    } catch (e) {
      console.warn("Storage load error:", e);
    }
  }

  // Save to LocalStorage
  function saveState() {
    try {
      const embeddedIds = (window.EMBEDDED_QUESTION_BANKS || []).map(b => b.bankId);
      const customBanks = state.banks.filter(b => !embeddedIds.includes(b.bankId));
      const payload = {
        version: "1.0",
        settings: state.settings,
        bookmarks: state.bookmarks,
        wrongQuestions: state.wrongQuestions,
        practiceHistory: state.practiceHistory,
        examHistory: state.examHistory,
        customBanks: customBanks
      };
      localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn("Storage save error:", e);
    }
  }

  // UI Toast
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    let icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    if (type === 'success') {
      icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
    } else if (type === 'danger') {
      icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
    }
    toast.innerHTML = `${icon} <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // Theme Manager
  function applyTheme(themeName) {
    state.settings.theme = themeName;
    saveState();
    let effective = themeName;
    if (themeName === 'system') {
      effective = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', effective);
    const toggleIcon = document.getElementById('theme-toggle-icon');
    if (toggleIcon) {
      toggleIcon.innerHTML = effective === 'dark' 
        ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
        : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
    }
  }

  function applyFontSize(size) {
    state.settings.questionFontSize = size;
    saveState();
    const map = { small: '16px', medium: '18px', large: '22px' };
    document.documentElement.style.setProperty('--q-font-size', map[size] || '18px');
  }

  // Navigation Controller
  function navigateTo(viewId) {
    // If leaving active exam without submitting, confirm
    if (activeExam && !activeExam.isSubmitted && viewId !== 'exam') {
      if (!confirm("আপনার পরীক্ষাটি চলমান রয়েছে! অন্য পাতায় গেলে পরীক্ষার সময় বন্ধ হবে না। আপনি কি নিশ্চিত?")) {
        return;
      }
    }

    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

    const targetView = document.getElementById(`view-${viewId}`);
    if (targetView) targetView.classList.add('active');

    const targetNav = document.querySelector(`.nav-item[data-view="${viewId}"]`);
    if (targetNav) targetNav.classList.add('active');

    // Close mobile drawer if open
    document.getElementById('sidebar')?.classList.remove('open');

    // Refresh view data
    if (viewId === 'dashboard') renderDashboard();
    else if (viewId === 'banks') renderBanksView();
    else if (viewId === 'revision') renderRevisionView();
    else if (viewId === 'bookmarks') renderBookmarksView();
    else if (viewId === 'analytics') renderAnalyticsView();
    else if (viewId === 'backup') renderBackupView();
    else if (viewId === 'settings') renderSettingsView();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Focus Mode
  function toggleFocusMode() {
    state.settings.focusMode = !state.settings.focusMode;
    saveState();
    const sidebar = document.getElementById('sidebar');
    const header = document.getElementById('app-header');
    const mainWrapper = document.getElementById('main-wrapper');
    if (state.settings.focusMode) {
      if (sidebar) sidebar.style.display = 'none';
      if (mainWrapper) mainWrapper.style.marginLeft = '0';
      showToast("ফোকাস মোড চালু হয়েছে", "info");
    } else {
      if (sidebar) sidebar.style.display = 'flex';
      if (mainWrapper) mainWrapper.style.marginLeft = '';
      showToast("ফোকাস মোড বন্ধ হয়েছে", "info");
    }
  }

  // Bengali Number Formatter
  function toBengaliNum(num) {
    if (num === null || num === undefined) return '';
    const bDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/[0-9]/g, d => bDigits[d]);
  }

  // Statistics Calculation
  function calculateStats() {
    let totalQuestions = 0;
    state.banks.forEach(b => { totalQuestions += b.questions.length; });

    let attemptedIds = new Set();
    let totalCorrect = 0;
    let totalWrong = 0;

    state.practiceHistory.forEach(h => {
      totalCorrect += (h.correct || 0);
      totalWrong += (h.wrong || 0);
      if (h.answeredIds) h.answeredIds.forEach(id => attemptedIds.add(id));
    });

    state.examHistory.forEach(h => {
      totalCorrect += (h.correct || 0);
      totalWrong += (h.wrong || 0);
      if (h.answeredIds) h.answeredIds.forEach(id => attemptedIds.add(id));
    });

    const totalAnswered = totalCorrect + totalWrong;
    const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

    let bestExamPercentage = 0;
    state.examHistory.forEach(h => {
      if (h.percentage > bestExamPercentage) bestExamPercentage = h.percentage;
    });

    return {
      totalBanks: state.banks.length,
      totalQuestions: totalQuestions,
      attemptedCount: attemptedIds.size,
      totalAnswered: totalAnswered,
      totalCorrect: totalCorrect,
      totalWrong: totalWrong,
      accuracy: accuracy,
      practiceSessions: state.practiceHistory.length,
      examsCompleted: state.examHistory.length,
      bestExamPercentage: bestExamPercentage
    };
  }

  // Dashboard Renderer
  function renderDashboard() {
    const stats = calculateStats();
    
    document.getElementById('dash-stat-banks').textContent = toBengaliNum(stats.totalBanks);
    document.getElementById('dash-stat-total-q').textContent = toBengaliNum(stats.totalQuestions);
    document.getElementById('dash-stat-attempted').textContent = toBengaliNum(stats.attemptedCount);
    document.getElementById('dash-stat-accuracy').textContent = `${toBengaliNum(stats.accuracy)}%`;
    document.getElementById('dash-stat-exams').textContent = toBengaliNum(stats.examsCompleted);
    document.getElementById('dash-stat-best-score').textContent = `${toBengaliNum(stats.bestExamPercentage)}%`;

    // Render Recent Sessions
    const recentContainer = document.getElementById('dash-recent-list');
    if (!recentContainer) return;

    const allSessions = [];
    state.practiceHistory.forEach(p => allSessions.push({ ...p, type: 'practice' }));
    state.examHistory.forEach(e => allSessions.push({ ...e, type: 'exam' }));
    allSessions.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    if (allSessions.length === 0) {
      recentContainer.innerHTML = `
        <div style="text-align:center; padding: 32px 16px; color: var(--text-muted);">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 10px; display:block;">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>এখনো কোনো অনুশীলন বা পরীক্ষার রেকর্ড নেই।</p>
          <button class="btn btn-primary" onclick="window.OnushilonApp.openPracticeSetup()" style="margin-top: 12px;">প্রথম অনুশীলন শুরু করুন</button>
        </div>
      `;
    } else {
      let html = '<div style="display:flex; flex-direction:column; gap:10px;">';
      allSessions.slice(0, 5).forEach(s => {
        const isExam = s.type === 'exam';
        const dateStr = new Date(s.timestamp).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' });
        const bank = state.banks.find(b => b.bankId === s.bankId);
        const bankName = bank ? bank.title : 'সাধারণ প্রশ্ন ব্যাংক';
        html += `
          <div style="display:flex; align-items:center; justify-content:space-between; padding:12px 16px; background:var(--bg-subtle); border-radius:var(--radius-sm); border:1px solid var(--border);">
            <div style="display:flex; align-items:center; gap:12px;">
              <span style="padding:4px 8px; border-radius:6px; font-size:0.75rem; font-weight:700; ${isExam ? 'background:var(--accent-light); color:var(--accent);' : 'background:var(--primary-light); color:var(--primary);'}">
                ${isExam ? 'মডেল টেস্ট পরীক্ষা' : 'অনুশীলন'}
              </span>
              <div>
                <strong style="font-size:0.95rem; color:var(--text-primary);">${bankName}</strong>
                <span style="font-size:0.8rem; color:var(--text-muted); display:block;">${dateStr} • ${toBengaliNum(s.total)}টি প্রশ্ন</span>
              </div>
            </div>
            <div style="text-align:right;">
              <span style="font-size:1.05rem; font-weight:800; color:var(--success);">
                ${isExam ? `${toBengaliNum(s.score)}/${toBengaliNum(s.maxScore)}` : `${toBengaliNum(s.correct)}টি সঠিক`}
              </span>
              <span style="font-size:0.78rem; color:var(--text-muted); display:block;">${toBengaliNum(s.percentage)}% নির্ভুল</span>
            </div>
          </div>
        `;
      });
      html += '</div>';
      recentContainer.innerHTML = html;
    }

    // Render Bank Cards on Dashboard
    renderBankCards('dash-bank-grid', 3);
  }

  // Question Banks Cards Renderer
  function renderBankCards(containerId, limit = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let list = state.banks;
    if (limit) list = list.slice(0, limit);

    let html = '';
    list.forEach(bank => {
      // Calculate bank specific accuracy
      let bCorrect = 0, bWrong = 0;
      state.practiceHistory.filter(h => h.bankId === bank.bankId).forEach(h => {
        bCorrect += (h.correct || 0);
        bWrong += (h.wrong || 0);
      });
      state.examHistory.filter(h => h.bankId === bank.bankId).forEach(h => {
        bCorrect += (h.correct || 0);
        bWrong += (h.wrong || 0);
      });
      const bTotal = bCorrect + bWrong;
      const bAccuracy = bTotal > 0 ? Math.round((bCorrect / bTotal) * 100) : 0;

      html += `
        <div class="card bank-card">
          <div class="bank-card-header">
            <span class="bank-badge">বাংলা ১ম পত্র</span>
            <span style="font-size:0.75rem; color:var(--success); font-weight:700;">✓ ১০০% যাচাইকৃত</span>
          </div>
          <h3 class="bank-title">${bank.title}</h3>
          <p class="bank-author">${bank.author || 'এইচএসসি পাঠ্যবই'}</p>
          <div class="bank-metrics">
            <div>
              <div class="metric-val">${toBengaliNum(bank.questions.length)}</div>
              <div class="metric-lbl">মোট প্রশ্ন</div>
            </div>
            <div>
              <div class="metric-val">${toBengaliNum(bTotal)}</div>
              <div class="metric-lbl">অনুশীলিত</div>
            </div>
            <div>
              <div class="metric-val">${toBengaliNum(bAccuracy)}%</div>
              <div class="metric-lbl">নির্ভুলতা</div>
            </div>
          </div>
          <div class="bank-actions">
            <button class="btn btn-primary" onclick="window.OnushilonApp.startPracticeForBank('${bank.bankId}')" style="flex:1;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              অনুশীলন
            </button>
            <button class="btn btn-accent" onclick="window.OnushilonApp.startExamForBank('${bank.bankId}')" style="flex:1;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              পরীক্ষা
            </button>
            <button class="btn btn-secondary" onclick="window.OnushilonApp.openBankDetails('${bank.bankId}')" title="প্রশ্ন তালিকা দেখুন">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  function renderBanksView() {
    renderBankCards('all-banks-grid');
  }

  // Bank Details Modal / Question Browser
  function openBankDetails(bankId) {
    const bank = state.banks.find(b => b.bankId === bankId);
    if (!bank) return;

    const modal = document.getElementById('bank-details-modal');
    if (!modal) return;

    document.getElementById('bank-modal-title').textContent = `${bank.title} — সকল প্রশ্ন (${toBengaliNum(bank.questions.length)}টি)`;
    
    const container = document.getElementById('bank-questions-list');
    renderQuestionBrowserList(bank, container, '');

    // Search event
    const searchInput = document.getElementById('bank-q-search');
    if (searchInput) {
      searchInput.value = '';
      searchInput.oninput = (e) => {
        renderQuestionBrowserList(bank, container, e.target.value.trim().toLowerCase());
      };
    }

    modal.classList.add('active');
  }

  function renderQuestionBrowserList(bank, container, filterText) {
    let filtered = bank.questions;
    if (filterText) {
      filtered = filtered.filter(q => 
        q.question.toLowerCase().includes(filterText) || 
        q.options.some(o => o.text.toLowerCase().includes(filterText)) ||
        (q.stimulus && q.stimulus.toLowerCase().includes(filterText))
      );
    }

    if (filtered.length === 0) {
      container.innerHTML = `<p style="text-align:center; padding:30px; color:var(--text-muted);">কোনো প্রশ্ন পাওয়া যায়নি।</p>`;
      return;
    }

    let html = '';
    filtered.forEach((q, idx) => {
      const isBookmarked = !!state.bookmarks[`${bank.bankId}_${q.id}`];
      html += `
        <div style="background:var(--bg-subtle); border:1px solid var(--border); border-radius:var(--radius-sm); padding:16px; margin-bottom:12px;">
          ${q.stimulus ? `<div class="stimulus-box" style="margin-bottom:10px; font-size:0.88rem;"><span class="stimulus-tag">উদ্দীপক:</span>${q.stimulus}</div>` : ''}
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
            <div style="font-weight:600; font-size:0.95rem; color:var(--text-primary);">
              ${toBengaliNum(q.questionNumber)}। ${q.question}
            </div>
            <span style="font-size:0.75rem; color:var(--text-muted); background:var(--bg-card); padding:2px 8px; border-radius:12px; border:1px solid var(--border); flex-shrink:0;">
              পৃষ্ঠা: ${toBengaliNum(q.sourcePage)}
            </span>
          </div>
          ${q.statements ? `<div style="margin:8px 0 8px 18px; font-size:0.88rem; color:var(--text-secondary);">${q.statements.join('<br>')}</div>` : ''}
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin:10px 0;">
            ${q.options.map(opt => `
              <div style="padding:6px 10px; border-radius:6px; font-size:0.85rem; border:1px solid ${opt.id === q.correctAnswer ? 'var(--success)' : 'var(--border)'}; background:${opt.id === q.correctAnswer ? 'var(--success-light)' : 'var(--bg-card)'};">
                <strong>${opt.id}.</strong> ${opt.text} ${opt.id === q.correctAnswer ? '✓' : ''}
              </div>
            `).join('')}
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; font-size:0.82rem;">
            <span style="color:var(--success); font-weight:700;">সঠিক উত্তর: ${q.correctAnswer}</span>
            <button class="icon-btn" onclick="window.OnushilonApp.toggleBookmark('${bank.bankId}', '${q.id}', this)" style="padding:4px 8px; font-size:0.78rem;">
              ${isBookmarked ? '★ সংরক্ষিত' : '☆ সংরক্ষণ করুন'}
            </button>
          </div>
          ${q.explanation ? `<div style="margin-top:6px; padding:6px 10px; background:var(--bg-card); border-radius:4px; font-size:0.8rem; color:var(--text-secondary);"><strong style="color:var(--primary);">ব্যাখ্যা:</strong> ${q.explanation}</div>` : ''}
        </div>
      `;
    });
    container.innerHTML = html;
  }

  function closeBankDetails() {
    document.getElementById('bank-details-modal')?.classList.remove('active');
  }

  // Practice Engine
  function openPracticeSetup(preselectedBankId = null) {
    const modal = document.getElementById('practice-setup-modal');
    if (!modal) return;

    // Populate banks dropdown
    const select = document.getElementById('practice-bank-select');
    select.innerHTML = state.banks.map(b => 
      `<option value="${b.bankId}" ${preselectedBankId === b.bankId ? 'selected' : ''}>${b.title} (${toBengaliNum(b.questions.length)}টি প্রশ্ন)</option>`
    ).join('');

    // Update preset pills
    updatePresetPillActive('practice-count-presets', state.settings.defaultQuestionCount);
    document.getElementById('practice-custom-count').value = state.settings.defaultQuestionCount;

    // Feedback mode
    const modeSelect = document.getElementById('practice-mode-select');
    if (modeSelect) modeSelect.value = state.settings.defaultPracticeMode;

    modal.classList.add('active');
  }

  function closePracticeSetup() {
    document.getElementById('practice-setup-modal')?.classList.remove('active');
  }

  function updatePresetPillActive(containerId, value) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.querySelectorAll('.preset-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-value') == value);
    });
  }

  function startPractice() {
    const bankId = document.getElementById('practice-bank-select').value;
    const bank = state.banks.find(b => b.bankId === bankId);
    if (!bank) return;

    let countVal = parseInt(document.getElementById('practice-custom-count').value, 10);
    if (isNaN(countVal) || countVal <= 0) countVal = 20;

    const orderType = document.getElementById('practice-order-select').value; // 'original' or 'random'
    const filterType = document.getElementById('practice-filter-select').value; // 'all', 'unattempted', 'wrong', 'bookmarked'
    const feedbackMode = document.getElementById('practice-mode-select').value; // 'instant' or 'submit'
    const timerMinutes = parseInt(document.getElementById('practice-timer-select').value, 10) || 0;

    let pool = [...bank.questions];

    // Apply Filter
    if (filterType === 'unattempted') {
      const attemptedIds = new Set();
      state.practiceHistory.filter(h => h.bankId === bankId).forEach(h => {
        if (h.answeredIds) h.answeredIds.forEach(id => attemptedIds.add(id));
      });
      pool = pool.filter(q => !attemptedIds.has(q.id));
      if (pool.length === 0) {
        showToast("এই ফিল্টারে কোনো প্রশ্ন অবশিষ্ট নেই! সকল প্রশ্ন লোড করা হলো।", "warning");
        pool = [...bank.questions];
      }
    } else if (filterType === 'wrong') {
      pool = pool.filter(q => !!state.wrongQuestions[`${bankId}_${q.id}`]);
      if (pool.length === 0) {
        showToast("কোনো ভুল প্রশ্ন পাওয়া যায়নি! সকল প্রশ্ন লোড করা হলো।", "warning");
        pool = [...bank.questions];
      }
    } else if (filterType === 'bookmarked') {
      pool = pool.filter(q => !!state.bookmarks[`${bankId}_${q.id}`]);
      if (pool.length === 0) {
        showToast("কোনো বুকমার্ক করা প্রশ্ন পাওয়া যায়নি! সকল প্রশ্ন লোড করা হলো।", "warning");
        pool = [...bank.questions];
      }
    }

    if (orderType === 'random') {
      pool.sort(() => Math.random() - 0.5);
    }

    const selectedQuestions = pool.slice(0, Math.min(countVal, pool.length));

    activePractice = {
      bankId: bankId,
      bankTitle: bank.title,
      questions: selectedQuestions,
      currentIndex: 0,
      answers: {}, // qId -> { selected, isSubmitted, isCorrect }
      feedbackMode: feedbackMode,
      timerTotalSeconds: timerMinutes * 60,
      secondsRemaining: timerMinutes * 60,
      startTime: Date.now(),
      isCompleted: false
    };

    closePracticeSetup();
    navigateTo('practice-session');
    initPracticeSession();
  }

  function initPracticeSession() {
    if (!activePractice) return;

    if (practiceTimerInterval) clearInterval(practiceTimerInterval);
    if (activePractice.timerTotalSeconds > 0) {
      practiceTimerInterval = setInterval(() => {
        activePractice.secondsRemaining--;
        updatePracticeTimerDisplay();
        if (activePractice.secondsRemaining <= 0) {
          clearInterval(practiceTimerInterval);
          finishPracticeSession();
        }
      }, 1000);
      updatePracticeTimerDisplay();
    } else {
      document.getElementById('practice-timer-badge').style.display = 'none';
    }

    renderCurrentPracticeQuestion();
  }

  function updatePracticeTimerDisplay() {
    const badge = document.getElementById('practice-timer-badge');
    if (!badge || activePractice.timerTotalSeconds <= 0) return;
    badge.style.display = 'flex';
    const mins = Math.floor(activePractice.secondsRemaining / 60);
    const secs = activePractice.secondsRemaining % 60;
    badge.innerHTML = `⏱ ${toBengaliNum(String(mins).padStart(2, '0'))}:${toBengaliNum(String(secs).padStart(2, '0'))}`;
    badge.classList.toggle('urgent', activePractice.secondsRemaining < 60);
  }

  function renderCurrentPracticeQuestion() {
    if (!activePractice) return;
    const q = activePractice.questions[activePractice.currentIndex];
    const total = activePractice.questions.length;
    const currentNum = activePractice.currentIndex + 1;

    // Progress bar & text
    document.getElementById('practice-q-counter').textContent = `প্রশ্ন ${toBengaliNum(currentNum)} / ${toBengaliNum(total)}`;
    const pct = Math.round((currentNum / total) * 100);
    document.getElementById('practice-progress-fill').style.width = `${pct}%`;

    // Stimulus
    const stimBox = document.getElementById('practice-stimulus-box');
    if (q.stimulus) {
      stimBox.style.display = 'block';
      stimBox.innerHTML = `<span class="stimulus-tag">উদ্দীপক:</span> ${q.stimulus}`;
    } else {
      stimBox.style.display = 'none';
    }

    // Question Text & Statements
    document.getElementById('practice-q-text').textContent = `${toBengaliNum(currentNum)}। ${q.question}`;
    const stmtBox = document.getElementById('practice-statements-box');
    if (q.statements && q.statements.length > 0) {
      stmtBox.style.display = 'block';
      stmtBox.innerHTML = q.statements.join('<br>');
    } else {
      stmtBox.style.display = 'none';
    }

    // Source Page & Subject Badge
    document.getElementById('practice-q-meta').textContent = `${q.subject} • ${q.chapter} • পৃষ্ঠা: ${toBengaliNum(q.sourcePage)}`;

    // Bookmark button
    const bmBtn = document.getElementById('practice-bookmark-btn');
    const isBm = !!state.bookmarks[`${activePractice.bankId}_${q.id}`];
    bmBtn.innerHTML = isBm ? `★ সংরক্ষিত` : `☆ বুকমার্ক`;

    // Existing answer record
    const ansRecord = activePractice.answers[q.id];

    // Options rendering
    const optContainer = document.getElementById('practice-options-list');
    let optHtml = '';
    const keyLabels = ['1', '2', '3', '4'];

    q.options.forEach((opt, idx) => {
      let stateClass = '';
      if (ansRecord) {
        if (activePractice.feedbackMode === 'instant' || ansRecord.isSubmitted) {
          if (opt.id === q.correctAnswer) stateClass = 'correct';
          else if (ansRecord.selected === opt.id) stateClass = 'incorrect';
        } else if (ansRecord.selected === opt.id) {
          stateClass = 'selected';
        }
      }

      optHtml += `
        <div class="option-item ${stateClass}" onclick="window.OnushilonApp.selectPracticeOption('${opt.id}')">
          <div class="option-badge">${opt.id}</div>
          <div class="option-text">${opt.text}</div>
          <span style="font-size:0.75rem; color:var(--text-muted); opacity:0.6; margin-left:auto;">[${keyLabels[idx]}]</span>
        </div>
      `;
    });
    optContainer.innerHTML = optHtml;

    // Explanation panel
    const expPanel = document.getElementById('practice-explanation-panel');
    const showExp = ansRecord && (activePractice.feedbackMode === 'instant' || ansRecord.isSubmitted);
    if (showExp && q.explanation) {
      expPanel.style.display = 'block';
      expPanel.innerHTML = `
        <div class="explanation-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          যাচাইকৃত ব্যাখ্যা (সোর্স পৃষ্ঠা: ${toBengaliNum(q.sourcePage)})
        </div>
        <p style="font-size:0.95rem; color:var(--text-primary);">${q.explanation}</p>
      `;
    } else {
      expPanel.style.display = 'none';
    }

    // Submit button in Mode B
    const submitBtn = document.getElementById('practice-submit-answer-btn');
    if (activePractice.feedbackMode === 'submit' && ansRecord && !ansRecord.isSubmitted) {
      submitBtn.style.display = 'inline-flex';
    } else {
      submitBtn.style.display = 'none';
    }

    // Navigation buttons
    document.getElementById('practice-prev-btn').disabled = activePractice.currentIndex === 0;
    const nextBtn = document.getElementById('practice-next-btn');
    if (activePractice.currentIndex === total - 1) {
      nextBtn.innerHTML = `অনুশীলন সম্পন্ন করুন ✓`;
      nextBtn.classList.add('btn-success');
    } else {
      nextBtn.innerHTML = `পরবর্তী প্রশ্ন →`;
      nextBtn.classList.remove('btn-success');
    }
  }

  function selectPracticeOption(optId) {
    if (!activePractice) return;
    const q = activePractice.questions[activePractice.currentIndex];
    const prev = activePractice.answers[q.id];

    // In instant mode, if already answered, don't re-select
    if (activePractice.feedbackMode === 'instant' && prev && prev.selected) return;
    if (activePractice.feedbackMode === 'submit' && prev && prev.isSubmitted) return;

    const isCorrect = optId === q.correctAnswer;
    const record = {
      selected: optId,
      isCorrect: isCorrect,
      isSubmitted: activePractice.feedbackMode === 'instant'
    };
    activePractice.answers[q.id] = record;

    if (activePractice.feedbackMode === 'instant') {
      playAudioChime(isCorrect);
      if (!isCorrect) {
        trackWrongQuestion(activePractice.bankId, q.id);
      }
    }

    renderCurrentPracticeQuestion();
  }

  function submitCurrentPracticeAnswer() {
    if (!activePractice) return;
    const q = activePractice.questions[activePractice.currentIndex];
    const rec = activePractice.answers[q.id];
    if (!rec || rec.isSubmitted) return;

    rec.isSubmitted = true;
    playAudioChime(rec.isCorrect);
    if (!rec.isCorrect) {
      trackWrongQuestion(activePractice.bankId, q.id);
    }
    renderCurrentPracticeQuestion();
  }

  function clearPracticeSelection() {
    if (!activePractice) return;
    const q = activePractice.questions[activePractice.currentIndex];
    delete activePractice.answers[q.id];
    renderCurrentPracticeQuestion();
  }

  function prevPracticeQuestion() {
    if (!activePractice || activePractice.currentIndex <= 0) return;
    activePractice.currentIndex--;
    renderCurrentPracticeQuestion();
  }

  function nextPracticeQuestion() {
    if (!activePractice) return;
    if (activePractice.currentIndex < activePractice.questions.length - 1) {
      activePractice.currentIndex++;
      renderCurrentPracticeQuestion();
    } else {
      finishPracticeSession();
    }
  }

  function finishPracticeSession() {
    if (!activePractice) return;
    if (practiceTimerInterval) clearInterval(practiceTimerInterval);

    const total = activePractice.questions.length;
    let correct = 0;
    let wrong = 0;
    let answeredCount = 0;
    const answeredIds = [];

    activePractice.questions.forEach(q => {
      const a = activePractice.answers[q.id];
      if (a && a.selected) {
        answeredCount++;
        answeredIds.push(q.id);
        if (a.isCorrect) correct++;
        else wrong++;
      }
    });

    const elapsedSeconds = Math.round((Date.now() - activePractice.startTime) / 1000);
    const accuracy = answeredCount > 0 ? Math.round((correct / answeredCount) * 100) : 0;

    // Save session record
    const record = {
      id: 'p_' + Date.now(),
      bankId: activePractice.bankId,
      timestamp: Date.now(),
      total: total,
      answered: answeredCount,
      correct: correct,
      wrong: wrong,
      percentage: accuracy,
      timeSpent: elapsedSeconds,
      answeredIds: answeredIds
    };
    state.practiceHistory.unshift(record);
    saveState();

    // Render summary
    navigateTo('practice-summary');
    document.getElementById('summary-total').textContent = toBengaliNum(total);
    document.getElementById('summary-answered').textContent = toBengaliNum(answeredCount);
    document.getElementById('summary-correct').textContent = toBengaliNum(correct);
    document.getElementById('summary-wrong').textContent = toBengaliNum(wrong);
    document.getElementById('summary-accuracy').textContent = `${toBengaliNum(accuracy)}%`;
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    document.getElementById('summary-time').textContent = `${toBengaliNum(mins)} মিনিট ${toBengaliNum(secs)} সেকেন্ড`;
  }

  // Exam Engine
  function openExamSetup(preselectedBankId = null) {
    const modal = document.getElementById('exam-setup-modal');
    if (!modal) return;

    const select = document.getElementById('exam-bank-select');
    select.innerHTML = state.banks.map(b => 
      `<option value="${b.bankId}" ${preselectedBankId === b.bankId ? 'selected' : ''}>${b.title} (${toBengaliNum(b.questions.length)}টি প্রশ্ন)</option>`
    ).join('');

    updatePresetPillActive('exam-count-presets', 20);
    document.getElementById('exam-custom-count').value = 20;

    updatePresetPillActive('exam-time-presets', state.settings.defaultExamDuration);
    document.getElementById('exam-custom-time').value = state.settings.defaultExamDuration;

    modal.classList.add('active');
  }

  function closeExamSetup() {
    document.getElementById('exam-setup-modal')?.classList.remove('active');
  }

  function startExam() {
    const bankId = document.getElementById('exam-bank-select').value;
    const bank = state.banks.find(b => b.bankId === bankId);
    if (!bank) return;

    let countVal = parseInt(document.getElementById('exam-custom-count').value, 10);
    if (isNaN(countVal) || countVal <= 0) countVal = 20;

    let durationMins = parseInt(document.getElementById('exam-custom-time').value, 10);
    if (isNaN(durationMins) || durationMins <= 0) durationMins = 15;

    const negMarking = document.getElementById('exam-neg-marking').checked;
    const negRate = parseFloat(document.getElementById('exam-neg-rate').value) || 0.25;

    // Randomize questions for exam
    const pool = [...bank.questions].sort(() => Math.random() - 0.5);
    const selected = pool.slice(0, Math.min(countVal, pool.length));

    activeExam = {
      id: 'exam_' + Date.now(),
      bankId: bankId,
      bankTitle: bank.title,
      questions: selected,
      currentIndex: 0,
      answers: {}, // qId -> selected option
      markedForReview: {}, // qId -> true
      startTime: Date.now(),
      durationMs: durationMins * 60 * 1000,
      negativeMarking: negMarking,
      negativePerWrong: negRate,
      marksPerCorrect: 1,
      isSubmitted: false
    };

    closeExamSetup();
    navigateTo('exam-session');
    initExamSession();
  }

  function initExamSession() {
    if (!activeExam) return;

    if (examTimerInterval) clearInterval(examTimerInterval);
    examTimerInterval = setInterval(() => {
      const elapsed = Date.now() - activeExam.startTime;
      const remainingMs = Math.max(0, activeExam.durationMs - elapsed);
      updateExamTimerDisplay(remainingMs);
      if (remainingMs <= 0) {
        clearInterval(examTimerInterval);
        submitExam(true); // auto submit
      }
    }, 500);

    renderCurrentExamQuestion();
    renderExamPalette();
  }

  function updateExamTimerDisplay(remainingMs) {
    const badge = document.getElementById('exam-timer-badge');
    if (!badge) return;
    const totalSecs = Math.floor(remainingMs / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    badge.innerHTML = `⏱ ${toBengaliNum(String(mins).padStart(2, '0'))}:${toBengaliNum(String(secs).padStart(2, '0'))}`;
    badge.classList.toggle('urgent', totalSecs < 120);
  }

  function renderCurrentExamQuestion() {
    if (!activeExam) return;
    const q = activeExam.questions[activeExam.currentIndex];
    const total = activeExam.questions.length;
    const currentNum = activeExam.currentIndex + 1;

    document.getElementById('exam-q-counter').textContent = `প্রশ্ন ${toBengaliNum(currentNum)} / ${toBengaliNum(total)}`;

    // Stimulus
    const stimBox = document.getElementById('exam-stimulus-box');
    if (q.stimulus) {
      stimBox.style.display = 'block';
      stimBox.innerHTML = `<span class="stimulus-tag">উদ্দীপক:</span> ${q.stimulus}`;
    } else {
      stimBox.style.display = 'none';
    }

    document.getElementById('exam-q-text').textContent = `${toBengaliNum(currentNum)}। ${q.question}`;
    const stmtBox = document.getElementById('exam-statements-box');
    if (q.statements && q.statements.length > 0) {
      stmtBox.style.display = 'block';
      stmtBox.innerHTML = q.statements.join('<br>');
    } else {
      stmtBox.style.display = 'none';
    }

    const selectedOpt = activeExam.answers[q.id];
    const isMarked = !!activeExam.markedForReview[q.id];

    // Mark review toggle button text
    const reviewBtn = document.getElementById('exam-mark-review-btn');
    reviewBtn.innerHTML = isMarked ? `★ মার্ক করা আছে` : `☆ রিভিউ মার্ক`;
    reviewBtn.classList.toggle('btn-accent', isMarked);

    const optContainer = document.getElementById('exam-options-list');
    let optHtml = '';
    const keyLabels = ['1', '2', '3', '4'];

    q.options.forEach((opt, idx) => {
      const isSelected = selectedOpt === opt.id;
      optHtml += `
        <div class="option-item ${isSelected ? 'selected' : ''}" onclick="window.OnushilonApp.selectExamOption('${opt.id}')">
          <div class="option-badge">${opt.id}</div>
          <div class="option-text">${opt.text}</div>
          <span style="font-size:0.75rem; color:var(--text-muted); opacity:0.6; margin-left:auto;">[${keyLabels[idx]}]</span>
        </div>
      `;
    });
    optContainer.innerHTML = optHtml;

    document.getElementById('exam-prev-btn').disabled = activeExam.currentIndex === 0;
    document.getElementById('exam-next-btn').disabled = activeExam.currentIndex === total - 1;
  }

  function selectExamOption(optId) {
    if (!activeExam || activeExam.isSubmitted) return;
    const q = activeExam.questions[activeExam.currentIndex];
    if (activeExam.answers[q.id] === optId) {
      delete activeExam.answers[q.id];
    } else {
      activeExam.answers[q.id] = optId;
    }
    renderCurrentExamQuestion();
    renderExamPalette();
  }

  function clearExamSelection() {
    if (!activeExam || activeExam.isSubmitted) return;
    const q = activeExam.questions[activeExam.currentIndex];
    delete activeExam.answers[q.id];
    renderCurrentExamQuestion();
    renderExamPalette();
  }

  function toggleExamReviewMark() {
    if (!activeExam || activeExam.isSubmitted) return;
    const q = activeExam.questions[activeExam.currentIndex];
    if (activeExam.markedForReview[q.id]) {
      delete activeExam.markedForReview[q.id];
    } else {
      activeExam.markedForReview[q.id] = true;
    }
    renderCurrentExamQuestion();
    renderExamPalette();
  }

  function jumpToExamQuestion(index) {
    if (!activeExam || index < 0 || index >= activeExam.questions.length) return;
    activeExam.currentIndex = index;
    renderCurrentExamQuestion();
    renderExamPalette();
  }

  function renderExamPalette() {
    if (!activeExam) return;
    const container = document.getElementById('exam-palette-grid');
    if (!container) return;

    let answeredCount = 0;
    let reviewedCount = 0;

    let html = '';
    activeExam.questions.forEach((q, idx) => {
      const isCurrent = idx === activeExam.currentIndex;
      const isAnswered = !!activeExam.answers[q.id];
      const isReviewed = !!activeExam.markedForReview[q.id];

      if (isAnswered) answeredCount++;
      if (isReviewed) reviewedCount++;

      let cls = 'unanswered';
      if (isReviewed) cls = 'reviewed';
      else if (isAnswered) cls = 'answered';

      if (isCurrent) cls += ' current';

      html += `
        <button class="palette-btn ${cls}" onclick="window.OnushilonApp.jumpToExamQuestion(${idx})">
          ${toBengaliNum(idx + 1)}
        </button>
      `;
    });

    container.innerHTML = html;

    // Update palette summary counters
    document.getElementById('palette-answered-count').textContent = toBengaliNum(answeredCount);
    document.getElementById('palette-unanswered-count').textContent = toBengaliNum(activeExam.questions.length - answeredCount);
    document.getElementById('palette-reviewed-count').textContent = toBengaliNum(reviewedCount);
  }

  // Exam Submission Confirmation
  function confirmSubmitExam() {
    if (!activeExam) return;
    let answered = 0, reviewed = 0;
    activeExam.questions.forEach(q => {
      if (activeExam.answers[q.id]) answered++;
      if (activeExam.markedForReview[q.id]) reviewed++;
    });
    const unanswered = activeExam.questions.length - answered;

    const modal = document.getElementById('exam-submit-confirm-modal');
    document.getElementById('submit-confirm-answered').textContent = toBengaliNum(answered);
    document.getElementById('submit-confirm-unanswered').textContent = toBengaliNum(unanswered);
    document.getElementById('submit-confirm-reviewed').textContent = toBengaliNum(reviewed);
    modal.classList.add('active');
  }

  function closeSubmitConfirmModal() {
    document.getElementById('exam-submit-confirm-modal')?.classList.remove('active');
  }

  function submitExam(isAuto = false) {
    if (!activeExam || activeExam.isSubmitted) return;
    closeSubmitConfirmModal();
    if (examTimerInterval) clearInterval(examTimerInterval);

    activeExam.isSubmitted = true;
    const total = activeExam.questions.length;
    let correct = 0, wrong = 0, unanswered = 0;
    const reviewList = [];
    const answeredIds = [];

    activeExam.questions.forEach(q => {
      const userSel = activeExam.answers[q.id];
      const isAnswered = !!userSel;
      const isCorrect = userSel === q.correctAnswer;

      if (!isAnswered) {
        unanswered++;
      } else {
        answeredIds.push(q.id);
        if (isCorrect) correct++;
        else {
          wrong++;
          trackWrongQuestion(activeExam.bankId, q.id);
        }
      }

      reviewList.push({
        question: q,
        userSelected: userSel || null,
        isCorrect: isCorrect,
        isAnswered: isAnswered
      });
    });

    // Score calculation
    let rawScore = correct * activeExam.marksPerCorrect;
    let negativeDeduction = 0;
    if (activeExam.negativeMarking) {
      negativeDeduction = wrong * activeExam.negativePerWrong;
      rawScore = Math.max(0, rawScore - negativeDeduction);
    }

    const maxScore = total * activeExam.marksPerCorrect;
    const percentage = maxScore > 0 ? Math.round((rawScore / maxScore) * 100) : 0;
    const elapsedSeconds = Math.round((Date.now() - activeExam.startTime) / 1000);

    const examRecord = {
      id: activeExam.id,
      bankId: activeExam.bankId,
      timestamp: Date.now(),
      total: total,
      correct: correct,
      wrong: wrong,
      unanswered: unanswered,
      score: parseFloat(rawScore.toFixed(2)),
      negativeDeduction: parseFloat(negativeDeduction.toFixed(2)),
      maxScore: maxScore,
      percentage: percentage,
      timeSpent: elapsedSeconds,
      reviewList: reviewList,
      answeredIds: answeredIds
    };

    state.examHistory.unshift(examRecord);
    saveState();
    lastExamResult = examRecord;

    renderExamResults(examRecord);
    navigateTo('exam-results');
  }

  // Results Review Renderer
  function renderExamResults(result) {
    document.getElementById('res-score').textContent = toBengaliNum(result.score);
    document.getElementById('res-max-score').textContent = `/${toBengaliNum(result.maxScore)}`;
    document.getElementById('res-pct').textContent = `${toBengaliNum(result.percentage)}%`;
    document.getElementById('res-correct').textContent = toBengaliNum(result.correct);
    document.getElementById('res-wrong').textContent = toBengaliNum(result.wrong);
    document.getElementById('res-unanswered').textContent = toBengaliNum(result.unanswered);
    document.getElementById('res-neg').textContent = result.negativeDeduction > 0 ? `-${toBengaliNum(result.negativeDeduction)}` : '০';

    const mins = Math.floor(result.timeSpent / 60);
    const secs = result.timeSpent % 60;
    document.getElementById('res-time').textContent = `${toBengaliNum(mins)} মিনিট ${toBengaliNum(secs)} সেকেন্ড`;

    renderReviewQuestions(result.reviewList, 'all');
  }

  function filterReviewQuestions(filter) {
    if (!lastExamResult) return;
    document.querySelectorAll('.filter-tab').forEach(t => {
      t.classList.toggle('active', t.getAttribute('data-filter') === filter);
    });
    renderReviewQuestions(lastExamResult.reviewList, filter);
  }

  function renderReviewQuestions(list, filter) {
    const container = document.getElementById('exam-review-container');
    if (!container) return;

    let filtered = list;
    if (filter === 'correct') filtered = list.filter(item => item.isAnswered && item.isCorrect);
    else if (filter === 'wrong') filtered = list.filter(item => item.isAnswered && !item.isCorrect);
    else if (filter === 'unanswered') filtered = list.filter(item => !item.isAnswered);

    if (filtered.length === 0) {
      container.innerHTML = `<p style="text-align:center; padding:30px; color:var(--text-muted);">এই ক্যাটাগরিতে কোনো প্রশ্ন নেই।</p>`;
      return;
    }

    let html = '';
    filtered.forEach((item, idx) => {
      const q = item.question;
      let statusClass = 'unanswered';
      let statusLabel = 'উত্তর দেওয়া হয়নি';
      if (item.isAnswered) {
        if (item.isCorrect) { statusClass = 'correct'; statusLabel = 'সঠিক উত্তর ✓'; }
        else { statusClass = 'incorrect'; statusLabel = 'ভুল উত্তর ✗'; }
      }

      html += `
        <div class="review-card ${statusClass}">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
            <span style="font-weight:700; font-size:0.8rem; padding:3px 10px; border-radius:12px; ${statusClass === 'correct' ? 'background:var(--success-light); color:var(--success);' : statusClass === 'incorrect' ? 'background:var(--danger-light); color:var(--danger);' : 'background:var(--warning-light); color:var(--warning);'}">
              ${statusLabel}
            </span>
            <span style="font-size:0.8rem; color:var(--text-muted);">পৃষ্ঠা: ${toBengaliNum(q.sourcePage)}</span>
          </div>
          ${q.stimulus ? `<div class="stimulus-box" style="margin-bottom:10px; font-size:0.88rem;"><span class="stimulus-tag">উদ্দীপক:</span>${q.stimulus}</div>` : ''}
          <div style="font-weight:600; font-size:1.05rem; margin-bottom:10px;">${toBengaliNum(q.questionNumber)}। ${q.question}</div>
          ${q.statements ? `<div style="margin:8px 0 10px 18px; font-size:0.9rem; color:var(--text-secondary);">${q.statements.join('<br>')}</div>` : ''}
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:12px;">
            ${q.options.map(opt => {
              let border = 'var(--border)';
              let bg = 'var(--bg-card)';
              let mark = '';
              if (opt.id === q.correctAnswer) {
                border = 'var(--success)';
                bg = 'var(--success-light)';
                mark = ' ✓ (সঠিক উত্তর)';
              } else if (item.userSelected === opt.id) {
                border = 'var(--danger)';
                bg = 'var(--danger-light)';
                mark = ' ✗ (আপনার নির্বাচন)';
              }
              return `
                <div style="padding:8px 12px; border-radius:6px; font-size:0.9rem; border:2px solid ${border}; background:${bg};">
                  <strong>${opt.id}.</strong> ${opt.text} <small style="font-weight:700;">${mark}</small>
                </div>
              `;
            }).join('')}
          </div>
          ${q.explanation ? `<div style="padding:10px 14px; background:var(--bg-subtle); border-radius:6px; font-size:0.88rem; color:var(--text-secondary);"><strong style="color:var(--primary);">ব্যাখ্যা:</strong> ${q.explanation}</div>` : ''}
        </div>
      `;
    });

    container.innerHTML = html;
  }

  // Revision & Wrong Questions
  function trackWrongQuestion(bankId, questionId) {
    const key = `${bankId}_${questionId}`;
    if (!state.wrongQuestions[key]) {
      state.wrongQuestions[key] = { bankId: bankId, questionId: questionId, count: 1, lastAttempted: Date.now() };
    } else {
      state.wrongQuestions[key].count++;
      state.wrongQuestions[key].lastAttempted = Date.now();
    }
    saveState();
  }

  function renderRevisionView() {
    const container = document.getElementById('revision-questions-list');
    if (!container) return;

    const wrongKeys = Object.keys(state.wrongQuestions);
    if (wrongKeys.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:48px 16px; color:var(--text-muted);">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto 12px; display:block; color:var(--success);">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <h3>চমৎকার! কোনো ভুল প্রশ্ন নেই।</h3>
          <p>আপনি যখন কোনো অনুশীলন বা পরীক্ষায় ভুল উত্তর দেবেন, তা স্বয়ংক্রিয়ভাবে এখানে অনুশীলনের জন্য সংরক্ষিত হবে।</p>
        </div>
      `;
      document.getElementById('start-revision-btn').style.display = 'none';
      return;
    }

    document.getElementById('start-revision-btn').style.display = 'inline-flex';
    document.getElementById('revision-count-badge').textContent = `${toBengaliNum(wrongKeys.length)}টি প্রশ্ন`;

    let html = '';
    wrongKeys.forEach(k => {
      const record = state.wrongQuestions[k];
      const bank = state.banks.find(b => b.bankId === record.bankId);
      if (!bank) return;
      const q = bank.questions.find(item => item.id === record.questionId);
      if (!q) return;

      html += `
        <div class="card" style="margin-bottom:14px; border-left:4px solid var(--danger);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span style="font-size:0.75rem; background:var(--danger-light); color:var(--danger); font-weight:700; padding:2px 8px; border-radius:12px;">
              ${toBengaliNum(record.count)} বার ভুল হয়েছে
            </span>
            <span style="font-size:0.78rem; color:var(--text-muted);">${bank.title} • পৃষ্ঠা: ${toBengaliNum(q.sourcePage)}</span>
          </div>
          ${q.stimulus ? `<div class="stimulus-box" style="margin-bottom:8px; font-size:0.85rem;"><span class="stimulus-tag">উদ্দীপক:</span>${q.stimulus}</div>` : ''}
          <div style="font-weight:600; font-size:1rem; margin-bottom:8px;">${toBengaliNum(q.questionNumber)}। ${q.question}</div>
          <div style="font-size:0.88rem; color:var(--success); font-weight:700; margin-bottom:6px;">সঠিক উত্তর: ${q.correctAnswer} (${q.options.find(o => o.id === q.correctAnswer)?.text || ''})</div>
          ${q.explanation ? `<div style="font-size:0.82rem; color:var(--text-secondary); background:var(--bg-subtle); padding:6px 10px; border-radius:4px;">ব্যাখ্যা: ${q.explanation}</div>` : ''}
        </div>
      `;
    });

    container.innerHTML = html;
  }

  function startRevisionPractice() {
    const wrongKeys = Object.keys(state.wrongQuestions);
    if (wrongKeys.length === 0) return;

    const revisionQuestions = [];
    wrongKeys.forEach(k => {
      const record = state.wrongQuestions[k];
      const bank = state.banks.find(b => b.bankId === record.bankId);
      if (bank) {
        const q = bank.questions.find(item => item.id === record.questionId);
        if (q) revisionQuestions.push(q);
      }
    });

    if (revisionQuestions.length === 0) return;

    activePractice = {
      bankId: 'revision',
      bankTitle: 'ভুল প্রশ্ন সংশোধন অনুশীলন',
      questions: revisionQuestions,
      currentIndex: 0,
      answers: {},
      feedbackMode: 'instant',
      timerTotalSeconds: 0,
      secondsRemaining: 0,
      startTime: Date.now(),
      isCompleted: false
    };

    navigateTo('practice-session');
    initPracticeSession();
  }

  // Bookmarks System
  function toggleBookmark(bankId, questionId, btnEl = null) {
    const key = `${bankId}_${questionId}`;
    if (state.bookmarks[key]) {
      delete state.bookmarks[key];
      showToast("বুকমার্ক থেকে সরানো হয়েছে", "info");
      if (btnEl) btnEl.innerHTML = `☆ বুকমার্ক`;
    } else {
      state.bookmarks[key] = { bankId: bankId, questionId: questionId, addedAt: Date.now() };
      showToast("প্রশ্নে বুকমার্ক যুক্ত হয়েছে", "success");
      if (btnEl) btnEl.innerHTML = `★ সংরক্ষিত`;
    }
    saveState();
  }

  function renderBookmarksView() {
    const container = document.getElementById('bookmarks-list');
    if (!container) return;

    const keys = Object.keys(state.bookmarks);
    if (keys.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:48px 16px; color:var(--text-muted);">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto 12px; display:block;">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <h3>কোনো সংরক্ষিত বুকমার্ক নেই।</h3>
          <p>অনুশীলন বা রিভিউর সময় গুরুত্বপূর্ণ প্রশ্ন বুকমার্ক করে রাখুন।</p>
        </div>
      `;
      document.getElementById('start-bookmarks-btn').style.display = 'none';
      return;
    }

    document.getElementById('start-bookmarks-btn').style.display = 'inline-flex';

    let html = '';
    keys.forEach(k => {
      const bm = state.bookmarks[k];
      const bank = state.banks.find(b => b.bankId === bm.bankId);
      if (!bank) return;
      const q = bank.questions.find(item => item.id === bm.questionId);
      if (!q) return;

      html += `
        <div class="card" style="margin-bottom:14px; position:relative;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span style="font-size:0.75rem; background:var(--primary-light); color:var(--primary); font-weight:700; padding:2px 8px; border-radius:12px;">
              ${bank.title} • পৃষ্ঠা: ${toBengaliNum(q.sourcePage)}
            </span>
            <button class="icon-btn" onclick="window.OnushilonApp.removeBookmark('${k}')" style="padding:2px 8px; font-size:0.75rem; color:var(--danger);">
              মুছে ফেলুন ✕
            </button>
          </div>
          ${q.stimulus ? `<div class="stimulus-box" style="margin-bottom:8px; font-size:0.85rem;"><span class="stimulus-tag">উদ্দীপক:</span>${q.stimulus}</div>` : ''}
          <div style="font-weight:600; font-size:1rem; margin-bottom:8px;">${toBengaliNum(q.questionNumber)}। ${q.question}</div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:8px;">
            ${q.options.map(opt => `
              <div style="padding:6px 10px; border-radius:4px; font-size:0.85rem; border:1px solid ${opt.id === q.correctAnswer ? 'var(--success)' : 'var(--border)'}; background:${opt.id === q.correctAnswer ? 'var(--success-light)' : 'var(--bg-subtle)'};">
                <strong>${opt.id}.</strong> ${opt.text}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  function removeBookmark(key) {
    delete state.bookmarks[key];
    saveState();
    renderBookmarksView();
    showToast("বুকমার্ক মুছে ফেলা হয়েছে", "info");
  }

  function startBookmarksPractice() {
    const keys = Object.keys(state.bookmarks);
    if (keys.length === 0) return;

    const bmQuestions = [];
    keys.forEach(k => {
      const bm = state.bookmarks[k];
      const bank = state.banks.find(b => b.bankId === bm.bankId);
      if (bank) {
        const q = bank.questions.find(item => item.id === bm.questionId);
        if (q) bmQuestions.push(q);
      }
    });

    if (bmQuestions.length === 0) return;

    activePractice = {
      bankId: 'bookmarks',
      bankTitle: 'বুকমার্ক সংরক্ষিত প্রশ্ন অনুশীলন',
      questions: bmQuestions,
      currentIndex: 0,
      answers: {},
      feedbackMode: 'instant',
      timerTotalSeconds: 0,
      secondsRemaining: 0,
      startTime: Date.now(),
      isCompleted: false
    };

    navigateTo('practice-session');
    initPracticeSession();
  }

  // Analytics View Renderer
  function renderAnalyticsView() {
    const stats = calculateStats();
    document.getElementById('stat-total-answered').textContent = toBengaliNum(stats.totalAnswered);
    document.getElementById('stat-correct-count').textContent = toBengaliNum(stats.totalCorrect);
    document.getElementById('stat-wrong-count').textContent = toBengaliNum(stats.totalWrong);
    document.getElementById('stat-accuracy-rate').textContent = `${toBengaliNum(stats.accuracy)}%`;

    // Render Bank Performance Bars
    const bankBarsContainer = document.getElementById('analytics-bank-bars');
    if (bankBarsContainer) {
      let bHtml = '';
      state.banks.forEach(b => {
        let cor = 0, wrg = 0;
        state.practiceHistory.filter(h => h.bankId === b.bankId).forEach(h => { cor += h.correct || 0; wrg += h.wrong || 0; });
        state.examHistory.filter(h => h.bankId === b.bankId).forEach(h => { cor += h.correct || 0; wrg += h.wrong || 0; });
        const tot = cor + wrg;
        const rate = tot > 0 ? Math.round((cor / tot) * 100) : 0;
        bHtml += `
          <div style="margin-bottom:14px;">
            <div style="display:flex; justify-content:space-between; font-size:0.9rem; font-weight:600; margin-bottom:4px;">
              <span>${b.title} (${toBengaliNum(tot)} অনুশীলিত)</span>
              <span style="color:var(--primary); font-weight:700;">${toBengaliNum(rate)}%</span>
            </div>
            <div class="progress-track" style="height:10px;">
              <div class="progress-fill" style="width:${rate}%;"></div>
            </div>
          </div>
        `;
      });
      bankBarsContainer.innerHTML = bHtml;
    }

    // Render Exam History Table
    const tableBody = document.getElementById('analytics-exam-history-body');
    if (tableBody) {
      if (state.examHistory.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:var(--text-muted);">এখনো কোনো পরীক্ষা সম্পন্ন হয়নি।</td></tr>`;
      } else {
        tableBody.innerHTML = state.examHistory.slice(0, 10).map((ex, idx) => {
          const bank = state.banks.find(b => b.bankId === ex.bankId);
          const dateStr = new Date(ex.timestamp).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' });
          return `
            <tr style="border-bottom:1px solid var(--border);">
              <td style="padding:10px;">${toBengaliNum(idx + 1)}</td>
              <td style="padding:10px; font-weight:600;">${bank ? bank.title : 'সাধারণ পরীক্ষা'}</td>
              <td style="padding:10px;">${dateStr}</td>
              <td style="padding:10px; font-weight:700;">${toBengaliNum(ex.score)}/${toBengaliNum(ex.maxScore)}</td>
              <td style="padding:10px; font-weight:700; color:${ex.percentage >= 80 ? 'var(--success)' : ex.percentage >= 50 ? 'var(--warning)' : 'var(--danger)'};">${toBengaliNum(ex.percentage)}%</td>
              <td style="padding:10px;">
                <button class="icon-btn" onclick="window.OnushilonApp.viewPastExamResult('${ex.id}')" style="padding:4px 8px; font-size:0.75rem;">
                  রিভিউ
                </button>
              </td>
            </tr>
          `;
        }).join('');
      }
    }
  }

  function viewPastExamResult(examId) {
    const exam = state.examHistory.find(e => e.id === examId);
    if (!exam) return;
    lastExamResult = exam;
    renderExamResults(exam);
    navigateTo('exam-results');
  }

  // Backup & Restore Engine
  function exportFullBackup() {
    const backupData = {
      appName: "Onushilon",
      version: "1.0",
      exportDate: new Date().toISOString(),
      banks: state.banks,
      bookmarks: state.bookmarks,
      wrongQuestions: state.wrongQuestions,
      practiceHistory: state.practiceHistory,
      examHistory: state.examHistory,
      settings: state.settings
    };

    const jsonStr = JSON.stringify(backupData, null, 2);
    downloadJsonFile(jsonStr, `onushilon_backup_${Date.now()}.json`);
    showToast("ব্যাকআপ ফাইল ডাউনলোড শুরু হয়েছে!", "success");
  }

  function exportSingleBank(bankId) {
    const bank = state.banks.find(b => b.bankId === bankId);
    if (!bank) return;
    const jsonStr = JSON.stringify(bank, null, 2);
    downloadJsonFile(jsonStr, `bank_${bankId}.json`);
    showToast(`"${bank.title}" প্রশ্ন ব্যাংক সফলভাবে ডাউনলোড হয়েছে!`, "success");
  }

  function downloadJsonFile(content, filename) {
    // If Android Javascript interface exists
    if (window.AndroidInterface && typeof window.AndroidInterface.downloadJson === 'function') {
      window.AndroidInterface.downloadJson(content, filename);
      return;
    }
    const blob = new Blob([content], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 500);
  }

  function handleImportFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
      try {
        const data = JSON.parse(evt.target.result);
        validateAndPreviewBackup(data);
      } catch (err) {
        alert("ত্রুটি: ফাইলটি সঠিক JSON ফরম্যাটে নেই।");
      }
    };
    reader.readAsText(file);
  }

  let pendingImportData = null;

  function validateAndPreviewBackup(data) {
    let banksCount = 0;
    let questionsCount = 0;

    // Check if it's a full backup
    if (data.banks && Array.isArray(data.banks)) {
      banksCount = data.banks.length;
      data.banks.forEach(b => { if (b.questions) questionsCount += b.questions.length; });
    } else if (data.bankId && data.questions && Array.isArray(data.questions)) {
      // Single bank import
      banksCount = 1;
      questionsCount = data.questions.length;
    } else {
      alert("ত্রুটি: ফাইলের ভেতরে কোনো বৈধ প্রশ্ন ব্যাংক বা ব্যাকআপ তথ্য খুঁজে পাওয়া যায়নি।");
      return;
    }

    pendingImportData = data;
    const modal = document.getElementById('backup-preview-modal');
    document.getElementById('import-preview-banks').textContent = toBengaliNum(banksCount);
    document.getElementById('import-preview-questions').textContent = toBengaliNum(questionsCount);
    modal.classList.add('active');
  }

  function closeBackupPreviewModal() {
    document.getElementById('backup-preview-modal')?.classList.remove('active');
    pendingImportData = null;
  }

  function executeImport(mode) {
    if (!pendingImportData) return;
    const data = pendingImportData;

    if (mode === 'replace') {
      if (!confirm("সতর্কতা: সম্পূর্ণ প্রতিস্থাপন করলে আপনার বর্তমান সকল হিস্ট্রি মুছে গিয়ে এই ব্যাকআপের ডেটা সেট হবে। আপনি কি নিশ্চিত?")) {
        return;
      }
      if (data.banks && Array.isArray(data.banks)) state.banks = data.banks;
      if (data.bookmarks) state.bookmarks = data.bookmarks;
      if (data.wrongQuestions) state.wrongQuestions = data.wrongQuestions;
      if (data.practiceHistory) state.practiceHistory = data.practiceHistory;
      if (data.examHistory) state.examHistory = data.examHistory;
      if (data.settings) state.settings = { ...state.settings, ...data.settings };
    } else {
      // Merge mode
      if (data.banks && Array.isArray(data.banks)) {
        data.banks.forEach(incomingBank => {
          const existingIdx = state.banks.findIndex(b => b.bankId === incomingBank.bankId);
          if (existingIdx !== -1) {
            // Merge questions
            const existingQIds = new Set(state.banks[existingIdx].questions.map(q => q.id));
            incomingBank.questions.forEach(iq => {
              if (!existingQIds.has(iq.id)) state.banks[existingIdx].questions.push(iq);
            });
          } else {
            state.banks.push(incomingBank);
          }
        });
      } else if (data.bankId && data.questions) {
        // Single bank merge
        const existingIdx = state.banks.findIndex(b => b.bankId === data.bankId);
        if (existingIdx !== -1) {
          const existingQIds = new Set(state.banks[existingIdx].questions.map(q => q.id));
          data.questions.forEach(iq => {
            if (!existingQIds.has(iq.id)) state.banks[existingIdx].questions.push(iq);
          });
        } else {
          state.banks.push(data);
        }
      }

      if (data.bookmarks) {
        state.bookmarks = { ...state.bookmarks, ...data.bookmarks };
      }
      if (data.wrongQuestions) {
        state.wrongQuestions = { ...state.wrongQuestions, ...data.wrongQuestions };
      }
      if (data.practiceHistory && Array.isArray(data.practiceHistory)) {
        const existIds = new Set(state.practiceHistory.map(h => h.id));
        data.practiceHistory.forEach(h => { if (!existIds.has(h.id)) state.practiceHistory.push(h); });
      }
      if (data.examHistory && Array.isArray(data.examHistory)) {
        const existIds = new Set(state.examHistory.map(h => h.id));
        data.examHistory.forEach(h => { if (!existIds.has(h.id)) state.examHistory.push(h); });
      }
    }

    saveState();
    closeBackupPreviewModal();
    showToast("ব্যাকআপ সফলভাবে রিস্টোর হয়েছে!", "success");
    renderDashboard();
    renderBanksView();
  }

  function resetAllData() {
    if (!confirm("আপনি কি নিশ্চিত যে সকল রেকর্ড, বুকমার্ক ও পরিসংখ্যান মুছে প্রথম অবস্থায় ফিরে যেতে চান?")) return;
    localStorage.removeItem(APP_STORAGE_KEY);
    localStorage.removeItem(ACTIVE_PRACTICE_KEY);
    localStorage.removeItem(ACTIVE_EXAM_KEY);
    location.reload();
  }

  function renderBackupView() {
    const listContainer = document.getElementById('backup-bank-export-list');
    if (listContainer) {
      listContainer.innerHTML = state.banks.map(b => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 14px; background:var(--bg-subtle); border-radius:var(--radius-sm); border:1px solid var(--border); margin-bottom:8px;">
          <div>
            <strong>${b.title}</strong>
            <span style="font-size:0.75rem; color:var(--text-muted); display:block;">${toBengaliNum(b.questions.length)}টি প্রশ্ন</span>
          </div>
          <button class="btn btn-secondary" onclick="window.OnushilonApp.exportSingleBank('${b.bankId}')" style="padding:4px 10px; font-size:0.8rem;">
            ডাউনলোড JSON ⭳
          </button>
        </div>
      `).join('');
    }
  }

  function renderSettingsView() {
    const themeSelect = document.getElementById('settings-theme-select');
    if (themeSelect) themeSelect.value = state.settings.theme;

    const fontSelect = document.getElementById('settings-font-select');
    if (fontSelect) fontSelect.value = state.settings.questionFontSize;

    const soundCheck = document.getElementById('settings-sound-check');
    if (soundCheck) soundCheck.checked = state.settings.soundEnabled;

    const modeSelect = document.getElementById('settings-mode-select');
    if (modeSelect) modeSelect.value = state.settings.defaultPracticeMode;
  }

  // Keyboard Shortcuts Listener
  window.addEventListener('keydown', (e) => {
    // If inside an input or select, skip
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

    const key = e.key;
    if (activePractice && document.getElementById('view-practice-session').classList.contains('active')) {
      if (['1', '2', '3', '4'].includes(key)) {
        const optKeys = ['ক', 'খ', 'গ', 'ঘ'];
        selectPracticeOption(optKeys[parseInt(key) - 1]);
      } else if (key === 'ArrowRight') {
        nextPracticeQuestion();
      } else if (key === 'ArrowLeft') {
        prevPracticeQuestion();
      } else if (key === 'Enter') {
        if (activePractice.feedbackMode === 'submit') {
          submitCurrentPracticeAnswer();
        } else {
          nextPracticeQuestion();
        }
      }
    } else if (activeExam && document.getElementById('view-exam-session').classList.contains('active')) {
      if (['1', '2', '3', '4'].includes(key)) {
        const optKeys = ['ক', 'খ', 'গ', 'ঘ'];
        selectExamOption(optKeys[parseInt(key) - 1]);
      } else if (key === 'ArrowRight') {
        if (activeExam.currentIndex < activeExam.questions.length - 1) {
          jumpToExamQuestion(activeExam.currentIndex + 1);
        }
      } else if (key === 'ArrowLeft') {
        if (activeExam.currentIndex > 0) {
          jumpToExamQuestion(activeExam.currentIndex - 1);
        }
      }
    }
  });

  // Global App API (exposed on window)
  window.OnushilonApp = {
    init: function() {
      loadState();
      applyTheme(state.settings.theme);
      applyFontSize(state.settings.questionFontSize);
      renderDashboard();
      renderBanksView();

      // Mobile Menu Toggle
      document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
        document.getElementById('sidebar')?.classList.toggle('open');
      });

      // Theme button
      document.getElementById('theme-toggle-btn')?.addEventListener('click', () => {
        const current = state.settings.theme === 'dark' ? 'light' : 'dark';
        applyTheme(current);
      });

      // Focus mode button
      document.getElementById('focus-mode-btn')?.addEventListener('click', toggleFocusMode);
    },
    navigate: navigateTo,
    openPracticeSetup: openPracticeSetup,
    closePracticeSetup: closePracticeSetup,
    startPracticeForBank: function(bankId) { openPracticeSetup(bankId); },
    startPractice: startPractice,
    selectPracticeOption: selectPracticeOption,
    submitCurrentPracticeAnswer: submitCurrentPracticeAnswer,
    clearPracticeSelection: clearPracticeSelection,
    prevPracticeQuestion: prevPracticeQuestion,
    nextPracticeQuestion: nextPracticeQuestion,
    toggleBookmark: toggleBookmark,
    removeBookmark: removeBookmark,
    openExamSetup: openExamSetup,
    closeExamSetup: closeExamSetup,
    startExamForBank: function(bankId) { openExamSetup(bankId); },
    startExam: startExam,
    selectExamOption: selectExamOption,
    clearExamSelection: clearExamSelection,
    toggleExamReviewMark: toggleExamReviewMark,
    jumpToExamQuestion: jumpToExamQuestion,
    confirmSubmitExam: confirmSubmitExam,
    closeSubmitConfirmModal: closeSubmitConfirmModal,
    submitExam: submitExam,
    filterReviewQuestions: filterReviewQuestions,
    startRevisionPractice: startRevisionPractice,
    startBookmarksPractice: startBookmarksPractice,
    viewPastExamResult: viewPastExamResult,
    openBankDetails: openBankDetails,
    closeBankDetails: closeBankDetails,
    exportFullBackup: exportFullBackup,
    exportSingleBank: exportSingleBank,
    handleImportFileSelect: handleImportFileSelect,
    closeBackupPreviewModal: closeBackupPreviewModal,
    executeImport: executeImport,
    resetAllData: resetAllData,
    applyTheme: applyTheme,
    applyFontSize: applyFontSize,
    updatePreset: function(containerId, inputId, val) {
      updatePresetPillActive(containerId, val);
      document.getElementById(inputId).value = val;
    },
    copyResultSummary: function() {
      if (!lastExamResult) return;
      const text = `অনুশীলন (Onushilon) ফলাফল:\nপ্রাপ্ত নম্বর: ${lastExamResult.score}/${lastExamResult.maxScore} (${lastExamResult.percentage}%)\nসঠিক: ${lastExamResult.correct}, ভুল: ${lastExamResult.wrong}, উত্তরহীন: ${lastExamResult.unanswered}`;
      navigator.clipboard.writeText(text).then(() => {
        showToast("ফলাফল ক্লিপবোর্ডে কপি হয়েছে!", "success");
      });
    },
    printResults: function() {
      window.print();
    }
  };

  // Run on DOM loaded
  document.addEventListener('DOMContentLoaded', window.OnushilonApp.init);
})();
