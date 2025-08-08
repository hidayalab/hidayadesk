<template>
    <div v-for="section in sections" :key="section.name" class="section">
        <h2 class="section-title">{{ section.name }}</h2>
        <div class="widget-grid">

        </div>
        <ul class="item-list">
            <li v-for="item in section.items" :key="item.title" class="list-item">
                <a :href="item.url" target="_blank" class="item-link">
                    <i :class="['icon', item.icon]"></i>
                    <p class="item-title">{{ item.title }}</p>
                </a>
            </li>
            <li class="list-item add-item-button" @click="showAddItemModal()">
                <a target="_blank" class="item-link">
                    <i class="icon fa fa-plus" aria-hidden="true"></i>
                    <p class="item-title">Add</p>
                </a>
            </li>
        </ul>
    </div>
    <!-- Add Item Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
            <h3>Add New Item</h3>
            <form @submit.prevent="addItem">
                <div class="form-group">
                    <label for="item-title">Title:</label>
                    <input type="text" id="item-title" v-model="newItem.title" required>
                </div>
                <div class="form-group">
                    <label for="item-url">URL:</label>
                    <input type="url" id="item-url" v-model="newItem.url" required>
                </div>
                <div class="form-group">
                    <label for="item-icon">Icon (Font Awesome class, e.g., fas fa-star):</label>
                    <input type="text" id="item-icon" v-model="newItem.icon">
                </div>
                <div class="modal-actions">
                    <button type="submit" class="save-button">Add Item</button>
                    <button type="button" @click="closeModal" class="cancel-button">Cancel</button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>

export default {
    props: {
        sections: {
            type: Array,
            default: []
        }
    },
    methods: {

        showAddItemModal() {
            this.showModal = true;
        },
        closeModal() {
            this.showModal = false;
        },
        addItem() {
            // Basic validation
            if (!this.newItem.title || !this.newItem.url) {
                alert('Title and URL are required.');
                return;
            }

            // Find the target section (e.g., the first section)
            // You might want a more sophisticated way to select the section
            const targetSection = this.sections[0];
            if (targetSection) {
                targetSection.items.push({
                    ...this.newItem,
                    // Ensure the icon has a default if not provided
                    icon: this.newItem.icon || 'fas fa-link',
                });
            }

            // Reset the form and close the modal
            this.newItem = { title: '', url: '', icon: '' };
            this.closeModal();
        },
    },
    data() {
        return {

            showModal: false,
            newItem: {
                title: '',
                url: '',
                icon: '',
            },
        };
    },
};
</script>