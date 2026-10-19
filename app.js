// app.js
import { TOKEN_STORAGE_KEY } from './config.js';
import * as api from './api.js';
import * as ui from './ui.js';

let currentToken = localStorage.getItem(TOKEN_STORAGE_KEY) || '';
let articlesList = [];
let currentArticleId = null;
let currentArticleData = null; // Для хранения полной текущей статьи

// Инициализация
document.addEventListener('DOMContentLoaded', async () => {
    if (currentToken) {
        ui.DOM.tokenInput().value = currentToken;
        ui.updateAuthUI(true);
    }
    
    // Вешаем клики на неизменяемые кнопки управления
    ui.DOM.adminBtn().addEventListener('click', ui.toggleAdminPanel);
    document.getElementById('save-token-btn').addEventListener('click', saveToken);
    ui.DOM.createBtn().addEventListener('click', ui.showCreateForm);
    document.getElementById('edit-act-btn').addEventListener('click', editCurrentArticle);
    document.getElementById('delete-act-btn').addEventListener('click', deleteCurrentArticle);
    document.getElementById('save-art-btn').addEventListener('click', saveArticle);
    document.getElementById('cancel-edit-btn').addEventListener('click', () => {
        ui.DOM.editMode().add('hidden');
        ui.DOM.viewMode().remove('hidden');
    });

    await loadArticlesList();
});

// Авторизация
function saveToken() {
    const tokenInput = ui.DOM.tokenInput().value.trim();
    if (tokenInput) {
        localStorage.setItem(TOKEN_STORAGE_KEY, tokenInput);
        currentToken = tokenInput;
        ui.updateAuthUI(true);
        ui.toggleAdminPanel();
    } else {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        currentToken = '';
        ui.updateAuthUI(false);
    }
}

// Загрузка списка
async function loadArticlesList() {
    try {
        articlesList = await api.fetchJson('list.json');
        ui.renderSidebar(articlesList, loadArticle);
    } catch (e) {
        ui.DOM.listContainer().innerHTML = '<li>Ошибка загрузки меню</li>';
    }
}

// Загрузка конкретной статьи
async function loadArticle(id) {
    try {
        ui.DOM.artTitle().innerText = 'Загрузка... ⏳';
        currentArticleData = await api.fetchJson(`${id}.json`);
        currentArticleId = id;
        ui.renderArticleView(currentArticleData);
    } catch (e) {
        ui.DOM.artTitle().innerText = 'Ошибка ❌';
    }
}

// Сохранение статьи
async function saveArticle() {
    if (!currentToken) return alert('Нужен токен!');
    
    const title = ui.DOM.editTitle().value.trim();
    const category = ui.DOM.editCategory().value.trim() || 'Разное';
    const content = ui.DOM.editContent().value.trim();
    
    if (!title || !content) return alert('Заполните поля!');

    const id = currentArticleId || generateId(title);
    ui.DOM.formTitle().innerText = 'Сохранение в GitHub... 🚀';

    const newArticle = { id, title, category, content, updatedAt: new Date().toISOString().split('T')[0] };

    try {
        // 1. Сохраняем файл статьи
        await api.saveFile(`${id}.json`, newArticle, `Update article: ${title}`, currentToken);

        // 2. Обновляем list.json
        if (!currentArticleId) {
            articlesList.push({ id, title, category });
        } else {
            const index = articlesList.findIndex(a => a.id === id);
            if (index !== -1) articlesList[index] = { id, title, category };
        }
        await api.saveFile('list.json', articlesList, 'Update index list', currentToken);

        currentArticleId = id;
        await loadArticlesList();
        await loadArticle(id);
    } catch (error) {
        alert(error.message);
    }
}

// Удаление статьи
async function deleteCurrentArticle() {
    if (!currentArticleId || !confirm('Удалить статью?')) return;
    try {
        await api.deleteFile(`${currentArticleId}.json`, `Delete article ${currentArticleId}`, currentToken);
        
        articlesList = articlesList.filter(a => a.id !== currentArticleId);
        await api.saveFile('list.json', articlesList, 'Remove from index', currentToken);
        
        currentArticleId = null;
        await loadArticlesList();
        ui.DOM.artTitle().innerText = 'Kidopedia';
        ui.DOM.artContent().innerText = 'Выберите статью слева.';
    } catch (error) {
        alert(error.message);
    }
}

function editCurrentArticle() {
    if (currentArticleData) ui.showEditForm(currentArticleData);
}

function generateId(text) {
    const translit = {'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'ts','ч':'ch','ш':'sh','щ':'sch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya'};
    return text.toLowerCase().split('').map(c => translit[c] !== undefined ? translit[c] : (/[a-z0-9-]/.test(c) ? c : (c === ' ' ? '-' : ''))).join('').replace(/-+/g, '-').substring(0, 30);
}
