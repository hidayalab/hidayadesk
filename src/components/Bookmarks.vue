<template>
  <div v-for="(section, sectionIndex) in filteredSections" :key="section.name" class="section">
    <h2 class="section-title">
      {{ section.name }}
      <button
        v-if="editMode"
        class="edit-icon-button"
        @click="showEditSectionModalWrapper(sectionIndex)"
        :aria-label="`Edit ${section.name} section`"
      >
        <i class="fas fa-edit" aria-hidden="true"></i>
      </button>
    </h2>
    <div class="widget-grid"></div>
    <ul class="item-list" role="list">
      <li v-for="(item, itemIndex) in section.items" :key="item.title" class="list-item" role="listitem">
        <a :href="item.url" target="_blank" class="item-link" :aria-label="`Open ${item.title}`" rel="noopener noreferrer">
          <i v-if="!item.iconType || item.iconType === 'font'" :class="['icon', item.icon]" aria-hidden="true"></i>
          <img v-else :src="item.icon" :alt="`${item.title} icon`" class="icon favicon" aria-hidden="true" />
          <p class="item-title">{{ item.title }}</p>
        </a>
        <button
          v-if="editMode"
          class="edit-icon-button item-edit-button"
          @click="showEditItemModalWrapper(sectionIndex, itemIndex)"
          :aria-label="`Edit ${item.title}`"
        >
          <i class="fas fa-edit" aria-hidden="true"></i>
        </button>
      </li>
      <li v-if="editMode" class="list-item add-item-button" role="listitem">
        <button class="item-link add-button" @click="showAddItemModal(section)" :aria-label="`Add item to ${section.name}`">
          <i class="icon fa fa-plus" aria-hidden="true"></i>
          <p class="item-title">Add</p>
        </button>
      </li>
    </ul>
  </div>
  <div v-if="editMode" class="add-section-button">
    <button class="item-link add-button" @click="showAddSectionModal = true" aria-label="Add new section">
      <i class="icon fa fa-plus" aria-hidden="true"></i>
      <p class="item-title">Add New Section</p>
    </button>
  </div>
  <!-- Add Item Modal -->
  <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <h3>Add New Item</h3>

      <!-- Error Display -->
      <div v-if="error" class="error-message" role="alert">
        {{ error }}
        <button @click="clearError" class="error-close" aria-label="Close error">&times;</button>
      </div>

      <form @submit.prevent="addItem">
        <div class="form-group">
          <label for="item-title">Title:</label>
          <input type="text" id="item-title" v-model="newItem.title" required :disabled="isLoading" />
        </div>
        <div class="form-group">
          <label for="item-url">URL:</label>
          <input
            type="text"
            id="item-url"
            v-model="newItem.url"
            required
            placeholder="e.g., https://example.com or example.com"
            :disabled="isLoading"
          />
        </div>
        <div class="form-group">
          <label for="item-icon">Icon (Font Awesome class, e.g., fas fa-star):</label>
          <input type="text" id="item-icon" v-model="newItem.icon" :disabled="isLoading" />
          <small>Leave empty to auto-detect icon from URL</small>
        </div>
        <div class="modal-actions">
          <button type="submit" class="save-button" :disabled="isLoading">
            <span v-if="isLoading">Adding...</span>
            <span v-else>Add Item</span>
          </button>
          <button type="button" @click="closeModal" class="cancel-button" :disabled="isLoading">Cancel</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Add Section Modal -->
  <div v-if="showAddSectionModal" class="modal-overlay" @click.self="showAddSectionModal = false">
    <div class="modal-content">
      <h3>Add New Section</h3>

      <!-- Error Display -->
      <div v-if="error" class="error-message" role="alert">
        {{ error }}
        <button @click="clearError" class="error-close" aria-label="Close error">&times;</button>
      </div>

      <form @submit.prevent="addSection">
        <div class="form-group">
          <label for="section-name">Section Name:</label>
          <input type="text" id="section-name" v-model="newSectionName" required />
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

      <!-- Error Display -->
      <div v-if="error" class="error-message" role="alert">
        {{ error }}
        <button @click="clearError" class="error-close" aria-label="Close error">&times;</button>
      </div>

      <form @submit.prevent="updateSection">
        <div class="form-group">
          <label for="edit-section-name">Section Name:</label>
          <input type="text" id="edit-section-name" v-model="editableSection.name" required />
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

      <!-- Error Display -->
      <div v-if="error" class="error-message" role="alert">
        {{ error }}
        <button @click="clearError" class="error-close" aria-label="Close error">&times;</button>
      </div>

      <form @submit.prevent="updateItem">
        <div class="form-group">
          <label for="edit-item-title">Title:</label>
          <input type="text" id="edit-item-title" v-model="editableItem.title" required :disabled="isLoading" />
        </div>
        <div class="form-group">
          <label for="edit-item-url">URL:</label>
          <input
            type="text"
            id="edit-item-url"
            v-model="editableItem.url"
            required
            placeholder="e.g., https://example.com or example.com"
            :disabled="isLoading"
          />
        </div>
        <div class="form-group">
          <label for="edit-item-icon">Icon:</label>
          <input type="text" id="edit-item-icon" v-model="editableItem.icon" :disabled="isLoading" />
          <small>Leave empty to auto-detect icon from URL</small>
        </div>
        <div class="modal-actions">
          <button type="button" @click="deleteItem" class="delete-button" :disabled="isLoading">Delete</button>
          <div>
            <button type="submit" class="save-button" :disabled="isLoading">
              <span v-if="isLoading">Saving...</span>
              <span v-else>Save Changes</span>
            </button>
            <button type="button" @click="closeEditModal" class="cancel-button" :disabled="isLoading">Cancel</button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useBookmarkModal } from '../composables/useBookmarkModal';
