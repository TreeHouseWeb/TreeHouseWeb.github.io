function openRegisterForm() {
    document.getElementById("modal__register").style.display = "flex";
}

function openLoginForm() {
    let x = document.getElementById("modal__login").style.display = "flex";
}

function closeLoginForm() {
    let x = document.getElementById("modal__login").style.display = "none";
}

function closeRegisterForm() {
    let x = document.getElementById("modal__register").style.display = "none";
}

// Xử lý scroll và active state cho danh mục
document.addEventListener('DOMContentLoaded', function() {
    const categoryLinks = document.querySelectorAll('.category-item__link');
    const sections = document.querySelectorAll('.home-section');
    const categoryItems = document.querySelectorAll('.category-item');
    
    const header = document.querySelector('.header');
    const headerHeight = header ? header.offsetHeight : 100;
    
    sections.forEach(section => {
        section.style.scrollMarginTop = headerHeight + 20 + 'px';
    });

    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                categoryItems.forEach(item => item.classList.remove('category-item--active'));
                this.parentElement.classList.add('category-item--active');
            }
        });
    });
    
    function updateActiveCategory() {
        let currentSection = '';
        const scrollPosition = window.scrollY + headerHeight + 100;
        const documentHeight = document.documentElement.scrollHeight;
        const windowHeight = window.innerHeight;
        
        // Nếu scroll đến cuối trang, active section cuối cùng
        if (window.scrollY + windowHeight >= documentHeight - 100) {
            currentSection = sections[sections.length - 1].getAttribute('id');
        } else {
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    currentSection = section.getAttribute('id');
                }
            });
        }
        
        categoryItems.forEach(item => {
            item.classList.remove('category-item--active');
            const link = item.querySelector('.category-item__link');
            if (link && link.getAttribute('href') === `#${currentSection}`) {
                item.classList.add('category-item--active');
            }
        });
    }
    
    window.addEventListener('scroll', updateActiveCategory);
    updateActiveCategory();
});