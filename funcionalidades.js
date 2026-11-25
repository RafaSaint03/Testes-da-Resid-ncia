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

        let statusAtual = 'todas';
        let inicio = new Date(2026, 8, 1);
        let fim = new Date(2026, 8, 30);

        const pad = (n) => String(n).padStart(2, '0');
        const moeda = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
        const normaliza = (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

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
});