import { useIconService } from '../composables/useIconService';
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
                iconType: 'font'
            },
            iconMapping: {
                // Social Media
                'facebook.com': 'fab fa-facebook',
                'twitter.com': 'fab fa-twitter',
                'x.com': 'fab fa-x-twitter',
                'instagram.com': 'fab fa-instagram',
                'linkedin.com': 'fab fa-linkedin',
                'youtube.com': 'fab fa-youtube',
                'tiktok.com': 'fab fa-tiktok',
                'whatsapp.com': 'fab fa-whatsapp',
                
                // Tech
                'github.com': 'fab fa-github',
                'stackoverflow.com': 'fab fa-stack-overflow',
                'reddit.com': 'fab fa-reddit',
                'discord.com': 'fab fa-discord',
                'medium.com': 'fab fa-medium',
                
                // Islamic Sites
                'islamqa.info': 'fas fa-mosque',
                'quran.com': 'fas fa-book-quran',
                'sunnah.com': 'fas fa-book-open',
                'islamweb.net': 'fas fa-crescent',
                'islamhouse.com': 'fas fa-mosque',
                'islamicfinder.org': 'fas fa-compass',
                
                // Google Services
                'gmail.com': 'fas fa-envelope',
                'drive.google.com': 'fab fa-google-drive',
                'docs.google.com': 'fas fa-file-alt',
                'maps.google.com': 'fas fa-map-marked-alt',
                
                // E-commerce
                'amazon.com': 'fab fa-amazon',
                'ebay.com': 'fab fa-ebay',
                
                // Entertainment
                'netflix.com': 'fas fa-film',
                'spotify.com': 'fab fa-spotify',
                'twitch.tv': 'fab fa-twitch',
                
                // Others
                'wikipedia.org': 'fab fa-wikipedia-w',
                'paypal.com': 'fab fa-paypal'
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
        
        getIconForDomain(url) {
            try {
                const domain = new URL(this.normalizeUrl(url)).hostname.replace('www.', '');
                if (this.iconMapping[domain]) {
                    return this.iconMapping[domain];
                } else {
                    for (const [key, icon] of Object.entries(this.iconMapping)) {
                        if (domain.includes(key)) {
                            return icon
                        }
                    }
                }
            } catch {
                return null;
            }
        },
        
        async fetchWebsiteIcon(url) {
            const cleanUrl = this.normalizeUrl(url);
            try {
                const domain = new URL(cleanUrl).hostname;
                const faviconServices = [
                    `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
                    `https://favicon.yandex.net/favicon/${domain}`
                ];
                
                for (const service of faviconServices) {
                    try {
                        await fetch(service, { mode: 'no-cors' });
                        return service;
                    } catch {
                        continue;
                    }
                }
            } catch (error) {
                console.log('Error fetching favicon:', error);
            }
            return 'fas fa-link';
        },
        
        async addItem() {
            if (!this.newItem.title || !this.newItem.url) {
                alert('Title and URL are required.');
                return;
            }

            this.newItem.iconType = 'font';

            // Normalize the URL
            this.newItem.url = this.normalizeUrl(this.newItem.url);
            
            if (!this.newItem.icon) {
                const mappedIcon = this.getIconForDomain(this.newItem.url);
                
                if (mappedIcon) {
                    this.newItem.icon = mappedIcon;
                } else {
                    try {
                        const faviconUrl = await this.fetchWebsiteIcon(this.newItem.url);
                        this.newItem.icon = faviconUrl;
                        if (faviconUrl.startsWith('http')) {
                            this.newItem.iconType = 'image';
                        }
                    } catch {
                        this.newItem.icon = 'fas fa-link'
                    }
                }
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

            this.newItem = { title: '', url: '', icon: '', iconType: 'font' };
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

        async updateItem() {
            // Normalize the URL
            this.editableItem.url = this.normalizeUrl(this.editableItem.url);
            this.editableItem.iconType = 'font';
            if (!this.editableItem.icon || this.editableItem.icon === 'fas fa-link') {
                const mappedIcon = this.getIconForDomain(this.editableItem.url);
                if (mappedIcon) {
                    this.editableItem.icon = mappedIcon;
                } else {
                    try {
                        const faviconUrl = await this.fetchWebsiteIcon(this.editableItem.url);
                        if (faviconUrl.startsWith('http')) {
                            this.editableItem.iconType = 'image';
                            this.editableItem.icon = faviconUrl;
                        } else {
                            this.editableItem.icon = faviconUrl;
                        }
                    } catch {
                        this.editableItem.icon = 'fas fa-link';
                    }
                }
            }
            
            if (!this.editableItem.iconType) {
                this.editableItem.iconType = this.editableItem.icon?.startsWith('http') ? 'image' : 'font';
            }
            
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

const deleteItem = () => {
  if (confirm('Are you sure you want to delete this item?')) {
    emit('delete-item', {
      sectionIndex: editableSectionIndex.value,
      itemIndex: editableItemIndex.value,
    });
    closeEditModal();
  }
};
</script>
