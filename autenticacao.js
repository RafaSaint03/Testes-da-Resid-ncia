// Scripts das telas "Criar conta" e "Esqueci minha senha"
// Ainda não há back-end: o envio é simulado, só para demonstrar o fluxo.

document.addEventListener('DOMContentLoaded', () => {

    // ---------- Utilitários ----------
    const $ = (id) => document.getElementById(id);

    function mostrarErro(campoId, mensagem) {
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

    function limparErro(campoId) {
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

    // Limpa o erro assim que a pessoa volta a digitar
    document.querySelectorAll('.auth-form input').forEach((input) => {
        input.addEventListener('input', () => limparErro(input.id));
        input.addEventListener('change', () => limparErro(input.id));
    });

    // ---------- Mostrar/ocultar senha ----------
    document.querySelectorAll('.eye-btn[data-target]').forEach((botao) => {
        botao.addEventListener('click', () => {
            const campo = $(botao.dataset.target);
            if (!campo) return;
            const mostrar = campo.type === 'password';
            campo.type = mostrar ? 'text' : 'password';
            botao.textContent = mostrar ? '👁️‍🗨️' : '👁️';
        });
    });

    // ---------- Máscaras (CPF e celular) ----------
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

    // ---------- Força da senha ----------
    const senha = $('senha');
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

    if (senha && barras && textoForca) {
        const rotulos = [
            'Use 8 ou mais caracteres, com letras, números e símbolos.',
            'Senha fraca',
            'Senha razoável',
            'Senha boa',
            'Senha forte'
        ];

        senha.addEventListener('input', () => {
            const nivel = calcularForca(senha.value);
            barras.className = 'strength-bars' + (nivel ? ' level-' + nivel : '');
            textoForca.textContent = rotulos[nivel];
        });
    }

    // ---------- Formulário: criar conta ----------
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
                mostrarErro('nome', 'Informe seu nome completo.');
                valido = false;
            }
            if (!emailValido(email)) {
                mostrarErro('email', 'Informe um e-mail válido.');
                valido = false;
            }
            if (!cpfValido(cpf)) {
                mostrarErro('cpf', 'CPF inválido.');
                valido = false;
            }
            if (celular.length < 10) {
                mostrarErro('celular', 'Informe um celular com DDD.');
                valido = false;
            }
            if (calcularForca(valorSenha) < 3 || valorSenha.length < 8) {
                mostrarErro('senha', 'Use 8+ caracteres, misturando letras, números ou símbolos.');
                valido = false;
            }
            if (confirmar !== valorSenha || confirmar === '') {
                mostrarErro('confirmarSenha', 'As senhas não coincidem.');
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

            // Simulação: aqui entraria a chamada ao back-end
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

    // ---------- Formulário: esqueci minha senha ----------
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
                mostrarErro('emailRecuperacao', 'Informe um e-mail válido.');
                $('emailRecuperacao').focus();
                return;
            }

            // Simulação: aqui entraria a chamada ao back-end
            $('emailEnviado').textContent = email;
            $('esqueciConteudo').style.display = 'none';
            $('esqueciSucesso').classList.add('visible');
            iniciarEspera(30);
        });

        btnReenviar.addEventListener('click', () => {
            // Simulação de novo envio
            iniciarEspera(30);
        });
    }
});
