// Google Sheets Database - SỬ DỤNG LINK SHEET THỰC TẾ
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRE57CFGdYb65908_tlrkQO4Jwnvy-wdc53ROVxi1w5lUQtIrridEPBMHgZZ3e0cxbHPrcAOE0_Iv6P/pub?output=csv';

class AppDetail {
    constructor() {
        this.appData = null;
        this.allApps = [];
        this.init();
    }

    async init() {
        const urlParams = new URLSearchParams(window.location.search);
        const appId = urlParams.get('id');
        
        if (!appId) {
            this.showError('Không tìm thấy ứng dụng');
            return;
        }

        await this.loadAllAppData();
        await this.loadAppData(appId);
        
        if (this.appData) {
            this.renderAppDetail();
            document.title = `${this.appData.name} - Tải miễn phí | TreeHouse`;
        }
    }

    async loadAllAppData() {
        try {
            const response = await fetch(SHEET_URL);
            const csvText = await response.text();
            this.allApps = this.parseCSV(csvText);
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu từ Google Sheets:', error);
            this.showError('Lỗi khi tải dữ liệu ứng dụng');
        }
    }

    parseCSV(csvText) {
        const lines = csvText.split('\n').filter(line => line.trim() !== '');
        if (lines.length === 0) return [];

        const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
        
        const apps = [];
        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            if (values.length !== headers.length) continue;

            const app = {};
            headers.forEach((header, index) => {
                let value = values[index] ? values[index].trim() : '';
                app[header] = value;
            });
            apps.push(app);
        }
        
