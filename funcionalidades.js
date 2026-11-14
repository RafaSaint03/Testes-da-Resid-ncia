// Interatividade básica para rolagem suave (smooth scroll) nos links do menu
document.addEventListener('DOMContentLoaded', () => {
    const internalLinks = document.querySelectorAll('a[href^="#"]');

    internalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Efeito de destaque no menu conforme a rolagem da página
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            // Corrigido o fechamento do parêntese abaixo:
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
});

/// CADASTRO E LOGIN ///
document.addEventListener('DOMContentLoaded', () => {
    // Interatividade para alternar visibilidade da senha na tela de login
    const togglePasswordBtn = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('senha');

    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePasswordBtn.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
        });
    }

    // REDIRECIONAMENTO COM DUPLO CLIQUE PARA O DASHBOARD
    const formLogin = document.getElementById('formLogin');
    if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
            e.preventDefault();
        });

        formLogin.addEventListener('dblclick', (e) => {
            e.preventDefault();
            window.location.href = 'geral.html';
        });
    }
});

/// MENU LATERAL RECOLHÍVEL ///
// Recolhe ou expande a barra lateral (botão ☰) e guarda a escolha
function toggleSidebar() {
    const app = document.getElementById('appContainer');
    const btn = document.getElementById('sidebarToggle');
    if (!app || !btn) return;

    const recolhido = app.classList.toggle('collapsed');
    btn.setAttribute('aria-expanded', String(!recolhido));
    btn.setAttribute('aria-label', recolhido ? 'Expandir menu' : 'Recolher menu');

    try {
        localStorage.setItem('nexusSidebar', recolhido ? '1' : '0');
    } catch (e) {}
}

// Restaura o estado do menu ao abrir a página
document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('appContainer');
    const btn = document.getElementById('sidebarToggle');
    if (!app || !btn) return;

    let salvo = null;
    try {
        salvo = localStorage.getItem('nexusSidebar');
    } catch (e) {}

    if (salvo === '1') {
        app.classList.add('collapsed');
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-label', 'Expandir menu');
    }
});
