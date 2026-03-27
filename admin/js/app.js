import { templateService } from "./templates.js";
import { userService } from "./users.js";
import { auth, signInAnonymously } from "./firebase-config.js";

class AdminApp {
    constructor() {
        this.currentView = 'dashboard';
        this.templates = [];
        this.users = [];
        this.init();
    }

    async init() {
        this.bindEvents();
        try {
            console.log("Authenticating anonymously...");
            await signInAnonymously(auth);
            console.log("Authenticated.");
        } catch (error) {
            console.error("Auth Error:", error);
            alert("Authentication failed. Make sure 'Anonymous' sign-in is enabled in your Firebase Console (Authentication > Sign-in method).");
        }
        await this.loadData();
        this.renderDashboard();
    }

    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                this.switchView(view);
            });
        });

        // Template Modal
        document.getElementById('add-template-btn').addEventListener('click', () => this.showTemplateModal());
        document.querySelector('.close-btn').addEventListener('click', () => this.hideTemplateModal());
        document.querySelector('.cancel-modal').addEventListener('click', () => this.hideTemplateModal());
        
        document.getElementById('template-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleTemplateSubmit();
        });

        // Delete Modal
        document.querySelector('.cancel-delete').addEventListener('click', () => this.hideDeleteModal());
    }

    async loadData() {
        try {
            console.log("Fetching templates...");
            this.templates = await templateService.getAllTemplates();
            console.log("Templates loaded:", this.templates.length);
            
            console.log("Fetching users...");
            this.users = await userService.getAllUsers();
            console.log("Users loaded:", this.users.length);

            this.updateStats();
            this.checkMigration();
        } catch (error) {
            console.error("Firebase Connection Error:", error);
            let errorMessage = error.message;
            if (error.code === 'permission-denied') {
                errorMessage = "Permission Denied. Your Firestore rules might be blocking unauthenticated access. Try setting rules to allow public access or implement sign-in.";
            }
            alert("Failed to connect to Firebase:\n" + errorMessage);
        }
    }

    checkMigration() {
        // If there are no templates, or if the standard ones are missing, or if there are duplicates
        const standardIds = ['skill-no-photo', 'skill-with-photo', 'history-no-photo', 'history-with-photo'];
        const hasStandards = standardIds.every(id => this.templates.some(t => t.id === id));
        
        // Detect duplicates (by checking if unique count < total count)
        const uniqueIds = new Set(this.templates.map(t => t.id));
        const hasDuplicates = uniqueIds.size < this.templates.length;

        if (this.templates.length === 0 || !hasStandards || hasDuplicates) {
            const dashboard = document.getElementById('dashboard-view');
            // Remove existing migration section if any
            document.getElementById('migration-section')?.remove();
            
            const migrateSection = document.createElement('div');
            migrateSection.className = 'recent-activity';
            migrateSection.id = 'migration-section';
            
            let message = "Some or all standard resume templates are missing from Firestore.";
            let buttonText = "Run Migration (Fixed IDs)";
            let secondaryButton = "";

            if (hasDuplicates) {
                message = "Duplicates detected in Firestore! Your mobile app might show error-prone results.";
                buttonText = "Clean Reset & Migrate";
                secondaryButton = `<button class="btn btn-secondary" onclick="window.app.resetTemplates()" style="margin-left: 0.5rem; background-color: var(--danger-color); color: white;">
                    <i data-lucide="refresh-cw"></i> Wipe All & Start Over
                </button>`;
            }

            migrateSection.innerHTML = `
                <h3 style="color: ${hasDuplicates ? 'var(--danger-color)' : 'var(--primary-color)'}">
                    ${hasDuplicates ? '⚠️ Data Cleanup Required' : 'Migration Required'}
                </h3>
                <p>${message}</p>
                <div class="action-buttons">
                    <button class="btn btn-primary" onclick="window.app.migrateTemplates()">
                        <i data-lucide="upload-cloud"></i> ${buttonText}
                    </button>
                    ${secondaryButton}
                </div>
            `;
            dashboard.appendChild(migrateSection);
            if (window.lucide) window.lucide.createIcons();
        }
    }

    async resetTemplates() {
        if (!confirm("⚠️ This will DELETE ALL templates from Firestore. This is recommended to clean up duplicates. Continue?")) return;
        
        try {
            await templateService.resetTemplates();
            alert("All templates cleared. You can now run a clean migration.");
            await this.loadData();
        } catch (error) {
            alert("Reset failed: " + error.message);
        }
    }

    async migrateTemplates() {
        const hardcoded = [
            {
                id: 'skill-no-photo',
                name: 'Skill/Achievement Based',
                category: 'Skills Focused',
                formatType: 'functional',
                hasPhoto: false,
                isActive: true,
                description: 'Highlights projects, internships, and core skills first. Clean and ATS-friendly.',
                sections: ['Contact Information', 'Professional Summary', 'Technical Skills', 'Project Highlights', 'Education']
            },
            {
                id: 'skill-with-photo',
                name: 'Skill/Achievement Based (With 1x1 Photo)',
                category: 'Skills Focused',
                formatType: 'functional',
                hasPhoto: true,
                isActive: true,
                description: 'Same skill-focused layout but includes a professional 1x1 ID photo in the header.',
                sections: ['Contact Information', 'Professional Summary', 'Technical Skills', 'Project Highlights', 'Education']
            },
            {
                id: 'history-no-photo',
                name: 'Education/Job History Based',
                category: 'Career/Education Timeline',
                formatType: 'chronological',
                hasPhoto: false,
                isActive: true,
                description: 'Traditional formal layout focusing on education and chronological work/internship experience.',
                sections: ['Contact Information', 'Professional Summary', 'Education', 'Professional Experience', 'Skills']
            },
            {
                id: 'history-with-photo',
                name: 'Education/Job History Based (With 1x1 Photo)',
                category: 'Career/Education Timeline',
                formatType: 'chronological',
                hasPhoto: true,
                isActive: true,
                description: 'Traditional layout combined with a professional 1x1 ID photo for complete formal applications.',
                sections: ['Contact Information', 'Professional Summary', 'Education', 'Professional Experience', 'Skills']
            }
        ];

        try {
            for (const t of hardcoded) {
                await templateService.addTemplate(t);
            }
            alert("Migration successful! Fixed IDs have been restored.");
            document.getElementById('migration-section')?.remove();
            await this.loadData();
        } catch (error) {
            alert("Migration failed: " + error.message);
        }
    }

    updateStats() {
        document.getElementById('total-users').textContent = this.users.length;
        document.getElementById('active-templates').textContent = this.templates.filter(t => t.isActive).length;
        // Re-run Lucide icons
        if (window.lucide) window.lucide.createIcons();
    }

    switchView(view) {
        // Update UI
        document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
        document.getElementById(`${view}-view`).classList.remove('hidden');
        
        document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-view="${view}"]`).classList.add('active');
        
        document.getElementById('view-title').textContent = view.charAt(0).toUpperCase() + view.slice(1);
        this.currentView = view;

        if (view === 'templates') this.renderTemplates();
        if (view === 'users') this.renderUsers();
        if (view === 'dashboard') this.loadData();

        if (window.lucide) window.lucide.createIcons();
    }

    renderTemplates() {
        const list = document.getElementById('templates-list');
        list.innerHTML = this.templates.map(t => `
            <tr>
                <td>
                    <span class="badge ${t.isActive ? 'badge-success' : 'badge-danger'}">
                        ${t.isActive ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td><strong>${t.name}</strong> <br/><small style="color:var(--text-muted)">ID: ${t.id}</small></td>
                <td>${t.category}</td>
                <td>${t.formatType}</td>
                <td>${t.hasPhoto ? '✅ Yes' : '❌ No'}</td>
                <td>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn-icon" onclick="window.app.showTemplateModal('${t.id}')">
                            <i data-lucide="edit-2"></i>
                        </button>
                        <button class="btn-icon delete" onclick="window.app.confirmDelete('template', '${t.id}')">
                            <i data-lucide="trash-2"></i>
                        </button>
                        <label class="switch">
                            <input type="checkbox" ${t.isActive ? 'checked' : ''} 
                                onchange="window.app.toggleTemplateVisibility('${t.id}', this.checked)">
                            <span class="slider"></span>
                        </label>
                    </div>
                </td>
            </tr>
        `).join('');
        if (window.lucide) window.lucide.createIcons();
    }

    renderUsers() {
        const list = document.getElementById('users-list');
        list.innerHTML = this.users.map(u => `
            <tr>
                <td>${u.email}</td>
                <td>
                    <select onchange="window.app.changeUserRole('${u.id}', this.value)" class="role-select">
                        <option value="student" ${u.role === 'student' ? 'selected' : ''}>Student</option>
                        <option value="worker" ${u.role === 'worker' ? 'selected' : ''}>Worker</option>
                        <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
                    </select>
                </td>
                <td>${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
                <td>
                    <button class="btn-icon delete" onclick="window.app.confirmDelete('user', '${u.id}')">
                        <i data-lucide="trash-2"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        if (window.lucide) window.lucide.createIcons();
    }

    showTemplateModal(id = null) {
        const modal = document.getElementById('template-modal');
        const form = document.getElementById('template-form');
        const title = document.getElementById('modal-title');
        
        form.reset();
        document.getElementById('template-id').value = id || '';
        document.getElementById('template-name').disabled = false;
        
        if (id) {
            const t = this.templates.find(temp => temp.id === id);
            title.textContent = 'Edit Template';
            document.getElementById('template-name').value = t.name;
            document.getElementById('template-category').value = t.category;
            document.getElementById('template-format').value = t.formatType;
            document.getElementById('template-description').value = t.description;
            document.getElementById('template-hasPhoto').checked = t.hasPhoto;
            document.getElementById('template-isActive').checked = t.isActive;
            
            // If it's a standard ID, don't allow changing name easily or just show ID
            console.log("Editing:", t.id);
        } else {
            title.textContent = 'New Template';
        }
        
        modal.classList.remove('hidden');
    }

    hideTemplateModal() {
        document.getElementById('template-modal').classList.add('hidden');
    }

    confirmDelete(type, id) {
        const modal = document.getElementById('delete-modal');
        const typeSpan = document.getElementById('delete-item-type');
        const confirmBtn = document.getElementById('confirm-delete-btn');
        
        typeSpan.textContent = type;
        modal.classList.remove('hidden');
        
        // Remove existing listeners to avoid multiple fires
        const newBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);
        
        newBtn.addEventListener('click', async () => {
            if (type === 'template') {
                await this.deleteTemplate(id);
            } else {
                await this.deleteUser(id);
            }
            this.hideDeleteModal();
        });
    }

    hideDeleteModal() {
        document.getElementById('delete-modal').classList.add('hidden');
    }

    async handleTemplateSubmit() {
        const id = document.getElementById('template-id').value;
        const data = {
            name: document.getElementById('template-name').value,
            category: document.getElementById('template-category').value,
            formatType: document.getElementById('template-format').value,
            description: document.getElementById('template-description').value,
            hasPhoto: document.getElementById('template-hasPhoto').checked,
            isActive: document.getElementById('template-isActive').checked,
        };

        try {
            if (id) {
                // Check if document exists first to avoid "No document to update" error
                // In this case, we'll try setDoc if update fails
                try {
                    await templateService.updateTemplate(id, data);
                } catch (e) {
                    if (e.message.includes('No document to update')) {
                        console.log("Document doesn't exist, using setDoc instead");
                        await templateService.addTemplate({ id, ...data });
                    } else {
                        throw e;
                    }
                }
            } else {
                await templateService.addTemplate(data);
            }
            this.hideTemplateModal();
            await this.loadData();
            this.renderTemplates();
        } catch (error) {
            alert("Error saving template: " + error.message);
        }
    }

    async deleteTemplate(id) {
        try {
            await templateService.deleteTemplate(id);
            await this.loadData();
            this.renderTemplates();
        } catch (error) {
            alert("Error deleting template: " + error.message);
        }
    }

    async toggleTemplateVisibility(id, isActive) {
        try {
            await templateService.toggleVisibility(id, isActive);
            const template = this.templates.find(t => t.id === id);
            if (template) template.isActive = isActive;
            this.renderTemplates();
            this.updateStats();
        } catch (error) {
            alert("Error updating visibility: " + error.message);
        }
    }

    async changeUserRole(userId, newRole) {
        try {
            await userService.updateRole(userId, newRole);
            const user = this.users.find(u => u.id === userId);
            if (user) user.role = newRole;
        } catch (error) {
            alert("Error updating role: " + error.message);
        }
    }

    async deleteUser(userId) {
        if (!confirm("Are you sure you want to delete this user?")) return;
        try {
            await userService.deleteUser(userId);
            await this.loadData();
            this.renderUsers();
        } catch (error) {
            alert("Error deleting user: " + error.message);
        }
    }

    // Helper for onclick functions
    showTemplates() { this.switchView('templates'); }
    showUsers() { this.switchView('users'); }
}

// Global exposure for onclick
window.app = new AdminApp();