        return apps;
    }

    parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        values.push(current);
        return values;
    }

    async loadAppData(appId) {
        if (!this.allApps || this.allApps.length === 0) {
            this.showError('Không có dữ liệu ứng dụng');
            return;
        }

        this.appData = this.allApps.find(app => app.id === appId);
        
        if (!this.appData) {
            this.showError('Ứng dụng không tồn tại');
            return;
        }

        this.appData = {
            id: this.appData.id,
            name: this.appData.name || this.appData.title,
            category: this.appData.category,
            image: this.appData.image || this.appData.thumbnail,
            rating: this.appData.rating || '0',
            reviews: this.appData.reviews || '0',
            downloads: this.appData.downloads || '0',
            oldPrice: this.appData.oldprice || this.appData.originalprice,
            price: this.appData.price || 'MIỄN PHÍ',
            version: this.appData.version,
            size: this.appData.size,
            os: this.appData.os || this.appData.operatingsystem,
            language: this.appData.language,
            developer: this.appData.developer,
            features: this.appData.features,
            description: this.processNewlines(this.appData.description),
            installation: this.processNewlines(this.appData.installation || this.appData.installguide),
            downloadLinks: this.appData.downloadlinks || this.appData.links,
            updateDate: this.appData.updatedate || this.appData.lastupdated
        };
    }

    processNewlines(text) {
        if (!text) return '';
        return text.replace(/\\n/g, '<br>');
    }

    renderAppDetail() {
        if (!this.appData) return;

        document.getElementById('breadcrumb-category').textContent = this.appData.category;
        document.getElementById('breadcrumb-app').textContent = this.appData.name;

        const content = `
            <div class="row sm-gutter">
                <div class="col l-8 m-12 c-12">
                    <div class="app-detail">
                        <div class="app-detail__header">
                            <div class="app-detail__image">
                                <div class="app-detail__img" style="background-image: url('${this.appData.image || './assets/img/no-img.png'}')"></div>
                            </div>
                            <div class="app-detail__info">
                                <h1 class="app-detail__name">${this.appData.name}</h1>
                                <div class="app-detail__meta">
                                    <div class="app-detail__rating">
                                        ${this.renderRating(parseInt(this.appData.rating))}
                                        <span class="app-detail__review">(${this.appData.reviews} đánh giá)</span>
                                    </div>
                                    <div class="app-detail__downloads">
                                        <i class="fas fa-download"></i>
                                        <span>${this.appData.downloads} lượt tải</span>
                                    </div>
                                </div>
                                <div class="app-detail__price">
                                    <span class="app-detail__price-old">${this.appData.oldPrice}</span>
                                    <span class="app-detail__price-current">${this.appData.price}</span>
                                </div>
                                <div class="app-detail__actions">
                                    <button class="btn btn--primary btn--large app-detail__download-btn" onclick="downloadApp('${this.appData.id}')">
                                        <i class="fas fa-download"></i>
                                        TẢI NGAY
                                    </button>
                                    <button class="btn app-detail__cart-btn" onclick="addToCart('${this.appData.id}')">
                                        <i class="fas fa-shopping-cart"></i>
                                        Thêm vào giỏ
                                    </button>
                                </div>
                                ${this.renderFeatures()}
                            </div>
                        </div>

                        <div class="app-detail__content">
                            ${this.renderDescription()}
                            ${this.renderSpecs()}
                            ${this.renderInstallation()}
                        </div>
                    </div>
                </div>

                <div class="col l-4 m-12 c-12">
                    ${this.renderSidebar()}
                </div>
            </div>
        `;

        document.getElementById('app-detail-content').innerHTML = content;
    }

    renderRating(stars) {
        if (!stars || isNaN(stars)) stars = 0;
        let starsHTML = '';
        for (let i = 1; i <= 5; i++) {
            const starClass = i <= stars ? 'home-product-item__star--gold' : '';
            starsHTML += `<i class="fas fa-star ${starClass}"></i>`;
        }
        return `<div class="home-product-item__rating" style="display: inline-flex; gap: 2px;">${starsHTML}</div>`;
    }

    renderFeatures() {
        if (!this.appData.features) return '';
        const features = this.appData.features.split(';').filter(f => f.trim() !== '');
        if (features.length === 0) return '';
        
        return `
            <div class="app-detail__features">
                ${features.map(feature => `
                    <div class="app-detail__feature">
                        <i class="fas fa-check"></i>
                        <span>${feature.trim()}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderDescription() {
        if (!this.appData.description) return '';
        return `
            <div class="app-detail__section">
                <h2 class="app-detail__section-title">Mô tả ứng dụng</h2>
                <div class="app-detail__description">
                    ${this.appData.description}
                </div>
            </div>
        `;
    }

    renderSpecs() {
        const specs = [
            { label: 'Phiên bản:', value: this.appData.version || 'Đang cập nhật' },
            { label: 'Kích thước:', value: this.appData.size || 'Đang cập nhật' },
            { label: 'Hệ điều hành:', value: this.appData.os || 'Đang cập nhật' },
            { label: 'Ngôn ngữ:', value: this.appData.language || 'Đang cập nhật' },
            { label: 'Nhà phát triển:', value: this.appData.developer || 'Đang cập nhật' }
        ];

        return `
            <div class="app-detail__section">
                <h2 class="app-detail__section-title">Thông tin kỹ thuật</h2>
                <div class="app-detail__specs">
                    ${specs.map(spec => `
                        <div class="app-detail__spec-row">
                            <span class="app-detail__spec-label">${spec.label}</span>
                            <span class="app-detail__spec-value">${spec.value}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderInstallation() {
        if (!this.appData.installation) return '';
        return `
            <div class="app-detail__section">
                <h2 class="app-detail__section-title">Hướng dẫn cài đặt</h2>
                <div class="app-detail__installation">
                    ${this.appData.installation}
                </div>
            </div>
        `;
    }

    renderSidebar() {
        return `
            <div class="app-sidebar">
                <div class="app-sidebar__card">
                    <h3 class="app-sidebar__title">Thông tin tải về</h3>
                    <div class="app-sidebar__info">
                        <div class="app-sidebar__info-item">
                            <span class="app-sidebar__info-label">Phiên bản:</span>
                            <span class="app-sidebar__info-value">${this.appData.version || 'Đang cập nhật'}</span>
                        </div>
                        <div class="app-sidebar__info-item">
                            <span class="app-sidebar__info-label">Cập nhật:</span>
                            <span class="app-sidebar__info-value">${this.appData.updateDate || 'Đang cập nhật'}</span>
                        </div>
                        <div class="app-sidebar__info-item">
                            <span class="app-sidebar__info-label">Lượt tải:</span>
                            <span class="app-sidebar__info-value">${this.appData.downloads}</span>
                        </div>
                        <div class="app-sidebar__info-item">
                            <span class="app-sidebar__info-label">Danh mục:</span>
                            <span class="app-sidebar__info-value">${this.appData.category}</span>
                        </div>
                    </div>
                </div>

                <div class="app-sidebar__card">
                    <h3 class="app-sidebar__title">Link tải về</h3>
                    <div class="app-sidebar__download-links">
                        ${this.renderDownloadLinks()}
                    </div>
                </div>

                <div class="app-sidebar__card">
                    <h3 class="app-sidebar__title">Ứng dụng liên quan</h3>
                    <div class="app-sidebar__related">
                        ${this.renderRelatedApps()}
                    </div>
                </div>
            </div>
        `;
    }

    renderDownloadLinks() {
        if (!this.appData.downloadLinks) {
            return '<p class="app-sidebar__no-links">Đang cập nhật link tải...</p>';
        }
        
        const links = this.appData.downloadLinks.split(';').filter(link => link.trim() !== '');
        const linkTypes = [
            { name: 'Google Drive', icon: 'fab fa-google-drive' },
            { name: 'MediaFire', icon: 'fas fa-cloud-download-alt' },
            { name: 'Direct Link', icon: 'fas fa-server' },
            { name: 'FShare', icon: 'fas fa-share-alt' },
            { name: 'OneDrive', icon: 'fab fa-microsoft' }
        ];

        return links.map((link, index) => `
            <a href="${link.trim()}" class="app-sidebar__download-link" target="_blank" rel="noopener noreferrer">
                <i class="${linkTypes[index]?.icon || 'fas fa-download'}"></i>
                ${linkTypes[index]?.name || `Download ${index + 1}`}
            </a>
        `).join('');
    }

    renderRelatedApps() {
        if (!this.allApps || this.allApps.length === 0) return '';
        
        const relatedApps = this.allApps
            .filter(app => app.id !== this.appData.id && app.category === this.appData.category)
            .slice(0, 2);
        
        if (relatedApps.length === 0) {
            return '<p class="app-sidebar__no-related">Không có ứng dụng liên quan</p>';
        }

        return relatedApps.map(app => `
            <a href="app-detail.html?id=${app.id}" class="app-sidebar__related-item">
                <div class="app-sidebar__related-img" style="background-image: url('${app.image || './assets/img/no-img.png'}')"></div>
                <div class="app-sidebar__related-info">
                    <h4>${app.name || app.title}</h4>
                    <span class="app-sidebar__related-price">${app.price || 'Miễn phí'}</span>
                </div>
            </a>
        `).join('');
    }

    showError(message) {
        document.getElementById('app-detail-content').innerHTML = `
            <div class="error-message" style="text-align: center; padding: 50px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 50px; color: #ff4757; margin-bottom: 20px;"></i>
                <h3 style="font-size: 2rem; color: var(--text-color); margin-bottom: 20px;">${message}</h3>
                <a href="/" class="btn btn--primary">Quay về trang chủ</a>
            </div>
        `;
    }
}

// Biến toàn cục để lưu trữ allApps
let globalAllApps = [];

// Hàm download app - SỬA LẠI
function downloadApp(appId) {
    const app = globalAllApps.find(a => a.id === appId);
    
    if (app && (app.downloadlinks || app.links)) {
        const downloadLinks = app.downloadlinks || app.links;
        const links = downloadLinks.split(';').filter(link => link.trim() !== '');
        
        if (links.length > 0) {
            window.open(links[0].trim(), '_blank');
            return;
        }
    }
    
    alert('Không tìm thấy link tải cho ứng dụng này');
}

// Hàm thêm vào giỏ hàng - SỬA LẠI
function addToCart(appId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (!cart.find(item => item.id === appId)) {
        const app = globalAllApps.find(a => a.id === appId);
        
        if (app) {
            cart.push({
                id: app.id,
                name: app.name || app.title,
                price: app.price || 'MIỄN PHÍ',
                image: app.image || './assets/img/no-img.png',
                category: app.category
            });
            
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartBadge();
            alert(`Đã thêm "${app.name || app.title}" vào giỏ hàng`);
        }
    } else {
        alert('Ứng dụng đã có trong giỏ hàng');
    }
}

// Hàm cập nhật badge giỏ hàng
function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartNotice = document.querySelector('.header__cart-notice');
    if (cartNotice) {
        cartNotice.textContent = cart.length;
        cartNotice.style.display = cart.length > 0 ? 'block' : 'none';
    }
}

// Khởi tạo app khi trang load - SỬA LẠI
document.addEventListener('DOMContentLoaded', async function() {
    // Load all apps data trước
    try {
        const response = await fetch(SHEET_URL);
        const csvText = await response.text();
        globalAllApps = parseCSVData(csvText);
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
    }
    
    // Khởi tạo AppDetail
    new AppDetail();
    updateCartBadge();
});

// Hàm parse CSV data - SỬA LẠI
function parseCSVData(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
    
    const apps = [];
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length !== headers.length) continue;

        const app = {};
        headers.forEach((header, index) => {
            let value = values[index] ? values[index].trim() : '';
            app[header] = value;
        });
        apps.push(app);
    }
    
    return apps;
}

// Hàm parse CSV line - SỬA LẠI
function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            values.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    values.push(current);
    return values;
}