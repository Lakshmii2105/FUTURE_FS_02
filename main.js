/* ==========================================================================
   ApexCRM - Core Application Logic
   ========================================================================== */

// 1. Data Store & State
let leads = JSON.parse(localStorage.getItem('apex_crm_leads')) || [];
let currentOpenLeadId = null;

// Mock traffic logs stream
const simulatedLogs = [
  { text: "Visitor from New York landed on /services page", type: "info" },
  { text: "Visitor from London clicked 'Get a Quote' button", type: "info" },
  { text: "Visitor from San Francisco started typing in contact form", type: "form-start" },
  { text: "Visitor from Berlin downloaded product catalog PDF", type: "info" },
  { text: "Visitor from Sydney landed on homepage via Google Search", type: "info" },
  { text: "Visitor from Toronto navigated to /pricing page", type: "info" },
  { text: "Visitor from Tokyo started typing in contact form", type: "form-start" },
  { text: "Visitor from Paris viewed case studies gallery", type: "info" },
];

// 2. Authentication Logic
function initAuth() {
  const loginScreen = document.getElementById('login-screen');
  const appContainer = document.getElementById('app-container');
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const logoutBtn = document.getElementById('logout-btn');
  const togglePasswordBtn = document.getElementById('toggle-password');
  const passwordInput = document.getElementById('password');

  // Check existing session
  const token = sessionStorage.getItem('apex_crm_token');
  if (token === 'authorized') {
    loginScreen.classList.add('hidden');
    appContainer.classList.remove('hidden');
    initializeDashboard();
  }

  // Toggle Password Visibility
  togglePasswordBtn.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    const icon = togglePasswordBtn.querySelector('i');
    if (type === 'text') {
      icon.setAttribute('data-lucide', 'eye-off');
    } else {
      icon.setAttribute('data-lucide', 'eye');
    }
    lucide.createIcons();
  });

  // Login submission
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = passwordInput.value.trim();

    if (username === 'admin' && password === 'admin123') {
      sessionStorage.setItem('apex_crm_token', 'authorized');
      loginError.classList.add('hidden');
      
      // Animate transition
      loginScreen.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      loginScreen.style.opacity = '0';
      loginScreen.style.transform = 'scale(0.95)';
      
      setTimeout(() => {
        loginScreen.classList.add('hidden');
        appContainer.classList.remove('hidden');
        loginScreen.style.opacity = '1';
        loginScreen.style.transform = 'scale(1)';
        initializeDashboard();
        showToast("Secure Access Granted", "Logged in as Administrator", "success");
      }, 400);
    } else {
      loginError.classList.remove('hidden');
      // Shake animation
      const card = document.querySelector('.login-card');
      card.style.animation = 'none';
      setTimeout(() => {
        card.style.animation = 'shake 0.4s ease-in-out';
      }, 10);
    }
  });

  // Logout trigger
  logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('apex_crm_token');
    appContainer.classList.add('hidden');
    loginScreen.classList.remove('hidden');
    showToast("Logged Out", "Session ended successfully.", "info");
  });
}

// 3. Storage Syncer
function saveLeads() {
  localStorage.setItem('apex_crm_leads', JSON.stringify(leads));
}

// 4. Tab Navigation Router
function initNavigation() {
  const navBtns = document.querySelectorAll('.nav-btn');
  const panels = document.querySelectorAll('.tab-panel');
  const pageTitle = document.getElementById('page-title');
  const pageSubtitle = document.getElementById('page-subtitle');

  const subtitles = {
    dashboard: "Welcome back. Here is the latest performance on lead conversions.",
    kanban: "Drag and drop leads between columns to advance their status.",
    list: "Search, filter, sort and manage your complete lead repository.",
    simulator: "Simulate a live client-facing contact form to test lead generation."
  };

  const titles = {
    dashboard: "Dashboard Overview",
    kanban: "Lead Pipeline Board",
    list: "Lead Directory",
    simulator: "Website Simulator & Form"
  };

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      
      // Toggle nav highlights
      navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Toggle tab panels
      panels.forEach(p => p.classList.remove('active'));
      const activePanel = document.getElementById(`tab-${targetTab}`);
      if (activePanel) activePanel.classList.add('active');

      // Update Header Text
      pageTitle.textContent = titles[targetTab];
      pageSubtitle.textContent = subtitles[targetTab];

      // Refresh view logic
      if (targetTab === 'dashboard') {
        renderDashboardStats();
      } else if (targetTab === 'kanban') {
        renderKanbanBoard();
      } else if (targetTab === 'list') {
        renderLeadsTable();
      }

      lucide.createIcons();
    });
  });

  // Live Date Time In Header
  function updateTime() {
    const liveTimeSpan = document.getElementById('live-time');
    if (liveTimeSpan) {
      const now = new Date();
      liveTimeSpan.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }
  updateTime();
  setInterval(updateTime, 60000);
}

