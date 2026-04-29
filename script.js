// ==========================================
// 1. "BANCO DE DADOS" DO ECO KIDS (CAA DATA)
// ==========================================
// Estrutura complexa organizando categorias e itens.
// Cores pastéis baseadas na simbologia TEA.

const dadosCAA = {
    categorias: [
        { id: 'estruturante', nome: 'Básicos', icone: '🧠', cor: 'var(--pastel-blue)' },
        { id: 'alimentacao', nome: 'Alimentação', icone: '🍎', cor: 'var(--pastel-green)' },
        { id: 'rotina', nome: 'Rotina e Higiene', icone: '🧻', cor: 'var(--pastel-yellow)' },
        { id: 'sentimentos', nome: 'Sentimentos', icone: '😊', cor: 'var(--pastel-pink)' }
    ],
    itens: [
        // --- CATEGORIA: BÁSICOS ---
        { id: 'eu_quero', categoria: 'estruturante', nome: 'Eu Quero', fala: 'Eu quero', emoji: '👈' },
        { id: 'sim', categoria: 'estruturante', nome: 'Sim', fala: 'Sim', emoji: '✅' },
        { id: 'nao', categoria: 'estruturante', nome: 'Não', fala: 'Não', emoji: '❌' },
        { id: 'ajuda', categoria: 'estruturante', nome: 'Ajuda', fala: 'Me ajuda', emoji: '🆘' },
        
        // --- CATEGORIA: ALIMENTAÇÃO ---
        { id: 'comer', categoria: 'alimentacao', nome: 'Comer', fala: 'Comer', emoji: '🍽️' },
        { id: 'beber', categoria: 'alimentacao', nome: 'Beber', fala: 'Beber água', emoji: '💧' },
        { id: 'maca', categoria: 'alimentacao', nome: 'Maçã', fala: 'Maçã', emoji: '🍎' },
        { id: 'pao', categoria: 'alimentacao', nome: 'Pão', fala: 'Pão', emoji: '🍞' },
        { id: 'leite', categoria: 'alimentacao', nome: 'Leite', fala: 'Leite', emoji: '🥛' },

        // --- CATEGORIA: ROTINA ---
        { id: 'banheiro', categoria: 'rotina', nome: 'Banheiro', fala: 'Ir ao banheiro', emoji: '🧻' },
        { id: 'sono', categoria: 'rotina', nome: 'Sono', fala: 'Estou com sono', emoji: '😴' },
        { id: 'tomar_banho', categoria: 'rotina', nome: 'Banho', fala: 'Tomar banho', emoji: '🛀' },
        { id: 'escola', categoria: 'rotina', nome: 'Escola', fala: 'Ir para a escola', emoji: '🏫' },

        // --- CATEGORIA: SENTIMENTOS ---
        { id: 'feliz', categoria: 'sentimentos', nome: 'Feliz', fala: 'Estou feliz', emoji: '😊' },
        { id: 'triste', categoria: 'sentimentos', nome: 'Triste', fala: 'Estou triste', emoji: '😢' },
        { id: 'bravo', categoria: 'sentimentos', nome: 'Bravo', fala: 'Estou bravo', emoji: '😡' }
    ]
};

// ==========================================
// 2. ESTADO DA APLICAÇÃO (APP STATE)
// ==========================================
// Gerencia o que está acontecendo na tela.

let categoriaAtiva = 'estruturante'; // Começa na básica
let fraseAtual = []; // Array que guarda os itens da frase

// ==========================================
// 3. SELETORES DOM
// ==========================================
const domBoard = document.getElementById('communication-board');
const domCategories = document.getElementById('category-list');
const domPhraseBar = document.getElementById('phrase-bar');
const btnSpeakPhrase = document.getElementById('btn-speak-phrase');
const btnClearPhrase = document.getElementById('btn-clear-phrase');

// ==========================================
// 4. FUNÇÕES DE INICIALIZAÇÃO
// ==========================================

function init() {
    renderizarCategorias();
    renderizarPrancha(categoriaAtiva);
    configurarAPI_Fala();
    
    // Eventos dos botões da barra de frase
    btnSpeakPhrase.addEventListener('click', falarFraseCompleta);
    btnClearPhrase.addEventListener('click', limparFrase);
}

// Executa ao carregar a página
window.addEventListener('DOMContentLoaded', init);


// ==========================================
// 5. FUNÇÕES DE RENDERIZAÇÃO (JS -> HTML)
// ==========================================

