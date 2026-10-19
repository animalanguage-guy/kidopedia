// ui.js
export const DOM = {
    tokenInput: () => document.getElementById('gh-token'),
    adminPanel: () => document.getElementById('admin-panel'),
    adminBtn: () => document.getElementById('admin-btn'),
    createBtn: () => document.getElementById('create-btn'),
    actionButtons: () => document.getElementById('article-actions'),
    listContainer: () => document.getElementById('list-container'),
    viewMode: () => document.getElementById('view-mode'),
    editMode: () => document.getElementById('edit-mode'),
    artTitle: () => document.getElementById('article-title'),
    artContent: () => document.getElementById('article-content'),
    formTitle: () => document.getElementById('form-title'),
    editTitle: () => document.getElementById('edit-title'),
    editCategory: () => document.getElementById('edit-category'),
    editContent: () => document.getElementById('edit-content')
};

// Переключение видимости панели администратора
export function toggleAdminPanel() {
    DOM.adminPanel().classList.toggle('hidden');
}

// Настройка кнопок под роль (Автор или Читатель)
export function updateAuthUI(hasToken) {
    if (hasToken) {
        DOM.createBtn().classList.remove('hidden');
        DOM.actionButtons().classList.remove('hidden');
        DOM.adminBtn().innerText = '🔒 Выйти / Изменить токен';
    } {
        DOM.createBtn().classList.add('hidden');
        DOM.actionButtons().classList.add('hidden');
        DOM.adminBtn().innerText = 'Вход для автора';
    }
}

// Отображение списка статей в сайдбаре
export function renderSidebar(articles, onSelectCallback) {
    const container = DOM.listContainer();
    container.innerHTML = '';
    
    if (articles.length === 0) {
        container.innerHTML = '<li class="empty">Статей пока нет 🐱</li>';
        return;
    }

    articles.forEach(article => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#';
        a.innerHTML = `📂 [${article.category}] <b>${article.title}</b>`;
        a.addEventListener('click', (e) => {
            e.preventDefault();
            onSelectCallback(article.id);
        });
        li.appendChild(a);
        container.appendChild(li);
    });
}

// Отображение текста статьи
export function renderArticleView(article) {
    DOM.viewMode().classList.remove('hidden');
    DOM.editMode().classList.add('hidden');
    DOM.artTitle().innerText = article.title;
    DOM.artContent().innerHTML = `<p><b>Категория:</b> ${article.category}</p><hr><p>${article.content.replace(/\n/g, '<br>')}</p>`;
}

// Открытие формы создания
export function showCreateForm() {
    DOM.viewMode().classList.add('hidden');
    DOM.editMode().classList.remove('hidden');
    DOM.formTitle().innerText = '✨ Создание новой статьи';
    DOM.editTitle().value = '';
    DOM.editCategory().value = '';
    DOM.editContent().value = '';
}

// Открытие формы редактирования
export function showEditForm(article) {
    DOM.viewMode().classList.add('hidden');
    DOM.editMode().classList.remove('hidden');
    DOM.formTitle().innerText = '✏️ Редактирование статьи';
    DOM.editTitle().value = article.title;
    DOM.editCategory().value = article.category;
    DOM.editContent().value = article.content;
}
