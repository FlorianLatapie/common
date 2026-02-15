/**
 * CommonStorage - Wrapper localStorage pour florianlatapie.github.io
 *
 * Chaque application utilise une clé racine unique dans le localStorage.
 * Toutes les données de l'app sont stockées comme un objet JSON sous cette clé.
 * 
 * Objectif : être un wrapper autour de localStorage pour simplifier la gestion des données d'une app, éviter les conflits entre apps, et fournir une API la plus proche possible de localStorage pour faciliter la transition.
 *
 * Usage :
 *   const storage = new CommonStorage('velib'); // 'velib' est chargé dans l'ojbet racine
 *   storage.setItem('stations', [...]);         // stocke les stations dans la clé 'stations' de l'objet racine dans 'velib'
 *   storage.getItem('stations');                // récupère les stations depuis la clé 'stations' de l'objet racine dans 'velib'
 *   storage.removeItem('stations');             // supprime la clé 'stations' de l'objet racine dans 'velib'
 *   storage.clear();                            // supprime toutes les données de cette app
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

    // ─── Méthodes internes ───

    _isPlainObject(value) {
        return !!value && typeof value === 'object' && !Array.isArray(value);
    }

    /** Charge l'objet racine depuis le localStorage */
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

    /** Persiste l'objet racine en localStorage */
    _save(data) {
        try {
            localStorage.setItem(this.appKey, JSON.stringify(data));
        } catch (e) {
            console.error(`[CommonStorage:${this.appKey}] Erreur d'écriture:`, e);
        }
    }

    // ─── API publique ───

    /**
     * Récupérer une valeur par clé depuis l'objet racine
     * @param {string} key
     * @param {*} defaultValue - Valeur par défaut si la clé n'existe pas
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
     * Définir une valeur par clé dans l'objet racine
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
     * Supprimer une clé de l'objet racine
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
     * Vérifie si l'app a des données
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
     * Supprimer toutes les données de cette app
     */
    clear() {
        localStorage.removeItem(this.appKey);
    }

    // ─── API native ───

    /**
     * Alias pour accéder directement aux donnees
     * @returns {Object}
     */
    get data() {
        return this._load() || {};
    }

    /**
     * Permet JSON.stringify(storage) d'afficher les donnees
     */
    toJSON() {
        return this._load() || {};
    }

    /**
     * Permet String(storage) ou `${storage}` d'afficher les donnees
     */
    [Symbol.toPrimitive]() {
        return JSON.stringify(this._load() || {});
    }
}

window.CommonStorage = CommonStorage;