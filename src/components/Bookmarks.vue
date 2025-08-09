<template>
    <div v-for="section in filteredSections" :key="section.name" class="section">
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
            <li class="list-item add-item-button" @click="showAddItemModal(section)">
                <a target="_blank" class="item-link">
                    <i class="icon fa fa-plus" aria-hidden="true"></i>
                    <p class="item-title">Add</p>
                </a>
            </li>
        </ul>
    </div>
    <div class="add-section-button" @click="showAddSectionModal = true">
        <button class="item-link">
            <i class="icon fa fa-plus" aria-hidden="true"></i>
            <p class="item-title">Add New Section</p>
        </button>
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

    <!-- Add Section Modal -->
    <div v-if="showAddSectionModal" class="modal-overlay" @click.self="showAddSectionModal = false">
        <div class="modal-content">
            <h3>Add New Section</h3>
            <form @submit.prevent="addSection">
                <div class="form-group">
                    <label for="section-name">Section Name:</label>
                    <input type="text" id="section-name" v-model="newSectionName" required>
                </div>
                <div class="modal-actions">
                    <button type="submit" class="save-button">Add Section</button>
                    <button type="button" @click="showAddSectionModal = false" class="cancel-button">Cancel</button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import './styles/bookmark.css';

export default {
    props: {
        sections: {
            type: Array,
            default: []
        },
        searchQuery: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            showModal: false,
            showAddSectionModal: false,
            newItem: {
                title: '',
                url: '',
                icon: '',
            },
            newSectionName: '',
            activeSection: null,
        };
    },
    computed: {
        filteredSections() {
            if (!this.searchQuery) {
                return this.sections;
            }
            const query = this.searchQuery.toLowerCase();
            return this.sections.map(section => {
                const filteredItems = section.items.filter(item => item.title.toLowerCase().includes(query));
                return { ...section, items: filteredItems };
            }).filter(section => section.items.length > 0);
        }
    },
    methods: {
        showAddItemModal(section) {
            this.activeSection = section;
            this.showModal = true;
        },
        closeModal() {
            this.showModal = false;
            this.activeSection = null;
        },
        addItem() {
            if (!this.newItem.title || !this.newItem.url) {
                alert('Title and URL are required.');
                return;
            }

            if (this.activeSection) {
                this.$emit('add-item', {
                    sectionName: this.activeSection.name,
                    item: {
                        ...this.newItem,
                        icon: this.newItem.icon || 'fas fa-link',
                    }
                });
            }

            this.newItem = { title: '', url: '', icon: '' };
            this.closeModal();
        },
        addSection() {
            if (!this.newSectionName) {
                alert('Section name is required.');
                return;
            }
            this.$emit('add-section', this.newSectionName);
            this.newSectionName = '';
            this.showAddSectionModal = false;
        },
    },
};
</script>
