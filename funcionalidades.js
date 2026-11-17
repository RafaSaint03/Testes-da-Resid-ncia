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

/// CARTEIRAS: LISTA, BUSCA, FILTROS, PERÍODO E EXPORTAÇÃO ///
document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.getElementById('tabelaClientes');
    if (!tbody) return;

    // Dados de exemplo
   
    const clientes = [
        { nome: 'Ana Luiza Martins', patrimonio: 1240000, perfil: 'Arrojado',    status: 'ativo',   abertaEm: '2024-03-10' },
        { nome: 'Bernardo Oliveira', patrimonio: 892400,  perfil: 'Moderado',    status: 'ativo',   abertaEm: '2024-08-22' },
        { nome: 'Camila Freire',     patrimonio: 575000,  perfil: 'Moderado',    status: 'analise', abertaEm: '2025-05-14' },
        { nome: 'Diego Nascimento',  patrimonio: 460800,  perfil: 'Conservador', status: 'ativo',   abertaEm: '2025-11-03' },
        { nome: 'Elisa Montenegro',  patrimonio: 318250,  perfil: 'Arrojado',    status: 'inativo', abertaEm: '2026-02-18' },
        { nome: 'Felipe Santoro',    patrimonio: 275900,  perfil: 'Conservador', status: 'ativo',   abertaEm: '2026-09-09' }
    ];

    const rotulos = { ativo: 'Ativo', analise: 'Em análise', inativo: 'Inativo' };
    const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    const iconeCarteira = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>`;

    const busca  = document.getElementById('buscaCliente');
    const perfil = document.getElementById('filtroPerfil');
    const tabs   = document.querySelectorAll('#statusTabs .tab');
    const vazio  = document.getElementById('vazio');

    const btnPeriodo   = document.getElementById('btnPeriodo');
    const popPeriodo   = document.getElementById('periodoPop');
    const labelPeriodo = document.getElementById('periodoLabel');
    const inputInicio  = document.getElementById('dataInicio');
    const inputFim     = document.getElementById('dataFim');
    const erroPeriodo  = document.getElementById('periodoErro');

    let statusAtual = 'todas';
    // período padrão: o mesmo do layout (01–30 set 2026)
    let inicio = new Date(2026, 8, 1);
    let fim    = new Date(2026, 8, 30);

    /* ---------- helpers ---------- */
    const pad = (n) => String(n).padStart(2, '0');

    const moeda = (v) =>
        v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

    const normaliza = (t) =>
        t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

    // "2026-09-30" -> Date local (evita erro de fuso do new Date('2026-09-30'))
    const paraData = (iso) => {
        const [a, m, d] = iso.split('-').map(Number);
        return new Date(a, m - 1, d);
    };
    const paraISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    function rotuloPeriodo(i, f) {
        if (i.getFullYear() === f.getFullYear() && i.getMonth() === f.getMonth()) {
            return `${pad(i.getDate())}–${pad(f.getDate())} ${meses[f.getMonth()]} ${f.getFullYear()}`;
        }
        return `${pad(i.getDate())} ${meses[i.getMonth()]} ${i.getFullYear()} – ${pad(f.getDate())} ${meses[f.getMonth()]} ${f.getFullYear()}`;
    }

    /* ---------- filtro + tabela ---------- */
        function filtrar() {
        const termo = normaliza(busca.value.trim());
        return clientes.filter(c =>
            paraData(c.abertaEm) <= fim &&
            (statusAtual === 'todas' || c.status === statusAtual) &&
            (perfil.value === 'todos' || c.perfil === perfil.value) &&
            (!termo || normaliza(c.nome).includes(termo))
        );
    }

    function render() {
        const lista = filtrar();

        tbody.innerHTML = lista.map(c => `
            <tr>
                <td>
                    <div class="asset-cell">
                        <span class="asset-icon t-pink">${iconeCarteira}</span>
                        <div>
                            <strong>${c.nome}</strong>
                            <small>Carteira principal</small>
                        </div>
                    </div>
                </td>
                <td>${moeda(c.patrimonio)}</td>
                <td>${c.perfil}</td>
                <td><span class="status-badge ${c.status}">${rotulos[c.status]}</span></td>
            </tr>
        `).join('');

        vazio.hidden = lista.length > 0;
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            statusAtual = tab.dataset.status;
            render();
        });
    });

    busca.addEventListener('input', render);
    perfil.addEventListener('change', render);

    /* ---------- seletor de período ---------- */
    function aplicarPeriodo(i, f) {
        inicio = i;
        fim = f;
        labelPeriodo.textContent = rotuloPeriodo(i, f);
        inputInicio.value = paraISO(i);
        inputFim.value = paraISO(f);
        erroPeriodo.hidden = true;
        fecharPopPeriodo();
        render();
    }

    function abrirPopPeriodo() {
        popPeriodo.hidden = false;
        btnPeriodo.setAttribute('aria-expanded', 'true');
    }

    function fecharPopPeriodo() {
        popPeriodo.hidden = true;
        btnPeriodo.setAttribute('aria-expanded', 'false');
    }

    // períodos prontos, sempre calculados a partir de hoje
    const presets = {
        mes:        (h) => [new Date(h.getFullYear(), h.getMonth(), 1), new Date(h.getFullYear(), h.getMonth() + 1, 0)],
        mesPassado: (h) => [new Date(h.getFullYear(), h.getMonth() - 1, 1), new Date(h.getFullYear(), h.getMonth(), 0)],
        '30d':      (h) => [new Date(h.getFullYear(), h.getMonth(), h.getDate() - 29), h],
        '90d':      (h) => [new Date(h.getFullYear(), h.getMonth(), h.getDate() - 89), h],
        ano:        (h) => [new Date(h.getFullYear(), 0, 1), new Date(h.getFullYear(), 11, 31)]
    };

    btnPeriodo.addEventListener('click', (e) => {
        e.stopPropagation();
        popPeriodo.hidden ? abrirPopPeriodo() : fecharPopPeriodo();
    });

    popPeriodo.addEventListener('click', (e) => e.stopPropagation());

    popPeriodo.querySelectorAll('[data-preset]').forEach(btn => {
        btn.addEventListener('click', () => {
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            const [i, f] = presets[btn.dataset.preset](hoje);
            aplicarPeriodo(i, f);
        });
    });

    document.getElementById('periodoAplicar').addEventListener('click', () => {
        if (!inputInicio.value || !inputFim.value) return;
        const i = paraData(inputInicio.value);
        const f = paraData(inputFim.value);
        if (f < i) {
            erroPeriodo.hidden = false;
            return;
        }
        aplicarPeriodo(i, f);
    });

    // fecha o seletor ao clicar fora ou apertar Esc
    document.addEventListener('click', fecharPopPeriodo);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') fecharPopPeriodo();
    });

    /* ---------- exportar CSV ---------- */
    const celula = (v) => {
        const t = String(v);
        return /[;"\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
    };

    const btnExportar = document.getElementById('btnExportarCarteiras');
    if (btnExportar) {
        btnExportar.addEventListener('click', () => {
            const agora = new Date();
            const geradoEm = `${pad(agora.getDate())}/${pad(agora.getMonth() + 1)}/${agora.getFullYear()} ${pad(agora.getHours())}:${pad(agora.getMinutes())}`;
            const lista = filtrar();
            const total = lista.reduce((soma, c) => soma + c.patrimonio, 0);

            const linhas = [
                ['Carteiras dos clientes'],
                ['Período', rotuloPeriodo(inicio, fim)],
                ['Gerado em', geradoEm],
                [],
                ['Cliente', 'Patrimônio (R$)', 'Perfil', 'Status', 'Aberta em']
            ];
            lista.forEach(c => linhas.push([
                c.nome,
                c.patrimonio.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
                c.perfil,
                rotulos[c.status],
                paraData(c.abertaEm).toLocaleDateString('pt-BR')
            ]));
            linhas.push([]);
            linhas.push(['Total', total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })]);

            const csv = linhas.map(l => l.map(celula).join(';')).join('\r\n');
            const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `carteiras-${paraISO(agora)}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        });
    }

    inputInicio.value = paraISO(inicio);
    inputFim.value = paraISO(fim);
    labelPeriodo.textContent = rotuloPeriodo(inicio, fim);
    render();
});
