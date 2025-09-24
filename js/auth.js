// Authentication Manager
class AuthManager {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.sessionExpiry = null;
        this.init();
    }

    init() {
        this.setupLoginForm();
        this.setupLogoutButton();
        this.setupAdminPanel();
        this.checkExistingSession();
        this.startSessionMonitor();
    }

    setupLoginForm() {
        const loginForm = document.getElementById('login-form');
        
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                
                await this.login(username, password);
            });
        }
    }

    setupLogoutButton() {
        const logoutBtn = document.getElementById('logout-btn');
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }
    }

    setupAdminPanel() {
        const adminPanelBtn = document.getElementById('admin-panel-btn');
        
        if (adminPanelBtn) {
            adminPanelBtn.addEventListener('click', () => {
                this.openAdminPanel();
            });
        }
    }

    async login(username, password) {
        if (!username || !password) {
            this.showError('Por favor ingresa usuario y contraseña');
            return;
        }

        try {
            // Show loading state
            const submitBtn = document.querySelector('#login-form button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.innerHTML = '<span class="loading"></span> Iniciando sesión...';
            submitBtn.disabled = true;

            // Make login request
            const response = await this.makeAuthRequest('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });

            if (response.success) {
                this.handleSuccessfulLogin(response);
            } else {
                this.showError(response.message || 'Credenciales inválidas');
            }

        } catch (error) {
            console.error('Login error:', error);
            this.showError('Error de conexión. Intenta nuevamente.');
        } finally {
            // Reset button state
            const submitBtn = document.querySelector('#login-form button[type="submit"]');
            submitBtn.textContent = 'Iniciar Sesión';
            submitBtn.disabled = false;
        }
    }

    handleSuccessfulLogin(response) {
        this.isAuthenticated = true;
        this.currentUser = response.user;
        this.sessionExpiry = new Date(Date.now() + (response.expiresIn * 1000));

        // Store session data
        localStorage.setItem('radioAuth', JSON.stringify({
            token: response.token,
            user: response.user,
            expiresAt: this.sessionExpiry.toISOString()
        }));

        // Update UI
        this.updateAuthUI();
        this.showSuccess(`¡Bienvenido, ${this.currentUser.name || this.currentUser.username}!`);

        // Clear form
        document.getElementById('login-form').reset();

        // Track login
        this.trackAuthEvent('login_success');
    }

    logout() {
        try {
            // Make logout request to server
            this.makeAuthRequest('/api/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout request failed:', error);
        }

        // Clear local session
        this.clearSession();
        this.showSuccess('Sesión cerrada correctamente');
        
        // Track logout
        this.trackAuthEvent('logout');
    }

    clearSession() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.sessionExpiry = null;

        // Clear stored data
        localStorage.removeItem('radioAuth');
        
        // Update UI
        this.updateAuthUI();
    }

    checkExistingSession() {
        try {
            const storedAuth = localStorage.getItem('radioAuth');
            
            if (!storedAuth) return;

            const authData = JSON.parse(storedAuth);
            const expiryDate = new Date(authData.expiresAt);

            // Check if session is expired
            if (expiryDate > new Date()) {
                this.isAuthenticated = true;
                this.currentUser = authData.user;
                this.sessionExpiry = expiryDate;
                this.updateAuthUI();

                // Validate session with server
                this.validateSession();
            } else {
                this.clearSession();
            }

        } catch (error) {
            console.error('Session check error:', error);
            this.clearSession();
        }
    }

    async validateSession() {
        try {
            const response = await this.makeAuthRequest('/api/auth/validate');
            
            if (!response.valid) {
                this.clearSession();
                this.showError('Sesión expirada. Por favor inicia sesión nuevamente.');
            }

        } catch (error) {
            console.error('Session validation error:', error);
        }
    }

    startSessionMonitor() {
        // Check session every 5 minutes
        setInterval(() => {
            if (this.isAuthenticated && this.sessionExpiry) {
                const now = new Date();
                const timeLeft = this.sessionExpiry.getTime() - now.getTime();
                const minutesLeft = Math.floor(timeLeft / 1000 / 60);

                // Warn user 5 minutes before expiry
                if (minutesLeft <= 5 && minutesLeft > 0) {
                    this.showWarning(`Tu sesión expirará en ${minutesLeft} minutos`);
                } else if (minutesLeft <= 0) {
                    this.clearSession();
                    this.showError('Sesión expirada');
                }
            }
        }, 60000); // Check every minute
    }

    updateAuthUI() {
        const loginContainer = document.getElementById('login-form-container');
        const dashboardContainer = document.getElementById('dashboard-container');

        if (this.isAuthenticated) {
            // Show dashboard
            if (loginContainer) loginContainer.style.display = 'none';
            if (dashboardContainer) dashboardContainer.style.display = 'block';
            
            // Update user info in dashboard
            this.updateDashboard();
            
        } else {
            // Show login form
            if (loginContainer) loginContainer.style.display = 'block';
            if (dashboardContainer) dashboardContainer.style.display = 'none';
        }
    }

    updateDashboard() {
        // Update with real-time data
        if (this.currentUser) {
            // Update user-specific data
            this.loadUserDashboard();
        }
    }

    async loadUserDashboard() {
        try {
            const response = await this.makeAuthRequest('/api/dashboard/stats');
            
            if (response.success) {
                // Update dashboard stats
                const stats = response.data;
                
                if (window.radioApp) {
                    window.radioApp.updateStats({
                        listeners: stats.currentListeners || 0,
                        songs: stats.songsToday || 0,
                        uptime: stats.uptimeHours || 0
                    });
                }
            }

        } catch (error) {
            console.error('Dashboard load error:', error);
        }
    }

    openAdminPanel() {
        if (!this.isAuthenticated) {
            this.showError('Debes iniciar sesión para acceder al panel de administración');
            return;
        }

        if (!this.currentUser.isAdmin) {
            this.showError('No tienes permisos de administrador');
            return;
        }

        // Create admin panel modal
        this.createAdminPanel();
        this.trackAuthEvent('admin_panel_opened');
    }

    createAdminPanel() {
        // Check if modal already exists
        let modal = document.getElementById('admin-modal');
        if (modal) {
            modal.style.display = 'flex';
            return;
        }

        // Create modal
        modal = document.createElement('div');
        modal.id = 'admin-modal';
        modal.className = 'admin-modal';
        modal.innerHTML = `
            <div class="admin-modal-content">
                <div class="admin-header">
                    <h2>Panel de Administración</h2>
                    <button class="close-btn" id="close-admin">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="admin-tabs">
                    <button class="admin-tab active" data-tab="streaming">Streaming</button>
                    <button class="admin-tab" data-tab="schedule">Programación</button>
                    <button class="admin-tab" data-tab="users">Usuarios</button>
                    <button class="admin-tab" data-tab="settings">Configuración</button>
                </div>

                <div class="admin-content">
                    <div id="streaming-tab" class="admin-tab-content active">
                        <h3>Control de Streaming</h3>
                        <div class="admin-controls">
                            <div class="control-group">
                                <label>Estado del Stream</label>
                                <button id="toggle-stream" class="btn-primary">Alternar Stream</button>
                            </div>
                            <div class="control-group">
                                <label>Fuente de Audio</label>
                                <select id="admin-stream-source">
                                    <option value="azuracast">AzuraCast</option>
                                    <option value="zenofm">ZenoFM</option>
                                    <option value="manual">Manual</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div id="schedule-tab" class="admin-tab-content">
                        <h3>Gestión de Programación</h3>
                        <div class="admin-controls">
                            <button id="add-show" class="btn-primary">Agregar Programa</button>
                            <div id="shows-list" class="shows-list">
                                <!-- Shows will be loaded here -->
                            </div>
                        </div>
                    </div>

                    <div id="users-tab" class="admin-tab-content">
                        <h3>Gestión de Usuarios</h3>
                        <div class="admin-controls">
                            <button id="add-user" class="btn-primary">Agregar Usuario</button>
                            <div id="users-list" class="users-list">
                                <!-- Users will be loaded here -->
                            </div>
                        </div>
                    </div>

                    <div id="settings-tab" class="admin-tab-content">
                        <h3>Configuración General</h3>
                        <div class="admin-controls">
                            <div class="control-group">
                                <label>Nombre de la Radio</label>
                                <input type="text" id="radio-name" class="form-input" value="Radio PWA">
                            </div>
                            <div class="control-group">
                                <label>Descripción</label>
                                <textarea id="radio-description" class="form-input">Radio online con streaming en vivo</textarea>
                            </div>
                            <button id="save-settings" class="btn-primary">Guardar Configuración</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .admin-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2000;
            }
            
            .admin-modal-content {
                background: var(--surface-color);
                border-radius: 16px;
                width: 90%;
                max-width: 800px;
                max-height: 90vh;
                overflow-y: auto;
                border: 1px solid var(--border-color);
            }
            
            .admin-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid var(--border-color);
            }
            
            .close-btn {
                background: none;
                border: none;
                color: var(--text-primary);
                font-size: 1.5rem;
                cursor: pointer;
            }
            
            .admin-tabs {
                display: flex;
                border-bottom: 1px solid var(--border-color);
            }
            
            .admin-tab {
                flex: 1;
                padding: 15px;
                background: none;
                border: none;
                color: var(--text-secondary);
                cursor: pointer;
                font-weight: 500;
            }
            
            .admin-tab.active {
                color: var(--primary-color);
                border-bottom: 2px solid var(--primary-color);
            }
            
            .admin-content {
                padding: 20px;
            }
            
            .admin-tab-content {
                display: none;
            }
            
            .admin-tab-content.active {
                display: block;
            }
            
            .control-group {
                margin-bottom: 20px;
            }
            
            .control-group label {
                display: block;
                margin-bottom: 5px;
                color: var(--text-secondary);
                font-weight: 500;
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(modal);

        // Setup modal event listeners
        this.setupAdminModalEvents(modal);
        this.loadAdminData();
    }

    setupAdminModalEvents(modal) {
        // Close modal
        const closeBtn = modal.querySelector('#close-admin');
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        // Tab navigation
        const tabs = modal.querySelectorAll('.admin-tab');
        const tabContents = modal.querySelectorAll('.admin-tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.getAttribute('data-tab');
                
                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Show corresponding content
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === `${targetTab}-tab`) {
                        content.classList.add('active');
                    }
                });
            });
        });

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    async loadAdminData() {
        // Load admin-specific data
        try {
            const response = await this.makeAuthRequest('/api/admin/data');
            
            if (response.success) {
                // Update admin interface with real data
                this.updateAdminInterface(response.data);
            }
        } catch (error) {
            console.error('Admin data load error:', error);
        }
    }

    updateAdminInterface(data) {
        // Update interface with fetched data
        // This would be implemented based on actual admin requirements
    }

    async makeAuthRequest(endpoint, options = {}) {
        const authData = localStorage.getItem('radioAuth');
        let headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (authData) {
            const { token } = JSON.parse(authData);
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(endpoint, {
                ...options,
                headers
            });

            const data = await response.json();

            // Handle unauthorized responses
            if (response.status === 401) {
                this.clearSession();
                throw new Error('Unauthorized');
            }

            return data;

        } catch (error) {
            console.error('Auth request error:', error);
            
            // Return mock data for demo purposes
            return this.getMockAuthResponse(endpoint, options);
        }
    }

    getMockAuthResponse(endpoint, options) {
        // Mock responses for demo
        if (endpoint.includes('/login') && options.method === 'POST') {
            const body = JSON.parse(options.body);
            if (body.username === 'admin' && body.password === 'admin') {
                return {
                    success: true,
                    token: 'mock-jwt-token',
                    user: {
                        id: 1,
                        username: 'admin',
                        name: 'Administrador',
                        isAdmin: true
                    },
                    expiresIn: 3600 // 1 hour
                };
            } else {
                return {
                    success: false,
                    message: 'Credenciales inválidas'
                };
            }
        }

        if (endpoint.includes('/validate')) {
            return { valid: true };
        }

        if (endpoint.includes('/dashboard/stats')) {
            return {
                success: true,
                data: {
                    currentListeners: Math.floor(Math.random() * 1000),
                    songsToday: Math.floor(Math.random() * 100),
                    uptimeHours: Math.floor(Math.random() * 24)
                }
            };
        }

        return { success: false, message: 'Endpoint not found' };
    }

    trackAuthEvent(event) {
        if (window.pwaManager) {
            window.pwaManager.trackUsage(event, 'Authentication');
        }
    }

    showSuccess(message) {
        if (window.radioApp) {
            window.radioApp.showNotification(message, 'success');
        }
    }

    showError(message) {
        if (window.radioApp) {
            window.radioApp.showNotification(message, 'error');
        }
    }

    showWarning(message) {
        if (window.radioApp) {
            window.radioApp.showNotification(message, 'warning');
        }
    }
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (!window.authManager) {
            window.authManager = new AuthManager();
        }
    });
} else {
    if (!window.authManager) {
        window.authManager = new AuthManager();
    }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}