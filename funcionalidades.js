// PREFERÊNCIAS GLOBAIS DE ACESSIBILIDADE
(function inicializarPreferenciasAcessibilidade() {
    const preferencias = [
        {
            id: 'toggle-borders',
            chave: 'nexusA11yThickBorders',
            classe: 'a11y-thick-borders'
        },
        {
            id: 'toggle-contrast',
            chave: 'nexusA11yHighContrast',
            classe: 'a11y-high-contrast'
        },
        {
            id: 'toggle-animations',
            chave: 'nexusA11yReducedMotion',
            classe: 'a11y-reduced-motion'
        }
    ];

    function lerPreferencia(chave) {
        try {
            return localStorage.getItem(chave) === 'true';
        } catch (erro) {
            console.error('Não foi possível carregar as preferências de acessibilidade.', erro);
            return false;
        }
    }

    function salvarPreferencia(chave, ativada) {
        try {
            localStorage.setItem(chave, String(ativada));
        } catch (erro) {
            console.error('Não foi possível salvar as preferências de acessibilidade.', erro);
        }
    }

    preferencias.forEach(preferencia => {
        const controle = document.getElementById(preferencia.id);
        const ativada = lerPreferencia(preferencia.chave);

        document.body.classList.toggle(preferencia.classe, ativada);
        if (!controle) return;

        controle.checked = ativada;
        controle.addEventListener('change', () => {
            const novoEstado = controle.checked;
            document.body.classList.toggle(preferencia.classe, novoEstado);
            salvarPreferencia(preferencia.chave, novoEstado);
        });
    });
})();

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
    } catch (e) { }
}

