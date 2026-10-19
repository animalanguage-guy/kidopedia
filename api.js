// api.js
import { API_BASE } from './config.js';

// Вспомогательная функция: получение SHA файла (необходим для перезаписи и удаления)
export async function getFileSha(filename, token) {
    try {
        const response = await fetch(`${API_BASE}/${filename}`, {
            headers: token ? { 'Authorization': `token ${token}` } : {}
        });
        if (response.status === 404) return null;
        const data = await response.json();
        return data.sha;
    } catch (e) {
        return null;
    }
}

// Загрузка любого JSON файла (списка или статьи)
export async function fetchJson(filename) {
    const response = await fetch(`${API_BASE}/${filename}?t=${Date.now()}`);
    if (!response.ok) throw new Error(`Не удалось загрузить ${filename}`);
    
    const data = await response.json();
    const content = data.content ? decodeContent(data.content) : JSON.stringify(data);
    return JSON.parse(content);
}

// Сохранение (создание или обновление) файла на GitHub
export async function saveFile(filename, dataObj, commitMessage, token) {
    const sha = await getFileSha(filename, token);
    const response = await fetch(`${API_BASE}/${filename}`, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: commitMessage,
            content: encodeContent(JSON.stringify(dataObj, null, 2)),
            sha: sha || undefined
        })
    });
    if (!response.ok) throw new Error(`Ошибка сохранения файла ${filename}`);
    return true;
}

// Удаление файла с GitHub
export async function deleteFile(filename, commitMessage, token) {
    const sha = await getFileSha(filename, token);
    if (!sha) return false;

    const response = await fetch(`${API_BASE}/${filename}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: commitMessage, sha })
    });
    if (!response.ok) throw new Error(`Ошибка удаления файла ${filename}`);
    return true;
}

// Утилиты шифрования UTF-8 для GitHub API
function encodeContent(str) { return btoa(unescape(encodeURIComponent(str))); }
function decodeContent(str) { return decodeURIComponent(escape(atob(str.replace(/\s/g, '')))); }
