// Storage utility functions with error handling
const StorageUtil = {
    setItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Storage error:', error);
            return false;
        }
    },
    
    getItem(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Storage retrieval error:', error);
            return defaultValue;
        }
    }
};

// Component validation
const validateComponent = (component) => {
    const errors = [];
    if (!component.type?.trim()) errors.push('Type is required');
    if (!Number.isInteger(component.quantity) || component.quantity < 0) {
        errors.push('Quantity must be a positive number');
    }
    if (!Number.isInteger(component.running) || component.running < 0) {
        errors.push('Running count must be a positive number');
    }
    if (!Number.isInteger(component.damage) || component.damage < 0) {
        errors.push('Damage count must be a positive number');
    }
    if (component.running + component.damage > component.quantity) {
        errors.push('Running + damaged items cannot exceed total quantity');
    }
    return errors;
};

// Enhanced component management
class ComponentManager {
    constructor() {
        this.components = [];
        this.currentComponentId = null;
    }

    init() {
        this.loadComponents();
        this.setupEventListeners();
    }

    loadComponents() {
        const labId = this.getLabId();
        if (!labId) return;
        
        this.components = StorageUtil.getItem(`lab_${labId}_components`, []);
        this.renderComponents();
    }

    saveComponents() {
        const labId = this.getLabId();
        if (!labId) return;
        
        StorageUtil.setItem(`lab_${labId}_components`, this.components);
    }

    getLabId() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    createComponent(formData) {
        const component = {
            id: Date.now(),
            type: formData.type.trim(),
            quantity: parseInt(formData.quantity),
            running: parseInt(formData.running),
            damage: parseInt(formData.damage),
            comments: formData.comments.trim()
        };

        const errors = validateComponent(component);
        if (errors.length > 0) {
            throw new Error(errors.join('\n'));
        }

        this.components.push(component);
        this.saveComponents();
        this.renderComponents();
    }

    editComponent(id, formData) {
        const component = this.components.find(c => c.id === id);
        if (!component) throw new Error('Component not found');

        const updatedComponent = {
            ...component,
            ...formData,
            type: formData.type.trim(),
            quantity: parseInt(formData.quantity),
            running: parseInt(formData.running),
            damage: parseInt(formData.damage)
        };

        const errors = validateComponent(updatedComponent);
        if (errors.length > 0) {
            throw new Error(errors.join('\n'));
        }

        this.components = this.components.map(c => 
            c.id === id ? updatedComponent : c
        );
        
        this.saveComponents();
        this.renderComponents();
    }

    setupEventListeners() {
        // Create component form submission
        const createForm = document.getElementById('createComponentForm');
        if (createForm) {
            createForm.addEventListener('submit', (e) => {
                e.preventDefault();
                try {
                    const formData = new FormData(createForm);
                    this.createComponent(Object.fromEntries(formData));
                    bootstrap.Modal.getInstance(document.getElementById('createModal'))?.hide();
                    createForm.reset();
                } catch (error) {
                    alert(error.message);
                }
            });
        }

        // Edit component form submission
        const editForm = document.getElementById('editComponentForm');
        if (editForm) {
            editForm.addEventListener('submit', (e) => {
                e.preventDefault();
                try {
                    const formData = new FormData(editForm);
                    this.editComponent(this.currentComponentId, Object.fromEntries(formData));
                    bootstrap.Modal.getInstance(document.getElementById('editModal'))?.hide();
                } catch (error) {
                    alert(error.message);
                }
            });
        }
    }

    renderComponents() {
        const tbody = document.getElementById('componentsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        this.components.forEach((component, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${this.escapeHtml(component.type)}</td>
                <td>${component.quantity}</td>
                <td>${component.running}</td>
                <td>${component.damage}</td>
                <td>${this.escapeHtml(component.comments || 'No comments')}</td>
                <td>
                    <button class="btn btn-info btn-sm" data-component-id="${component.id}" data-action="comment">
                        Add Comment
                    </button>
                </td>
                <td>
                    <button class="btn btn-warning btn-sm" data-component-id="${component.id}" data-action="edit">
                        Edit
                    </button>
                </td>
                <td>
                    <button class="btn btn-danger btn-sm" data-component-id="${component.id}" data-action="delete">
                        Remove
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('componentsTableBody')) {
        const componentManager = new ComponentManager();
        componentManager.init();
    }
});