// Gera o menu lateral de categorias
function renderizarCategorias() {
    domCategories.innerHTML = ''; // Limpa antes de gerar

    dadosCAA.categorias.forEach(cat => {
        const button = document.createElement('button');
        button.className = `category-btn cat-${cat.id}`;
        
        // Se for a ativa, adiciona classe 'active'
        if (cat.id === categoriaAtiva) button.classList.add('active');
        
        button.innerHTML = `<span class="cat-icon">${cat.icone}</span> ${cat.nome}`;
        
        // Evento de clique para mudar a prancha
        button.onclick = () => mudarCategoria(cat.id);
        
        domCategories.appendChild(button);
    });
}

// Gera os cards da prancha baseado na categoria ativa
function renderizarPrancha(idCategoria) {
    domBoard.innerHTML = ''; // Limpa a prancha atual
    
    // Encontra a cor da categoria para as bordas
    const corCategoria = dadosCAA.categorias.find(c => c.id === idCategoria).cor;

    // Filtra apenas os itens da categoria ativa
    const itensDaCategoria = dadosCAA.itens.filter(item => item.categoria === idCategoria);

    itensDaCategoria.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.borderColor = corCategoria; // Define a cor da borda pastél
        
        card.innerHTML = `
            <span class="emoji">${item.emoji}</span>
            <p>${item.nome}</p>
        `;
        
        // Evento: Ao clicar, adiciona à frase
        card.onclick = () => adicionarAFrase(item);
        
        domBoard.appendChild(card);
    });
}

// Gera os cards pequenos dentro da barra de frase
function renderizarBarraFrase() {
    domPhraseBar.innerHTML = ''; // Limpa a barra
    
    if (fraseAtual.length === 0) {
        domPhraseBar.innerHTML = '<p class="placeholder-text">Toque nos cards para montar sua frase...</p>';
        return;
    }

    fraseAtual.forEach(item => {
        // Acha a cor da categoria do item
        const corCategoria = dadosCAA.categorias.find(c => c.id === item.categoria).cor;

        const phraseCard = document.createElement('div');
        phraseCard.className = 'phrase-card';
        phraseCard.style.borderColor = corCategoria; // Mantém a identidade visual
        
        phraseCard.innerHTML = `
            <span class="emoji">${item.emoji}</span>
            <p>${item.nome}</p>
        `;
        
        domPhraseBar.appendChild(phraseCard);
    });
    
    // Auto-scroll para o final se houver muitos itens
    domPhraseBar.scrollLeft = domPhraseBar.scrollWidth;
}


// ==========================================
// 6. FUNÇÕES DE LÓGICA (ESTADO E AÇÃO)
// ==========================================

function mudarCategoria(idCategoria) {
    categoriaAtiva = idCategoria;
    renderizarCategorias(); // Atualiza o menu (para mostrar o botão ativo)
    renderizarPrancha(idCategoria); // Atualiza a prancha
}

function adicionarAFrase(item) {
    fraseAtual.push(item); // Adiciona o objeto completo ao array da frase
    renderizarBarraFrase(); // Atualiza a visualização da frase
    
    // Opcional: Falar apenas a palavra clicada para feedback imediato
    falarTexto(item.fala);
}

function limparFrase() {
    fraseAtual = [];
    renderizarBarraFrase();
}

function falarFraseCompleta() {
    if (fraseAtual.length === 0) return;

    // Concatena todas as falas dos itens em uma única string
    // Ex: ['Eu quero', 'Comer', 'Maçã'] -> "Eu quero Comer Maçã"
    const textoCompleto = fraseAtual.map(item => item.fala).join(' ');
    
    falarTexto(textoCompleto);
}

// ==========================================
// 7. FUNÇÕES DE SÍNTESE DE VOZ (SPEECH API)
// ==========================================

function falarTexto(texto) {
    if (!('speechSynthesis' in window)) {
        alert("Ops! Seu navegador não suporta a síntese de voz.");
        return;
    }

    // Cancela falas anteriores para não encavalar
    window.speechSynthesis.cancel();

    const mensagem = new SpeechSynthesisUtterance();
    mensagem.text = texto;
    mensagem.lang = 'pt-BR';
    mensagem.rate = 0.9; // Um pouco mais devagar para clareza (bom para TEA)
    mensagem.pitch = 1.0; 

    window.speechSynthesis.speak(mensagem);
}

// Garante que as vozes estão carregadas (necessário em alguns navegadores)
function configurarAPI_Fala() {
    if ('speechSynthesis' in window) {
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
        }
    }
}
