// Central de ajuda: busca, filtros do FAQ e formulário de contato.
// Ainda não há back-end: o envio da mensagem é simulado.

document.addEventListener('DOMContentLoaded', () => {
    const $ = (id) => document.getElementById(id);

    // ---------- Botão "Voltar" ----------
    const btnVoltar = $('btnVoltar');
    if (btnVoltar) {
        btnVoltar.addEventListener('click', (e) => {
            if (window.history.length > 1) {
                e.preventDefault();
                window.history.back();
            }
            // sem histórico: segue o link normal (login.html)
        });
    }

    // ---------- FAQ: busca + filtro por categoria ----------
    const itens = Array.from(document.querySelectorAll('.faq-item'));
    const chips = Array.from(document.querySelectorAll('.help-chip'));
    const busca = $('buscaAjuda');
    const vazio = $('faqVazio');
    const contador = $('faqContador');
    let categoria = 'todos';

    const normalizar = (texto) =>
        texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

    itens.forEach((item) => {
        item.dataset.texto = normalizar(item.textContent);
    });

    function filtrar() {
        const palavras = normalizar(busca.value.trim()).split(/\s+/).filter(Boolean);
        let visiveis = 0;

        itens.forEach((item) => {
            const okCategoria = categoria === 'todos' || item.dataset.cat === categoria;
            const okBusca = palavras.every((p) => item.dataset.texto.includes(p));
            const mostrar = okCategoria && okBusca;
            item.hidden = !mostrar;
            if (mostrar) visiveis++;
        });

        vazio.hidden = visiveis !== 0;
        contador.textContent = visiveis === 1 ? '1 resultado' : `${visiveis} resultados`;
    }

    chips.forEach((chip) => {
        chip.addEventListener('click', () => {
            categoria = chip.dataset.cat;
            chips.forEach((c) => {
                const ativo = c === chip;
                c.classList.toggle('active', ativo);
                c.setAttribute('aria-pressed', ativo ? 'true' : 'false');
            });
            filtrar();
        });
    });

    busca.addEventListener('input', filtrar);

    $('formBusca').addEventListener('submit', (e) => {
        e.preventDefault();
        filtrar();
        $('duvidas').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // Abre direto uma pergunta quando o endereço vem com #faq-...
    function abrirPeloEndereco() {
        if (!window.location.hash.startsWith('#faq-')) return;
        const alvo = document.querySelector(window.location.hash);
        if (alvo && alvo.tagName === 'DETAILS') {
            // garante que a pergunta não esteja escondida por um filtro
            busca.value = '';
            categoria = 'todos';
            chips.forEach((c) => {
                const ativo = c.dataset.cat === 'todos';
                c.classList.toggle('active', ativo);
                c.setAttribute('aria-pressed', ativo ? 'true' : 'false');
            });
            filtrar();
            alvo.open = true;
            alvo.scrollIntoView({ block: 'center' });
        }
    }

    filtrar();
    abrirPeloEndereco();
    window.addEventListener('hashchange', abrirPeloEndereco);

    // ---------- Formulário de contato ----------
    const form = $('formContato');

    function mostrarErro(id, mensagem) {
        const campo = $(id);
        const erro = $('erro-' + id);
        campo.closest('.input-field-wrapper').classList.add('invalid');
        erro.textContent = mensagem;
        erro.classList.add('visible');
    }

    function limparErro(id) {
        const campo = $(id);
        const erro = $('erro-' + id);
        campo.closest('.input-field-wrapper').classList.remove('invalid');
        erro.textContent = '';
        erro.classList.remove('visible');
    }

    ['contatoNome', 'contatoEmail', 'contatoAssunto', 'contatoMensagem'].forEach((id) => {
        $(id).addEventListener('input', () => limparErro(id));
        $(id).addEventListener('change', () => limparErro(id));
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let valido = true;

        const nome = $('contatoNome').value.trim();
        const email = $('contatoEmail').value.trim();
        const assunto = $('contatoAssunto').value;
        const mensagem = $('contatoMensagem').value.trim();

        if (nome.length < 3) {
            mostrarErro('contatoNome', 'Informe seu nome.');
            valido = false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
            mostrarErro('contatoEmail', 'Informe um e-mail válido.');
            valido = false;
        }
        if (!assunto) {
            mostrarErro('contatoAssunto', 'Escolha um assunto.');
            valido = false;
        }
        if (mensagem.length < 10) {
            mostrarErro('contatoMensagem', 'Conte um pouco mais (mínimo de 10 caracteres).');
            valido = false;
        }

        if (!valido) {
            const primeiro = form.querySelector('.invalid input, .invalid select, .invalid textarea');
            if (primeiro) primeiro.focus();
            return;
        }

        // Simulação: aqui entraria a chamada ao back-end
        $('contatoEmailEnviado').textContent = email;
        $('contatoFormWrap').hidden = true;
        $('contatoSucesso').classList.add('visible');
    });

    $('btnNovaMensagem').addEventListener('click', () => {
        form.reset();
        $('contatoSucesso').classList.remove('visible');
        $('contatoFormWrap').hidden = false;
        $('contatoNome').focus();
    });
});