document.addEventListener('DOMContentLoaded', () => {
    const $ = (id) => document.getElementById(id);

    // =========================================================
    // 0. UTILITÁRIOS DE EXPORTAÇÃO (usados por todas as páginas)
    // =========================================================
    function csvCelula(valor) {
        const texto = String(valor == null ? '' : valor);
        return /[;"\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
    }

    function dataISO(d) {
        const p = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
    }

    function dataHoraBR(d) {
        const p = (n) => String(n).padStart(2, '0');
        return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
    }

    function textoLimpo(el) {
        return (el.innerText || el.textContent || '')
            .replace(/\s*\n\s*/g, ' · ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function slug(texto) {
        return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'relatorio';
    }

    // Gera o arquivo .csv (separador ";", com BOM para abrir certo no Excel) e baixa
    function baixarCSV(nomeBase, linhas) {
        const csv = linhas.map((l) => l.map(csvCelula).join(';')).join('\r\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${nomeBase}-${dataISO(new Date())}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    // Converte uma <table> do DOM em linhas (título da caixa, cabeçalho e corpo visível)
    function blocoDaTabela(tabela) {
        const cabecalho = Array.from(tabela.querySelectorAll('thead th')).map(textoLimpo);
        const corpo = Array.from(tabela.querySelectorAll('tbody tr'))
            .filter((tr) => !tr.hidden && !tr.closest('[hidden]'))
            .map((tr) => Array.from(tr.children).map(textoLimpo));
        if (corpo.length === 0) return [];

        const caixa = tabela.closest('.positions-table-box, .chart-box-main, section');
        const nome = caixa && caixa.querySelector('h2, h3');
        const bloco = [];
        if (nome) bloco.push([textoLimpo(nome)]);
        if (cabecalho.length) bloco.push(cabecalho);
        return bloco.concat(corpo);
    }

    function montarRelatorio(titulo, secoes) {
        const linhas = [[titulo], ['Gerado em', dataHoraBR(new Date())]];
        secoes.forEach((secao) => {
            if (secao.length === 0) return;
            linhas.push([]);
            secao.forEach((l) => linhas.push(l));
        });
        return linhas;
    }

    // Relatório automático da página: indicadores, alocação e todas as tabelas visíveis
    function relatorioDaPagina() {
        const raiz = document.querySelector('.app-screen.active')
            || document.querySelector('.content-wrapper')
            || document.body;
        const h1 = raiz.querySelector('h1') || document.querySelector('h1');
        const titulo = h1 ? textoLimpo(h1) : document.title;

        const indicadores = [];
        raiz.querySelectorAll('.metric-card-dark, .metric-card-light').forEach((card) => {
            const rotulo = card.querySelector('.card-label-light, .card-label-dark');
            const valor = card.querySelector('.metric-value-white, .metric-value-dark');
            if (rotulo && valor) indicadores.push([textoLimpo(rotulo), textoLimpo(valor)]);
        });

        const alocacao = [];
        raiz.querySelectorAll('.legend-item').forEach((item) => {
            const valor = item.querySelector('.val');
            const nome = Array.from(item.childNodes)
                .filter((n) => !(n.nodeType === 1 && (n.classList.contains('val') || n.classList.contains('dot'))))
                .map((n) => n.textContent).join('').trim();
            if (nome) alocacao.push([nome, valor ? textoLimpo(valor) : '']);
        });

        const tabelas = Array.from(raiz.querySelectorAll('table'))
            .filter((tabela) => !tabela.closest('[hidden]'))
            .map(blocoDaTabela);

        return {
            titulo,
            linhas: montarRelatorio(titulo, [
                indicadores.length ? [['Indicadores']].concat(indicadores) : [],
                alocacao.length ? [['Alocação']].concat(alocacao) : []
            ].concat(tabelas))
        };
    }

    // =========================================================
    // 1. NAVEGAÇÃO SUAVE, MENU LATERAL E LOGIN
    // =========================================================
    const internalLinks = document.querySelectorAll('a[href^="#"]');

    internalLinks.forEach((link) => {
        link.addEventListener('click', function (e) {
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

    // Destaque no menu conforme rolagem da página
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';

        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach((link) => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // Alternar visibilidade da senha na tela de login
    const togglePasswordBtn = $('togglePassword');
    const passwordInput = $('senha');

    if (togglePasswordBtn && passwordInput && !togglePasswordBtn.dataset.target) {
        togglePasswordBtn.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePasswordBtn.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
        });
    }

    // Redirecionamento com duplo clique no formulário de login
    const formLogin = $('formLogin');
    if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
            e.preventDefault();
        });

        formLogin.addEventListener('dblclick', (e) => {
            e.preventDefault();
            window.location.href = 'geral.html';
        });
    }

    // Restaura o estado do menu lateral ao abrir a página
    const app = $('appContainer');
    const btn = $('sidebarToggle');
    if (app && btn) {
        let salvo = null;
        try {
            salvo = localStorage.getItem('nexusSidebar');
        } catch (e) { }

        if (salvo === '1') {
            app.classList.add('collapsed');
            btn.setAttribute('aria-expanded', 'false');
            btn.setAttribute('aria-label', 'Expandir menu');
        }
    }

    // =========================================================
    // 2. CARTEIRAS: LISTA, BUSCA, FILTROS, PERÍODO E CSV
    // =========================================================
    const tbody = $('tabelaClientes');
    if (tbody) {
        const clientes = [
            { nome: 'Ana Luiza Martins', patrimonio: 1240000, perfil: 'Arrojado', status: 'ativo', abertaEm: '2024-03-10' },
            { nome: 'Bernardo Oliveira', patrimonio: 892400, perfil: 'Moderado', status: 'ativo', abertaEm: '2024-08-22' },
            { nome: 'Camila Freire', patrimonio: 575000, perfil: 'Moderado', status: 'analise', abertaEm: '2025-05-14' },
            { nome: 'Diego Nascimento', patrimonio: 460800, perfil: 'Conservador', status: 'ativo', abertaEm: '2025-11-03' },
            { nome: 'Elisa Montenegro', patrimonio: 318250, perfil: 'Arrojado', status: 'inativo', abertaEm: '2026-02-18' },
            { nome: 'Felipe Santoro', patrimonio: 275900, perfil: 'Conservador', status: 'ativo', abertaEm: '2026-09-09' }
        ];

        const rotulos = { ativo: 'Ativo', analise: 'Em análise', inativo: 'Inativo' };
        const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
        const iconeCarteira = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>`;

        const busca = $('buscaCliente');
        const perfil = $('filtroPerfil');
        const tabs = document.querySelectorAll('#statusTabs .tab');
        const vazio = $('vazio');

        const btnPeriodo = $('btnPeriodo');
        const popPeriodo = $('periodoPop');
        const labelPeriodo = $('periodoLabel');
        const inputInicio = $('dataInicio');
        const inputFim = $('dataFim');
        const erroPeriodo = $('periodoErro');

        const hojeCarteira = new Date();
        hojeCarteira.setHours(0, 0, 0, 0);

        let statusAtual = 'todas';
        let inicio = new Date(hojeCarteira);
        let fim = new Date(hojeCarteira);

        const pad = (n) => String(n).padStart(2, '0');
        const moeda = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
        const normaliza = (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

        const paraData = (iso) => {
            const [a, m, d] = iso.split('-').map(Number);
            return new Date(a, m - 1, d);
        };
        const paraISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

        function rotuloPeriodo(i, f) {
            if (
                i.getFullYear() === f.getFullYear() &&
                i.getMonth() === f.getMonth() &&
                i.getDate() === f.getDate()
            ) {
                return `${pad(i.getDate())} ${meses[i.getMonth()]} ${i.getFullYear()}`;
            }
            if (i.getFullYear() === f.getFullYear() && i.getMonth() === f.getMonth()) {
                return `${pad(i.getDate())}–${pad(f.getDate())} ${meses[f.getMonth()]} ${f.getFullYear()}`;
            }
            return `${pad(i.getDate())} ${meses[i.getMonth()]} ${i.getFullYear()} – ${pad(f.getDate())} ${meses[f.getMonth()]} ${f.getFullYear()}`;
        }

        function filtrar() {
            const termo = normaliza(busca.value.trim());
            return clientes.filter((c) =>
                paraData(c.abertaEm) <= fim &&
                (statusAtual === 'todas' || c.status === statusAtual) &&
                (perfil.value === 'todos' || c.perfil === perfil.value) &&
                (!termo || normaliza(c.nome).includes(termo))
            );
        }

        function render() {
            const lista = filtrar();

            tbody.innerHTML = lista.map((c) => `
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

        tabs.forEach((tab) => {
            tab.addEventListener('click', () => {
                tabs.forEach((t) => t.classList.remove('active'));
                tab.classList.add('active');
                statusAtual = tab.dataset.status;
                render();
            });
        });

        busca.addEventListener('input', render);
        perfil.addEventListener('change', render);

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

        const presets = {
            mes: (h) => [new Date(h.getFullYear(), h.getMonth(), 1), new Date(h.getFullYear(), h.getMonth() + 1, 0)],
            mesPassado: (h) => [new Date(h.getFullYear(), h.getMonth() - 1, 1), new Date(h.getFullYear(), h.getMonth(), 0)],
            '30d': (h) => [new Date(h.getFullYear(), h.getMonth(), h.getDate() - 29), h],
            '90d': (h) => [new Date(h.getFullYear(), h.getMonth(), h.getDate() - 89), h],
            ano: (h) => [new Date(h.getFullYear(), 0, 1), new Date(h.getFullYear(), 11, 31)]
        };

        btnPeriodo.addEventListener('click', (e) => {
            e.stopPropagation();
            popPeriodo.hidden ? abrirPopPeriodo() : fecharPopPeriodo();
        });

        popPeriodo.addEventListener('click', (e) => e.stopPropagation());

        popPeriodo.querySelectorAll('[data-preset]').forEach((btnPreset) => {
            btnPreset.addEventListener('click', () => {
                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0);
                const [i, f] = presets[btnPreset.dataset.preset](hoje);
                aplicarPeriodo(i, f);
            });
        });

        $('periodoAplicar').addEventListener('click', () => {
            if (!inputInicio.value || !inputFim.value) return;
            const i = paraData(inputInicio.value);
            const f = paraData(inputFim.value);
            if (f < i) {
                erroPeriodo.hidden = false;
                return;
            }
            aplicarPeriodo(i, f);
        });

        document.addEventListener('click', fecharPopPeriodo);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') fecharPopPeriodo();
        });

        const btnExportar = $('btnExportarCarteiras');
        if (btnExportar) {
            btnExportar.dataset.exportarLigado = '1';
            btnExportar.addEventListener('click', () => {
                const lista = filtrar();
                const total = lista.reduce((soma, c) => soma + c.patrimonio, 0);

                const linhas = [
                    ['Carteiras dos clientes'],
                    ['Período', rotuloPeriodo(inicio, fim)],
                    ['Gerado em', dataHoraBR(new Date())],
                    [],
                    ['Cliente', 'Patrimônio (R$)', 'Perfil', 'Status', 'Aberta em']
                ];
                lista.forEach((c) => linhas.push([
                    c.nome,
                    c.patrimonio.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
                    c.perfil,
                    rotulos[c.status],
                    paraData(c.abertaEm).toLocaleDateString('pt-BR')
                ]));
                linhas.push([]);
                linhas.push(['Total', total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })]);

                baixarCSV('carteiras', linhas);
            });
        }

        inputInicio.value = paraISO(inicio);
        inputFim.value = paraISO(fim);
        labelPeriodo.textContent = rotuloPeriodo(inicio, fim);
        render();
    }

    // =========================================================
    // SELETOR DE PERÍODO GLOBAL (atualiza todo dia + outras páginas)
    // =========================================================
    function iniciarSeletorPeriodo(aoMudar) {
        const btnPeriodoGlobal = $('btnPeriodo');
        const popPeriodoGlobal = $('periodoPop');
        const labelPeriodoGlobal = $('periodoLabel');
        const inputInicioGlobal = $('dataInicio');
        const inputFimGlobal = $('dataFim');
        const erroPeriodoGlobal = $('periodoErro');
        const btnAplicarGlobal = $('periodoAplicar');

        if ($('tabelaClientes') || !btnPeriodoGlobal || !popPeriodoGlobal) return null;

        const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
        const pad = (n) => String(n).padStart(2, '0');
        const paraData = (iso) => {
            const [a, m, d] = iso.split('-').map(Number);
            return new Date(a, m - 1, d);
        };
        const paraISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

        function obterHoje() {
            const d = new Date();
            d.setHours(0, 0, 0, 0);
            return d;
        }

        function mesmoDia(a, b) {
            return a.getFullYear() === b.getFullYear() &&
                a.getMonth() === b.getMonth() &&
                a.getDate() === b.getDate();
        }

        let hoje = obterHoje();
        let inicio = new Date(hoje);
        let fim = new Date(hoje);
        let modoDataHoje = true;
        let timerMeiaNoite = null;

        function rotuloPeriodo(i, f) {
            if (mesmoDia(i, f)) {
                return `${pad(i.getDate())} ${meses[i.getMonth()]} ${i.getFullYear()}`;
            }
            if (i.getFullYear() === f.getFullYear() && i.getMonth() === f.getMonth()) {
                return `${pad(i.getDate())}–${pad(f.getDate())} ${meses[f.getMonth()]} ${f.getFullYear()}`;
            }
            return `${pad(i.getDate())} ${meses[i.getMonth()]} ${i.getFullYear()} – ${pad(f.getDate())} ${meses[f.getMonth()]} ${f.getFullYear()}`;
        }

        function fechar() {
            popPeriodoGlobal.hidden = true;
            btnPeriodoGlobal.setAttribute('aria-expanded', 'false');
        }

        function aplicar(i, f, manterHoje = false) {
            inicio = new Date(i);
            fim = new Date(f);
            modoDataHoje = manterHoje;

            if (labelPeriodoGlobal) labelPeriodoGlobal.textContent = rotuloPeriodo(inicio, fim);
            if (inputInicioGlobal) inputInicioGlobal.value = paraISO(inicio);
            if (inputFimGlobal) inputFimGlobal.value = paraISO(fim);
            if (erroPeriodoGlobal) erroPeriodoGlobal.hidden = true;

            fechar();
            if (typeof aoMudar === 'function') {
                aoMudar({ inicio, fim, rotulo: rotuloPeriodo(inicio, fim) });
            }
        }

        const presets = {
            mes: (h) => [new Date(h.getFullYear(), h.getMonth(), 1), new Date(h.getFullYear(), h.getMonth() + 1, 0)],
            mesPassado: (h) => [new Date(h.getFullYear(), h.getMonth() - 1, 1), new Date(h.getFullYear(), h.getMonth(), 0)],
            '30d': (h) => [new Date(h.getFullYear(), h.getMonth(), h.getDate() - 29), h],
            '90d': (h) => [new Date(h.getFullYear(), h.getMonth(), h.getDate() - 89), h],
            ano: (h) => [new Date(h.getFullYear(), 0, 1), new Date(h.getFullYear(), 11, 31)]
        };

        btnPeriodoGlobal.addEventListener('click', (e) => {
            e.stopPropagation();
            const abrir = popPeriodoGlobal.hidden;
            popPeriodoGlobal.hidden = !abrir;
            btnPeriodoGlobal.setAttribute('aria-expanded', String(abrir));
        });

        popPeriodoGlobal.addEventListener('click', (e) => e.stopPropagation());

        popPeriodoGlobal.querySelectorAll('[data-preset]').forEach((b) => {
            b.addEventListener('click', () => {
                const ref = obterHoje();
                const [i, f] = presets[b.dataset.preset](ref);
                aplicar(i, f, false);
            });
        });

        if (btnAplicarGlobal) {
            btnAplicarGlobal.addEventListener('click', () => {
                if (!inputInicioGlobal || !inputFimGlobal || !inputInicioGlobal.value || !inputFimGlobal.value) return;
                const i = paraData(inputInicioGlobal.value);
                const f = paraData(inputFimGlobal.value);
                if (f < i) {
                    if (erroPeriodoGlobal) erroPeriodoGlobal.hidden = false;
                    return;
                }
                const ehHoje = mesmoDia(i, f) && mesmoDia(i, obterHoje());
                aplicar(i, f, ehHoje);
            });
        }

        document.addEventListener('click', fechar);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') fechar();
        });

        function agendarAtualizacaoDiaria() {
            clearTimeout(timerMeiaNoite);
            const agora = new Date();
            const proximaVirada = new Date(
                agora.getFullYear(),
                agora.getMonth(),
                agora.getDate() + 1,
                0, 0, 1, 0
            );

            timerMeiaNoite = setTimeout(() => {
                const novoHoje = obterHoje();
                if (!mesmoDia(novoHoje, hoje)) {
                    hoje = novoHoje;
                    if (modoDataHoje) {
                        aplicar(hoje, hoje, true);
                    }
                }
                agendarAtualizacaoDiaria();
            }, Math.max(1000, proximaVirada - agora));
        }

        aplicar(inicio, fim, true);
        agendarAtualizacaoDiaria();

        return { getPeriodo: () => ({ inicio, fim, rotulo: rotuloPeriodo(inicio, fim) }) };
    }

    iniciarSeletorPeriodo();

    // =========================================================
    // 3. CENTRAL DE CLIENTES (ex-script inline de clientes.html)
    // =========================================================
    const telas = document.querySelectorAll('.app-screen');
    if (telas.length > 0) {
        const titulo = $('breadcrumb-title');
        const nomes = {
            'screen-clientes': 'Central de clientes',
            'screen-detalhes': 'Detalhes do cliente',
            'screen-novo': 'Novo cliente'
        };

        document.querySelectorAll('[data-screen]').forEach((el) => {
            el.addEventListener('click', () => {
                const alvo = el.getAttribute('data-screen');
                telas.forEach((t) => t.classList.toggle('active', t.id === alvo));
                if (titulo && nomes[alvo]) titulo.textContent = nomes[alvo];
                window.scrollTo({ top: 0 });
            });
        });

        const logout = $('btnLogout');
        if (logout) {
            logout.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }
    }

    // =========================================================
    // 4. AUTENTICAÇÃO (ex-autenticacao.js)
    // =========================================================
    function mostrarErroAuth(campoId, mensagem) {
        const input = $(campoId);
        const erro = $('erro-' + campoId);
        if (input && input.closest('.input-field-wrapper')) {
            input.closest('.input-field-wrapper').classList.add('invalid');
        }
        if (erro) {
            erro.textContent = mensagem;
            erro.classList.add('visible');
        }
    }

    function limparErroAuth(campoId) {
        const input = $(campoId);
        const erro = $('erro-' + campoId);
        if (input && input.closest('.input-field-wrapper')) {
            input.closest('.input-field-wrapper').classList.remove('invalid');
        }
        if (erro) {
            erro.textContent = '';
            erro.classList.remove('visible');
        }
    }

    function emailValido(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
    }

    function cpfValido(valor) {
        const cpf = valor.replace(/\D/g, '');
        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

        for (let t = 9; t < 11; t++) {
            let soma = 0;
            for (let i = 0; i < t; i++) {
                soma += parseInt(cpf[i], 10) * (t + 1 - i);
            }
            const digito = ((soma * 10) % 11) % 10;
            if (digito !== parseInt(cpf[t], 10)) return false;
        }
        return true;
    }

    document.querySelectorAll('.auth-form input').forEach((input) => {
        input.addEventListener('input', () => limparErroAuth(input.id));
        input.addEventListener('change', () => limparErroAuth(input.id));
    });

    document.querySelectorAll('.eye-btn[data-target]').forEach((botao) => {
        botao.addEventListener('click', () => {
            const campo = $(botao.dataset.target);
            if (!campo) return;
            const mostrar = campo.type === 'password';
            campo.type = mostrar ? 'text' : 'password';
            botao.textContent = mostrar ? '👁️‍🗨️' : '👁️';
        });
    });

    document.querySelectorAll('[data-mask]').forEach((campo) => {
        campo.addEventListener('input', () => {
            let v = campo.value.replace(/\D/g, '');

            if (campo.dataset.mask === 'cpf') {
                v = v.slice(0, 11);
                v = v.replace(/^(\d{3})(\d)/, '$1.$2')
                    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
                    .replace(/\.(\d{3})(\d)/, '.$1-$2');
            }

            if (campo.dataset.mask === 'telefone') {
                v = v.slice(0, 11);
                if (v.length > 10) {
                    v = v.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
                } else if (v.length > 6) {
                    v = v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
                } else if (v.length > 2) {
                    v = v.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
                } else if (v.length > 0) {
                    v = v.replace(/^(\d{0,2})/, '($1');
                }
            }

            campo.value = v;
        });
    });

    const senhaCadastro = $('senha');
    const barras = $('forcaBarras');
    const textoForca = $('forcaTexto');

    function calcularForca(valor) {
        let pontos = 0;
        if (valor.length >= 8) pontos++;
        if (/[a-z]/.test(valor) && /[A-Z]/.test(valor)) pontos++;
        if (/\d/.test(valor)) pontos++;
        if (/[^A-Za-z0-9]/.test(valor)) pontos++;
        return valor.length === 0 ? 0 : Math.max(pontos, 1);
    }

    if (senhaCadastro && barras && textoForca) {
        const rotulos = [
            'Use 8 ou mais caracteres, com letras, números e símbolos.',
            'Senha fraca',
            'Senha razoável',
            'Senha boa',
            'Senha forte'
        ];

        senhaCadastro.addEventListener('input', () => {
            const nivel = calcularForca(senhaCadastro.value);
            barras.className = 'strength-bars' + (nivel ? ' level-' + nivel : '');
            textoForca.textContent = rotulos[nivel];
        });
    }

    const formCadastro = $('formCadastro');
    if (formCadastro) {
        formCadastro.addEventListener('submit', (e) => {
            e.preventDefault();
            let valido = true;

            const nome = $('nome').value.trim();
            const email = $('email').value.trim();
            const cpf = $('cpf').value;
            const celular = $('celular').value.replace(/\D/g, '');
            const valorSenha = $('senha').value;
            const confirmar = $('confirmarSenha').value;

            if (nome.split(/\s+/).length < 2) {
                mostrarErroAuth('nome', 'Informe seu nome completo.');
                valido = false;
            }
            if (!emailValido(email)) {
                mostrarErroAuth('email', 'Informe um e-mail válido.');
                valido = false;
            }
            if (!cpfValido(cpf)) {
                mostrarErroAuth('cpf', 'CPF inválido.');
                valido = false;
            }
            if (celular.length < 10) {
                mostrarErroAuth('celular', 'Informe um celular com DDD.');
                valido = false;
            }
            if (calcularForca(valorSenha) < 3 || valorSenha.length < 8) {
                mostrarErroAuth('senha', 'Use 8+ caracteres, misturando letras, números ou símbolos.');
                valido = false;
            }
            if (confirmar !== valorSenha || confirmar === '') {
                mostrarErroAuth('confirmarSenha', 'As senhas não coincidem.');
                valido = false;
            }
            if (!$('termos').checked) {
                const erroTermos = $('erro-termos');
                erroTermos.textContent = 'Você precisa aceitar os termos para continuar.';
                erroTermos.classList.add('visible');
                valido = false;
            }

            if (!valido) {
                const primeiro = formCadastro.querySelector('.invalid input');
                if (primeiro) primeiro.focus();
                return;
            }

            $('nomeBoasVindas').textContent = nome.split(/\s+/)[0];
            $('emailBoasVindas').textContent = email;
            $('cadastroConteudo').style.display = 'none';
            $('cadastroSucesso').classList.add('visible');
        });

        $('termos').addEventListener('change', () => {
            const erroTermos = $('erro-termos');
            erroTermos.textContent = '';
            erroTermos.classList.remove('visible');
        });
    }

    const formEsqueci = $('formEsqueci');
    if (formEsqueci) {
        const btnReenviar = $('btnReenviar');
        let contador = null;

        function iniciarEspera(segundos) {
            let restante = segundos;
            btnReenviar.disabled = true;
            btnReenviar.textContent = `Reenviar e-mail (${restante}s)`;

            clearInterval(contador);
            contador = setInterval(() => {
                restante--;
                if (restante <= 0) {
                    clearInterval(contador);
                    btnReenviar.disabled = false;
                    btnReenviar.textContent = 'Reenviar e-mail';
                } else {
                    btnReenviar.textContent = `Reenviar e-mail (${restante}s)`;
                }
            }, 1000);
        }

        formEsqueci.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = $('emailRecuperacao').value.trim();

            if (!emailValido(email)) {
                mostrarErroAuth('emailRecuperacao', 'Informe um e-mail válido.');
                $('emailRecuperacao').focus();
                return;
            }

            $('emailEnviado').textContent = email;
            $('esqueciConteudo').style.display = 'none';
            $('esqueciSucesso').classList.add('visible');
            iniciarEspera(30);
        });

        btnReenviar.addEventListener('click', () => {
            iniciarEspera(30);
        });
    }

    // =========================================================
    // 5. CENTRAL DE AJUDA (ex-ajuda.js)
    // =========================================================
    const btnVoltar = $('btnVoltar');
    if (btnVoltar) {
        btnVoltar.addEventListener('click', (e) => {
            if (window.history.length > 1) {
                e.preventDefault();
                window.history.back();
            }
        });
    }

    const itensFaq = Array.from(document.querySelectorAll('.faq-item'));
    const chipsFaq = Array.from(document.querySelectorAll('.help-chip'));
    const buscaAjuda = $('buscaAjuda');
    const vazioFaq = $('faqVazio');
    const contadorFaq = $('faqContador');

    if (itensFaq.length > 0 && buscaAjuda) {
        let categoriaFaq = 'todos';

        const normalizarFaq = (texto) =>
            texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        itensFaq.forEach((item) => {
            item.dataset.texto = normalizarFaq(item.textContent);
        });

        function filtrarFaq() {
            const palavras = normalizarFaq(buscaAjuda.value.trim()).split(/\s+/).filter(Boolean);
            let visiveis = 0;

            itensFaq.forEach((item) => {
                const okCategoria = categoriaFaq === 'todos' || item.dataset.cat === categoriaFaq;
                const okBusca = palavras.every((p) => item.dataset.texto.includes(p));
                const mostrar = okCategoria && okBusca;
                item.hidden = !mostrar;
                if (mostrar) visiveis++;
            });

            if (vazioFaq) vazioFaq.hidden = visiveis !== 0;
            if (contadorFaq) {
                contadorFaq.textContent = visiveis === 1 ? '1 resultado' : `${visiveis} resultados`;
            }
        }

        chipsFaq.forEach((chip) => {
            chip.addEventListener('click', () => {
                categoriaFaq = chip.dataset.cat;
                chipsFaq.forEach((c) => {
                    const ativo = c === chip;
                    c.classList.toggle('active', ativo);
                    c.setAttribute('aria-pressed', ativo ? 'true' : 'false');
                });
                filtrarFaq();
            });
        });

        buscaAjuda.addEventListener('input', filtrarFaq);

        const formBusca = $('formBusca');
        if (formBusca) {
            formBusca.addEventListener('submit', (e) => {
                e.preventDefault();
                filtrarFaq();
                const duvidas = $('duvidas');
                if (duvidas) duvidas.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        }

        function abrirPeloEndereco() {
            if (!window.location.hash.startsWith('#faq-')) return;
            const alvo = document.querySelector(window.location.hash);
            if (alvo && alvo.tagName === 'DETAILS') {
                buscaAjuda.value = '';
                categoriaFaq = 'todos';
                chipsFaq.forEach((c) => {
                    const ativo = c.dataset.cat === 'todos';
                    c.classList.toggle('active', ativo);
                    c.setAttribute('aria-pressed', ativo ? 'true' : 'false');
                });
                filtrarFaq();
                alvo.open = true;
                alvo.scrollIntoView({ block: 'center' });
            }
        }

        filtrarFaq();
        abrirPeloEndereco();
        window.addEventListener('hashchange', abrirPeloEndereco);
    }

    const formContato = $('formContato');
    if (formContato) {
        function mostrarErroContato(id, mensagem) {
            const campo = $(id);
            const erro = $('erro-' + id);
            campo.closest('.input-field-wrapper').classList.add('invalid');
            erro.textContent = mensagem;
            erro.classList.add('visible');
        }

        function limparErroContato(id) {
            const campo = $(id);
            const erro = $('erro-' + id);
            campo.closest('.input-field-wrapper').classList.remove('invalid');
            erro.textContent = '';
            erro.classList.remove('visible');
        }

        ['contatoNome', 'contatoEmail', 'contatoAssunto', 'contatoMensagem'].forEach((id) => {
            $(id).addEventListener('input', () => limparErroContato(id));
            $(id).addEventListener('change', () => limparErroContato(id));
        });

        formContato.addEventListener('submit', (e) => {
            e.preventDefault();
            let valido = true;

            const nome = $('contatoNome').value.trim();
            const email = $('contatoEmail').value.trim();
            const assunto = $('contatoAssunto').value;
            const mensagem = $('contatoMensagem').value.trim();

            if (nome.length < 3) {
                mostrarErroContato('contatoNome', 'Informe seu nome.');
                valido = false;
            }
            if (!emailValido(email)) {
                mostrarErroContato('contatoEmail', 'Informe um e-mail válido.');
                valido = false;
            }
            if (!assunto) {
                mostrarErroContato('contatoAssunto', 'Escolha um assunto.');
                valido = false;
            }
            if (mensagem.length < 10) {
                mostrarErroContato('contatoMensagem', 'Conte um pouco mais (mínimo de 10 caracteres).');
                valido = false;
            }

            if (!valido) {
                const primeiro = formContato.querySelector('.invalid input, .invalid select, .invalid textarea');
                if (primeiro) primeiro.focus();
                return;
            }

            $('contatoEmailEnviado').textContent = email;
            $('contatoFormWrap').hidden = true;
            $('contatoSucesso').classList.add('visible');
        });

        $('btnNovaMensagem').addEventListener('click', () => {
            formContato.reset();
            $('contatoSucesso').classList.remove('visible');
            $('contatoFormWrap').hidden = false;
            $('contatoNome').focus();
        });
    }

    // =========================================================
    // 6. MOVIMENTAÇÕES: LISTA, PAGINAÇÃO, ÚLTIMA MOVIMENTAÇÃO E CSV
    // =========================================================
    const tbodyMov = $('tabelaMovimentacoes');
    if (tbodyMov) {
        const TOTAL = 128;
        const POR_PAGINA = 5;
        const PAGINAS = Math.ceil(TOTAL / POR_PAGINA);

        const tipos = {
            compra: { rotulo: 'Compra', icone: 'buy' },
            venda: { rotulo: 'Venda', icone: 'sell' },
            rolagem: { rotulo: 'Rolagem', icone: 'roll' }
        };

        const movimentacoes = [
            { ativo: 'Tesouro IPCA+ 2035', categoria: 'Renda fixa · Tesouro Direto', data: '2026-09-30', tipo: 'compra', valor: 25000, icone: 'bank', cor: 't-mint', cliente: 'Marina Coots', responsavel: 'Marina Coots' },
            { ativo: 'PETR4', categoria: 'Ações · Petrobras PN', data: '2026-09-29', tipo: 'venda', valor: 7700, icone: 'stock', cor: 't-pink' },
            { ativo: 'CDB Banco Prisma', categoria: 'Renda fixa · 112% do CDI', data: '2026-09-28', tipo: 'rolagem', valor: 40000, icone: 'cdb', cor: 't-lilac' },
            { ativo: 'Fundo Aurora Macro', categoria: 'Fundos · Multimercado', data: '2026-09-25', tipo: 'compra', valor: 15000, icone: 'layers', cor: 't-mint' },
            { ativo: 'Tesouro Prefixado 2029', categoria: 'Renda fixa · Tesouro Direto', data: '2026-09-24', tipo: 'rolagem', valor: 18500, icone: 'bank', cor: 't-lilac' }
        ];

        const moeda = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const dataBR = (iso) => iso.split('-').reverse().join('/');
        const usarIcone = (use, nome) => use.setAttribute('href', `#i-${nome}`);

        const modeloLinha = $('modeloLinhaMov');
        const modeloPagina = $('modeloPaginaMov');
        const modeloReticencias = $('modeloReticenciasMov');
        const listaPaginas = $('movPaginas');
        const btnAnterior = $('movAnterior');
        const btnProxima = $('movProxima');

        let paginaAtual = 1;

        // Mock: nas demais páginas repete os mesmos itens. Troque por fetch('/api/movimentacoes?pagina=N').
        const buscarPagina = () => movimentacoes;

        function renderLinhas() {
            const fragmento = document.createDocumentFragment();

            buscarPagina(paginaAtual).forEach((m) => {
                const linha = modeloLinha.content.cloneNode(true);
                const campo = (nome) => linha.querySelector(`[data-campo="${nome}"]`);

                campo('iconeAtivo').classList.add(m.cor);
                usarIcone(campo('iconeUse'), m.icone);
                campo('ativo').textContent = m.ativo;
                campo('categoria').textContent = m.categoria;
                campo('data').textContent = dataBR(m.data);
                campo('tipoWrap').classList.add(m.tipo);
                usarIcone(campo('tipoIconeUse'), tipos[m.tipo].icone);
                campo('tipo').textContent = tipos[m.tipo].rotulo;
                campo('valor').textContent = moeda(m.valor);

                fragmento.appendChild(linha);
            });

            tbodyMov.replaceChildren(fragmento);

            const primeiro = (paginaAtual - 1) * POR_PAGINA + 1;
            const ultimo = Math.min(paginaAtual * POR_PAGINA, TOTAL);
            $('movIntervalo').textContent = `Exibindo ${primeiro}–${ultimo} de ${TOTAL} movimentações`;
        }

        function listaDePaginas() {
            if (PAGINAS <= 5) return Array.from({ length: PAGINAS }, (_, i) => i + 1);
            if (paginaAtual <= 2) return [1, 2, 3, '…', PAGINAS];
            if (paginaAtual >= PAGINAS - 1) return [1, '…', PAGINAS - 2, PAGINAS - 1, PAGINAS];
            return [1, '…', paginaAtual, '…', PAGINAS];
        }

        function renderPaginacao() {
            const fragmento = document.createDocumentFragment();

            listaDePaginas().forEach((p) => {
                if (p === '…') {
                    fragmento.appendChild(modeloReticencias.content.cloneNode(true));
                    return;
                }
                const botao = modeloPagina.content.firstElementChild.cloneNode(true);
                botao.textContent = p;
                botao.dataset.pagina = p;
                if (p === paginaAtual) {
                    botao.classList.add('active');
                    botao.setAttribute('aria-current', 'page');
                }
                fragmento.appendChild(botao);
            });

            listaPaginas.replaceChildren(fragmento);
            btnAnterior.disabled = paginaAtual === 1;
            btnProxima.disabled = paginaAtual === PAGINAS;
        }

        function irParaPagina(p) {
            paginaAtual = Math.min(Math.max(p, 1), PAGINAS);
            renderLinhas();
            renderPaginacao();
        }

        listaPaginas.addEventListener('click', (e) => {
            const botao = e.target.closest('[data-pagina]');
            if (botao) irParaPagina(Number(botao.dataset.pagina));
        });
        btnAnterior.addEventListener('click', () => irParaPagina(paginaAtual - 1));
        btnProxima.addEventListener('click', () => irParaPagina(paginaAtual + 1));

        function renderUltima() {
            const m = movimentacoes[0];
            $('ultimaIconeWrap').classList.add(m.cor);
            usarIcone($('ultimaIcone'), m.icone);
            $('ultimaAtivo').textContent = m.ativo;
            $('ultimaCategoria').textContent = m.categoria;
            $('ultimaValor').textContent = moeda(m.valor);
            $('ultimaCliente').textContent = m.cliente;
            $('ultimaResponsavel').textContent = m.responsavel;
            $('ultimaTipoWrap').classList.add(m.tipo);
            usarIcone($('ultimaTipoIcone'), tipos[m.tipo].icone);
            $('ultimaTipo').textContent = tipos[m.tipo].rotulo;
        }

        // Exportar relatório
        document.querySelectorAll('[data-exportar="movimentacoes"]').forEach((botao) => {
            botao.dataset.exportarLigado = '1';
            botao.addEventListener('click', () => {
                const total = movimentacoes.reduce((soma, m) => soma + m.valor, 0);

                const linhas = [
                    ['Movimentações recentes'],
                    ['Gerado em', dataHoraBR(new Date())],
                    [],
                    ['Ativo', 'Categoria', 'Data', 'Tipo', 'Valor (R$)']
                ];
                movimentacoes.forEach((m) => linhas.push([
                    m.ativo,
                    m.categoria,
                    dataBR(m.data),
                    tipos[m.tipo].rotulo,
                    m.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                ]));
                linhas.push([]);
                linhas.push(['Total', '', '', '', total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })]);

                baixarCSV('movimentacoes', linhas);
            });
        });

        // Menu lateral recolhível (usa toggleSidebar() do topo do arquivo)
        if (btn) btn.addEventListener('click', toggleSidebar);

        $('movTotal').textContent = TOTAL;
        renderLinhas();
        renderPaginacao();
        renderUltima();
    }

    // =========================================================
    // 7. EXPORTAR RELATÓRIO EM TODAS AS PÁGINAS
    // =========================================================
    document.querySelectorAll('[data-exportar], .btn-pink-solid').forEach((botao) => {
        const ehExportar = botao.hasAttribute('data-exportar') || /exportar/i.test(botao.textContent);
        if (!ehExportar || botao.dataset.exportarLigado) return;
        botao.dataset.exportarLigado = '1';

        botao.addEventListener('click', () => {
            let titulo;
            let linhas;

            if (botao.dataset.exportarTabela) {
                const tabela = $(botao.dataset.exportarTabela);
                titulo = (tabela && tabela.dataset.titulo) || document.title;
                linhas = tabela ? montarRelatorio(titulo, [blocoDaTabela(tabela)]) : [];
            } else {
                const relatorio = relatorioDaPagina();
                titulo = relatorio.titulo;
                linhas = relatorio.linhas;
            }

            // só cabeçalho (título + "Gerado em") = nada para exportar
            if (linhas.length <= 2) {
                alert('Não há dados para exportar nesta página.');
                return;
            }
            baixarCSV(slug(titulo), linhas);
        });
    });

    // =========================================================
    // 8. INVESTIMENTOS: ATIVOS, FILTROS, PAGINAÇÃO E CALCULADORAS
    // =========================================================
    const tbodyInvest = $('tabelaAtivosInvest');
    if (tbodyInvest) {
        const TOTAL_ATIVOS = 32;
        const POR_PAGINA_INV = 8;
        const PAGINAS_INV = Math.ceil(TOTAL_ATIVOS / POR_PAGINA_INV);

        const ativosBase = [
            { nome: 'Tesouro IPCA+ 2035', sub: 'Tesouro Direto · IPCA + 6,10% a.a.', cat: 'Renda fixa', valor: 840200, rent: 8.42, liquidez: 'D+1', cor: 't-pink', icone: 'bank' },
            { nome: 'Fundo Aurora Macro', sub: 'Aurora Asset · Multimercado', cat: 'Fundos', valor: 524900, rent: 12.18, liquidez: 'D+30', cor: 't-lilac', icone: 'layers' },
            { nome: 'PETR4', sub: 'Petrobras · Preferencial', cat: 'Ações', valor: 318400, rent: 4.76, liquidez: 'D+2', cor: 't-pink', icone: 'trend' },
            { nome: 'CDB Banco Prisma', sub: 'Banco Prisma · 112% do CDI', cat: 'Renda fixa', valor: 286000, rent: 6.91, liquidez: 'Diária', cor: 't-pink', icone: 'bank' },
            { nome: 'Tesouro Prefixado 2029', sub: 'Tesouro Direto · Prefixado', cat: 'Renda fixa', valor: 245600, rent: 7.24, liquidez: 'D+1', cor: 't-pink', icone: 'bank' },
            { nome: 'Fundo Horizonte Crédito', sub: 'Horizonte Asset · Crédito privado', cat: 'Fundos', valor: 218300, rent: 9.15, liquidez: 'D+15', cor: 't-lilac', icone: 'layers' },
            { nome: 'VALE3', sub: 'Vale · Ordinária', cat: 'Ações', valor: 186400, rent: -1.28, liquidez: 'D+2', cor: 't-pink', icone: 'trend' },
            { nome: 'ITUB4', sub: 'Itaú Unibanco · Preferencial', cat: 'Ações', valor: 148700, rent: 6.32, liquidez: 'D+2', cor: 't-pink', icone: 'trend' }
        ];

        const iconesSvg = {
            bank: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>`,
            layers: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
            trend: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>`
        };

        const buscaInput = $('buscaAtivo');
        const liquidezSelect = $('filtroLiquidez');
        const catTabs = document.querySelectorAll('#categoriaTabs .tab');
        const vazioBox = $('vazioAtivosInvest');
        const paginasBox = $('investPaginas');
        const btnAnt = $('investAnterior');
        const btnProx = $('investProxima');

        let catAtual = 'todos';
        let pagAtual = 1;

        const moedaInteira = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
        const norm = (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

        function formatarRent(r) {
            const sinal = r >= 0 ? '+' : '−';
            const abs = Math.abs(r).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            return `${sinal}${abs}%`;
        }

        function filtrarAtivos() {
            const termo = norm(buscaInput.value.trim());
            const liq = liquidezSelect.value;

            return ativosBase.filter((a) =>
                (catAtual === 'todos' || a.cat === catAtual) &&
                (liq === 'todas' || a.liquidez === liq) &&
                (!termo || norm(a.nome).includes(termo) || norm(a.sub).includes(termo))
            );
        }

        function renderTabelaInvest() {
            const lista = filtrarAtivos();

            tbodyInvest.innerHTML = lista.map((a) => `
                <tr>
                    <td>
                        <div class="asset-cell">
                            <span class="asset-icon ${a.cor}">${iconesSvg[a.icone]}</span>
                            <div>
                                <strong>${a.nome}</strong>
                                <small>${a.sub}</small>
                            </div>
                        </div>
                    </td>
                    <td>${a.cat}</td>
                    <td class="mov-value">${moedaInteira(a.valor)}</td>
                    <td class="${a.rent >= 0 ? 'rent-positive' : 'rent-negative'}">${formatarRent(a.rent)}</td>
                    <td>${a.liquidez}</td>
                    <td><span class="inv-badge-carteira">Em carteira</span></td>
                </tr>
            `).join('');

            vazioBox.hidden = lista.length > 0;
            const ini = (pagAtual - 1) * POR_PAGINA_INV + 1;
            const fim = Math.min(pagAtual * POR_PAGINA_INV, TOTAL_ATIVOS);
            $('investIntervalo').textContent = lista.length === ativosBase.length
                ? `Exibindo ${ini}–${fim} de ${TOTAL_ATIVOS} ativos`
                : `Exibindo ${lista.length} ativo(s) filtrado(s)`;
        }

        function renderPaginacaoInvest() {
            const itens = [1, 2];
            paginasBox.innerHTML = itens.map((p) => `
                <button type="button" class="mov-page ${p === pagAtual ? 'active' : ''}" data-inv-pag="${p}">${p}</button>
            `).join('');
            btnAnt.disabled = pagAtual === 1;
            btnProx.disabled = pagAtual === PAGINAS_INV;
        }

        catTabs.forEach((t) => {
            t.addEventListener('click', () => {
                catTabs.forEach((b) => b.classList.remove('active'));
                t.classList.add('active');
                catAtual = t.dataset.cat;
                renderTabelaInvest();
            });
        });

        buscaInput.addEventListener('input', renderTabelaInvest);
        liquidezSelect.addEventListener('change', renderTabelaInvest);

        paginasBox.addEventListener('click', (e) => {
            const b = e.target.closest('[data-inv-pag]');
            if (!b) return;
            pagAtual = Number(b.dataset.invPag);
            renderTabelaInvest();
            renderPaginacaoInvest();
        });

        btnAnt.addEventListener('click', () => {
            if (pagAtual > 1) {
                pagAtual--;
                renderTabelaInvest();
                renderPaginacaoInvest();
            }
        });

        btnProx.addEventListener('click', () => {
            if (pagAtual < PAGINAS_INV) {
                pagAtual++;
                renderTabelaInvest();
                renderPaginacaoInvest();
            }
        });

        renderTabelaInvest();
        renderPaginacaoInvest();

        // --- CALCULADORA 1: RENDIMENTO E PRAZO ---
        const parseMoedaBR = (str) => {
            const limpo = String(str || '').replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
            const n = parseFloat(limpo);
            return Number.isFinite(n) ? n : 0;
        };

        const formatarBRL = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        let unidadePrazo = 'meses';
        const inputCap = $('calcCapital');
        const inputAporte = $('calcAporte');
        const inputTaxa = $('calcTaxa');
        const inputPrazo = $('calcPrazo');

        function atualizarRendimento() {
            const capital = Math.max(0, parseMoedaBR(inputCap.value));
            const aporte = Math.max(0, parseMoedaBR(inputAporte.value));
            const taxaAnual = Math.max(0, parseMoedaBR(inputTaxa.value)) / 100;
            const qtd = Math.max(0, parseInt(inputPrazo.value, 10) || 0);
            const meses = unidadePrazo === 'anos' ? qtd * 12 : qtd;

            const taxaMensal = Math.pow(1 + taxaAnual, 1 / 12) - 1;
            let montante = capital;
            for (let m = 0; m < meses; m++) {
                montante = montante * (1 + taxaMensal) + aporte;
            }

            const totalInvestido = capital + aporte * meses;
            const juros = Math.max(0, montante - totalInvestido);

            $('resAcumulado').textContent = formatarBRL(montante);
            $('resResumo').textContent = juros > 0
                ? `Prazo de ${meses} meses · +${formatarBRL(juros)} em rendimentos`
                : `Prazo de ${meses} meses · sem rendimentos no período`;

            // Atualiza curva do SVG conforme rendimento
            const yFinal = meses === 0 || montante === 0 ? 102 : Math.max(14, Math.round(102 - Math.min(86, (juros / Math.max(montante, 1)) * 140 + 22)));
            const yMeio = Math.round((105 + yFinal) / 2 + 8);
            $('svgLinhaProj').setAttribute('d', `M 4 105 Q 140 ${yMeio} 254 ${yFinal}`);
            $('svgAreaProj').setAttribute('d', `M 4 105 Q 140 ${yMeio} 254 ${yFinal} L 254 105 Z`);
            $('svgPontoFinal').setAttribute('cy', String(yFinal));
        }

        document.querySelectorAll('#prazoUnidadeToggle button').forEach((btnUnit) => {
            btnUnit.addEventListener('click', () => {
                document.querySelectorAll('#prazoUnidadeToggle button').forEach((b) => b.classList.remove('active'));
                btnUnit.classList.add('active');
                unidadePrazo = btnUnit.dataset.unit;
                $('prazoSufixo').textContent = unidadePrazo;
                atualizarRendimento();
            });
        });

        [inputCap, inputAporte, inputTaxa, inputPrazo].forEach((inp) => {
            inp.addEventListener('input', atualizarRendimento);
        });
        atualizarRendimento();

        // --- CALCULADORA 2: ROLAGEM DE POSICIONAMENTO ---
        function atualizarRolagem() {
            const pAtual = parseMoedaBR($('rolPrecoAtual').value);
            const pAlvo = parseMoedaBR($('rolPrecoAlvo').value);
            const aporte = Math.max(0, parseMoedaBR($('rolAporte').value));
            const unidades = 1000;

            const retornoPct = pAtual > 0 ? ((pAlvo - pAtual) / pAtual) * 100 : 0;
            const novoMedio = pAtual + (aporte / unidades);

            const sinal = retornoPct >= 0 ? '+' : '−';
            const elRet = $('rolRetorno');
            elRet.textContent = `${sinal}${Math.abs(retornoPct).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
            elRet.className = retornoPct >= 0 ? 'rent-positive' : 'rent-negative';
            $('rolPrecoMedio').textContent = formatarBRL(novoMedio);
        }

        ['rolPrecoAtual', 'rolPrecoAlvo', 'rolAporte'].forEach((id) => {
            $(id).addEventListener('input', atualizarRolagem);
        });
        $('btnCalcularRolagem').addEventListener('click', atualizarRolagem);
        atualizarRolagem();
    }
});

/* === LÓGICA DA PÁGINA DE RELATÓRIOS === */
document.addEventListener('DOMContentLoaded', () => {
    const relRoot = document.getElementById('relatorios-root');
    if (!relRoot) return;

    const TIPOS = ['Consolidado de investimentos', 'Desempenho da carteira', 'Movimentações do período', 'Composição por classe'];
    const CLIENTES = ['Todos os clientes', 'Ana Luiza Martins', 'Bernardo Oliveira', 'Camila Freire', 'Diego Nascimento', 'Elisa Montenegro', 'Felipe Santoro'];
    const CARTEIRAS = ['Carteira consolidada', 'Renda fixa', 'Fundos', 'Ações'];
    const ROTULOS = { concluido: 'Concluído', processando: 'Em processamento' };
    const BADGE = { concluido: 'ativo', processando: 'analise' };

    let relatorios = [
        { id: 7, tipo: TIPOS[0], sub: 'Todos os clientes · Carteira consolidada', data: '28/09/2026 18:02', status: 'concluido', fmt: 'PDF' },
        { id: 6, tipo: TIPOS[1], sub: 'Ana Luiza Martins · Renda fixa', data: '26/09/2026 17:15', status: 'concluido', fmt: 'PDF' },
        { id: 5, tipo: TIPOS[2], sub: 'Todos os clientes · Carteira consolidada', data: '26/09/2026 15:10', status: 'concluido', fmt: 'XLSX' },
        { id: 4, tipo: TIPOS[3], sub: 'Bernardo Oliveira · Fundos', data: '25/09/2026 10:08', status: 'concluido', fmt: 'PDF' },
        { id: 3, tipo: TIPOS[1], sub: 'Camila Freire · Carteira consolidada', data: '24/09/2026 14:20', status: 'concluido', fmt: 'PDF' },
        { id: 2, tipo: TIPOS[0], sub: 'Todos os clientes · Carteira consolidada', data: '15/09/2026 09:10', status: 'concluido', fmt: 'PDF' },
        { id: 1, tipo: TIPOS[2], sub: 'Diego Nascimento · Ações', data: '10/09/2026 11:45', status: 'concluido', fmt: 'XLSX' }
    ];

    let tela = location.hash === '#gerar' ? 'gerar' : 'lista';
    let filtroBusca = '';
    let filtroStatus = 'todos';
    let filtroTipo = 'todos';
    let toastTimer = null;

    const pad = (n) => String(n).padStart(2, '0');
    const dataBR = (iso) => iso.split('-').reverse().join('/');
    const agora = () => {
        const d = new Date();
        return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };
    const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-');

    const toastEl = document.createElement('div');
    toastEl.className = 'rel-toast';
    toastEl.setAttribute('role', 'status');
    document.body.appendChild(toastEl);

    function avisar(msg) {
        toastEl.textContent = msg;
        toastEl.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
    }

    function baixar(r) {
        const linhas = [['Relatório', r.tipo], ['Abrangência', r.sub], ['Gerado em', r.data], ['Solicitante', 'Marina Costa']];
        if (r.fmt === 'XLSX') {
            const csv = '\uFEFF' + linhas.map((l) => l.join(';')).join('\n');
            const a = document.createElement('a');
            a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
            a.download = slug(r.tipo) + '.csv';
            a.click();
            setTimeout(() => URL.revokeObjectURL(a.href), 1000);
            return;
        }
        const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>${r.tipo}</title>
            <style>body{font-family:Inter,Arial,sans-serif;padding:40px;color:#1B0B2E}h1{margin:0 0 4px}td{padding:8px 16px 8px 0}</style></head>
            <body><h1>${r.tipo}</h1><p>NEXUS · Aurora Wealth</p><table>
            ${linhas.map((l) => `<tr><td><strong>${l[0]}</strong></td><td>${l[1]}</td></tr>`).join('')}
            </table><script>window.onload=()=>window.print()<\/script></body></html>`;
        const w = window.open('', '_blank');
        if (w) { w.document.write(html); w.document.close(); }
        else avisar('Libere os pop-ups para abrir o PDF.');
    }

    function atualizarBreadcrumb() {
        const crumb = document.getElementById('breadcrumb-title');
        if (crumb) crumb.textContent = tela === 'gerar' ? 'Gerar relatório' : 'Relatórios';
        window.scrollTo({ top: 0 });
    }

    function atualizarTabela() {
        const tbody = document.getElementById('rel-tbody');
        const vazio = document.getElementById('rel-empty');
        if (!tbody) return;

        const filtrados = relatorios.filter((r) =>
            (filtroStatus === 'todos' || r.status === filtroStatus) &&
            (filtroTipo === 'todos' || r.tipo === filtroTipo) &&
            (r.tipo + ' ' + r.sub).toLowerCase().includes(filtroBusca.trim().toLowerCase())
        );

        tbody.innerHTML = filtrados.map((r) => `
            <tr>
                <td><strong>${r.tipo}</strong><br /><small class="sub-text-dark">${r.sub}</small></td>
                <td>${r.tipo}</td>
                <td>${r.data}</td>
                <td><span class="status-badge ${BADGE[r.status]}">${ROTULOS[r.status]}</span></td>
                <td>${r.fmt}</td>
                <td>
                    <button type="button" class="icon-act" data-baixar="${r.id}" ${r.status === 'processando' ? 'disabled' : ''}>Baixar</button>
                </td>
            </tr>
        `).join('');

        vazio.style.display = filtrados.length === 0 ? 'block' : 'none';

        tbody.querySelectorAll('[data-baixar]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const item = relatorios.find((x) => x.id === Number(btn.dataset.baixar));
                if (item) baixar(item);
            });
        });
    }

    function renderLista() {
        const prontos = relatorios.filter((r) => r.status === 'concluido').length;
        const proc = relatorios.length - prontos;
        const abas = [['todos', 'Todos'], ['concluido', 'Concluídos'], ['processando', 'Processando']];

        relRoot.innerHTML = `
            <section class="app-screen active">
                <div class="content-wrapper">
                    <div class="page-title-row">
                        <div>
                            <h1>Relatórios</h1>
                            <p class="section-desc">Gere, consulte e compartilhe os resultados dos investimentos.</p>
                        </div>
                        <button class="btn-pink-solid" id="btnNovoRelatorio">+ Novo relatório</button>
                    </div>

                    <div class="metrics-cards-grid" style="grid-template-columns: repeat(3, 1fr)">
                        <div class="metric-card-dark">
                            <span class="card-label-light">Histórico no período</span>
                            <div class="metric-value-white">${pad(relatorios.length)}</div>
                        </div>
                        <div class="metric-card-light">
                            <span class="card-label-dark">Prontos p/ download</span>
                            <div class="metric-value-dark">${pad(prontos)}</div>
                        </div>
                        <div class="metric-card-light">
                            <span class="card-label-dark">Em processamento</span>
                            <div class="metric-value-dark">${pad(proc)}</div>
                        </div>
                    </div>

                    <div class="toolbar-row">
                        <label class="search-box">
                            <input type="text" id="relBusca" placeholder="Buscar relatório ou cliente" autocomplete="off" value="${filtroBusca}" />
                        </label>
                        <div class="tabs-pill" id="relTabs">
                            ${abas.map(([v, nome]) => `<button class="tab ${filtroStatus === v ? 'active' : ''}" data-status="${v}">${nome}</button>`).join('')}
                        </div>
                        <div class="select-wrapper">
                            <select id="relFiltroTipo" aria-label="Filtrar por tipo">
                                <option value="todos">Todos os tipos</option>
                                ${TIPOS.map((t) => `<option value="${t}" ${filtroTipo === t ? 'selected' : ''}>${t}</option>`).join('')}
                            </select>
                        </div>
                    </div>

                    <div class="positions-table-box v2">
                        <div class="table-header-row">
                            <div>
                                <h3>Histórico de relatórios</h3>
                                <span class="sub-text-dark">Relatórios gerados na sua conta, do mais recente ao mais antigo.</span>
                            </div>
                        </div>
                        <div class="table-responsive">
                            <table class="positions-table">
                                <thead>
                                    <tr><th>RELATÓRIO</th><th>TIPO</th><th>GERADO EM</th><th>STATUS</th><th>FORMATO</th><th>AÇÕES</th></tr>
                                </thead>
                                <tbody id="rel-tbody"></tbody>
                            </table>
                            <p class="empty-state" id="rel-empty" style="display:none">Nenhum relatório encontrado com esses filtros.</p>
                        </div>
                    </div>
                </div>
            </section>
        `;

        document.getElementById('btnNovoRelatorio').addEventListener('click', () => {
            tela = 'gerar';
            render();
        });

        document.getElementById('relBusca').addEventListener('input', (e) => {
            filtroBusca = e.target.value;
            atualizarTabela();
        });

        document.querySelectorAll('#relTabs .tab').forEach((tab) => {
            tab.addEventListener('click', () => {
                filtroStatus = tab.dataset.status;
                document.querySelectorAll('#relTabs .tab').forEach((t) => t.classList.remove('active'));
                tab.classList.add('active');
                atualizarTabela();
            });
        });

        document.getElementById('relFiltroTipo').addEventListener('change', (e) => {
            filtroTipo = e.target.value;
            atualizarTabela();
        });

        atualizarTabela();
    }

    function renderGerar() {
        const form = {
            tipo: TIPOS[0], cliente: CLIENTES[0], carteira: CARTEIRAS[0],
            inicio: '2026-09-01', fim: '2026-09-30', fmt: 'PDF', detalhe: true
        };

        relRoot.innerHTML = `
            <section class="app-screen active">
                <div class="content-wrapper">
                    <div class="page-title-row">
                        <div>
                            <h1>Gerar relatório</h1>
                            <p class="section-desc">Personalize os dados e prepare um novo relatório de investimentos.</p>
                        </div>
                        <button class="date-filter" id="btnVoltarRel">Voltar para relatórios</button>
                    </div>

                    <div class="rel-grid">
                        <div>
                            <div class="rel-card">
                                <h3>Configuração do relatório</h3>
                                <span class="sub-text-dark">Defina o conteúdo e a abrangência do documento.</span>
                                <div class="rel-fields">
                                    <div class="full">
                                        <label for="relTipo">Tipo de relatório *</label>
                                        <select id="relTipo">${TIPOS.map((t) => `<option>${t}</option>`).join('')}</select>
                                    </div>
                                    <div>
                                        <label for="relCliente">Cliente *</label>
                                        <select id="relCliente">${CLIENTES.map((c) => `<option>${c}</option>`).join('')}</select>
                                    </div>
                                    <div>
                                        <label for="relCarteira">Carteira *</label>
                                        <select id="relCarteira">${CARTEIRAS.map((c) => `<option>${c}</option>`).join('')}</select>
                                    </div>
                                </div>
                            </div>

                            <div class="rel-card">
                                <h3>Período e formato</h3>
                                <span class="sub-text-dark">Escolha o intervalo de análise e o formato do arquivo.</span>
                                <div class="rel-fields">
                                    <div>
                                        <label for="relInicio">Data inicial *</label>
                                        <input type="date" id="relInicio" value="${form.inicio}" />
                                    </div>
                                    <div>
                                        <label for="relFim">Data final *</label>
                                        <input type="date" id="relFim" value="${form.fim}" />
                                    </div>
                                    <div class="full fmt-opts">
                                        <label class="fmt-opt">
                                            <input type="radio" name="relFmt" value="PDF" checked />
                                            <span><strong>PDF</strong><br /><small>Pronto para apresentação</small></span>
                                        </label>
                                        <label class="fmt-opt">
                                            <input type="radio" name="relFmt" value="XLSX" />
                                            <span><strong>XLSX</strong><br /><small>Dados para planilha</small></span>
                                        </label>
                                    </div>
                                    <label class="full">
                                        <input type="checkbox" id="relDetalhe" checked /> Incluir detalhamento de ativos e notas metodológicas
                                    </label>
                                </div>
                                <div class="rel-erro" id="relErro" role="alert"></div>
                            </div>
                        </div>

                        <aside>
                            <div class="rel-resumo">
                                <h3>Resumo do relatório</h3>
                                <dl>
                                    <dt>Relatório</dt><dd id="resTipo">${form.tipo}</dd>
                                    <dt>Abrangência</dt><dd id="resAbrangencia">${form.cliente} · ${form.carteira}</dd>
                                    <dt>Período</dt><dd id="resPeriodo">${dataBR(form.inicio)} a ${dataBR(form.fim)}</dd>
                                    <dt>Formato</dt><dd id="resFormato">PDF · Com detalhamento</dd>
                                    <dt>Solicitante</dt><dd>Marina Costa</dd>
                                </dl>
                            </div>
                            <div class="rel-actions">
                                <button class="date-filter" id="btnCancelarRel">Cancelar</button>
                                <button class="btn-pink-solid" id="btnConfirmarRel">Confirmar e gerar</button>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>
        `;

        function atualizarResumo() {
            form.tipo = document.getElementById('relTipo').value;
            form.cliente = document.getElementById('relCliente').value;
            form.carteira = document.getElementById('relCarteira').value;
            form.inicio = document.getElementById('relInicio').value;
            form.fim = document.getElementById('relFim').value;
            form.fmt = document.querySelector('input[name="relFmt"]:checked').value;
            form.detalhe = document.getElementById('relDetalhe').checked;

            document.getElementById('resTipo').textContent = form.tipo;
            document.getElementById('resAbrangencia').textContent = `${form.cliente} · ${form.carteira}`;
            document.getElementById('resPeriodo').textContent = form.inicio && form.fim ? `${dataBR(form.inicio)} a ${dataBR(form.fim)}` : '—';
            document.getElementById('resFormato').textContent = `${form.fmt}${form.detalhe ? ' · Com detalhamento' : ''}`;
        }

        ['relTipo', 'relCliente', 'relCarteira', 'relInicio', 'relFim', 'relDetalhe'].forEach((id) => {
            document.getElementById(id).addEventListener('change', atualizarResumo);
        });
        document.querySelectorAll('input[name="relFmt"]').forEach((r) => r.addEventListener('change', atualizarResumo));

        const voltar = () => { tela = 'lista'; render(); };
        document.getElementById('btnVoltarRel').addEventListener('click', voltar);
        document.getElementById('btnCancelarRel').addEventListener('click', voltar);

        document.getElementById('btnConfirmarRel').addEventListener('click', () => {
            const erroEl = document.getElementById('relErro');
            if (!form.inicio || !form.fim) {
                erroEl.textContent = 'Preencha a data inicial e a data final.';
                return;
            }
            if (form.inicio > form.fim) {
                erroEl.textContent = 'A data inicial não pode ser depois da data final.';
                return;
            }
            erroEl.textContent = '';

            const novo = {
                id: Math.max(...relatorios.map((r) => r.id)) + 1,
                tipo: form.tipo,
                sub: `${form.cliente} · ${form.carteira}`,
                data: agora(),
                status: 'processando',
                fmt: form.fmt
            };
            relatorios = [novo, ...relatorios];
            tela = 'lista';
            render();
            avisar('Gerando relatório...');

            setTimeout(() => {
                relatorios = relatorios.map((r) => r.id === novo.id ? { ...r, status: 'concluido' } : r);
                if (tela === 'lista') renderLista();
                avisar('Relatório pronto! Clique em Baixar.');
            }, 1800);
        });
    }

    function render() {
        atualizarBreadcrumb();
        if (tela === 'gerar') renderGerar();
        else renderLista();
    }

    const sair = document.getElementById('btnLogout');
    if (sair) sair.addEventListener('click', () => { window.location.href = 'index.html'; });

    render();
});


