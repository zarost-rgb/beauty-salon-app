/**
 * Bellezza Studio Frontend SPA Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const servicesGrid = document.getElementById('services-grid');
  const serviceSelect = document.getElementById('service_id');
  const appointmentForm = document.getElementById('appointment-form');
  const appointmentDateInput = document.getElementById('appointment_date');
  const appointmentsTbody = document.getElementById('appointments-tbody');
  const refreshAppointmentsBtn = document.getElementById('refresh-appointments');
  const backendStatusBadge = document.getElementById('backend-status-badge');
  const submitBtn = document.getElementById('submit-btn');

  // Set min date for datepicker to today
  if (appointmentDateInput) {
    const today = new Date().toISOString().split('T')[0];
    appointmentDateInput.setAttribute('min', today);
  }

  // Toast notification helper
  window.showToast = function (message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `
      <span class="text-base select-none">${icon}</span>
      <div class="flex-1 font-medium leading-snug">${message}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(50px)';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  };

  /**
   * Check backend health status
   */
  async function checkHealth() {
    try {
      const res = await fetch('/health');
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'UP' && data.database === 'connected') {
          backendStatusBadge.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-950 text-emerald-400 border border-emerald-800';
          backendStatusBadge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Baza & API Połączone';
          return;
        }
      }
      throw new Error('Not healthy');
    } catch {
      backendStatusBadge.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-950 text-rose-400 border border-rose-800';
      backendStatusBadge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span> Błąd API';
    }
  }

  /**
   * Fetch services catalog from backend
   */
  async function loadServices() {
    try {
      const res = await fetch('/api/services');
      if (!res.ok) throw new Error('Błąd serwera podczas pobierania usług');
      
      const json = await res.json();
      const services = json.data || [];

      renderServices(services);
      populateServiceSelect(services);
    } catch (err) {
      console.error(err);
      servicesGrid.innerHTML = `
        <div class="col-span-full p-8 text-center bg-rose-50 border border-rose-200 rounded-2xl text-rose-800">
          <p class="font-semibold">Nie udało się pobrać aktualnego cennika usług.</p>
          <p class="text-xs text-rose-600 mt-1">Upewnij się, że usługa backendu i bazy danych jest uruchomiona.</p>
        </div>
      `;
    }
  }

  /**
   * Render services cards
   */
  function renderServices(services) {
    if (!services.length) {
      servicesGrid.innerHTML = `<p class="col-span-full text-center text-neutral-500">Brak dostępnych usług.</p>`;
      return;
    }

    servicesGrid.innerHTML = services.map(service => `
      <div class="service-card bg-neutral-50/60 p-8 rounded-3xl border border-neutral-200/80 flex flex-col justify-between hover:bg-white transition-all">
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold uppercase tracking-wider text-brand-700 bg-brand-100/70 px-3 py-1 rounded-full">
              ${service.duration_min} min
            </span>
            <span class="font-serif text-2xl font-bold text-neutral-900">
              ${parseFloat(service.price).toFixed(2)} <span class="text-xs font-normal text-neutral-500">PLN</span>
            </span>
          </div>
          <h3 class="font-serif text-xl font-bold text-neutral-900">${service.name}</h3>
          <p class="text-sm text-neutral-600 leading-relaxed">${service.description}</p>
        </div>
        <div class="pt-6 mt-6 border-t border-neutral-200/60">
          <button onclick="selectServiceForBooking(${service.id})" class="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-brand-700 bg-brand-50 hover:bg-brand-600 hover:text-white border border-brand-200/80 transition-all flex items-center justify-center gap-2">
            <span>Wybierz zabieg</span>
            <span>&rarr;</span>
          </button>
        </div>
      </div>
    `).join('');
  }

  /**
   * Populate select dropdown in form
   */
  function populateServiceSelect(services) {
    serviceSelect.innerHTML = `
      <option value="" disabled selected>-- Wybierz usługę z listy --</option>
      ${services.map(s => `
        <option value="${s.id}">
          ${s.name} (${s.duration_min} min) — ${parseFloat(s.price).toFixed(2)} PLN
        </option>
      `).join('')}
    `;
  }

  /**
   * Select service from card and scroll to form
   */
  window.selectServiceForBooking = function (serviceId) {
    serviceSelect.value = serviceId;
    const bookingSection = document.getElementById('rezerwacja');
    bookingSection.scrollIntoView({ behavior: 'smooth' });
    serviceSelect.focus();
    serviceSelect.classList.add('ring-2', 'ring-brand-500');
    setTimeout(() => serviceSelect.classList.remove('ring-2', 'ring-brand-500'), 1500);
  };

  /**
   * Fetch all appointments
   */
  async function loadAppointments() {
    try {
      const res = await fetch('/api/appointments');
      if (!res.ok) throw new Error('Błąd pobierania rezerwacji');
      
      const json = await res.json();
      renderAppointments(json.data || []);
    } catch (err) {
      console.error(err);
      appointmentsTbody.innerHTML = `
        <tr>
          <td colspan="6" class="px-6 py-6 text-center text-rose-600 font-medium">
            Nie udało się wczytać listy rezerwacji.
          </td>
        </tr>
      `;
    }
  }

  /**
   * Render appointments table
   */
  function renderAppointments(appointments) {
    if (!appointments.length) {
      appointmentsTbody.innerHTML = `
        <tr>
          <td colspan="6" class="px-6 py-8 text-center text-neutral-500">
            Brak zaplanowanych wizyt. Bądź pierwszym klientem i zarezerwuj termin powyżej!
          </td>
        </tr>
      `;
      return;
    }

    appointmentsTbody.innerHTML = appointments.map(apt => `
      <tr class="hover:bg-neutral-50/80 transition-colors">
        <td class="px-6 py-4">
          <div class="font-semibold text-neutral-900">${apt.customer_name}</div>
          <div class="text-xs text-neutral-500">${apt.customer_phone} • ${apt.customer_email}</div>
        </td>
        <td class="px-6 py-4">
          <span class="font-medium text-neutral-800">${apt.service_name || 'Usługa #' + apt.service_id}</span>
          ${apt.service_price ? `<span class="block text-xs text-neutral-500">${parseFloat(apt.service_price).toFixed(2)} PLN</span>` : ''}
        </td>
        <td class="px-6 py-4 font-mono text-sm text-neutral-700">${apt.appointment_date}</td>
        <td class="px-6 py-4 font-mono text-sm text-neutral-700">${apt.appointment_time}</td>
        <td class="px-6 py-4">
          <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            ${apt.status || 'potwierdzona'}
          </span>
        </td>
        <td class="px-6 py-4 text-right">
          <button onclick="cancelAppointment(${apt.id})" class="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:underline p-1.5 transition-colors">
            Anuluj
          </button>
        </td>
      </tr>
    `).join('');
  }

  /**
   * Handle form submission
   */
  appointmentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(appointmentForm);
    const payload = {
      service_id: parseInt(formData.get('service_id'), 10),
      customer_name: formData.get('customer_name').trim(),
      customer_phone: formData.get('customer_phone').trim(),
      customer_email: formData.get('customer_email').trim(),
      appointment_date: formData.get('appointment_date'),
      appointment_time: formData.get('appointment_time'),
      notes: formData.get('notes') ? formData.get('notes').trim() : '',
    };

    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>Zapisywanie rezerwacji...</span>
    `;

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Nie udało się zapisać rezerwacji.');
      }

      showToast('Wizyta została pomyślnie zarezerwowana! Czekamy na Ciebie.', 'success');
      appointmentForm.reset();
      
      // Reload appointments table
      loadAppointments();

      // Scroll to appointments view
      setTimeout(() => {
        const listSection = document.getElementById('rezerwacje-lista');
        if (listSection) listSection.scrollIntoView({ behavior: 'smooth' });
      }, 500);

    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>Potwierdź i zarezerwuj termin</span>';
    }
  });

  /**
   * Cancel appointment
   */
  window.cancelAppointment = async function (id) {
    if (!confirm('Czy na pewno chcesz anulować wybraną rezerwację wizyty?')) {
      return;
    }

    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Błąd podczas usuwania rezerwacji.');
      }

      showToast('Rezerwacja została pomyślnie anulowana.', 'info');
      loadAppointments();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Refresh appointments click
  if (refreshAppointmentsBtn) {
    refreshAppointmentsBtn.addEventListener('click', () => {
      loadAppointments();
      showToast('Zaktualizowano listę rezerwacji.', 'info');
    });
  }

  // Initial loads
  checkHealth();
  loadServices();
  loadAppointments();

  // Periodic health check every 30 seconds
  setInterval(checkHealth, 30000);
});
