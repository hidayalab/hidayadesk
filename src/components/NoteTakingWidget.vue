<template>
    <div id="notebook-app" :class="themeClass">
        <div class="notebook-widget" :class="{ minimized: isMinimized }">
            <div class="notebook-header" @click="toggleMinimized">
                <div class="notebook-title">
                    📖 Quick Notes
                </div>
                <button class="toggle-btn">
                    {{ isMinimized ? '▲' : '▼' }}
                </button>
            </div>

            <div class="notebook-content" v-show="!isMinimized">
                <div class="pages-container">
                    <div class="page-tabs" v-if="pages.length > 0">
                        <div 
                            v-for="page in pages" 
                            :key="page.id"
                            :class="['page-tab', { active: currentPage && currentPage.id === page.id }]"
                            @click="selectPage(page)"
                        >
                            {{ page.title || `Page ${page.id}` }}
                            <button 
                                v-if="pages.length > 1"
                                class="close-tab" 
                                @click.stop="deletePage(page.id)"
                                title="Close page"
                            >×</button>
                        </div>
                    </div>

                    <div class="page-content" v-if="currentPage">
                        <input 
                            v-model="currentPage.title"
                            class="page-title"
                            placeholder="Page title..."
                            @input="savePage"
                        />
                        <textarea 
                            v-model="currentPage.content"
                            class="page-textarea"
                            placeholder="Write your notes here..."
                            @input="savePage"
                        ></textarea>
                    </div>
                </div>

                <div class="notebook-footer">
                    <button class="add-page-btn" @click="addNewPage">+ Add Page</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
  props: {
    theme: {
      type: String,
      default: 'light'
    }
  },
  data() {
    return {
        isMinimized: false,
        pages: [],
        currentPage: null,
        nextId: 1
    }
  },
  computed: {
    themeClass() {
      return `theme-${this.theme}`;
    }
  },
  mounted() {
    this.initializeNotebook();
  },
  methods: {
    toggleMinimized() {
        this.isMinimized = !this.isMinimized;
    },

    initializeNotebook() {
        const savedPages = localStorage.getItem('notebook-pages');
        if (savedPages) {
            this.pages = JSON.parse(savedPages);
            this.currentPage = this.pages[0];
            this.nextId = Math.max(...this.pages.map(p => p.id)) + 1;
        } else {
            // Create initial page
            const welcomePage = {
                id: 1,
                title: 'Welcome',
                content: 'Welcome to your quick notes!\n\nThis notebook widget lets you:\n• Create multiple pages\n• Switch between them easily\n• Auto-save your notes\n• Minimize when not in use\n\nStart writing your thoughts here...',
                createdAt: new Date(),
                updatedAt: new Date()
            };
    
            this.pages = [welcomePage];
            this.currentPage = welcomePage;
            this.nextId = 2;
            this.savePages();
        }
    },

    addNewPage() {
        const newPage = {
            id: this.nextId++,
            title: '',
            content: '',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.pages.push(newPage);
        this.currentPage = newPage;
        this.savePages();
    },

    selectPage(page) {
        this.currentPage = page;
    },

    deletePage(pageId) {
        if (this.pages.length === 1) return; // Keep at least one page
        
        const pageIndex = this.pages.findIndex(p => p.id === pageId);
        this.pages.splice(pageIndex, 1);

        if (this.currentPage && this.currentPage.id === pageId) {
            this.currentPage = this.pages[Math.max(0, pageIndex - 1)];
        }
        this.savePages();
    },

    savePage() {
        if (this.currentPage) {
            this.currentPage.updatedAt = new Date();
            this.savePages();
        }
    },

    savePages() {
        localStorage.setItem('notebook-pages', JSON.stringify(this.pages));
        console.log('All pages saved to localStorage');
    }
  }
};
</script>
