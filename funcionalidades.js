const PAGINA_DASHBOARD = 'geral.html';
const ICONE_OLHO = 'Icones/eye.png';
const ICONE_OLHO_FECHADO = 'Icones/eye-off.png';

/* =========================================================
   1. TROCA DE TELAS (DASHBOARD)
   ========================================================= */
function switchScreen(screenId) {
    const screens = document.querySelectorAll('.app-screen');
    screens.forEach(screen => screen.classList.remove('active'));

    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');

        const breadcrumb = document.getElementById('breadcrumb-title');
        if (breadcrumb) {
            if (screenId === 'screen-clientes') breadcrumb.textContent = 'Central de clientes';
            if (screenId === 'screen-detalhes') breadcrumb.textContent = 'Central de clientes / Ana Luiza Martins';
            if (screenId === 'screen-novo') breadcrumb.textContent = 'Central de clientes / Novo cliente';
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

/* =========================================================
   2. MENU LATERAL RECOLHÍVEL (SIDEBAR)
   ========================================================= */
function toggleSidebar() {
    const app = document.getElementById('appContainer');
    if (!app) return;

    const isCollapsed = app.classList.toggle('collapsed');
    const btn = document.getElementById('sidebarToggle');

    if (btn) {
        btn.setAttribute('aria-expanded', String(!isCollapsed));
    }

    try {
        localStorage.setItem('sidebarCollapsed', isCollapsed ? '1' : '0');
    } catch (e) {
        console.warn('LocalStorage inacessível:', e);
    }
}

/* =========================================================
   3. INICIALIZAÇÃO DE EVENTOS (DOM LOADED)
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {

    // --- Restaurar Estado da Sidebar ---
    const app = document.getElementById('appContainer');
    if (app) {
        try {
            if (localStorage.getItem('sidebarCollapsed') === '1') {
                app.classList.add('collapsed');
                const btn = document.getElementById('sidebarToggle');
                if (btn) btn.setAttribute('aria-expanded', 'false');
            }
        } catch (e) {}
    }

    // --- Event Listener da Sidebar ---
    // Só liga o listener se o botão NÃO tiver onclick no HTML.
    // Assim evita o clique duplo (recolhe e expande na mesma hora).
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle && !sidebarToggle.hasAttribute('onclick')) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }

    // --- Troca de Telas via Atributo data-screen ---
    // Ignora elementos que já têm onclick no HTML (evita chamada dupla)
    document.querySelectorAll('[data-screen]').forEach(element => {
        if (element.hasAttribute('onclick')) return;
        element.addEventListener('click', () => {
            const screenId = element.getAttribute('data-screen');
            if (screenId) switchScreen(screenId);
        });
    });

    // --- Formulário de Novo Cliente ---
    const formNovoCliente = document.getElementById('formNovoCliente');
    if (formNovoCliente) {
        formNovoCliente.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Cliente cadastrado com sucesso!');
            switchScreen('screen-clientes');
        });
    }

    // --- Botão de Logout ---
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    // --- Âncoras do Menu (Navegação Suave) ---
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    internalLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // --- Login e Olhinho de Senha ---
    const formLogin = document.getElementById('formLogin');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('senha');
    const btnEntrar = document.getElementById('btnEntrar');
    const erroLogin = document.getElementById('loginErro');
    const togglePasswordBtn = document.getElementById('togglePassword');

    if (togglePasswordBtn && passwordInput) {
        const icone = togglePasswordBtn.querySelector('img');
        togglePasswordBtn.addEventListener('click', () => {
            const mostrar = passwordInput.getAttribute('type') === 'password';
            passwordInput.setAttribute('type', mostrar ? 'text' : 'password');
            togglePasswordBtn.classList.toggle('is-visible', mostrar);
            togglePasswordBtn.setAttribute('aria-label', mostrar ? 'Ocultar senha' : 'Mostrar senha');

            if (icone) {
                icone.alt = mostrar ? 'Ocultar senha' : 'Mostrar senha';
                icone.onerror = () => {
                    icone.onerror = null;
                    icone.src = ICONE_OLHO;
                };
                icone.src = mostrar ? ICONE_OLHO_FECHADO : ICONE_OLHO;
            }
        });
    }

    if (formLogin) {
        function mostrarErro(mensagem, campo) {
            if (erroLogin) {
                erroLogin.textContent = mensagem;
                erroLogin.hidden = false;
            }
            if (campo) campo.focus();
        }

        function limparErro() {
            if (erroLogin) {
                erroLogin.textContent = '';
                erroLogin.hidden = true;
            }
        }

        function tentarLogin() {
            limparErro();

            const email = emailInput ? emailInput.value.trim() : '';
            const senha = passwordInput ? passwordInput.value : '';

            if (!email) {
                mostrarErro('Preencha o e-mail para entrar.', emailInput);
                return;
            }
            if (emailInput && !emailInput.checkValidity()) {
                mostrarErro('Digite um e-mail válido (ex.: marina@exemplo.com).', emailInput);
                return;
            }
            if (!senha) {
                mostrarErro('Preencha a senha para entrar.', passwordInput);
                return;
            }

            window.location.href = PAGINA_DASHBOARD;
        }

        formLogin.addEventListener('submit', (e) => {
            e.preventDefault();
            tentarLogin();
        });

        if (btnEntrar) {
            btnEntrar.addEventListener('click', (e) => {
                e.preventDefault();
                tentarLogin();
            });
        }

        [emailInput, passwordInput].forEach(campo => {
            if (campo) campo.addEventListener('input', limparErro);
        });
    }
});
