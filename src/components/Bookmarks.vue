<template>
    <div v-for="(section, sectionIndex) in filteredSections" :key="section.name" class="section">
        <h2 class="section-title">
            {{ section.name }}
            <button 
              v-if="editMode" 
              class="edit-icon-button"
              @click="showEditSectionModal(sectionIndex)"
              :aria-label="`Edit ${section.name} section`"
            >
              <i class="fas fa-edit" aria-hidden="true"></i>
            </button>
        </h2>
        <div class="widget-grid">

        </div>
        <ul class="item-list" role="list">
            <li v-for="(item, itemIndex) in section.items" :key="item.title" class="list-item" role="listitem">
                <a 
                  :href="item.url" 
                  target="_blank" 
                  class="item-link"
                  :aria-label="`Open ${item.title}`"
                  rel="noopener noreferrer"
                >
                    <i :class="['icon', item.icon]" aria-hidden="true"></i>
                    <p class="item-title">{{ item.title }}</p>
                </a>
                <button 
                  v-if="editMode" 
                  class="edit-icon-button item-edit-button"
                  @click="showEditItemModal(sectionIndex, itemIndex)"
                  :aria-label="`Edit ${item.title}`"
                >
                  <i class="fas fa-edit" aria-hidden="true"></i>
                </button>
            </li>
            <li v-if="editMode" class="list-item add-item-button" role="listitem">
                <button 
                  class="item-link add-button" 
                  @click="showAddItemModal(section)"
                  :aria-label="`Add item to ${section.name}`"
                >
                    <i class="icon fa fa-plus" aria-hidden="true"></i>
                    <p class="item-title">Add</p>
                </button>
            </li>
        </ul>
    </div>
    <div v-if="editMode" class="add-section-button">
        <button 
          class="item-link add-button"
          @click="showAddSectionModal = true"
          aria-label="Add new section"
        >
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
                    <input type="text" id="item-url" v-model="newItem.url" required placeholder="e.g., https://example.com or example.com">
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

    <!-- Edit Section Modal -->
    <div v-if="showEditSection" class="modal-overlay" @click.self="closeEditModal">
        <div class="modal-content">
            <h3>Edit Section</h3>
            <form @submit.prevent="updateSection">
                <div class="form-group">
                    <label for="edit-section-name">Section Name:</label>
                    <input type="text" id="edit-section-name" v-model="editableSection.name" required>
                </div>
                <div class="modal-actions">
                    <button type="button" @click="deleteSection" class="delete-button">Delete</button>
                    <div>
                        <button type="submit" class="save-button">Save Changes</button>
                        <button type="button" @click="closeEditModal" class="cancel-button">Cancel</button>
                    </div>
                </div>
            </form>
        </div>
    </div>

    <!-- Edit Item Modal -->
    <div v-if="showEditItem" class="modal-overlay" @click.self="closeEditModal">
        <div class="modal-content">
            <h3>Edit Item</h3>
            <form @submit.prevent="updateItem">
                <div class="form-group">
                    <label for="edit-item-title">Title:</label>
                    <input type="text" id="edit-item-title" v-model="editableItem.title" required>
                </div>
                <div class="form-group">
                    <label for="edit-item-url">URL:</label>
                    <input type="text" id="edit-item-url" v-model="editableItem.url" required placeholder="e.g., https://example.com or example.com">
                </div>
                <div class="form-group">
                    <label for="edit-item-icon">Icon:</label>
                    <input type="text" id="edit-item-icon" v-model="editableItem.icon">
                </div>
                <div class="modal-actions">
                    <button type="button" @click="deleteItem" class="delete-button">Delete</button>
                    <div>
                        <button type="submit" class="save-button">Save Changes</button>
                        <button type="button" @click="closeEditModal" class="cancel-button">Cancel</button>
                    </div>
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
        },
        editMode: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            showModal: false,
            showAddSectionModal: false,
            showEditSection: false,
            showEditItem: false,
            newItem: {
                title: '',
                url: '',
                icon: '',
            },
            newSectionName: '',
            activeSection: null,
            editableSection: null,
            editableItem: null,
            editableSectionIndex: null,
            editableItemIndex: null,
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
        showEditSectionModal(sectionIndex) {
            this.editableSectionIndex = sectionIndex;
            this.editableSection = { ...this.sections[sectionIndex] };
            this.showEditSection = true;
        },

        showEditItemModal(sectionIndex, itemIndex) {
            this.editableSectionIndex = sectionIndex;
            this.editableItemIndex = itemIndex;
            this.editableItem = { ...this.sections[sectionIndex].items[itemIndex] };
            this.showEditItem = true;
        },

        closeEditModal() {
            this.showEditSection = false;
            this.showEditItem = false;
            this.editableSection = null;
            this.editableItem = null;
            this.editableSectionIndex = null;
            this.editableItemIndex = null;
        },
        normalizeUrl(url) {
            if (!url) return url;
            
            // Remove whitespace
            url = url.trim();
            
            // Add https:// if no protocol
            if (!/^https?:\/\//i.test(url)) {
                url = 'https://' + url;
            }
            
            return url;
        },
        addItem() {
            if (!this.newItem.title || !this.newItem.url) {
                alert('Title and URL are required.');
                return;
            }

            // Normalize the URL
            this.newItem.url = this.normalizeUrl(this.newItem.url);

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
        updateSection() {
            this.$emit('update-section', {
                index: this.editableSectionIndex,
                section: this.editableSection
            });
            this.closeEditModal();
        },

        updateItem() {
            // Normalize the URL
            this.editableItem.url = this.normalizeUrl(this.editableItem.url);
            
            this.$emit('update-item', {
                sectionIndex: this.editableSectionIndex,
                itemIndex: this.editableItemIndex,
                item: this.editableItem
            });
            this.closeEditModal();
        },
        deleteSection() {
            if (confirm('Are you sure you want to delete this section?')) {
                this.$emit('delete-section', this.editableSectionIndex);
                this.closeEditModal();
            }
        },

        deleteItem() {
            if (confirm('Are you sure you want to delete this item?')) {
                this.$emit('delete-item', {
                    sectionIndex: this.editableSectionIndex,
                    itemIndex: this.editableItemIndex
                });
                this.closeEditModal();
            }
        },
    },
};
</script>
