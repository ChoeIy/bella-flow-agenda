(function(){
  "use strict";

  const API = 'http://localhost:3000/api';
  const token = localStorage.getItem('essencia_token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  function headers() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('essencia_token');
    localStorage.removeItem('essencia_user');
    window.location.href = 'login.html';
  });

  // Modo escuro
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = themeToggle.querySelector('i');
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    themeIcon.className = 'fas fa-sun';
  }
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
  });

  // Estado
  let clients = [];
  let services = [];
  let appointments = [];

  function genId() { return Date.now() + '-' + Math.random().toString(36).substr(2, 6); }

  // API Calls
  async function fetchClients() {
    const res = await fetch(`${API}/clients`, { headers: headers() });
    if (!res.ok) throw new Error('Erro ao carregar clientes');
    clients = await res.json();
  }
  async function fetchServices() {
    const res = await fetch(`${API}/services`, { headers: headers() });
    if (!res.ok) throw new Error('Erro ao carregar serviços');
    services = await res.json();
  }
  async function fetchAppointments() {
    const res = await fetch(`${API}/appointments`, { headers: headers() });
    if (!res.ok) throw new Error('Erro ao carregar agendamentos');
    appointments = await res.json();
  }

  async function saveClient(client) {
    const method = client._new ? 'POST' : 'PUT';
    const url = client._new ? `${API}/clients` : `${API}/clients/${client.id}`;
    const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(client) });
    if (!res.ok) throw new Error('Erro ao salvar cliente');
  }
  async function deleteClient(id) {
    const res = await fetch(`${API}/clients/${id}`, { method: 'DELETE', headers: headers() });
    if (!res.ok) throw new Error('Erro ao excluir cliente');
  }
  async function saveService(service) {
    const method = service._new ? 'POST' : 'PUT';
    const url = service._new ? `${API}/services` : `${API}/services/${service.id}`;
    const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(service) });
    if (!res.ok) throw new Error('Erro ao salvar serviço');
  }
  async function deleteService(id) {
    const res = await fetch(`${API}/services/${id}`, { method: 'DELETE', headers: headers() });
    if (!res.ok) throw new Error('Erro ao excluir serviço');
  }
  async function saveAppointment(app) {
    const method = app._new ? 'POST' : 'PUT';
    const url = app._new ? `${API}/appointments` : `${API}/appointments/${app.id}`;
    // Mapeia snake_case do objeto vindo da API para camelCase que o backend espera
    const payload = {
      id: app.id,
      clientId: app.clientId || app.client_id,
      serviceId: app.serviceId || app.service_id,
      date: app.date,
      time: app.time,
      status: app.status || 'agendado',
      paid: app.paid || false
    };
    const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(payload) });
    if (!res.ok) throw new Error('Erro ao salvar agendamento');
  }
  async function deleteAppointment(id) {
    const res = await fetch(`${API}/appointments/${id}`, { method: 'DELETE', headers: headers() });
    if (!res.ok) throw new Error('Erro ao excluir agendamento');
  }

  // Confirmação
  let resolveConfirm = null;
  const confirmDialog = document.getElementById('confirmDialog');
  const confirmMsg = document.getElementById('confirmMessage');
  document.getElementById('confirmCancel').addEventListener('click', ()=>{
    confirmDialog.style.display = 'none';
    if(resolveConfirm) resolveConfirm(false);
  });
  document.getElementById('confirmOk').addEventListener('click', ()=>{
    confirmDialog.style.display = 'none';
    if(resolveConfirm) resolveConfirm(true);
  });
  function customConfirm(msg) {
    return new Promise(resolve => {
      resolveConfirm = resolve;
      confirmMsg.textContent = msg;
      confirmDialog.style.display = 'flex';
    });
  }

  // Toast
  function showToast(msg, isError = false) {
    const toast = document.createElement('div');
    toast.textContent = msg;
    toast.style.cssText = `
      position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
      background: ${isError ? '#d32f2f' : '#388e3c'}; color: white;
      padding: 12px 24px; border-radius: 40px; font-weight: 500; z-index: 9999;
      box-shadow: 0 8px 20px rgba(0,0,0,0.3); animation: slideUp 0.3s ease;
      max-width: 90%; text-align: center;
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Modal
  const modalOverlay = document.getElementById('modalOverlay');
  const modalContent = document.getElementById('modalContent');
  function openModal(html) {
    modalContent.innerHTML = html;
    modalOverlay.style.display = 'flex';
  }
  function closeModal() {
    modalOverlay.style.display = 'none';
  }
  window.closeModal = closeModal;
  modalOverlay.addEventListener('click', e => { if(e.target === modalOverlay) closeModal(); });

  // Máscaras
  function aplicarMascaraTelefone(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length > 10) value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    else if (value.length > 5) value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    else if (value.length > 2) value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    else if (value.length > 0) value = value.replace(/(\d{0,2})/, '($1');
    input.value = value;
  }
  function aplicarMascaraCEP(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 8) value = value.slice(0, 8);
    if (value.length > 5) value = value.replace(/(\d{5})(\d{1,3})/, '$1-$2');
    input.value = value;
  }
  function formatarTelefone(phone) {
    if (!phone) return '';
    phone = phone.replace(/\D/g, '');
    if (phone.length === 11) return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    if (phone.length === 10) return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    return phone;
  }
  function formatarCEP(cep) {
    if (!cep) return '';
    cep = cep.replace(/\D/g, '');
    if (cep.length === 8) return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
    return cep;
  }
  function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    return (parts[0]?.[0] || '') + (parts[1]?.[0] || '');
  }

  // Navegação
  const mainContent = document.getElementById('mainContent');
  const tabs = document.querySelectorAll('.tab-btn');
  let currentTab = 'clients';
  function switchTab(tabId) {
    currentTab = tabId;
    tabs.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabId));
    renderTabContent(tabId);
  }
  tabs.forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));

  function getClientName(id) {
    const client = clients.find(c => c.id === id);
    return client?.name || '—';
  }
  function getService(id) {
    return services.find(s => s.id === id);
  }

  function animateContent() {
    mainContent.classList.remove('fade-in');
    void mainContent.offsetWidth;
    mainContent.classList.add('fade-in');
  }

  async function renderTabContent(tab) {
    if(tab === 'clients') renderClients();
    else if(tab === 'appointments') await renderAppointments();
    else if(tab === 'services') renderServices();
    else if(tab === 'billing') renderFinance('billing');
    else if(tab === 'reports') renderFinance('report');
    animateContent();
  }

  // CLIENTES
  function renderClients() {
    mainContent.innerHTML = `
      <div class="panel-header"><h2><i class="fas fa-users"></i> Clientes</h2><button class="btn-primary" id="addClientBtn"><i class="fas fa-plus-circle"></i> Cadastrar</button></div>
      <table class="data-table"><thead><tr><th>Cliente</th><th>Telefone</th><th>Cidade/UF</th><th></th></tr></thead><tbody id="clientsTableBody"></tbody></table>
      <div class="mobile-cards" id="clientsMobileCards"></div>`;
    refreshClients();
    document.getElementById('addClientBtn').addEventListener('click', () => openClientModal());
  }

  function refreshClients() {
    const tbody = document.getElementById('clientsTableBody');
    const mobile = document.getElementById('clientsMobileCards');
    tbody.innerHTML = clients.map(c => `<tr>
      <td><div style="display:flex; align-items:center; gap:12px;"><div class="client-avatar">${getInitials(c.name)}</div>${c.name || '—'}</div></td>
      <td>${formatarTelefone(c.phone) || '—'}</td><td>${c.city && c.state ? `${c.city}/${c.state}` : '—'}</td>
      <td class="action-cell"><button class="btn-icon" data-edit-client="${c.id}"><i class="fas fa-edit"></i></button><button class="btn-icon" data-delete-client="${c.id}"><i class="fas fa-trash"></i></button></td></tr>`).join('');
    mobile.innerHTML = clients.map(c => `<div class="card-item">
      <div class="card-row"><div style="display:flex; align-items:center; gap:8px;"><div class="client-avatar">${getInitials(c.name)}</div><strong>${c.name || '—'}</strong></div></div>
      <div style="font-size:0.9rem; margin:8px 0;">📞 ${formatarTelefone(c.phone) || '—'}</div>
      <div style="display:flex; gap:8px; justify-content:flex-end;"><button class="btn-outline" data-edit-client="${c.id}">Editar</button><button class="btn-outline" data-delete-client="${c.id}">Excluir</button></div></div>`).join('');
    document.querySelectorAll('[data-edit-client]').forEach(b => b.addEventListener('click', () => openClientModal(b.dataset.editClient)));
    document.querySelectorAll('[data-delete-client]').forEach(b => b.addEventListener('click', async () => {
      if(await customConfirm('Excluir este cliente?')) {
        const id = b.dataset.deleteClient;
        try {
          await deleteClient(id);
          clients = clients.filter(c => c.id !== id);
          refreshClients();
          showToast('Cliente excluído');
        } catch(e) {
          showToast('Erro ao excluir', true);
        }
      }
    }));
  }

  function openClientModal(id=null) {
    const client = id ? clients.find(c => c.id === id) : null;
    const html = `<h3><i class="fas fa-user-plus"></i> ${client ? 'Editar' : 'Cadastrar'} Cliente</h3>
      <form id="clientForm"><div class="form-group"><label>Nome completo *</label><input class="form-control" name="name" id="nameInput" value="${client?.name || ''}" required></div>
      <div class="form-group"><label>Telefone *</label><input class="form-control" name="phone" id="phoneInput" value="${formatarTelefone(client?.phone || '')}" required></div>
      <div class="form-group"><label>CEP</label><input class="form-control" name="cep" id="cepInput" value="${formatarCEP(client?.cep || '')}" maxlength="9"></div>
      <div class="form-group"><label>Endereço</label><input class="form-control" name="address" value="${client?.address || ''}"></div>
      <div class="form-row"><div class="form-group" style="flex:2;"><label>Cidade</label><input class="form-control" name="city" value="${client?.city || ''}"></div>
      <div class="form-group" style="flex:1;"><label>Estado</label><input class="form-control" name="state" value="${client?.state || ''}" maxlength="2" style="text-transform:uppercase;"></div></div></form>
      <div class="modal-actions"><button class="btn-outline" onclick="window.closeModal()">Cancelar</button><button class="btn-primary" id="saveClientBtn">${client ? 'Salvar' : 'Cadastrar'}</button></div>`;
    openModal(html);
    const phoneInput = document.getElementById('phoneInput');
    const cepInput = document.getElementById('cepInput');
    if(phoneInput) phoneInput.addEventListener('input', () => aplicarMascaraTelefone(phoneInput));
    if(cepInput) cepInput.addEventListener('input', () => aplicarMascaraCEP(cepInput));
    document.getElementById('saveClientBtn').addEventListener('click', async () => {
      const name = document.getElementById('nameInput').value.trim();
      const phone = document.getElementById('phoneInput').value.replace(/\D/g, '');
      if(!name) return alert('Nome obrigatório');
      if(!phone) return alert('Telefone obrigatório');
      if(!(await customConfirm(client ? 'Confirmar alterações?' : 'Salvar dados?'))) return;
      const newClient = { id: client ? client.id : genId(), name, phone,
        cep: document.getElementById('cepInput').value.replace(/\D/g, ''),
        address: document.getElementById('addressInput')?.value?.trim() || '',
        city: document.getElementById('cityInput')?.value?.trim() || '',
        state: document.getElementById('stateInput')?.value?.toUpperCase()?.trim() || '' };
      if (!client) newClient._new = true;
      try {
        await saveClient(newClient);
        await fetchClients();
        closeModal();
        refreshClients();
        showToast('Cliente salvo');
      } catch(e) {
        showToast('Erro ao salvar', true);
      }
    });
  }

  // SERVIÇOS
  function renderServices() {
    mainContent.innerHTML = `<div class="panel-header"><h2><i class="fas fa-water"></i> Serviços</h2><button class="btn-primary" id="addServiceBtn"><i class="fas fa-plus"></i> Adicionar</button></div>
      <table class="data-table"><thead><tr><th>Nome</th><th>Preço (R$)</th><th></th></tr></thead><tbody id="servicesTbody"></tbody></table><div class="mobile-cards" id="servicesMobile"></div>`;
    refreshServices();
    document.getElementById('addServiceBtn').addEventListener('click', ()=>openServiceModal());
  }
  function refreshServices() {
    const tbody = document.getElementById('servicesTbody');
    const mobile = document.getElementById('servicesMobile');
    tbody.innerHTML = services.map(s=>`<tr><td>${s.name}</td><td>R$ ${parseFloat(s.price).toFixed(2)}</td><td class="action-cell"><button class="btn-icon" data-edit-service="${s.id}"><i class="fas fa-edit"></i></button><button class="btn-icon" data-delete-service="${s.id}"><i class="fas fa-trash"></i></button></td></tr>`).join('');
    mobile.innerHTML = services.map(s=>`<div class="card-item"><div class="card-row"><strong>${s.name}</strong><span class="badge-service">R$ ${parseFloat(s.price).toFixed(2)}</span></div><div style="display:flex; gap:8px;"><button class="btn-outline" data-edit-service="${s.id}">Editar</button><button class="btn-outline" data-delete-service="${s.id}">Excluir</button></div></div>`).join('');
    document.querySelectorAll('[data-edit-service]').forEach(b=>b.addEventListener('click', ()=>openServiceModal(b.dataset.editService)));
    document.querySelectorAll('[data-delete-service]').forEach(b=>b.addEventListener('click', async ()=>{
      if(await customConfirm('Excluir este serviço?')) {
        const id = b.dataset.deleteService;
        try {
          await deleteService(id);
          services = services.filter(s => s.id !== id);
          refreshServices();
          showToast('Serviço excluído');
        } catch(e) {
          showToast('Erro ao excluir', true);
        }
      }
    }));
  }
  function openServiceModal(sId=null) {
    const serv = sId ? services.find(s=>s.id===sId) : null;
    openModal(`<h3><i class="fas fa-water"></i> ${serv?'Editar':'Adicionar'} Serviço</h3><form id="serviceForm"><div class="form-group"><label>Nome</label><input class="form-control" name="name" value="${serv?.name||''}" required></div><div class="form-group"><label>Preço R$</label><input class="form-control" type="number" step="0.01" name="price" value="${serv?.price||''}" required></div></form><div class="modal-actions"><button class="btn-outline" onclick="window.closeModal()">Cancelar</button><button class="btn-primary" id="saveServiceBtn">${serv?'Salvar':'Adicionar'}</button></div>`);
    document.getElementById('saveServiceBtn').addEventListener('click', async ()=>{
      const form = document.getElementById('serviceForm');
      if(!form.reportValidity() || !(await customConfirm(serv ? 'Salvar alterações?' : 'Salvar novo serviço?'))) return;
      const data = { id: serv ? serv.id : genId(), name: form.name.value, price: parseFloat(form.price.value).toFixed(2) };
      if (!serv) data._new = true;
      try {
        await saveService(data);
        await fetchServices();
        closeModal();
        refreshServices();
        showToast('Serviço salvo');
      } catch(e) {
        showToast('Erro ao salvar', true);
      }
    });
  }

  // AGENDAMENTOS
  async function renderAppointments() {
    mainContent.innerHTML = `<div class="panel-header"><h2><i class="far fa-calendar-check"></i> Agenda</h2><button class="btn-primary" id="addAppointmentBtn"><i class="fas fa-plus"></i> Agendar</button></div><div id="appointmentsList"></div>`;
    refreshAppointments();
    document.getElementById('addAppointmentBtn').addEventListener('click', ()=>openAppointmentModal());
  }
  function refreshAppointments() {
    const container = document.getElementById('appointmentsList');
    const active = appointments.filter(a=>a.status==='agendado').sort((a,b)=> (a.date+' '+a.time).localeCompare(b.date+' '+b.time));
    const desktop = `<table class="data-table"><thead><tr><th>Cliente</th><th>Serviço</th><th>Data/Hora</th><th>Status</th><th></th></tr></thead><tbody>`+
      active.map(a=>`<tr><td><div style="display:flex; align-items:center; gap:10px;"><div class="client-avatar">${getInitials(getClientName(a.client_id))}</div>${getClientName(a.client_id)}</div></td><td>${getService(a.service_id)?.name||'-'}</td><td>${a.date.split('-').reverse().join('/')} ${a.time}</td><td>${a.paid ? '<span class="paid-badge"><i class="fas fa-check-circle"></i> Pago</span>' : '<span class="pending-badge"><i class="fas fa-clock"></i> Pendente</span>'}<div class="status-bar"><div class="status-bar-fill ${a.paid?'paid':'pending'}"></div></div></td><td class="action-cell"><button class="btn-icon" data-edit-app="${a.id}"><i class="fas fa-edit"></i></button><button class="btn-icon" data-cancel-app="${a.id}"><i class="fas fa-ban"></i></button></td></tr>`).join('')+'</tbody></table>';
    const mobile = `<div class="mobile-cards">`+active.map(a=>`<div class="card-item"><div class="card-row"><div style="display:flex; align-items:center; gap:8px;"><div class="client-avatar">${getInitials(getClientName(a.client_id))}</div><strong>${getClientName(a.client_id)}</strong></div> ${a.paid?'✅':'⏳'}</div><div>${getService(a.service_id)?.name} • ${a.date.split('-').reverse().join('/')} ${a.time}</div><div class="status-bar" style="margin:8px 0;"><div class="status-bar-fill ${a.paid?'paid':'pending'}"></div></div><div style="display:flex; gap:8px;"><button class="btn-outline" data-edit-app="${a.id}">Editar</button><button class="btn-outline" data-cancel-app="${a.id}">Cancelar</button></div></div>`).join('')+'</div>';
    container.innerHTML = desktop + mobile;
    document.querySelectorAll('[data-edit-app]').forEach(b=>b.addEventListener('click', ()=>openAppointmentModal(b.dataset.editApp)));
    document.querySelectorAll('[data-cancel-app]').forEach(b=>b.addEventListener('click', async ()=>{
      if(await customConfirm('Cancelar este agendamento?')) {
        const app = appointments.find(a=>a.id===b.dataset.cancelApp);
        if(app) {
          app.status = 'cancelado';
          try {
            await saveAppointment(app);
            refreshAppointments();
            showToast('Agendamento cancelado');
          } catch(e) {
            app.status = 'agendado';
            showToast('Erro ao cancelar', true);
          }
        }
      }
    }));
  }
  function openAppointmentModal(appId=null) {
    const app = appId ? appointments.find(a=>a.id===appId) : null;
    const clientOpts = clients.map(c=>`<option value="${c.id}" ${app?.client_id===c.id?'selected':''}>${c.name}</option>`).join('');
    const serviceOpts = services.map(s=>`<option value="${s.id}" ${app?.service_id===s.id?'selected':''}>${s.name} - R$ ${parseFloat(s.price).toFixed(2)}</option>`).join('');
    openModal(`<h3><i class="far fa-calendar-plus"></i> ${app?'Editar':'Novo'} Agendamento</h3><form id="appForm"><div class="form-group"><label>Cliente</label><select class="form-control" name="clientId" required>${clientOpts}</select></div><div class="form-group"><label>Data</label><input class="form-control" type="date" name="date" value="${app?.date||''}" required></div><div class="form-group"><label>Horário</label><input class="form-control" type="time" name="time" value="${app?.time||''}" required></div><div class="form-group"><label>Serviço</label><select class="form-control" name="serviceId" required>${serviceOpts}</select></div><div class="checkbox-group"><input type="checkbox" name="paid" id="paidCheckbox" ${app?.paid ? 'checked' : ''}><label for="paidCheckbox">Marcar como Pago</label></div></form><div class="modal-actions"><button class="btn-outline" onclick="window.closeModal()">Cancelar</button><button class="btn-primary" id="saveAppBtn">${app?'Salvar':'Agendar'}</button></div>`);
    document.getElementById('saveAppBtn').addEventListener('click', async ()=>{
      const form = document.getElementById('appForm');
      if(!form.reportValidity() || !(await customConfirm(app ? 'Salvar alterações?' : 'Confirmar agendamento?'))) return;
      const data = { id: app ? app.id : genId(), clientId: form.clientId.value, date: form.date.value, time: form.time.value, serviceId: form.serviceId.value, paid: form.paid.checked, status: app ? app.status : 'agendado' };
      if (!app) data._new = true;
      try {
        await saveAppointment(data);
        await fetchAppointments();
        closeModal();
        refreshAppointments();
        showToast('Agendamento salvo');
      } catch(e) {
        showToast('Erro ao salvar', true);
      }
    });
  }

  // FATURAMENTO / RELATÓRIO COM DASHBOARD
  function renderFinance(mode) {
    const title = mode === 'billing' ? 'Faturamento' : 'Relatório';
    const isMobile = window.innerWidth <= 720;

    const activeApps = appointments.filter(a=>a.status==='agendado');
    const totalClients = clients.length;
    const totalServices = services.length;
    const thisMonth = new Date().toISOString().slice(0,7);
    const monthlyRevenue = activeApps
      .filter(a => a.date.startsWith(thisMonth) && a.paid)
      .reduce((sum, a) => sum + parseFloat(getService(a.service_id)?.price || 0), 0);
    const pendingApps = activeApps.filter(a => !a.paid).length;

    const dashboardHTML = mode === 'report' ? `
      <div class="dashboard-grid">
        <div class="dash-card"><div class="dash-icon"><i class="fas fa-users"></i></div><div class="dash-content"><h3>${totalClients}</h3><p>Clientes</p></div></div>
        <div class="dash-card"><div class="dash-icon"><i class="fas fa-water"></i></div><div class="dash-content"><h3>${totalServices}</h3><p>Serviços</p></div></div>
        <div class="dash-card"><div class="dash-icon"><i class="fas fa-file-invoice-dollar"></i></div><div class="dash-content"><h3>R$ ${monthlyRevenue.toFixed(2)}</h3><p>Faturamento do mês</p></div></div>
        <div class="dash-card"><div class="dash-icon"><i class="fas fa-clock"></i></div><div class="dash-content"><h3>${pendingApps}</h3><p>Pendentes</p></div></div>
      </div>` : '';

    mainContent.innerHTML = `
      <div class="panel-header"><h2><i class="fas ${mode==='billing'?'fa-file-invoice-dollar':'fa-chart-bar'}"></i> ${title}</h2><div class="export-actions"><button class="btn-export" id="exportCsvBtn"><i class="fas fa-file-csv"></i><span class="hide-mobile"> CSV</span></button><button class="btn-export" id="exportPdfBtn"><i class="fas fa-file-pdf"></i><span class="hide-mobile"> PDF</span></button></div></div>
      ${dashboardHTML}
      ${isMobile ? `
        <div class="period-selector-compact"><div class="filter-row"><div class="date-input-group-compact"><i class="far fa-calendar"></i><input type="date" id="startDate"></div><span class="filter-separator">—</span><div class="date-input-group-compact"><i class="far fa-calendar"></i><input type="date" id="endDate"></div></div><div class="filter-row"><label class="checkbox-compact"><input type="checkbox" id="includeAllCheck"> Todos</label>${mode==='billing'?'<label class="checkbox-compact"><input type="checkbox" id="onlyPaidCheck"> Pagos</label>':''}</div><div class="service-filter-compact"><select multiple id="serviceSelect" size="2"><option value="__ALL__" selected>Todos os serviços</option>${services.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}</select></div><button class="btn-primary btn-compact" id="applyPeriod"><i class="fas fa-filter"></i> Filtrar</button></div>` : `
        <div class="period-selector"><div class="date-input-group"><i class="far fa-calendar"></i><input type="date" id="startDate"></div><span>até</span><div class="date-input-group"><i class="far fa-calendar"></i><input type="date" id="endDate"></div><label class="all-records-check"><input type="checkbox" id="includeAllCheck"> Incluir todos</label>${mode==='billing'?'<label style="display:flex; align-items:center; gap:8px;"><input type="checkbox" id="onlyPaidCheck"> Apenas pagos</label>':''}<div class="service-filter"><select multiple id="serviceSelect" size="3"><option value="__ALL__" selected>Todos os serviços</option>${services.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}</select></div><button class="btn-primary" id="applyPeriod">Aplicar filtros</button></div>`}
      <div id="financeResult"></div>`;

    const today = new Date().toISOString().split('T')[0];
    const startInp = document.getElementById('startDate');
    const endInp = document.getElementById('endDate');
    const includeAll = document.getElementById('includeAllCheck');
    const onlyPaidCheck = document.getElementById('onlyPaidCheck');
    const serviceSelect = document.getElementById('serviceSelect');
    if (!includeAll.checked) { startInp.value = today; endInp.value = today; }
    function updateDateFields() { startInp.disabled = includeAll.checked; endInp.disabled = includeAll.checked; }
    includeAll.addEventListener('change', updateDateFields);
    updateDateFields();
    serviceSelect.addEventListener('change', () => {
      const options = Array.from(serviceSelect.options);
      const allOption = options.find(opt => opt.value === '__ALL__');
      if (allOption.selected) options.forEach(opt => { if (opt.value !== '__ALL__') opt.selected = false; });
      else if (!options.some(opt => opt.value !== '__ALL__' && opt.selected)) allOption.selected = true;
    });

    async function updateDisplay() {
      const start = includeAll.checked ? null : startInp.value;
      const end = includeAll.checked ? null : endInp.value;
      const onlyPaid = onlyPaidCheck?.checked || false;
      const selectedOptions = Array.from(serviceSelect.selectedOptions);
      let serviceParam = null;
      if (!selectedOptions.some(opt => opt.value === '__ALL__')) serviceParam = selectedOptions.map(opt => opt.value).join(',');
      let url = `${API}/reports/${mode === 'billing' ? 'billing' : 'appointments'}?`;
      if (start) url += `start=${start}&end=${end}&`;
      if (onlyPaid) url += `paid=true&`;
      if (serviceParam) url += `serviceIds=${serviceParam}`;
      const res = await fetch(url, { headers: headers() });
      const data = await res.json();
      renderFinanceResult(data, mode);
    }

    function renderFinanceResult(data, mode) {
      const container = document.getElementById('financeResult');
      if (mode === 'billing') {
        let html = window.innerWidth > 720 ? '<table class="data-table"><thead><tr><th>Serviço</th><th>Total (R$)</th></tr></thead><tbody>' : '<div class="mobile-cards">';
        let total = 0;
        data.forEach(row => {
          if (window.innerWidth > 720) html += `<tr><td>${row.service_name}</td><td>R$ ${parseFloat(row.total).toFixed(2)}</td></tr>`;
          else html += `<div class="card-item" style="padding:12px;"><div style="display:flex; justify-content:space-between;"><span>${row.service_name}</span><strong>R$ ${parseFloat(row.total).toFixed(2)}</strong></div></div>`;
          total += parseFloat(row.total);
        });
        if (window.innerWidth > 720) html += `<tr style="font-weight:bold; background:#fff3f5;"><td>TOTAL</td><td>R$ ${total.toFixed(2)}</td></tr></tbody></table>`;
        else html += `<div class="finance-total-card"><div style="display:flex; justify-content:space-between;"><strong>TOTAL</strong><strong>R$ ${total.toFixed(2)}</strong></div></div></div>`;
        container.innerHTML = html;
      } else {
        if (window.innerWidth > 720) {
          let html = `<p style="margin-bottom:15px;"><i class="fas fa-calendar-check"></i> ${data.length} agendamentos</p><table class="data-table"><thead><tr><th>Data/Hora</th><th>Cliente</th><th>Serviço</th><th>Status</th></tr></thead><tbody>`;
          data.forEach(a => html += `<tr><td>${a.date.split('-').reverse().join('/')} ${a.time}</td><td>${a.client_name}</td><td>${a.service_name}</td><td>${a.paid ? '<span class="paid-badge">Pago</span>' : '<span class="pending-badge">Pendente</span>'}</td></tr>`);
          html += '</tbody></table>';
          container.innerHTML = html;
        } else {
          let html = `<p style="margin:12px 0 8px;"><i class="fas fa-calendar-check"></i> ${data.length} agendamentos</p><div class="mobile-cards">`;
          data.forEach(a => html += `<div class="card-item" style="padding:12px;"><div style="display:flex; justify-content:space-between; margin-bottom:6px;"><strong>${a.client_name}</strong>${a.paid ? '<span class="paid-badge">Pago</span>' : '<span class="pending-badge">Pendente</span>'}</div><div style="margin-bottom:6px;">${a.service_name}</div><div style="display:flex; gap:12px; font-size:0.8rem;"><span><i class="far fa-calendar"></i> ${a.date.split('-').reverse().join('/')}</span><span><i class="far fa-clock"></i> ${a.time}</span></div></div>`);
          html += '</div>';
          container.innerHTML = html;
        }
      }
    }

    document.getElementById('applyPeriod').addEventListener('click', updateDisplay);
    if (onlyPaidCheck) onlyPaidCheck.addEventListener('change', updateDisplay);
    includeAll.addEventListener('change', updateDisplay);
    serviceSelect.addEventListener('change', updateDisplay);
    updateDisplay();

    // CSV
    document.getElementById('exportCsvBtn').addEventListener('click', async () => {
      const start = includeAll.checked ? null : startInp.value;
      const end = includeAll.checked ? null : endInp.value;
      const onlyPaid = onlyPaidCheck?.checked || false;
      const selectedOptions = Array.from(serviceSelect.selectedOptions);
      let serviceParam = null;
      if (!selectedOptions.some(opt => opt.value === '__ALL__')) serviceParam = selectedOptions.map(opt => opt.value).join(',');
      let url = `${API}/reports/${mode === 'billing' ? 'billing' : 'appointments'}?`;
      if (start) url += `start=${start}&end=${end}&`;
      if (onlyPaid) url += `paid=true&`;
      if (serviceParam) url += `serviceIds=${serviceParam}`;
      const res = await fetch(url, { headers: headers() });
      const data = await res.json();
      let csv = '';
      if (mode === 'billing') { csv = 'Serviço,Total (R$)\n'; data.forEach(row => csv += `"${row.service_name}",${parseFloat(row.total).toFixed(2)}\n`); }
      else { csv = 'Data/Hora,Cliente,Serviço,Status\n'; data.forEach(a => csv += `"${a.date} ${a.time}","${a.client_name}","${a.service_name}","${a.paid ? 'Pago' : 'Pendente'}"\n`); }
      const blob = new Blob(["\uFEFF" + csv], {type: 'text/csv;charset=utf-8;'});
      const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `relatorio_${mode}_${new Date().toISOString().slice(0,10)}.csv`; link.click();
    });

    // PDF
    document.getElementById('exportPdfBtn').addEventListener('click', async () => {
      const start = includeAll.checked ? null : startInp.value;
      const end = includeAll.checked ? null : endInp.value;
      const onlyPaid = onlyPaidCheck?.checked || false;
      const selectedOptions = Array.from(serviceSelect.selectedOptions);
      let serviceParam = null;
      if (!selectedOptions.some(opt => opt.value === '__ALL__')) serviceParam = selectedOptions.map(opt => opt.value).join(',');
      let url = `${API}/reports/${mode === 'billing' ? 'billing' : 'appointments'}?`;
      if (start) url += `start=${start}&end=${end}&`;
      if (onlyPaid) url += `paid=true&`;
      if (serviceParam) url += `serviceIds=${serviceParam}`;
      const res = await fetch(url, { headers: headers() });
      const data = await res.json();
      generatePDF(data, mode, start, end);
    });
  }

  // GERAÇÃO DE PDF
  function generatePDF(data, mode, startDate, endDate) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFontSize(18); doc.setTextColor(185, 92, 107); doc.text('Bella Flow', pageWidth/2, 20, {align:'center'});
    doc.setFontSize(14); doc.setTextColor(135, 79, 92); doc.text(mode==='billing'?'Relatório de Faturamento':'Relatório de Agendamentos', pageWidth/2, 30, {align:'center'});
    doc.setFontSize(10); doc.setTextColor(100);
    if (startDate && endDate) {
      doc.text(`Período: de ${startDate.split('-').reverse().join('/')} até ${endDate.split('-').reverse().join('/')}`, pageWidth/2, 38, {align:'center'});
    } else {
      doc.text('Período: Todos', pageWidth/2, 38, {align:'center'});
    }
    doc.setFontSize(9); doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, pageWidth/2, 45, {align:'center'});
    let y = 55;
    if (mode === 'billing') {
      doc.setFontSize(12); doc.setTextColor(0); doc.text('Serviço', 14, y); doc.text('Total (R$)', pageWidth-40, y); y+=6;
      doc.setDrawColor(230); doc.line(14, y, pageWidth-14, y); y+=8;
      let total = 0;
      data.forEach(row => {
        if (y>270) { doc.addPage(); y=20; }
        doc.setFontSize(11); doc.text(row.service_name, 14, y); doc.text(`R$ ${parseFloat(row.total).toFixed(2)}`, pageWidth-40, y, {align:'right'}); total += parseFloat(row.total); y+=8;
      });
      y+=4; doc.setDrawColor(180); doc.line(14, y, pageWidth-14, y); y+=8;
      doc.setFontSize(12); doc.setFont(undefined, 'bold'); doc.text('TOTAL', 14, y); doc.text(`R$ ${total.toFixed(2)}`, pageWidth-40, y, {align:'right'});
    } else {
      doc.setFontSize(10);
      ['Data/Hora','Cliente','Serviço','Status'].forEach((h,i) => { doc.text(h, 14+i*40, y); }); y+=4;
      doc.line(14, y, pageWidth-14, y); y+=8;
      data.forEach(a => {
        if (y>270) { doc.addPage(); y=20; }
        doc.text(`${a.date.split('-').reverse().join('/')} ${a.time}`, 14, y);
        doc.text(a.client_name, 54, y); doc.text(a.service_name, 94, y); doc.text(a.paid?'Pago':'Pendente', 134, y); y+=7;
      });
    }
    doc.save(`relatorio_${mode}_${new Date().toISOString().slice(0,10)}.pdf`);
  }

  // Inicialização
  async function init() {
    document.getElementById('skeletonLoader').style.display = 'flex';
    try {
      await Promise.all([fetchClients(), fetchServices(), fetchAppointments()]);
    } catch(e) {
      showToast('Erro ao carregar dados. Verifique se o servidor está rodando.', true);
    }
    document.getElementById('skeletonLoader').style.display = 'none';
    switchTab('clients');
  }
  init();
})();