// 5. Toast Notifications
function showToast(title, desc, type = "info") {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let iconName = "info";
  if (type === "success") iconName = "check-circle-2";
  if (type === "warning") iconName = "alert-triangle";

  toast.innerHTML = `
    <div class="toast-icon">
      <i data-lucide="${iconName}"></i>
    </div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-desc">${desc}</div>
    </div>
  `;

  container.appendChild(toast);
  lucide.createIcons();

  // Slide-in and fade out
  setTimeout(() => {
    toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// 6. Lead Seeder (Sample Data Injection)
function initSeeder() {
  const seedBtn = document.getElementById('seed-leads-btn');
  seedBtn.addEventListener('click', () => {
    const mockLeads = [
      {
        id: "lead-" + Math.random().toString(36).substr(2, 9),
        name: "Charlotte Vance",
        email: "charlotte@vancemedia.co",
        phone: "+1 (415) 304-9182",
        company: "Vance Media",
        service: "UI/UX Redesign",
        budget: 25000,
        message: "We need to completely rebuild our web app SaaS dashboard. Seeking agency with deep React & Tailwind knowledge.",
        source: "LinkedIn",
        status: "new",
        createdAt: new Date(Date.now() - 4 * 3600000).toISOString(), // 4 hrs ago
        followUpDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
        notes: [
          { id: "note-1", type: "create", content: "Lead generated via contact form on LinkedIn reference page.", createdAt: new Date(Date.now() - 4 * 3600000).toISOString() }
        ]
      },
      {
        id: "lead-" + Math.random().toString(36).substr(2, 9),
        name: "David Chen",
        email: "d.chen@apex-logistics.io",
        phone: "+1 (206) 441-2309",
        company: "Apex Logistics",
        service: "Cloud Migration",
        budget: 75000,
        message: "Migrating from on-prem VMWare servers to AWS. Need cost calculation and architecture deployment roadmap.",
        source: "Google Search",
        status: "contacted",
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), // 3 days ago
        followUpDate: new Date().toISOString().split('T')[0], // today
        notes: [
          { id: "note-2", type: "create", content: "Lead generated from organic search landing page.", createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
          { id: "note-3", type: "call", content: "Conducted initial discovery call. Budget fits. Scheduled follow-up to deliver cloud scope estimate.", createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
          { id: "note-4", type: "status", content: "Status changed to Contacted", createdAt: new Date(Date.now() - 2 * 86400000).toISOString() }
        ]
      },
      {
        id: "lead-" + Math.random().toString(36).substr(2, 9),
        name: "Sarah Jenkins",
        email: "sarah.j@bloomventures.com",
        phone: "+1 (650) 882-9901",
        company: "Bloom Ventures",
        service: "Enterprise Software",
        budget: 150000,
        message: "Looking for team to develop a proprietary database reporting CRM tool for our venture team.",
        source: "Referral",
        status: "converted",
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString(), // 10 days ago
        followUpDate: "",
        notes: [
          { id: "note-5", type: "create", content: "Referred directly by John Green from SeriesA Consulting.", createdAt: new Date(Date.now() - 10 * 86400000).toISOString() },
          { id: "note-6", type: "email", content: "Sent service deck and case study reports.", createdAt: new Date(Date.now() - 8 * 86400000).toISOString() },
          { id: "note-7", type: "status", content: "Status changed to Contacted", createdAt: new Date(Date.now() - 8 * 86400000).toISOString() },
          { id: "note-8", type: "note", content: "Client approved enterprise quote. SLA signed. Kicking off build next week.", createdAt: new Date(Date.now() - 1 * 86400000).toISOString() },
          { id: "note-9", type: "status", content: "Status changed to Converted", createdAt: new Date(Date.now() - 1 * 86400000).toISOString() }
        ]
      },
      {
        id: "lead-" + Math.random().toString(36).substr(2, 9),
        name: "Marcus Aurelius",
        email: "m.aurelius@stoicapps.net",
        phone: "+39 06 6982",
        company: "Stoic Apps",
        service: "UI/UX Redesign",
        budget: 7500,
        message: "We need a clean landing page for our mobile journaling app.",
        source: "Direct Web",
        status: "new",
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(), // 1 day ago
        followUpDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday (Overdue)
        notes: [
          { id: "note-10", type: "create", content: "Form filled on site contact portal.", createdAt: new Date(Date.now() - 1 * 86400000).toISOString() }
        ]
      },
      {
        id: "lead-" + Math.random().toString(36).substr(2, 9),
        name: "Elena Rostova",
        email: "e.rostova@cyberdefense.org",
        phone: "+44 20 7946 0958",
        company: "Cyber Defense Corp",
        service: "Enterprise Software",
        budget: 150000,
        message: "Evaluating third-party web interface vendors to secure our database monitoring visualizer tool.",
        source: "Google Search",
        status: "contacted",
        createdAt: new Date(Date.now() - 6 * 86400000).toISOString(), // 6 days ago
        followUpDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0], // 3 days in future
        notes: [
          { id: "note-11", type: "create", content: "Search query: 'enterprise software UI agency security compliance'", createdAt: new Date(Date.now() - 6 * 86400000).toISOString() },
          { id: "note-12", type: "email", content: "Scheduled custom demo for Elena and IT Sec Lead.", createdAt: new Date(Date.now() - 4 * 86400000).toISOString() },
          { id: "note-13", type: "status", content: "Status changed to Contacted", createdAt: new Date(Date.now() - 4 * 86400000).toISOString() }
        ]
      }
    ];

    leads = [...leads, ...mockLeads];
    saveLeads();
    
    // Refresh current view
    const currentTab = document.querySelector('.nav-btn.active').getAttribute('data-tab');
    if (currentTab === 'dashboard') renderDashboardStats();
    if (currentTab === 'kanban') renderKanbanBoard();
    if (currentTab === 'list') renderLeadsTable();

    showToast("Leads Seeded Successfully", "Injected 5 realistic sample client leads.", "success");
    lucide.createIcons();
  });
}

// 7. General Helper Functions
function formatCurrency(val) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(val || 0);
}

// Format date helper
function formatDate(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getStatusBadgeClass(status) {
  if (status === 'new') return 'status-pill status-new';
  if (status === 'contacted') return 'status-pill status-contacted';
  if (status === 'converted') return 'status-pill status-converted';
  return 'status-pill';
}

// 8. Dashboard Analytics Rendering
function initializeDashboard() {
  renderDashboardStats();
  initTrafficSimulator();
}

function renderDashboardStats() {
  const totalLeadsSpan = document.getElementById('kpi-total-leads');
  const newLeadsSpan = document.getElementById('kpi-new-leads');
  const contactedLeadsSpan = document.getElementById('kpi-contacted-leads');
  const convertedLeadsSpan = document.getElementById('kpi-converted-leads');
  const pipelineValueSpan = document.getElementById('kpi-pipeline-value');
  const conversionRateSpan = document.getElementById('kpi-conversion-rate');
  const contactedPctSpan = document.getElementById('kpi-contacted-pct');

  const total = leads.length;
  const newCount = leads.filter(l => l.status === 'new').length;
  const contacted = leads.filter(l => l.status === 'contacted').length;
  const converted = leads.filter(l => l.status === 'converted').length;
  
  // Pipeline Value (Total Budget of converted won client deals)
  const convertedValue = leads
    .filter(l => l.status === 'converted')
    .reduce((sum, l) => sum + Number(l.budget || 0), 0);

  // Update DOM values
  totalLeadsSpan.textContent = total;
  newLeadsSpan.textContent = newCount;
  contactedLeadsSpan.textContent = contacted;
  convertedLeadsSpan.textContent = converted;
  pipelineValueSpan.textContent = formatCurrency(convertedValue);

  // Conversion rates
  const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0;
  conversionRateSpan.textContent = `${conversionRate}% Conversion Rate`;

  const contactedPct = total > 0 ? Math.round((contacted / total) * 100) : 0;
  contactedPctSpan.textContent = `${contactedPct}% active follow-ups`;

  // Draw Source Distribution Chart
  renderSourceChart();

  // Populate Reminders list
  renderRemindersList();
}

function renderSourceChart() {
  const chartContainer = document.getElementById('source-chart-container');
  if (!chartContainer) return;

  const sources = ["Google Search", "LinkedIn", "Direct Web", "Social Media", "Referral"];
  const sourceStats = {};
  
  // Initialize
  sources.forEach(src => sourceStats[src] = 0);
  
  // Count
  leads.forEach(l => {
    const src = l.source || "Direct Web";
    if (sourceStats[src] !== undefined) {
      sourceStats[src]++;
    } else {
      sourceStats["Direct Web"]++;
    }
  });

  const maxVal = Math.max(...Object.values(sourceStats), 1); // Avoid division by zero

  chartContainer.innerHTML = '';
  
  sources.forEach(src => {
    const val = sourceStats[src];
    const percentage = Math.round((val / maxVal) * 100);
    const heightPercent = percentage > 0 ? `${percentage}%` : '5%';

    // Custom CSS class map
    const classMap = {
      "Google Search": "bar-google",
      "LinkedIn": "bar-linkedin",
      "Direct Web": "bar-direct",
      "Social Media": "bar-social",
      "Referral": "bar-referral"
    };

    const barClass = classMap[src] || "bar-direct";

    const barWrapper = document.createElement('div');
    barWrapper.className = 'chart-bar-wrapper';
    barWrapper.innerHTML = `
      <span class="chart-bar-value">${val}</span>
      <div class="chart-bar ${barClass}" style="height: ${heightPercent}" title="${src}: ${val} leads"></div>
      <span class="chart-bar-label" title="${src}">${src}</span>
    `;
    chartContainer.appendChild(barWrapper);
  });
}

function renderRemindersList() {
  const listEl = document.getElementById('reminders-list');
  const countEl = document.getElementById('reminder-count');
  if (!listEl) return;

  const todayStr = new Date().toISOString().split('T')[0];
  
  // Filter leads with scheduled follow-ups
  const scheduledLeads = leads.filter(l => l.followUpDate && l.status !== 'converted');

  // Sort by date
  scheduledLeads.sort((a, b) => new Date(a.followUpDate) - new Date(b.followUpDate));

  countEl.textContent = scheduledLeads.length;

  if (scheduledLeads.length === 0) {
    listEl.innerHTML = `
      <li class="empty-state">
        <i data-lucide="calendar-check"></i>
        <p>All caught up! No scheduled follow-ups.</p>
      </li>
    `;
    lucide.createIcons();
    return;
  }

  listEl.innerHTML = '';
  scheduledLeads.forEach(lead => {
    let dateClass = 'upcoming';
    let dateLabel = formatDate(lead.followUpDate);

    if (lead.followUpDate < todayStr) {
      dateClass = 'overdue';
      dateLabel = `Overdue: ${formatDate(lead.followUpDate)}`;
    } else if (lead.followUpDate === todayStr) {
      dateClass = 'today';
      dateLabel = `Today: ${formatDate(lead.followUpDate)}`;
    }

    const li = document.createElement('li');
    li.className = 'reminder-item';
    li.innerHTML = `
      <div class="reminder-info">
        <span class="reminder-lead-name">${lead.name}</span>
        <span class="reminder-date ${dateClass}">
          <i data-lucide="clock"></i>
          <span>${dateLabel}</span>
        </span>
      </div>
      <button class="reminder-btn" data-id="${lead.id}" title="View Lead Details">
        <i data-lucide="chevron-right"></i>
      </button>
    `;

    // Hook View Action
    li.querySelector('.reminder-btn').addEventListener('click', () => {
      openLeadDrawer(lead.id);
    });

    listEl.appendChild(li);
  });
  lucide.createIcons();
}

// 9. Kanban Board Rendering & Operations
function renderKanbanBoard() {
  const cols = {
    new: document.getElementById('kanban-cards-new'),
    contacted: document.getElementById('kanban-cards-contacted'),
    converted: document.getElementById('kanban-cards-converted')
  };

  const counts = {
    new: document.getElementById('count-kanban-new'),
    contacted: document.getElementById('count-kanban-contacted'),
    converted: document.getElementById('count-kanban-converted')
  };

  // Clear lists
  Object.values(cols).forEach(el => {
    if (el) el.innerHTML = '';
  });

  const leadsByStatus = { new: [], contacted: [], converted: [] };

  leads.forEach(lead => {
    if (leadsByStatus[lead.status]) {
      leadsByStatus[lead.status].push(lead);
    }
  });

  // Render cards
  Object.entries(leadsByStatus).forEach(([status, list]) => {
    counts[status].textContent = list.length;
    
    if (list.length === 0) {
      cols[status].innerHTML = `
        <div class="empty-state">
          <p class="text-sm text-muted">No leads in this stage</p>
        </div>
      `;
      return;
    }

    list.forEach(lead => {
      const card = document.createElement('div');
      card.className = 'kanban-card';
      card.draggable = true;
      card.setAttribute('data-id', lead.id);

      card.innerHTML = `
        <div class="kanban-card-title">${lead.name}</div>
        <div class="text-xs text-muted">${lead.company || 'Private Individual'}</div>
        <div class="kanban-card-meta">
          <span class="card-source-badge">${lead.source}</span>
          <span class="card-value">${formatValue(lead.budget)}</span>
        </div>
        <div class="kanban-card-actions">
          <span class="text-muted text-xs">${formatDate(lead.createdAt)}</span>
          <div class="card-action-buttons">
            ${status !== 'new' ? `<button class="btn-card-nav btn-move-left" title="Move status back"><i data-lucide="chevron-left"></i></button>` : ''}
            <button class="btn-card-nav btn-card-inspect" title="Open details"><i data-lucide="eye"></i></button>
            ${status !== 'converted' ? `<button class="btn-card-nav btn-move-right" title="Advance status"><i data-lucide="chevron-right"></i></button>` : ''}
          </div>
        </div>
      `;

      // Event: Inspect
      card.querySelector('.btn-card-inspect').addEventListener('click', (e) => {
        e.stopPropagation();
        openLeadDrawer(lead.id);
      });

      // Click: Open details directly as well
      card.addEventListener('click', () => {
        openLeadDrawer(lead.id);
      });

      // Actions: Move Status via Nav buttons
      const btnLeft = card.querySelector('.btn-move-left');
      if (btnLeft) {
        btnLeft.addEventListener('click', (e) => {
          e.stopPropagation();
          shiftLeadStatus(lead.id, -1);
        });
      }

      const btnRight = card.querySelector('.btn-move-right');
      if (btnRight) {
        btnRight.addEventListener('click', (e) => {
          e.stopPropagation();
          shiftLeadStatus(lead.id, 1);
        });
      }

      // Drag Events
      card.addEventListener('dragstart', (e) => {
        card.classList.add('dragging');
        e.dataTransfer.setData('text/plain', lead.id);
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
      });

      cols[status].appendChild(card);
    });
  });

  // Enable drag drop on columns
  document.querySelectorAll('.kanban-column').forEach(col => {
    col.addEventListener('dragover', (e) => {
      e.preventDefault();
      col.classList.add('drag-over');
    });

    col.addEventListener('dragleave', () => {
      col.classList.remove('drag-over');
    });

    col.addEventListener('drop', (e) => {
      e.preventDefault();
      col.classList.remove('drag-over');
      const leadId = e.dataTransfer.getData('text/plain');
      const targetStatus = col.getAttribute('data-status');
      
      updateLeadStatus(leadId, targetStatus);
    });
  });

  lucide.createIcons();
}

function formatValue(budget) {
  if (!budget) return 'N/A';
  if (budget >= 1000) {
    return `$${Math.round(budget/1000)}k`;
  }
  return `$${budget}`;
}

function updateLeadStatus(leadId, newStatus) {
  const leadIndex = leads.findIndex(l => l.id === leadId);
  if (leadIndex !== -1 && leads[leadIndex].status !== newStatus) {
    const oldStatus = leads[leadIndex].status;
    leads[leadIndex].status = newStatus;
    
    // Log timeline activity
    leads[leadIndex].notes.push({
      id: "note-" + Math.random().toString(36).substr(2, 9),
      type: "status",
      content: `Status updated from ${oldStatus.toUpperCase()} to ${newStatus.toUpperCase()}`,
      createdAt: new Date().toISOString()
    });

    saveLeads();
    renderKanbanBoard();
    showToast("Pipeline Updated", `${leads[leadIndex].name} advanced to ${newStatus.toUpperCase()}`, "success");
    
    // Synchronize open drawer if viewing this lead
    if (currentOpenLeadId === leadId) {
      const drawerStatusSel = document.getElementById('drawer-status');
      if (drawerStatusSel) drawerStatusSel.value = newStatus;
      renderTimeline(leads[leadIndex]);
    }
  }
}

function shiftLeadStatus(leadId, direction) {
  const statuses = ['new', 'contacted', 'converted'];
  const lead = leads.find(l => l.id === leadId);
  if (lead) {
    const curIdx = statuses.indexOf(lead.status);
    const targetIdx = curIdx + direction;
    if (targetIdx >= 0 && targetIdx < statuses.length) {
      updateLeadStatus(leadId, statuses[targetIdx]);
    }
  }
}

// 10. Table List Directory Filters & Sorting
function initDirectoryControls() {
  const searchInput = document.getElementById('lead-search');
  const filterStatus = document.getElementById('filter-status');
  const filterSource = document.getElementById('filter-source');
  const sortSelect = document.getElementById('sort-leads');

  const triggers = [searchInput, filterStatus, filterSource, sortSelect];
  triggers.forEach(el => {
    if (el) {
      el.addEventListener('input', renderLeadsTable);
      el.addEventListener('change', renderLeadsTable);
    }
  });
}

function renderLeadsTable() {
  const tbody = document.getElementById('leads-table-body');
  const emptyState = document.getElementById('table-empty-state');
  if (!tbody) return;

  const searchQuery = document.getElementById('lead-search').value.toLowerCase().trim();
  const statusFilter = document.getElementById('filter-status').value;
  const sourceFilter = document.getElementById('filter-source').value;
  const sortBy = document.getElementById('sort-leads').value;

  // Filter
  let filtered = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery) ||
                          lead.email.toLowerCase().includes(searchQuery) ||
                          (lead.company && lead.company.toLowerCase().includes(searchQuery)) ||
                          (lead.message && lead.message.toLowerCase().includes(searchQuery));

    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;

    return matchesSearch && matchesStatus && matchesSource;
  });

  // Sort
  filtered.sort((a, b) => {
    if (sortBy === 'date-desc') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    if (sortBy === 'date-asc') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
    if (sortBy === 'name-asc') {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === 'value-desc') {
      return (b.budget || 0) - (a.budget || 0);
    }
    return 0;
  });

  tbody.innerHTML = '';

  if (filtered.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }
  
  emptyState.classList.add('hidden');

  filtered.forEach(lead => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="lead-name-cell">
          <span class="lead-primary-name">${lead.name}</span>
          <span class="lead-company-name">${lead.company || 'Private Client'}</span>
        </div>
      </td>
      <td>
        <span class="${getStatusBadgeClass(lead.status)}">${lead.status}</span>
      </td>
      <td>
        <div class="lead-contact-info">
          <span class="lead-email">${lead.email}</span>
          <span class="lead-phone">${lead.phone || 'No phone'}</span>
        </div>
      </td>
      <td>
        <span class="highlight-badge">${lead.source}</span>
      </td>
      <td>
        <span class="lead-value">${formatCurrency(lead.budget)}</span>
      </td>
      <td>
        <span class="text-muted text-sm">${formatDate(lead.createdAt)}</span>
      </td>
      <td>
        <div class="text-right card-action-buttons" style="justify-content: flex-end;">
          <button class="btn-card-nav btn-table-view" data-id="${lead.id}" title="Inspect lead"><i data-lucide="eye"></i></button>
          <button class="btn-card-nav btn-table-delete" data-id="${lead.id}" title="Delete Lead" style="color: var(--color-error);"><i data-lucide="trash-2"></i></button>
        </div>
      </td>
    `;

    // Hook Inspect Row
    tr.querySelector('.btn-table-view').addEventListener('click', (e) => {
      e.stopPropagation();
      openLeadDrawer(lead.id);
    });

    // Double-click row opens detail drawer
    tr.addEventListener('dblclick', () => {
      openLeadDrawer(lead.id);
    });

    // Hook Delete Row
    tr.querySelector('.btn-table-delete').addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm(`Are you sure you want to permanently delete lead ${lead.name}?`)) {
        deleteLead(lead.id);
      }
    });

    tbody.appendChild(tr);
  });

  lucide.createIcons();
}

function deleteLead(leadId) {
  const index = leads.findIndex(l => l.id === leadId);
  if (index !== -1) {
    const leadName = leads[index].name;
    leads.splice(index, 1);
    saveLeads();
    renderLeadsTable();
    showToast("Lead Deleted", `${leadName} was removed from the database.`, "warning");
  }
}

// 11. Lead Detail Drawer Sliding & Interactions
function initDrawer() {
  const drawer = document.getElementById('lead-drawer');
  const closeBtn = document.getElementById('drawer-close-btn');
  const statusSelect = document.getElementById('drawer-status');
  const budgetInput = document.getElementById('drawer-budget');
  const saveFollowUpBtn = document.getElementById('btn-save-follow-up');
  const followUpInput = document.getElementById('drawer-follow-up-date');
  const clearFollowUpBtn = document.getElementById('btn-clear-follow-up');
  const addNoteForm = document.getElementById('add-note-form');

  // Close Drawer click
  closeBtn.addEventListener('click', closeLeadDrawer);
  
  // Close Drawer clicking backdrop
  drawer.addEventListener('click', (e) => {
    if (e.target === drawer) closeLeadDrawer();
  });

  // Sync status edits
  statusSelect.addEventListener('change', () => {
    if (currentOpenLeadId) {
      updateLeadStatus(currentOpenLeadId, statusSelect.value);
    }
  });

  // Sync budget estimates
  budgetInput.addEventListener('change', () => {
    if (currentOpenLeadId) {
      const lead = leads.find(l => l.id === currentOpenLeadId);
      if (lead) {
        const oldValue = lead.budget;
        lead.budget = Number(budgetInput.value) || 0;
        lead.notes.push({
          id: "note-" + Math.random().toString(36).substr(2, 9),
          type: "note",
          content: `Assigned lead value updated from ${formatCurrency(oldValue)} to ${formatCurrency(lead.budget)}`,
          createdAt: new Date().toISOString()
        });
        saveLeads();
        renderTimeline(lead);
      }
    }
  });

  // Save Follow Up Date
  saveFollowUpBtn.addEventListener('click', () => {
    if (currentOpenLeadId && followUpInput.value) {
      const lead = leads.find(l => l.id === currentOpenLeadId);
      if (lead) {
        lead.followUpDate = followUpInput.value;
        lead.notes.push({
          id: "note-" + Math.random().toString(36).substr(2, 9),
          type: "status",
          content: `Follow-up contact scheduled for ${formatDate(lead.followUpDate)}`,
          createdAt: new Date().toISOString()
        });
        saveLeads();
        updateFollowUpBadge(lead.followUpDate);
        renderTimeline(lead);
        showToast("Reminder Set", `Follow up scheduled for ${formatDate(lead.followUpDate)}`, "info");
      }
    }
  });

  // Clear Follow Up Date
  clearFollowUpBtn.addEventListener('click', () => {
    if (currentOpenLeadId) {
      const lead = leads.find(l => l.id === currentOpenLeadId);
      if (lead) {
        lead.followUpDate = "";
        lead.notes.push({
          id: "note-" + Math.random().toString(36).substr(2, 9),
          type: "status",
          content: `Cleared scheduled follow-up reminder.`,
          createdAt: new Date().toISOString()
        });
        saveLeads();
        document.getElementById('active-follow-up-badge').classList.add('hidden');
        followUpInput.value = '';
        renderTimeline(lead);
        showToast("Reminder Cleared", "Follow-up schedule removed.", "warning");
      }
    }
  });

  // Appending Notes Form submit
  addNoteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentOpenLeadId) return;

    const textarea = document.getElementById('note-text');
    const selectedType = document.querySelector('input[name="note-type"]:checked').value;
    const lead = leads.find(l => l.id === currentOpenLeadId);

    if (lead && textarea.value.trim()) {
      lead.notes.push({
        id: "note-" + Math.random().toString(36).substr(2, 9),
        type: selectedType,
        content: textarea.value.trim(),
        createdAt: new Date().toISOString()
      });
      saveLeads();
      textarea.value = '';
      renderTimeline(lead);
      showToast("Activity Appended", "Log added to lead lifecycle.", "success");
    }
  });
}

function openLeadDrawer(leadId) {
  const lead = leads.find(l => l.id === leadId);
  if (!lead) return;

  currentOpenLeadId = leadId;
  const drawer = document.getElementById('lead-drawer');
  
  // Fill Drawer fields
  document.getElementById('drawer-created-at').textContent = `Generated on ${formatDate(lead.createdAt)}`;
  document.getElementById('drawer-lead-name').textContent = lead.name;
  document.getElementById('drawer-lead-company').textContent = lead.company || 'Private Individual';
  document.getElementById('drawer-status').value = lead.status;
  document.getElementById('drawer-budget').value = lead.budget || '';
  
  document.getElementById('drawer-email').textContent = lead.email;
  document.getElementById('drawer-phone').textContent = lead.phone || 'No phone provided';
  document.getElementById('drawer-source').textContent = lead.source;
  document.getElementById('drawer-service').textContent = lead.service || 'General Consultancy';
  document.getElementById('drawer-message').textContent = lead.message || 'No initial message details';

  // Handle Follow up state
  const followUpInput = document.getElementById('drawer-follow-up-date');
  followUpInput.value = lead.followUpDate || '';
  updateFollowUpBadge(lead.followUpDate);

  // Render notes logs
  renderTimeline(lead);

  // Open Drawer UI
  drawer.classList.remove('hidden');
  lucide.createIcons();
}

function updateFollowUpBadge(dateStr) {
  const badgeContainer = document.getElementById('active-follow-up-badge');
  const badgeDate = document.getElementById('follow-up-badge-date');
  if (dateStr) {
    badgeDate.textContent = formatDate(dateStr);
    badgeContainer.classList.remove('hidden');
  } else {
    badgeContainer.classList.add('hidden');
  }
}

function closeLeadDrawer() {
  const drawer = document.getElementById('lead-drawer');
  drawer.classList.add('hidden');
  currentOpenLeadId = null;

  // Refresh active lists to show values/statuses modified inside the drawer
  const activeTab = document.querySelector('.nav-btn.active').getAttribute('data-tab');
  if (activeTab === 'dashboard') renderDashboardStats();
  if (activeTab === 'kanban') renderKanbanBoard();
  if (activeTab === 'list') renderLeadsTable();
}

function renderTimeline(lead) {
  const timelineEl = document.getElementById('drawer-timeline');
  if (!timelineEl) return;

  if (!lead.notes || lead.notes.length === 0) {
    timelineEl.innerHTML = `
      <div class="empty-state text-xs">
        <p>No activity logs found</p>
      </div>
    `;
    return;
  }

  // Sort notes newest first
  const sortedNotes = [...lead.notes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  timelineEl.innerHTML = '';
  sortedNotes.forEach(note => {
    const item = document.createElement('div');
    item.className = `timeline-item log-${note.type}`;
    
    let typeName = "Log Entry";
    if (note.type === 'create') typeName = "Client Intake Form";
    if (note.type === 'status') typeName = "Workflow Stage Action";
    if (note.type === 'note') typeName = "Administrative Note";
    if (note.type === 'call') typeName = "Outgoing Phone Call";
    if (note.type === 'email') typeName = "Outbound Email correspondence";

    const timestampStr = new Date(note.createdAt).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    item.innerHTML = `
      <div class="timeline-marker"></div>
      <div class="timeline-content">
        <div class="timeline-meta">
          <strong class="timeline-type">${typeName}</strong>
          <span class="timeline-time">${timestampStr}</span>
        </div>
        <div class="timeline-text">${note.content}</div>
      </div>
    `;
    timelineEl.appendChild(item);
  });
}

// 12. Public Form Simulator & Client Intake
function initFormSimulator() {
  const form = document.getElementById('public-contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('form-name').value.trim();
    const email = document.getElementById('form-email').value.trim();
    const phone = document.getElementById('form-phone').value.trim();
    const company = document.getElementById('form-company').value.trim();
    const service = document.getElementById('form-service').value;
    const budget = Number(document.getElementById('form-budget').value) || 0;
    const source = document.getElementById('form-source').value;
    const message = document.getElementById('form-message').value.trim();

    // Create intake lead
    const newLead = {
      id: "lead-" + Math.random().toString(36).substr(2, 9),
      name,
      email,
      phone,
      company,
      service,
      budget,
      message,
      source,
      status: "new",
      createdAt: new Date().toISOString(),
      followUpDate: "",
      notes: [
        {
          id: "note-init",
          type: "create",
          content: `Lead generated via Client Intake Contact Form. User selected project category '${service}' with standard budget parameter of ${formatCurrency(budget)}.`,
          createdAt: new Date().toISOString()
        }
      ]
    };

    leads.push(newLead);
    saveLeads();

    // Reset public Form fields
    form.reset();

    // Add highlighted Conversion log in the traffic simulator feed
    addSimulationFeedLog(`Conversion! Contact Form request submitted by ${newLead.name} (${newLead.company || 'Individual'})`, "conversion");

    showToast("New Lead Ingested", `Ingested ${newLead.name} into the Pipeline.`, "success");
    
    // Animate badge glow effect on "Pipeline Board" sidebar button
    const kanbanTabBtn = document.querySelector('.font-simulator-tab-btn');
    kanbanTabBtn.style.animation = 'shake 0.4s ease';
    setTimeout(() => kanbanTabBtn.style.animation = 'none', 500);

    lucide.createIcons();
  });
}

// 13. Simulated Live Traffic logs feed
let trafficInterval = null;

function initTrafficSimulator() {
  const listEl = document.getElementById('sim-feed-list');
  if (!listEl) return;

  // Add initial mock logs
  listEl.innerHTML = '';
  for (let i = 0; i < 4; i++) {
    const randomLog = simulatedLogs[Math.floor(Math.random() * simulatedLogs.length)];
    addSimulationFeedLog(randomLog.text, randomLog.type);
  }

  // Interval script
  if (trafficInterval) clearInterval(trafficInterval);

  trafficInterval = setInterval(() => {
    // Only simulate if app is visible
    if (document.getElementById('app-container').classList.contains('hidden')) return;

    const randomLog = simulatedLogs[Math.floor(Math.random() * simulatedLogs.length)];
    addSimulationFeedLog(randomLog.text, randomLog.type);
  }, 12000); // Add log every 12 seconds
}

function addSimulationFeedLog(text, type = "info") {
  const listEl = document.getElementById('sim-feed-list');
  if (!listEl) return;

  const item = document.createElement('div');
  item.className = `sim-log-item ${type}`;
  
  let iconName = "globe";
  if (type === 'conversion') iconName = "check-circle-2";
  if (type === 'form-start') iconName = "edit-3";

  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  item.innerHTML = `
    <div class="sim-icon-wrapper">
      <i data-lucide="${iconName}"></i>
    </div>
    <div class="sim-log-details">
      <span class="sim-log-text">${text}</span>
      <span class="sim-log-time">${timeStr}</span>
    </div>
  `;

  // Prepend to show newest traffic at the top
  listEl.insertBefore(item, listEl.firstChild);
  
  // Cap at 15 items in container
  if (listEl.children.length > 15) {
    listEl.lastChild.remove();
  }

  lucide.createIcons();
}

// 14. Entry Point Bootstrapping
window.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initNavigation();
  initSeeder();
  initDirectoryControls();
  initDrawer();
  initFormSimulator();

  // Initialize icons initially
  lucide.createIcons();
});
