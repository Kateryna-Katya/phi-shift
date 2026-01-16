document.addEventListener('DOMContentLoaded', () => {
    // 1. Инициализация иконок и плагинов
    lucide.createIcons();
    gsap.registerPlugin(ScrollTrigger);

    // --- ГЛОБАЛЬНЫЕ КОНСТАНТЫ ---
    const header = document.getElementById('header');
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav');
    const navLinks = document.querySelectorAll('.nav__link');

    // --- МОБИЛЬНОЕ МЕНЮ ---
    const toggleMenu = () => {
        burger.classList.toggle('burger--active');
        nav.classList.toggle('active');
        document.body.classList.toggle('no-scroll'); // Чтобы не скроллился контент под меню
    };

    burger.addEventListener('click', toggleMenu);
    navLinks.forEach(link => link.addEventListener('click', toggleMenu));

    // --- СКРОЛЛ ХЕДЕРА ---
    window.addEventListener('scroll', () => {
        header.classList.toggle('header--scrolled', window.scrollY > 50);
    });

    // --- HERO CANVAS (Интерактивный фон) ---
    const initHeroCanvas = () => {
        const canvas = document.getElementById('heroCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let width, height, particles = [];
        const mouse = { x: null, y: null, radius: 150 };

        const resize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            particles = Array.from({ length: width < 768 ? 40 : 100 }, () => new Particle());
        };

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 2 + 1;
                this.speedX = Math.random() * 0.5 - 0.25;
                this.speedY = Math.random() * 0.5 - 0.25;
            }
            update() {
                this.x += this.speedX; this.y += this.speedY;
                if (this.x > width || this.x < 0) this.speedX *= -1;
                if (this.y > height || this.y < 0) this.speedY *= -1;
                if (mouse.x) {
                    let dx = mouse.x - this.x, dy = mouse.y - this.y;
                    let dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < mouse.radius) {
                        this.x -= dx / 20; this.y -= dy / 20;
                    }
                }
            }
            draw() {
                ctx.fillStyle = '#B8FF52'; ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
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
    initHeroCanvas();

    // --- GSAP ANIMATIONS (Hero, Reveal, Innovations) ---
    const initAnimations = () => {
        // Hero
        const splitTitle = new SplitType('.hero__title', { types: 'words, chars' });
        const tl = gsap.timeline();
        tl.from('.hero__label-wrapper', { opacity: 0, y: -20, duration: 1 })
          .from(splitTitle.chars, { opacity: 0, y: 30, stagger: 0.02, duration: 0.8 }, "-=0.5")
          .from('.hero__subtitle', { opacity: 0, y: 20, duration: 0.8 }, "-=0.5")
          .from('.hero__actions', { opacity: 0, y: 20, duration: 0.8 }, "-=0.5");

        // General Reveal
        gsap.utils.toArray('.js-reveal').forEach(el => {
            gsap.to(el, {
                scrollTrigger: { trigger: el, start: "top 85%" },
                opacity: 1, y: 0, duration: 1, ease: "power3.out"
            });
        });

        // Innovations Scrub
        gsap.utils.toArray('.js-innovation-item').forEach(item => {
            gsap.from(item, {
                scrollTrigger: { trigger: item, start: "top 90%", scrub: 1 },
                opacity: 0, x: 50
            });
        });
    };
    initAnimations();

    // --- SWIPER SLIDER ---
    if (document.querySelector('.blog-slider')) {
        new Swiper('.blog-slider', {
            slidesPerView: 1, spaceBetween: 30, loop: true,
            navigation: { nextEl: '.blog__btn--next', prevEl: '.blog__btn--prev' },
            pagination: { el: '.swiper-pagination', clickable: true },
            breakpoints: { 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }
        });
    }

    // --- CONTACT FORM & CAPTCHA ---
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        let n1 = Math.floor(Math.random() * 10), n2 = Math.floor(Math.random() * 10);
        const captchaLabel = document.getElementById('captchaQuestion');
        if (captchaLabel) captchaLabel.textContent = `${n1} + ${n2}`;

        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const ans = document.getElementById('captchaInput').value;
            if (parseInt(ans) !== (n1 + n2)) {
                alert('Капча введена неверно!'); return;
            }
            document.getElementById('contactSuccess').classList.add('active');
        });

        document.getElementById('closeSuccess')?.addEventListener('click', () => {
            document.getElementById('contactSuccess').classList.remove('active');
            contactForm.reset();
        });
    }

    // --- COOKIE POPUP ---
    const cookiePopup = document.getElementById('cookiePopup');
    const acceptBtn = document.getElementById('acceptCookies');

    if (!localStorage.getItem('cookiesAccepted')) {
        setTimeout(() => cookiePopup.classList.add('active'), 2000);
    }

    acceptBtn.addEventListener('click', () => {
        localStorage.setItem('cookiesAccepted', 'true');
        cookiePopup.classList.remove('active');
    });
});