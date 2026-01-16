document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    gsap.registerPlugin(ScrollTrigger);

    // --- HEADER SCROLL ---
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        header.classList.toggle('header--scrolled', window.scrollY > 50);
    });

    // --- HERO ANIMATION (GSAP + SplitType) ---
    const initHeroAnimation = () => {
        // Разбиваем текст на слова и буквы
        const splitTitle = new SplitType('.hero__title', { types: 'words, chars' });
        const splitSubtitle = new SplitType('.hero__subtitle', { types: 'words' });

        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        tl.fromTo('.hero__label-wrapper', 
            { opacity: 0, y: -20 }, 
            { opacity: 1, y: 0, duration: 0.8, delay: 0.3 }
        )
        .to('.hero__title', { opacity: 1, duration: 0.1 }, '-=0.5') // Делаем видимым перед анимацией букв
        .from(splitTitle.chars, {
            opacity: 0,
            y: 50,
            rotateX: -90,
            stagger: 0.02,
            duration: 1
        }, '-=0.6')
        .to('.hero__subtitle', { opacity: 1, duration: 0.1 }, '-=0.8')
        .from(splitSubtitle.words, {
            opacity: 0,
            y: 20,
            stagger: 0.05,
            duration: 0.8
        }, '-=0.8')
        .to('.hero__actions', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            clearProps: 'all' // Очищаем свойства после анимации для ховеров
        }, '-=0.6');
    };

    initHeroAnimation();

    // --- HERO INTERACTIVE CANVAS BACKGROUND ---
    const initHeroCanvas = () => {
        const canvas = document.getElementById('heroCanvas');
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];
        let mouse = { x: null, y: null, radius: 150 };

        // Настройка цветов из CSS переменных
        const accentColorHex = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim();
        const swampColorHex = getComputedStyle(document.documentElement).getPropertyValue('--color-swamp').trim();

        // Конфигурация частиц
        const config = {
            particleCount: window.innerWidth < 768 ? 50 : 100, // Меньше частиц на мобилках
            lineDistance: 120,
            particleSpeed: 0.3,
            mouseRepelForce: 2
        };

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            initParticles();
        }

        class Particle {
            constructor(x, y) {
                this.x = x ? x : Math.random() * width;
                this.y = y ? y : Math.random() * height;
                this.size = Math.random() * 2 + 1;
                this.baseX = this.x;
                this.baseY = this.y;
                this.density = (Math.random() * 10) + 5;
                this.color = Math.random() > 0.8 ? accentColorHex : swampColorHex;
                this.speedX = Math.random() * config.particleSpeed - config.particleSpeed/2;
                this.speedY = Math.random() * config.particleSpeed - config.particleSpeed/2;
            }

            update() {
                // Базовое движение
                this.x += this.speedX;
                this.y += this.speedY;

                // Отталкивание от краев
                if (this.x > width || this.x < 0) this.speedX = -this.speedX;
                if (this.y > height || this.y < 0) this.speedY = -this.speedY;

                // Взаимодействие с мышью
                if (mouse.x) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < mouse.radius) {
                        let forceDirectionX = dx / distance;
                        let forceDirectionY = dy / distance;
                        let force = (mouse.radius - distance) / mouse.radius;
                        let directionX = forceDirectionX * force * this.density * config.mouseRepelForce;
                        let directionY = forceDirectionY * force * this.density * config.mouseRepelForce;
                        this.x -= directionX;
                        this.y -= directionY;
                    } else {
                        // Возврат к базовой траектории, если мышь далеко
                        if (this.x !== this.baseX) {
                            let dx = this.x - this.baseX;
                            this.x -= dx / 20;
                        }
                         if (this.y !== this.baseY) {
                            let dy = this.y - this.baseY;
                            this.y -= dy / 20;
                        }
                    }
                }
            }

            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }
        }

        function initParticles() {
            particles = [];
            for (let i = 0; i < config.particleCount; i++) {
                particles.push(new Particle());
            }
        }

        function connect() {
            for (let a = 0; a < particles.length; a++) {
                for (let b = a; b < particles.length; b++) {
                    let distance = ((particles[a].x - particles[b].x) * (particles[a].x - particles[b].x)) +
                                   ((particles[a].y - particles[b].y) * (particles[a].y - particles[b].y));
                    if (distance < (config.lineDistance * config.lineDistance)) {
                        let opacityValue = 1 - (distance / (config.lineDistance * config.lineDistance));
                        ctx.strokeStyle = `rgba(184, 255, 82, ${opacityValue * 0.2})`; // Лаймовые связи
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
            }
            connect();
            requestAnimationFrame(animate);
        }

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.x;
            mouse.y = e.y;
        });
        window.addEventListener('mouseout', () => {
            mouse.x = null;
            mouse.y = null;
        });

        resize();
        animate();
    };

    initHeroCanvas();
    // --- SCROLL REVEAL ANIMATION (GSAP) ---
    const initScrollReveal = () => {
        const reveals = document.querySelectorAll('.js-reveal');
        
        reveals.forEach((el) => {
            gsap.to(el, {
                scrollTrigger: {
                    trigger: el,
                    start: "top 85%", // Анимация начнется, когда верх элемента дойдет до 85% экрана
                    toggleActions: "play none none none"
                },
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power3.out"
            });
        });
    };

    initScrollReveal();
    // Добавь это условие или обнови существующую логику
gsap.from('.benefits-grid .js-reveal', {
    scrollTrigger: {
        trigger: '.benefits-grid',
        start: "top 80%",
    },
    opacity: 0,
    y: 40,
    stagger: 0.15, // Поочередное появление карточек
    duration: 1,
    ease: "power3.out"
});
    // --- INNOVATIONS ANIMATION ---
    const initInnovations = () => {
        const items = document.querySelectorAll('.js-innovation-item');
        
        items.forEach((item) => {
            gsap.from(item, {
                scrollTrigger: {
                    trigger: item,
                    start: "top 90%",
                    end: "top 20%",
                    scrub: 1, // Привязка к движению колесика
                },
                opacity: 0,
                x: 50,
                duration: 1
            });
        });
    };

    initInnovations();
    // --- BLOG SLIDER (Swiper) ---
    const initBlogSlider = () => {
        const swiper = new Swiper('.blog-slider', {
            slidesPerView: 1,
            spaceBetween: 20,
            loop: true,
            grabCursor: true,
            navigation: {
                nextEl: '.blog__btn--next',
                prevEl: '.blog__btn--prev',
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
                dynamicBullets: true,
            },
            breakpoints: {
                640: {
                    slidesPerView: 2,
                    spaceBetween: 30,
                },
                1024: {
                    slidesPerView: 3,
                    spaceBetween: 30,
                },
            }
        });
    };

    initBlogSlider();
});