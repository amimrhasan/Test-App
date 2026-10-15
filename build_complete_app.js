const fs = require('fs');

const banksJson = fs.readFileSync('final_question_banks.json', 'utf-8');
const cssStyles = fs.readFileSync('app_styles.css', 'utf-8');
const jsLogic = fs.readFileSync('app_logic.js', 'utf-8');

const htmlContent = `<!DOCTYPE html>
<html lang="bn" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>অনুশীলন (Onushilon) — Premium MCQ Practice & Exam Platform</title>
  <meta name="description" content="পড়ো, অনুশীলন করো, নিজেকে যাচাই করো — এইচএসসি ও আলিম পরীক্ষার্থীদের জন্য ১০০% নির্ভুল ও ফ্রি বহুনির্বাচনি (MCQ) অনুশীলন ও পরীক্ষা প্ল্যাটফর্ম।">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700;800&family=Noto+Sans+Bengali:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
${cssStyles}
  </style>
</head>
<body>
  <div class="app-container">
    <!-- Left Navigation Sidebar -->
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-header">
        <div class="brand-icon">অ</div>
        <div class="brand-info">
          <h2>অনুশীলন</h2>
          <span>ONUSHILON</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <button class="nav-item active" data-view="dashboard" onclick="window.OnushilonApp.navigate('dashboard')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          <span>ড্যাশবোর্ড</span>
        </button>

        <button class="nav-item" data-view="banks" onclick="window.OnushilonApp.navigate('banks')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          <span>প্রশ্ন ব্যাংক</span>
          <span class="nav-badge" id="nav-bank-count">২</span>
        </button>

        <button class="nav-item" onclick="window.OnushilonApp.openPracticeSetup()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          <span>অনুশীলন শুরু</span>
        </button>

        <button class="nav-item" onclick="window.OnushilonApp.openExamSetup()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span>মডেল টেস্ট পরীক্ষা</span>
        </button>

        <button class="nav-item" data-view="revision" onclick="window.OnushilonApp.navigate('revision')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          <span>ভুল প্রশ্ন সংশোধন</span>
        </button>

        <button class="nav-item" data-view="bookmarks" onclick="window.OnushilonApp.navigate('bookmarks')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <span>বুকমার্কস</span>
        </button>

        <button class="nav-item" data-view="analytics" onclick="window.OnushilonApp.navigate('analytics')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          <span>অগ্রগতি ও বিশ্লেষণ</span>
        </button>

        <button class="nav-item" data-view="backup" onclick="window.OnushilonApp.navigate('backup')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          <span>ব্যাকআপ ও রিস্টোর</span>
        </button>

        <button class="nav-item" data-view="settings" onclick="window.OnushilonApp.navigate('settings')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          <span>সেটিংস</span>
        </button>
      </nav>

      <div class="sidebar-footer">
        <span>সংস্করণ ১.০ • ১০০% ফ্রি</span>
        <span style="color:var(--success); font-weight:700;">● অফলাইন</span>
      </div>
    </aside>

    <!-- Main Content Wrapper -->
    <div class="main-wrapper" id="main-wrapper">
      <!-- Top Sticky Header -->
      <header class="app-header" id="app-header">
        <div class="header-left">
          <button class="menu-toggle" id="mobile-menu-btn" aria-label="মেনু খুলুন">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <span class="header-title" id="page-title">অনুশীলন — অনুষঙ্গ</span>
        </div>

        <div class="header-right">
          <button class="icon-btn" id="focus-mode-btn" title="ফোকাস মোড">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
            <span class="btn-text-responsive">ফোকাস</span>
          </button>

          <button class="icon-btn" id="theme-toggle-btn" title="থিম পরিবর্তন">
            <span id="theme-toggle-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            </span>
          </button>
        </div>
      </header>

      <!-- Content Area Views -->
      <main class="content-area">
        <!-- 1. DASHBOARD VIEW -->
        <section id="view-dashboard" class="view-section active">
          <div class="welcome-hero">
            <h1>আজকের অনুশীলন শুরু করো</h1>
            <p>ছোট ছোট অনুশীলনই তোমাকে প্রস্তুত করে তুলবে। আসল পরীক্ষার আগে নিজেকে শতভাগ আত্মবিশ্বাসী করে তোলো।</p>
            <div style="margin-top: 18px; display:flex; gap:12px; flex-wrap:wrap;">
              <button class="btn" style="background:#fff; color:#1e3a8a;" onclick="window.OnushilonApp.openPracticeSetup()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                অনুশীলন শুরু করুন
              </button>
              <button class="btn" style="background:rgba(255,255,255,0.2); color:#fff; border:1px solid rgba(255,255,255,0.4);" onclick="window.OnushilonApp.openExamSetup()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                মডেল টেস্ট পরীক্ষা
              </button>
            </div>
          </div>

          <!-- Statistics Counters -->
          <div class="hero-stats-row">
            <div class="stat-card">
              <div class="stat-icon blue">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              </div>
              <div class="stat-data">
                <h3 id="dash-stat-banks">২</h3>
                <p>প্রশ্ন ব্যাংক</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon purple">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <div class="stat-data">
                <h3 id="dash-stat-total-q">৩৩৯</h3>
                <p>মোট সংগৃহীত MCQ</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon amber">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              </div>
              <div class="stat-data">
                <h3 id="dash-stat-attempted">০</h3>
                <p>অনুশীলিত প্রশ্ন</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon green">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <div class="stat-data">
                <h3 id="dash-stat-accuracy">০%</h3>
                <p>সামগ্রিক নির্ভুলতা</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon blue">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div class="stat-data">
                <h3 id="dash-stat-exams">০</h3>
                <p>সম্পন্ন পরীক্ষা</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon amber">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </div>
              <div class="stat-data">
                <h3 id="dash-stat-best-score">০%</h3>
                <p>সেরা পরীক্ষার স্কোর</p>
              </div>
            </div>
          </div>

          <!-- Featured Question Banks Section -->
          <div class="section-header">
            <h2>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              প্রশ্ন ব্যাংকসমূহ
            </h2>
            <button class="icon-btn" onclick="window.OnushilonApp.navigate('banks')">সবগুলো দেখুন →</button>
          </div>
          <div class="bank-grid" id="dash-bank-grid"></div>

          <!-- Recent Activity Timeline -->
          <div class="section-header" style="margin-top:20px;">
            <h2>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              সাম্প্রতিক সেশন ও পরীক্ষার হিস্ট্রি
            </h2>
          </div>
          <div class="card" id="dash-recent-list"></div>
        </section>

        <!-- 2. QUESTION BANKS VIEW -->
        <section id="view-banks" class="view-section">
          <div class="section-header">
            <div>
              <h2>প্রশ্ন ব্যাংক ব্যবস্থাপনা</h2>
              <p>সংযুক্ত সকল পিডিএফের প্রশ্ন ব্যাংকসমূহ সম্পূর্ণ আলাদা ও সংরক্ষিত</p>
            </div>
            <button class="btn btn-primary" onclick="window.OnushilonApp.navigate('backup')">
              + নতুন প্রশ্ন ব্যাংক ইমপোর্ট
            </button>
          </div>
          <div class="bank-grid" id="all-banks-grid"></div>
        </section>

        <!-- 3. PRACTICE ACTIVE SESSION VIEW -->
        <section id="view-practice-session" class="view-section">
          <div class="session-container">
            <div class="session-topbar">
              <div class="session-progress-wrapper">
                <div class="progress-info">
                  <span id="practice-q-counter">প্রশ্ন ১ / ২০</span>
                  <span id="practice-q-meta" style="color:var(--text-muted); font-size:0.8rem;">বাংলা ১ম পত্র</span>
                </div>
                <div class="progress-track">
                  <div class="progress-fill" id="practice-progress-fill"></div>
                </div>
              </div>
              <div style="display:flex; align-items:center; gap:10px;">
                <div class="timer-badge" id="practice-timer-badge">⏱ ১৫:০০</div>
                <button class="icon-btn" id="practice-bookmark-btn" onclick="window.OnushilonApp.toggleBookmark(activePractice.bankId, activePractice.questions[activePractice.currentIndex].id, this)">
                  ☆ বুকমার্ক
                </button>
              </div>
            </div>

            <!-- Interactive Question Card -->
            <div class="question-card">
              <div class="stimulus-box" id="practice-stimulus-box" style="display:none;"></div>
              
              <div class="question-header">
                <div class="question-text" id="practice-q-text">১। প্রশ্ন টেক্সট এখানে প্রদর্শিত হবে...</div>
              </div>

              <div class="question-statements" id="practice-statements-box" style="display:none;"></div>

              <div class="options-list" id="practice-options-list"></div>

              <div class="explanation-panel" id="practice-explanation-panel" style="display:none;"></div>
            </div>

            <!-- Action Bar -->
            <div class="session-controls">
              <div class="controls-left">
                <button class="btn btn-secondary" id="practice-prev-btn" onclick="window.OnushilonApp.prevPracticeQuestion()">
                  ← পূর্ববর্তী
                </button>
                <button class="btn btn-secondary" onclick="window.OnushilonApp.clearPracticeSelection()">
                  মুছে ফেলুন
                </button>
              </div>

              <div class="controls-right">
                <button class="btn btn-primary" id="practice-submit-answer-btn" style="display:none;" onclick="window.OnushilonApp.submitCurrentPracticeAnswer()">
                  জমা দিন
                </button>
                <button class="btn btn-primary" id="practice-next-btn" onclick="window.OnushilonApp.nextPracticeQuestion()">
                  পরবর্তী প্রশ্ন →
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- 4. PRACTICE SUMMARY VIEW -->
        <section id="view-practice-summary" class="view-section">
          <div class="card result-banner">
            <h2 style="font-size:1.8rem; margin-bottom:8px;">অনুশীলন সম্পন্ন হয়েছে! 🎉</h2>
            <p>আপনার আজকের অনুশীলন সেশনের ফলাফল নিচে দেওয়া হলো:</p>
            
            <div class="result-breakdown-grid" style="margin:24px auto;">
              <div class="res-item">
                <div style="font-size:1.4rem; font-weight:800; color:var(--text-primary);" id="summary-total">০</div>
                <div style="font-size:0.8rem; color:var(--text-muted);">মোট প্রশ্ন</div>
              </div>
              <div class="res-item">
                <div style="font-size:1.4rem; font-weight:800; color:var(--primary);" id="summary-answered">০</div>
                <div style="font-size:0.8rem; color:var(--text-muted);">উত্তর দেওয়া হয়েছে</div>
              </div>
              <div class="res-item">
                <div style="font-size:1.4rem; font-weight:800; color:var(--success);" id="summary-correct">০</div>
                <div style="font-size:0.8rem; color:var(--text-muted);">সঠিক উত্তর</div>
              </div>
              <div class="res-item">
                <div style="font-size:1.4rem; font-weight:800; color:var(--danger);" id="summary-wrong">০</div>
                <div style="font-size:0.8rem; color:var(--text-muted);">ভুল উত্তর</div>
              </div>
              <div class="res-item">
                <div style="font-size:1.4rem; font-weight:800; color:var(--accent);" id="summary-accuracy">০%</div>
                <div style="font-size:0.8rem; color:var(--text-muted);">নির্ভুলতার হার</div>
              </div>
              <div class="res-item">
                <div style="font-size:1.1rem; font-weight:700; color:var(--text-secondary);" id="summary-time">০ সেকেন্ড</div>
                <div style="font-size:0.8rem; color:var(--text-muted);">ব্যয়িত সময়</div>
              </div>
            </div>

            <div style="display:flex; justify-content:center; gap:12px; margin-top:20px; flex-wrap:wrap;">
              <button class="btn btn-secondary" onclick="window.OnushilonApp.navigate('revision')">ভুল প্রশ্নগুলো রিভিশন করুন</button>
              <button class="btn btn-primary" onclick="window.OnushilonApp.openPracticeSetup()">নতুন অনুশীলন শুরু</button>
              <button class="btn btn-secondary" onclick="window.OnushilonApp.navigate('dashboard')">ড্যাশবোর্ডে ফিরে যান</button>
            </div>
          </div>
        </section>

        <!-- 5. EXAM ACTIVE SESSION VIEW -->
        <section id="view-exam-session" class="view-section">
          <div class="exam-layout">
            <div class="session-container">
              <div class="session-topbar">
                <div style="display:flex; align-items:center; gap:12px;">
                  <span style="font-weight:700; font-size:1.1rem; color:var(--accent);">মডেল টেস্ট পরীক্ষা</span>
                  <span id="exam-q-counter" style="color:var(--text-secondary); font-size:0.9rem;">প্রশ্ন ১ / ২০</span>
                </div>
                <div style="display:flex; align-items:center; gap:10px;">
                  <div class="timer-badge urgent" id="exam-timer-badge">⏱ ১৫:০০</div>
                  <button class="btn btn-danger" onclick="window.OnushilonApp.confirmSubmitExam()">
                    পরীক্ষা জমা দিন ✓
                  </button>
                </div>
              </div>

              <!-- Question Card -->
              <div class="question-card">
                <div class="stimulus-box" id="exam-stimulus-box" style="display:none;"></div>
                
                <div class="question-header">
                  <div class="question-text" id="exam-q-text">১। পরীক্ষার প্রশ্ন এখানে আসবে...</div>
                </div>

                <div class="question-statements" id="exam-statements-box" style="display:none;"></div>

                <div class="options-list" id="exam-options-list"></div>
              </div>

              <!-- Action Controls -->
              <div class="session-controls">
                <div class="controls-left">
                  <button class="btn btn-secondary" id="exam-prev-btn" onclick="window.OnushilonApp.jumpToExamQuestion(activeExam.currentIndex - 1)">
                    ← পূর্ববর্তী
                  </button>
                  <button class="btn btn-secondary" onclick="window.OnushilonApp.clearExamSelection()">
                    সিলেকশন মুছুন
                  </button>
                  <button class="btn btn-secondary" id="exam-mark-review-btn" onclick="window.OnushilonApp.toggleExamReviewMark()">
                    ☆ রিভিউ মার্ক
                  </button>
                </div>

                <div class="controls-right">
                  <button class="btn btn-primary" id="exam-next-btn" onclick="window.OnushilonApp.jumpToExamQuestion(activeExam.currentIndex + 1)">
                    পরবর্তী প্রশ্ন →
                  </button>
                </div>
              </div>
            </div>

            <!-- Right Question Palette Panel -->
            <div class="card palette-card">
              <h3 style="font-size:1.1rem; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
                <span>প্রশ্ন প্যালেট</span>
                <span style="font-size:0.75rem; color:var(--text-muted);">ক্লিক করে জাম্প করুন</span>
              </h3>
              
              <div class="palette-grid" id="exam-palette-grid"></div>

              <div class="palette-legend">
                <div class="legend-item"><div class="legend-dot" style="background:var(--success);"></div>উত্তর দেওয়া (<span id="palette-answered-count">০</span>)</div>
                <div class="legend-item"><div class="legend-dot" style="background:var(--warning);"></div>মার্ক করা (<span id="palette-reviewed-count">০</span>)</div>
                <div class="legend-item"><div class="legend-dot" style="background:var(--bg-subtle); border:1px solid var(--border);"></div>উত্তরহীন (<span id="palette-unanswered-count">০</span>)</div>
                <div class="legend-item"><div class="legend-dot" style="border:2px solid var(--primary);"></div>বর্তমান প্রশ্ন</div>
              </div>
            </div>
          </div>
        </section>

        <!-- 6. EXAM RESULTS & REVIEW VIEW -->
        <section id="view-exam-results" class="view-section">
          <div class="card result-banner">
            <h2 style="font-size:1.85rem; margin-bottom:6px;">পরীক্ষার ফলাফল ও পর্যালোচনা</h2>
            <p>আপনার অর্জিত ফলাফল, নির্ভুলতা ও বিস্তারিত মূল্যায়ন:</p>

            <div class="score-circle">
              <div class="score-number" id="res-score">০</div>
              <div class="score-total" id="res-max-score">/২০</div>
            </div>

            <div class="result-breakdown-grid">
              <div class="res-item">
                <div style="font-size:1.3rem; font-weight:800; color:var(--primary);" id="res-pct">০%</div>
                <div style="font-size:0.8rem; color:var(--text-muted);">শতাংশ</div>
              </div>
              <div class="res-item">
                <div style="font-size:1.3rem; font-weight:800; color:var(--success);" id="res-correct">০</div>
                <div style="font-size:0.8rem; color:var(--text-muted);">সঠিক উত্তর (+১)</div>
              </div>
              <div class="res-item">
                <div style="font-size:1.3rem; font-weight:800; color:var(--danger);" id="res-wrong">০</div>
                <div style="font-size:0.8rem; color:var(--text-muted);">ভুল উত্তর</div>
              </div>
              <div class="res-item">
                <div style="font-size:1.3rem; font-weight:800; color:var(--warning);" id="res-unanswered">০</div>
                <div style="font-size:0.8rem; color:var(--text-muted);">উত্তর না দেওয়া</div>
              </div>
              <div class="res-item">
                <div style="font-size:1.3rem; font-weight:800; color:var(--danger);" id="res-neg">০</div>
                <div style="font-size:0.8rem; color:var(--text-muted);">নেগেটিভ কর্তন</div>
              </div>
              <div class="res-item">
                <div style="font-size:1.1rem; font-weight:700; color:var(--text-secondary);" id="res-time">০ মিনিট</div>
                <div style="font-size:0.8rem; color:var(--text-muted);">ব্যয়িত সময়</div>
              </div>
            </div>

            <div style="display:flex; justify-content:center; gap:10px; margin-top:20px; flex-wrap:wrap;">
              <button class="btn btn-secondary" onclick="window.OnushilonApp.printResults()">
                🖨 প্রিন্ট / PDF সংরক্ষণ
              </button>
              <button class="btn btn-secondary" onclick="window.OnushilonApp.copyResultSummary()">
                📋 ফলাফল কপি করুন
              </button>
              <button class="btn btn-primary" onclick="window.OnushilonApp.openExamSetup()">
                নতুন পরীক্ষা দিন
              </button>
              <button class="btn btn-secondary" onclick="window.OnushilonApp.navigate('dashboard')">
                ড্যাশবোর্ড
              </button>
            </div>
          </div>

          <!-- Question-by-Question Review Section -->
          <div class="section-header">
            <h2>প্রশ্নোত্তর বিশদ বিশ্লেষণ ও সলভ শিট</h2>
          </div>

          <div class="review-filter-tabs">
            <button class="filter-tab active" data-filter="all" onclick="window.OnushilonApp.filterReviewQuestions('all')">সকল প্রশ্ন</button>
            <button class="filter-tab" data-filter="correct" onclick="window.OnushilonApp.filterReviewQuestions('correct')">সঠিক উত্তরসমূহ</button>
            <button class="filter-tab" data-filter="wrong" onclick="window.OnushilonApp.filterReviewQuestions('wrong')">ভুল উত্তরসমূহ</button>
            <button class="filter-tab" data-filter="unanswered" onclick="window.OnushilonApp.filterReviewQuestions('unanswered')">উত্তর না দেওয়া</button>
          </div>

          <div class="review-list" id="exam-review-container"></div>
        </section>

        <!-- 7. REVISION VIEW -->
        <section id="view-revision" class="view-section">
          <div class="section-header">
            <div>
              <h2>ভুল প্রশ্ন সংশোধন ও রিভিশন</h2>
              <p>আপনার বিগত সকল অনুশীলন ও পরীক্ষায় ভুল হওয়া প্রশ্নের তালিকা</p>
            </div>
            <button class="btn btn-primary" id="start-revision-btn" onclick="window.OnushilonApp.startRevisionPractice()">
              সকল ভুল প্রশ্ন রিভিশন অনুশীলন
            </button>
          </div>
          <div id="revision-count-badge" style="font-weight:700; color:var(--danger); margin-bottom:14px;"></div>
          <div id="revision-questions-list"></div>
        </section>

        <!-- 8. BOOKMARKS VIEW -->
        <section id="view-bookmarks" class="view-section">
          <div class="section-header">
            <div>
              <h2>সংরক্ষিত প্রশ্ন (Bookmarks)</h2>
              <p>আপনার বুকমার্ক করে রাখা গুরুত্বপূর্ণ বহুনির্বাচনি প্রশ্নসমূহ</p>
            </div>
            <button class="btn btn-primary" id="start-bookmarks-btn" onclick="window.OnushilonApp.startBookmarksPractice()">
              বুকমার্ক অনুশীলন শুরু
            </button>
          </div>
          <div id="bookmarks-list"></div>
        </section>

        <!-- 9. PROGRESS ANALYTICS VIEW -->
        <section id="view-analytics" class="view-section">
          <div class="section-header">
            <div>
              <h2>অগ্রগতি ও পরিসংখ্যান</h2>
              <p>আপনার প্রকৃত পড়াশোনা ও অনুশীলনের সংরক্ষিত ডেটা অনুযায়ী বিশ্লেষণ</p>
            </div>
          </div>

          <div class="hero-stats-row">
            <div class="stat-card">
              <div class="stat-icon blue">✓</div>
              <div class="stat-data">
                <h3 id="stat-total-answered">০</h3>
                <p>সর্বমোট উত্তর দেওয়া</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon green">★</div>
              <div class="stat-data">
                <h3 id="stat-correct-count">০</h3>
                <p>সঠিক উত্তর</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon amber">✗</div>
              <div class="stat-data">
                <h3 id="stat-wrong-count">০</h3>
                <p>ভুল উত্তর</p>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon purple">%</div>
              <div class="stat-data">
                <h3 id="stat-accuracy-rate">০%</h3>
                <p>গড় নির্ভুলতা</p>
              </div>
            </div>
          </div>

          <!-- Bank-wise Performance Bars -->
          <div class="card" style="margin-bottom:24px;">
            <h3 style="font-size:1.15rem; margin-bottom:14px;">প্রশ্ন ব্যাংক ভিত্তিক অগ্রগতি</h3>
            <div id="analytics-bank-bars"></div>
          </div>

          <!-- Exams History Table -->
          <div class="card">
            <h3 style="font-size:1.15rem; margin-bottom:14px;">মডেল টেস্ট পরীক্ষার পূর্ববর্তী ইতিহাস</h3>
            <div style="overflow-x:auto;">
              <table style="width:100%; border-collapse:collapse; text-align:left; font-size:0.9rem;">
                <thead>
                  <tr style="border-bottom:2px solid var(--border); color:var(--text-muted); font-size:0.8rem; text-transform:uppercase;">
                    <th style="padding:10px;">#</th>
                    <th style="padding:10px;">প্রশ্ন ব্যাংক</th>
                    <th style="padding:10px;">তারিখ</th>
                    <th style="padding:10px;">নম্বর</th>
                    <th style="padding:10px;">শতকরা</th>
                    <th style="padding:10px;">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody id="analytics-exam-history-body"></tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- 10. BACKUP & RESTORE VIEW -->
        <section id="view-backup" class="view-section">
          <div class="section-header">
            <div>
              <h2>ব্যাকআপ ও ডেটা রিস্টোর</h2>
              <p>আপনার সমস্ত প্রশ্ন ব্যাংক, বুকমার্ক ও পরীক্ষার ইতিহাস এক্সপোর্ট অথবা ইমপোর্ট করুন</p>
            </div>
          </div>

          <div class="card" style="margin-bottom:20px;">
            <h3 style="font-size:1.2rem; margin-bottom:8px;">সম্পূর্ণ ব্যাকআপ এক্সপোর্ট (JSON)</h3>
            <p style="margin-bottom:16px;">আপনার সংরক্ষিত সকল প্রশ্ন ব্যাংক, বুকমার্ক, অনুশীলিত ইতিহাস ও পরিসংখ্যান একটি পোর্টেবল JSON ফাইলে ডাউনলোড করুন।</p>
            <button class="btn btn-primary" onclick="window.OnushilonApp.exportFullBackup()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              সম্পূর্ণ ব্যাকআপ ফাইল ডাউনলোড করুন
            </button>
          </div>

          <div class="card" style="margin-bottom:20px;">
            <h3 style="font-size:1.2rem; margin-bottom:8px;">ব্যাকআপ ফাইল থেকে রিস্টোর (JSON Import)</h3>
            <p style="margin-bottom:16px;">পূর্বে এক্সপোর্ট করা কোনো ব্যাকআপ JSON ফাইল সিলেক্ট করুন। ফাইল যাচাই করে সংযুক্ত (Merge) বা প্রতিস্থাপন (Replace) করতে পারবেন।</p>
            <input type="file" id="backup-file-input" accept=".json" onchange="window.OnushilonApp.handleImportFileSelect(event)" style="display:none;">
            <button class="btn btn-secondary" onclick="document.getElementById('backup-file-input').click()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              JSON ফাইল নির্বাচন করুন
            </button>
          </div>

          <div class="card">
            <h3 style="font-size:1.2rem; margin-bottom:12px;">আলাদা প্রশ্ন ব্যাংক এক্সপোর্ট</h3>
            <div id="backup-bank-export-list"></div>
          </div>
        </section>

        <!-- 11. SETTINGS VIEW -->
        <section id="view-settings" class="view-section">
          <div class="section-header">
            <div>
              <h2>অ্যাপ্লিকেশন সেটিংস</h2>
              <p>আপনার পড়ার সুবিধা অনুযায়ী অ্যাপের সেটিংস কাস্টমাইজ করুন</p>
            </div>
          </div>

          <div class="card" style="max-width:600px;">
            <div class="form-group">
              <label class="form-label">থিম মোড</label>
              <select class="form-select" id="settings-theme-select" onchange="window.OnushilonApp.applyTheme(this.value)">
                <option value="light">লাইট মোড (Light)</option>
                <option value="dark">ডার্ক মোড (Dark)</option>
                <option value="system">সিস্টেম ডিফল্ট (System)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">প্রশ্নের ফন্ট সাইজ</label>
              <select class="form-select" id="settings-font-select" onchange="window.OnushilonApp.applyFontSize(this.value)">
                <option value="small">ছোট (Small - ১৬px)</option>
                <option value="medium">মাঝারি (Medium - ১৮px)</option>
                <option value="large">বড় (Large - ২২px)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">অনুশীলনের ডিফল্ট ফিডব্যাক মোড</label>
              <select class="form-select" id="settings-mode-select">
                <option value="instant">তাৎক্ষণিক ফলাফল (Instant Feedback)</option>
                <option value="submit">উত্তর জমা দিয়ে যাচাই (Submit to Check)</option>
              </select>
            </div>

            <div class="form-group" style="display:flex; align-items:center; gap:10px;">
              <input type="checkbox" id="settings-sound-check" checked style="width:18px; height:18px;">
              <label for="settings-sound-check" class="form-label" style="margin-bottom:0;">অডিও সাউন্ড ইফেক্ট চালু রাখুন</label>
            </div>

            <div style="margin-top:28px; padding-top:20px; border-top:1px solid var(--border);">
              <h4 style="color:var(--danger); margin-bottom:6px;">ডেটা রিসেট জোন</h4>
              <p style="font-size:0.85rem; margin-bottom:12px;">আপনার সকল হিস্ট্রি মুছে প্রথম অবস্থায় ফিরে যেতে নিচের বাটন ব্যবহার করুন।</p>
              <button class="btn btn-danger" onclick="window.OnushilonApp.resetAllData()">
                সকল ডেটা মুছে ফেলুন
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>

  <!-- MODALS -->

  <!-- Practice Setup Modal -->
  <div class="modal-overlay" id="practice-setup-modal">
    <div class="modal-box">
      <div class="modal-header">
        <h3>অনুশীলন শুরু করুন</h3>
        <button class="icon-btn" onclick="window.OnushilonApp.closePracticeSetup()">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">প্রশ্ন ব্যাংক নির্বাচন করুন</label>
          <select class="form-select" id="practice-bank-select"></select>
        </div>

        <div class="form-group">
          <label class="form-label">প্রশ্নের সংখ্যা</label>
          <div class="preset-group" id="practice-count-presets" style="margin-bottom:8px;">
            <button class="preset-btn" data-value="5" onclick="window.OnushilonApp.updatePreset('practice-count-presets', 'practice-custom-count', 5)">৫টি</button>
            <button class="preset-btn" data-value="10" onclick="window.OnushilonApp.updatePreset('practice-count-presets', 'practice-custom-count', 10)">১০টি</button>
            <button class="preset-btn" data-value="15" onclick="window.OnushilonApp.updatePreset('practice-count-presets', 'practice-custom-count', 15)">১৫টি</button>
            <button class="preset-btn active" data-value="20" onclick="window.OnushilonApp.updatePreset('practice-count-presets', 'practice-custom-count', 20)">২০টি</button>
            <button class="preset-btn" data-value="25" onclick="window.OnushilonApp.updatePreset('practice-count-presets', 'practice-custom-count', 25)">২৫টি</button>
            <button class="preset-btn" data-value="50" onclick="window.OnushilonApp.updatePreset('practice-count-presets', 'practice-custom-count', 50)">৫০টি</button>
            <button class="preset-btn" data-value="200" onclick="window.OnushilonApp.updatePreset('practice-count-presets', 'practice-custom-count', 200)">সকল প্রশ্ন</button>
          </div>
          <input type="number" class="form-input" id="practice-custom-count" value="20" min="1" max="200" placeholder="কাস্টম সংখ্যা">
        </div>

        <div class="form-group">
          <label class="form-label">প্রশ্নের ক্রম</label>
          <select class="form-select" id="practice-order-select">
            <option value="original">মূল পিডিএফের ধারাবাহিক ক্রম</option>
            <option value="random">এলোমেলো (র‍্যান্ডম) ক্রম</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">প্রশ্ন ফিল্টার</label>
          <select class="form-select" id="practice-filter-select">
            <option value="all">সকল প্রশ্ন</option>
            <option value="unattempted">এখনো চেষ্টা না করা প্রশ্ন</option>
            <option value="wrong">পূর্বে ভুল হওয়া প্রশ্ন</option>
            <option value="bookmarked">বুকমার্ক করা প্রশ্ন</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">উত্তর ফিডব্যাক মোড</label>
          <select class="form-select" id="practice-mode-select">
            <option value="instant">মোড ক: তাৎক্ষণিক সঠিক/ভুল ফলাফল (Instant Feedback)</option>
            <option value="submit">মোড খ: উত্তর নির্বাচন করে 'জমা দিন' (Submit to Check)</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">কাউন্টডাউন টাইমার (ঐচ্ছিক)</label>
          <select class="form-select" id="practice-timer-select">
            <option value="0">টাইমার বন্ধ</option>
            <option value="5">৫ মিনিট</option>
            <option value="10">১০ মিনিট</option>
            <option value="15">১৫ মিনিট</option>
            <option value="20">২০ মিনিট</option>
            <option value="30">৩০ মিনিট</option>
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="window.OnushilonApp.closePracticeSetup()">বাতিল</button>
        <button class="btn btn-primary" onclick="window.OnushilonApp.startPractice()">শুরু করুন →</button>
      </div>
    </div>
  </div>

  <!-- Exam Setup Modal -->
  <div class="modal-overlay" id="exam-setup-modal">
    <div class="modal-box">
      <div class="modal-header">
        <h3>মডেল টেস্ট পরীক্ষা শুরু করুন</h3>
        <button class="icon-btn" onclick="window.OnushilonApp.closeExamSetup()">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">প্রশ্ন ব্যাংক নির্বাচন করুন</label>
          <select class="form-select" id="exam-bank-select"></select>
        </div>

        <div class="form-group">
          <label class="form-label">প্রশ্নের সংখ্যা</label>
          <div class="preset-group" id="exam-count-presets" style="margin-bottom:8px;">
            <button class="preset-btn" data-value="10" onclick="window.OnushilonApp.updatePreset('exam-count-presets', 'exam-custom-count', 10)">১০টি</button>
            <button class="preset-btn active" data-value="20" onclick="window.OnushilonApp.updatePreset('exam-count-presets', 'exam-custom-count', 20)">২০টি</button>
            <button class="preset-btn" data-value="30" onclick="window.OnushilonApp.updatePreset('exam-count-presets', 'exam-custom-count', 30)">৩০টি</button>
            <button class="preset-btn" data-value="50" onclick="window.OnushilonApp.updatePreset('exam-count-presets', 'exam-custom-count', 50)">৫০টি</button>
          </div>
          <input type="number" class="form-input" id="exam-custom-count" value="20" min="5" max="100">
        </div>

        <div class="form-group">
          <label class="form-label">পরীক্ষার সময়কাল (মিনিট)</label>
          <div class="preset-group" id="exam-time-presets" style="margin-bottom:8px;">
            <button class="preset-btn" data-value="10" onclick="window.OnushilonApp.updatePreset('exam-time-presets', 'exam-custom-time', 10)">১০ মিনিট</button>
            <button class="preset-btn active" data-value="15" onclick="window.OnushilonApp.updatePreset('exam-time-presets', 'exam-custom-time', 15)">১৫ মিনিট</button>
            <button class="preset-btn" data-value="20" onclick="window.OnushilonApp.updatePreset('exam-time-presets', 'exam-custom-time', 20)">২০ মিনিট</button>
            <button class="preset-btn" data-value="30" onclick="window.OnushilonApp.updatePreset('exam-time-presets', 'exam-custom-time', 30)">৩০ মিনিট</button>
          </div>
          <input type="number" class="form-input" id="exam-custom-time" value="15" min="1" max="120">
        </div>

        <div class="form-group" style="display:flex; align-items:center; justify-content:space-between; padding:10px 14px; background:var(--bg-subtle); border-radius:var(--radius-sm); border:1px solid var(--border);">
          <div>
            <label for="exam-neg-marking" style="font-weight:600; cursor:pointer;">নেগেটিভ মার্কিং চালু রাখুন</label>
            <span style="font-size:0.75rem; color:var(--text-muted); display:block;">প্রতি ভুল উত্তরে নির্ধারিত নম্বর কাটা যাবে</span>
          </div>
          <input type="checkbox" id="exam-neg-marking" style="width:18px; height:18px; cursor:pointer;">
        </div>

        <div class="form-group">
          <label class="form-label">ভুল উত্তরের জন্য কর্তন রেট</label>
          <select class="form-select" id="exam-neg-rate">
            <option value="0.25">০.২৫ নম্বর (১/৪)</option>
            <option value="0.50">০.৫০ নম্বর (১/২)</option>
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="window.OnushilonApp.closeExamSetup()">বাতিল</button>
        <button class="btn btn-primary" onclick="window.OnushilonApp.startExam()">পরীক্ষা শুরু করুন →</button>
      </div>
    </div>
  </div>

  <!-- Exam Submit Confirmation Modal -->
  <div class="modal-overlay" id="exam-submit-confirm-modal">
    <div class="modal-box" style="max-width:460px;">
      <div class="modal-header">
        <h3>পরীক্ষা জমা নিশ্চিতকরণ</h3>
        <button class="icon-btn" onclick="window.OnushilonApp.closeSubmitConfirmModal()">✕</button>
      </div>
      <div class="modal-body">
        <p style="margin-bottom:16px;">আপনি কি নিশ্চিত যে আপনার পরীক্ষাটি এখনই ফাইনাল সাবমিট করতে চান?</p>
        <div style="background:var(--bg-subtle); border-radius:var(--radius-sm); padding:14px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; text-align:center;">
          <div>
            <div style="font-size:1.3rem; font-weight:800; color:var(--success);" id="submit-confirm-answered">০</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">উত্তর দেওয়া</div>
          </div>
          <div>
            <div style="font-size:1.3rem; font-weight:800; color:var(--warning);" id="submit-confirm-unanswered">০</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">উত্তরহীন</div>
          </div>
          <div>
            <div style="font-size:1.3rem; font-weight:800; color:var(--accent);" id="submit-confirm-reviewed">০</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">রিভিউ মার্ক</div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="window.OnushilonApp.closeSubmitConfirmModal()">পরীক্ষায় ফিরে যান</button>
        <button class="btn btn-danger" onclick="window.OnushilonApp.submitExam(false)">নিশ্চিত জমা দিন ✓</button>
      </div>
    </div>
  </div>

  <!-- Bank Details / Question Browser Modal -->
  <div class="modal-overlay" id="bank-details-modal">
    <div class="modal-box" style="max-width:850px; height:85vh;">
      <div class="modal-header">
        <h3 id="bank-modal-title">প্রশ্ন ব্যাংকের বিস্তারিত</h3>
        <button class="icon-btn" onclick="window.OnushilonApp.closeBankDetails()">✕</button>
      </div>
      <div class="modal-body" style="padding:16px 24px;">
        <div style="margin-bottom:14px;">
          <input type="text" class="form-input" id="bank-q-search" placeholder="এই ব্যাংকের প্রশ্নের ভেতর অনুসন্ধান করুন...">
        </div>
        <div id="bank-questions-list"></div>
      </div>
    </div>
  </div>

  <!-- Backup Preview Modal -->
  <div class="modal-overlay" id="backup-preview-modal">
    <div class="modal-box" style="max-width:500px;">
      <div class="modal-header">
        <h3>ব্যাকআপ ফাইলের বিবরণ</h3>
        <button class="icon-btn" onclick="window.OnushilonApp.closeBackupPreviewModal()">✕</button>
      </div>
      <div class="modal-body">
        <p style="margin-bottom:14px;">নির্বাচিত ফাইলে নিম্নলিখিত ডেটা পাওয়া গেছে:</p>
        <div style="background:var(--bg-subtle); padding:14px; border-radius:var(--radius-sm); margin-bottom:16px;">
          <div><strong>প্রশ্ন ব্যাংক:</strong> <span id="import-preview-banks">০</span>টি</div>
          <div><strong>মোট প্রশ্ন:</strong> <span id="import-preview-questions">০</span>টি</div>
        </div>
        <p style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:8px;">আপনি কীভাবে ডেটা রিস্টোর করতে চান?</p>
      </div>
      <div class="modal-footer" style="flex-wrap:wrap; justify-content:space-between;">
        <button class="btn btn-secondary" onclick="window.OnushilonApp.closeBackupPreviewModal()">বাতিল</button>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-primary" onclick="window.OnushilonApp.executeImport('merge')">সংযুক্ত করুন (Merge)</button>
          <button class="btn btn-danger" onclick="window.OnushilonApp.executeImport('replace')">প্রতিস্থাপন (Replace)</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Toast Notification Container -->
  <div class="toast-container" id="toast-container"></div>

  <!-- Embedded Question Banks Data & App Engine -->
  <script>
    window.EMBEDDED_QUESTION_BANKS = ${banksJson};
  </script>
  <script>
${jsLogic}
  </script>
</body>
</html>
`;

// Write to root /index.html
fs.writeFileSync('index.html', htmlContent, 'utf-8');
console.log("Successfully generated /index.html (standalone downloadable file)!");

// Write to Android asset directory
fs.writeFileSync('app/src/main/assets/index.html', htmlContent, 'utf-8');
console.log("Successfully generated /app/src/main/assets/index.html for Android WebView!");
