document.addEventListener('DOMContentLoaded', () => {
    // 1. Инициализация иконок Lucide
    lucide.createIcons();

    // 2. Регистрация плагинов GSAP
    gsap.registerPlugin(ScrollTrigger);

    // --- ГЛОБАЛЬНЫЕ ЭЛЕМЕНТЫ ---
    const header = document.getElementById('header');
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav');
    const navLinks = document.querySelectorAll('.nav__link');

    // --- 1. МОБИЛЬНОЕ МЕНЮ ---
    const toggleMenu = () => {
        burger.classList.toggle('burger--active');
        nav.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    };

    if (burger) {
        burger.addEventListener('click', toggleMenu);
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (nav.classList.contains('active')) toggleMenu();
        });
    });

    // --- 2. ЭФФЕКТ ХЕДЕРА ПРИ СКРОЛЛЕ ---
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('header--scrolled');
        } else {
            header.classList.remove('header--scrolled');
        }
    });

    // --- 3. HERO ANIMATION (GSAP + SplitType) ---
    // Исправлено: слова не разрываются, анимация ждет загрузки шрифтов
    const initHeroAnimation = () => {
        const title = document.querySelector('.js-split-text');
        if (!title) return;

        document.fonts.ready.then(() => {
            // Разбиваем текст так, чтобы слова (words) были обертками для символов (chars)
            const splitTitle = new SplitType('.hero__title', { 
                types: 'words, chars',
                wordClass: 'word' 
            });
            const splitSubtitle = new SplitType('.hero__subtitle', { 
                types: 'words',
                wordClass: 'word'
            });

            const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

            tl.fromTo('.hero__label-wrapper', 
                { opacity: 0, y: -20 }, 
                { opacity: 1, y: 0, duration: 0.8, delay: 0.3 }
            )
            .set(['.hero__title', '.hero__subtitle'], { opacity: 1 }) // Проявляем скрытые в CSS блоки
            .from(splitTitle.chars, {
                opacity: 0,
                y: 40,
                rotateX: -90,
                stagger: 0.02,
                duration: 1
            }, '-=0.5')
            .from(splitSubtitle.words, {
                opacity: 0,
                y: 20,
                stagger: 0.03,
                duration: 0.8
            }, '-=0.8')
            .fromTo('.hero__actions', 
                { opacity: 0, y: 30 }, 
                { opacity: 1, y: 0, duration: 0.8, clearProps: "all" }, 
                '-=0.6'
            );
        });
    };

    // --- 4. INTERACTIVE CANVAS (Фон Hero) ---
    const initHeroCanvas = () => {
        const canvas = document.getElementById('heroCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let width, height, particles = [];
        const mouse = { x: null, y: null, radius: 150 };

        const resize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            particles = [];
            const count = width < 768 ? 40 : 100;
            for (let i = 0; i < count; i++) particles.push(new Particle());
        };

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 2 + 1;
                this.baseX = this.x;
                this.baseY = this.y;
                this.speedX = Math.random() * 0.4 - 0.2;
                this.speedY = Math.random() * 0.4 - 0.2;
            }
            update() {
                this.x += this.speedX; this.y += this.speedY;
                if (this.x > width || this.x < 0) this.speedX *= -1;
                if (this.y > height || this.y < 0) this.speedY *= -1;
                if (mouse.x) {
                    let dx = mouse.x - this.x, dy = mouse.y - this.y;
                    let dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < mouse.radius) {
                        this.x -= dx / 25; this.y -= dy / 25;
                    }
                }
            }
            draw() {
                ctx.fillStyle = 'rgba(184, 255, 82, 0.5)';
                ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
            }
        }

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => { p.update(); p.draw(); });
            requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', e => { mouse.x = e.x; mouse.y = e.y; });
        resize(); animate();
    };

    // --- 5. SCROLL REVEAL (Общее появление блоков) ---
    const initScrollReveal = () => {
        gsap.utils.toArray('.js-reveal').forEach(el => {
            gsap.to(el, {
                scrollTrigger: {
                    trigger: el,
                    start: "top 85%",
                    toggleActions: "play none none none"
                },
                opacity: 1, y: 0, duration: 1, ease: "power3.out"
            });
        });

        // Stagger для сетки преимуществ
        gsap.from('.benefits-grid .js-reveal', {
            scrollTrigger: { trigger: '.benefits-grid', start: "top 80%" },
            opacity: 0, y: 40, stagger: 0.15, duration: 1, ease: "power3.out"
        });
    };

    // --- 6. INNOVATIONS (Sticky Scrub) ---
    const initInnovations = () => {
        gsap.utils.toArray('.js-innovation-item').forEach(item => {
            gsap.from(item, {
                scrollTrigger: {
                    trigger: item,
                    start: "top 90%",
                    scrub: 1
                },
                opacity: 0, x: 40, duration: 1
            });
        });
    };

    // --- 7. BLOG SLIDER (Swiper) ---
    const initBlogSlider = () => {
        if (document.querySelector('.blog-slider')) {
            new Swiper('.blog-slider', {
                slidesPerView: 1, spaceBetween: 20, loop: true,
                navigation: { nextEl: '.blog__btn--next', prevEl: '.blog__btn--prev' },
                pagination: { el: '.swiper-pagination', clickable: true },
                breakpoints: { 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }
            });
        }
    };

    // --- 8. CONTACT FORM & CAPTCHA ---
    const initContactForm = () => {
        const form = document.getElementById('contactForm');
        if (!form) return;

        const phoneInput = document.getElementById('phoneInput');
        const captchaLabel = document.getElementById('captchaQuestion');
        const captchaInput = document.getElementById('captchaInput');
        const successMessage = document.getElementById('contactSuccess');

        let n1 = Math.floor(Math.random() * 10) + 1;
        let n2 = Math.floor(Math.random() * 10) + 1;
        let correctSum = n1 + n2;
        if (captchaLabel) captchaLabel.textContent = `${n1} + ${n2}`;

        phoneInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^\d+]/g, '');
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (parseInt(captchaInput.value) !== correctSum) {
                alert('Ошибка капчи! Попробуйте снова.');
                return;
            }
            successMessage.classList.add('active');
        });

        document.getElementById('closeSuccess')?.addEventListener('click', () => {
            successMessage.classList.remove('active');
            form.reset();
            n1 = Math.floor(Math.random() * 10) + 1;
            n2 = Math.floor(Math.random() * 10) + 1;
            correctSum = n1 + n2;
            captchaLabel.textContent = `${n1} + ${n2}`;
        });
    };

    // --- 9. COOKIE POPUP ---
    const initCookiePopup = () => {
        const popup = document.getElementById('cookiePopup');
        if (!popup || localStorage.getItem('cookiesAccepted')) return;

        setTimeout(() => popup.classList.add('active'), 2000);
        document.getElementById('acceptCookies')?.addEventListener('click', () => {
            localStorage.setItem('cookiesAccepted', 'true');
            popup.classList.remove('active');
        });
    };

    // --- ЗАПУСК ВСЕХ МОДУЛЕЙ ---
    initHeroCanvas();
    initHeroAnimation();
    initScrollReveal();
    initInnovations();
    initBlogSlider();
    initContactForm();
    initCookiePopup();
});