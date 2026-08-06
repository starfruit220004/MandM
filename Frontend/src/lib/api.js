const API_URL = 'http://localhost:3000/api';

export const api = {
    async login(username, password) {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (!res.ok) throw new Error('Login failed');
        return await res.json();
    },

    async getAll(table) {
        const res = await fetch(`${API_URL}/${table}`);
        if (!res.ok) throw new Error(`Failed to fetch ${table}`);
        return await res.json();
    },

    async get(table, id) {
        const res = await fetch(`${API_URL}/${table}/${id}`);
        if (!res.ok) throw new Error(`Failed to fetch ${table} with id ${id}`);
        return await res.json();
    },

    async create(table, data) {
        const res = await fetch(`${API_URL}/${table}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`Failed to create in ${table}`);
        return await res.json();
    },

    async update(table, id, data) {
        const res = await fetch(`${API_URL}/${table}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`Failed to update ${table}`);
        return await res.json();
    },

    async remove(table, id) {
        const res = await fetch(`${API_URL}/${table}/${id}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error(`Failed to delete from ${table}`);
        return await res.json();
    }
};
