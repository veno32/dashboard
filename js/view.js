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

class ComponentManager {
    constructor() {
        this.components = [];
        this.currentComponentId = null;
        this.labId = this.getLabId();
    }

    init() {
        this.loadComponents();
        this.setupEventListeners();
        this.setupFormHandlers();
    }

    getLabId() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    loadComponents() {
        if (!this.labId) {
            console.error('No lab ID found');
            return;
        }
        
        this.components = StorageUtil.getItem(`lab_${this.labId}_components`, []);
        this.renderComponents();
    }

    saveComponents() {
        if (!this.labId) {
            console.error('No lab ID found');
            return;
        }
        
        StorageUtil.setItem(`lab_${this.labId}_components`, this.components);
    }

    setupFormHandlers() {
        // Create component handler
        document.getElementById('createComponentBtn').addEventListener('click', () => {
            const formData = {
                type: document.getElementById('typeInput').value,
                quantity: document.getElementById('quantityInput').value,
                running: document.getElementById('runningInput').value,
                damage: document.getElementById('damageInput').value,
                comments: document.getElementById('commentsInput').value
            };

            try {
                this.createComponent(formData);
                const modal = bootstrap.Modal.getInstance(document.getElementById('createModal'));
                modal.hide();
                document.getElementById('componentForm').reset();
            } catch (error) {
                alert(error.message);
            }
        });

        // Edit component handler
        document.getElementById('saveEditBtn').addEventListener('click', () => {
            const formData = {
                type: document.getElementById('editTypeInput').value,
                quantity: document.getElementById('editQuantityInput').value,
                running: document.getElementById('editRunningInput').value,
                damage: document.getElementById('editDamageInput').value,
                comments: document.getElementById('editCommentsInput').value
            };

            try {
                const componentId = parseInt(document.getElementById('editComponentId').value);
                this.editComponent(componentId, formData);
                const modal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
                modal.hide();
            } catch (error) {
                alert(error.message);
            }
        });
    }

    setupEventListeners() {
        // Event delegation for table actions
        document.getElementById('componentsTableBody').addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button) return;

            const componentId = parseInt(button.dataset.componentId);
            const action = button.dataset.action;

            switch (action) {
                case 'edit':
                    this.handleEdit(componentId);
                    break;
                case 'delete':
                    this.handleDelete(componentId);
                    break;
                case 'comment':
                    this.handleAddComment(componentId);
                    break;
            }
        });
    }

    handleEdit(componentId) {
        const component = this.components.find(c => c.id === componentId);
        if (!component) return;

        // Populate edit form
        document.getElementById('editComponentId').value = component.id;
        document.getElementById('editTypeInput').value = component.type;
        document.getElementById('editQuantityInput').value = component.quantity;
        document.getElementById('editRunningInput').value = component.running;
        document.getElementById('editDamageInput').value = component.damage;
        document.getElementById('editCommentsInput').value = component.comments || '';

        // Show edit modal
        const editModal = new bootstrap.Modal(document.getElementById('editModal'));
        editModal.show();
    }

    editComponent(id, formData) {
        const component = this.components.find(c => c.id === id);
        if (!component) throw new Error('Component not found');

        const updatedComponent = {
            ...component,
            type: formData.type.trim(),
            quantity: parseInt(formData.quantity),
            running: parseInt(formData.running),
            damage: parseInt(formData.damage),
            comments: formData.comments?.trim() || ''
        };

        const errors = this.validateComponent(updatedComponent);
        if (errors.length > 0) {
            throw new Error(errors.join('\n'));
        }

        this.components = this.components.map(c => 
            c.id === id ? updatedComponent : c
        );
        
        this.saveComponents();
        this.renderComponents();
    }

    createComponent(formData) {
        const component = {
            id: Date.now(),
            type: formData.type.trim(),
            quantity: parseInt(formData.quantity),
            running: parseInt(formData.running),
            damage: parseInt(formData.damage),
            comments: formData.comments?.trim() || ''
        };

        const errors = this.validateComponent(component);
        if (errors.length > 0) {
            throw new Error(errors.join('\n'));
        }

        this.components.push(component);
        this.saveComponents();
        this.renderComponents();
    }

    validateComponent(component) {
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
        if (component.running + component.damage < component.quantity) {
            errors.push('Items cannot be less than running + damaged items Total quantity');
        }
        return errors;
    }

    handleDelete(componentId) {
        if (confirm('Are you sure you want to delete this component?')) {
            this.components = this.components.filter(c => c.id !== componentId);
            this.saveComponents();
            this.renderComponents();
        }
    }

    handleAddComment(componentId) {
        const component = this.components.find(c => c.id === componentId);
        if (!component) return;

        const newComment = prompt('Enter new comment:', component.comments);
        if (newComment !== null) {
            component.comments = newComment.trim();
            this.saveComponents();
            this.renderComponents();
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
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const componentManager = new ComponentManager();
    componentManager.init();
});
class PcManager {
    constructor() {
        this.pcs = [];
        this.currentPcId = null;
        this.labId = this.getLabId();
    }

    init() {
        this.loadPcs();
        this.setupEventListeners();
        this.setupFormHandlers();
    }

    getLabId() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    loadPcs() {
        if (!this.labId) {
            console.error('No lab ID found');
            return;
        }
        
        this.pcs = StorageUtil.getItem(`lab_${this.labId}_pcs`, []);
        this.renderPcs();
    }

    savePcs() {
        if (!this.labId) {
            console.error('No lab ID found');
            return;
        }
        
        StorageUtil.setItem(`lab_${this.labId}_pcs`, this.pcs);
    }

