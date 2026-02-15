/**
 * CommonStorage - localStorage wrapper for web apps on florianlatapie.github.io
 *
 * Each application uses a unique root key in localStorage.
 * All app data is stored as a JSON object under that root key.
 *
 * Goal: wrap localStorage to simplify app data handling, avoid conflicts between apps,
 * and provide an API as close as possible to localStorage.
 *
 * Usage:
 *   const storage = new CommonStorage('my-app'); // 'my-app' is loaded under the root key
 *   storage.setItem('my-obj-key', [...]);        // stores a JSON object with its key under 'my-obj-key' in the root key 'my-app'
 *   storage.getItem('my-obj-key');               // reads a JSON object from 'my-obj-key' in the root key 'my-app'
 *   storage.removeItem('my-obj-key');            // removes 'my-obj-key' and its associated value from the root key'my-app'
 *   storage.clear();                             // removes all data for this app
 */

class CommonStorage {
    /**
     * @param {string} appKey - Clé racine unique de l'application dans le localStorage
     */
    constructor(appKey) {
        if (!appKey || typeof appKey !== 'string') {
            throw new Error('CommonStorage: appKey est requis');
        }
        this.appKey = appKey;
    }

    // --- Internal methods ---

    _isPlainObject(value) {
        return !!value && typeof value === 'object' && !Array.isArray(value);
    }

    /** Get the root object from localStorage */
    _load() {
        try {
            const raw = localStorage.getItem(this.appKey);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            return this._isPlainObject(parsed) ? parsed : null;
        } catch (e) {
            console.error(`[CommonStorage:${this.appKey}] Erreur de lecture:`, e);
            return null;
        }
    }

    /** Save the root object to localStorage */
    _save(data) {
        try {
            localStorage.setItem(this.appKey, JSON.stringify(data));
        } catch (e) {
            console.error(`[CommonStorage:${this.appKey}] Erreur d'écriture:`, e);
        }
    }

    // --- Public API ---

    /**
     * Get the value from its associated key
     * @param {string} key
     * @param {*} defaultValue - Default value if the key does not exist
     * @returns {*}
     */
    getItem(key, defaultValue = null) {
        if (typeof key !== 'string' || key.length === 0) return defaultValue;
        const data = this._load();
        return data && Object.prototype.hasOwnProperty.call(data, key)
            ? data[key]
            : defaultValue;
    }

    /**
     * Set a value and its associated key
     * @param {string} key
     * @param {*} value
     */
    setItem(key, value) {
        if (typeof key !== 'string' || key.length === 0) {
            throw new Error('CommonStorage: key est requis');
        }
        const data = this._load() || {};
        data[key] = value;
        this._save(data);
    }

    /**
     * Remove a key and its associated value
     * @param {string} key
     */
    removeItem(key) {
        if (typeof key !== 'string' || key.length === 0) {
            throw new Error('CommonStorage: key est requis');
        }
        const data = this._load();
        if (!data || !Object.prototype.hasOwnProperty.call(data, key)) return;
        delete data[key];
        this._save(data);
    }

    /**
     * Check whether the CommonStorage object has any data
     * @returns {boolean}
     */
    isEmpty() {
        try {
            return Object.keys(this._load() || {}).length === 0;
        } catch (e) {
            return true;
        }
    }

    /**
     * Remove all data for CommonStorage object
     */
    clear() {
        localStorage.removeItem(this.appKey);
    }

    // --- Native API ---

    /**
     * Alias to access data directly
     * Usage : storageInstance.data
     * @returns {Object}
     */
    get data() {
        return this._load() || {};
    }

    /**
     * Allows JSON.stringify(storage)
     */
    toJSON() {
        return this._load() || {};
    }

    /**
     * Allows String(storage) or `${storage}` to display data
     */
    [Symbol.toPrimitive]() {
        return JSON.stringify(this._load() || {});
    }
}

window.CommonStorage = CommonStorage;