    setupFormHandlers() {
        // Create PC handler
        document.getElementById('createPcBtn').addEventListener('click', () => {
            const formData = {
                name: document.getElementById('pcNameInput').value,
                ipAddress: document.getElementById('pcIpInput').value,
                comments: document.getElementById('pcCommentsInput').value
            };

            try {
                this.createPc(formData);
                const modal = bootstrap.Modal.getInstance(document.getElementById('createPcModal'));
                modal.hide();
                document.getElementById('pcForm').reset();
            } catch (error) {
                alert(error.message);
            }
        });

        // Edit PC handler
        document.getElementById('savePcEditBtn').addEventListener('click', () => {
            const formData = {
                name: document.getElementById('editPcNameInput').value,
                ipAddress: document.getElementById('editPcIpInput').value,
                comments: document.getElementById('editPcCommentsInput').value
            };

            try {
                const pcId = parseInt(document.getElementById('editPcId').value);
                this.editPc(pcId, formData);
                const modal = bootstrap.Modal.getInstance(document.getElementById('editPcModal'));
                modal.hide();
            } catch (error) {
                alert(error.message);
            }
        });
    }

    setupEventListeners() {
        // Event delegation for table actions
        document.getElementById('pcsTableBody').addEventListener('click', async (e) => {
            const button = e.target.closest('button');
            if (!button) return;

            const pcId = parseInt(button.dataset.pcId);
            const action = button.dataset.action;

            switch (action) {
                case 'edit':
                    this.handleEdit(pcId);
                    break;
                case 'delete':
                    this.handleDelete(pcId);
                    break;
                case 'connect':
                    await this.handleConnect(pcId);
                    break;
            }
        });
    }

    async handleConnect(pcId) {
        const pc = this.pcs.find(p => p.id === pcId);
        if (!pc) return;

        const statusCell = document.querySelector(`[data-pc-status="${pcId}"]`);
        statusCell.textContent = 'Connecting...';

        try {
            const response = await fetch(`http://${pc.ipAddress}`);
            if (response.ok) {
                statusCell.textContent = 'Connected';
                statusCell.style.color = 'green';
            } else {
                statusCell.textContent = 'Failed';
                statusCell.style.color = 'red';
            }
        } catch (error) {
            statusCell.textContent = 'Unreachable';
            statusCell.style.color = 'red';
        }
    }

    handleEdit(pcId) {
        const pc = this.pcs.find(p => p.id === pcId);
        if (!pc) return;

        // Populate edit form
        document.getElementById('editPcId').value = pc.id;
        document.getElementById('editPcNameInput').value = pc.name;
        document.getElementById('editPcIpInput').value = pc.ipAddress;
        document.getElementById('editPcCommentsInput').value = pc.comments || '';

        // Show edit modal
        const editModal = new bootstrap.Modal(document.getElementById('editPcModal'));
        editModal.show();
    }

    editPc(id, formData) {
        const pc = this.pcs.find(p => p.id === id);
        if (!pc) throw new Error('PC not found');

        const updatedPc = {
            ...pc,
            name: formData.name.trim(),
            ipAddress: formData.ipAddress.trim(),
            comments: formData.comments?.trim() || ''
        };

        const errors = this.validatePc(updatedPc);
        if (errors.length > 0) {
            throw new Error(errors.join('\n'));
        }

        this.pcs = this.pcs.map(p => 
            p.id === id ? updatedPc : p
        );
        
        this.savePcs();
        this.renderPcs();
    }

    createPc(formData) {
        const pc = {
            id: Date.now(),
            name: formData.name.trim(),
            ipAddress: formData.ipAddress.trim(),
            comments: formData.comments?.trim() || '',
            status: 'Not Connected'
        };

        const errors = this.validatePc(pc);
        if (errors.length > 0) {
            throw new Error(errors.join('\n'));
        }

        this.pcs.push(pc);
        this.savePcs();
        this.renderPcs();
    }

    validatePc(pc) {
        const errors = [];
        if (!pc.name?.trim()) errors.push('PC name is required');
        if (!pc.ipAddress?.trim()) errors.push('IP address is required');
        if (!this.isValidIpAddress(pc.ipAddress)) {
            errors.push('Invalid IP address format');
        }
        return errors;
    }

    isValidIpAddress(ipAddress) {
        const ipFormat = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (!ipFormat.test(ipAddress)) return false;
        
        const octets = ipAddress.split('.');
        return octets.every(octet => {
            const num = parseInt(octet);
            return num >= 0 && num <= 255;
        });
    }

    handleDelete(pcId) {
        if (confirm('Are you sure you want to delete this PC?')) {
            this.pcs = this.pcs.filter(p => p.id !== pcId);
            this.savePcs();
            this.renderPcs();
        }
    }

    renderPcs() {
        const tbody = document.getElementById('pcsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        this.pcs.forEach((pc, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${this.escapeHtml(pc.name)}</td>
                <td>${this.escapeHtml(pc.ipAddress)}</td>
                <td data-pc-status="${pc.id}">${pc.status || 'Not Connected'}</td>
                <td>
                    <button class="btn btn-success btn-sm" data-pc-id="${pc.id}" data-action="connect">
                        Connect
                    </button>
                </td>
                <td>
                    <button class="btn btn-warning btn-sm" data-pc-id="${pc.id}" data-action="edit">
                        Edit
                    </button>
                </td>
                <td>
                    <button class="btn btn-danger btn-sm" data-pc-id="${pc.id}" data-action="delete">
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
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const pcManager = new PcManager();
    pcManager.init();
});