/**
 * CommonStorage - Wrapper localStorage pour florianlatapie.github.io
 *
 * Chaque application utilise une clé racine unique dans le localStorage.
 * Toutes les données de l'app sont stockées comme un objet JSON sous cette clé.
 *
 * Usage :
 *   const storage = new CommonStorage('velib');
 *   storage.set('stations', [...]);
 *   storage.get('stations');
 *   storage.getAll();        // { stations: [...] }
 *   storage.setAll({ stations: [...] });
 *   storage.clear();
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
        this._cache = null;
    }

    // ─── Méthodes internes ───

    /** Charge l'objet racine depuis le localStorage (avec cache) */
    _load() {
        if (this._cache !== null) return this._cache;
        try {
            const raw = localStorage.getItem(this.appKey);
            this._cache = raw ? JSON.parse(raw) : {};
        } catch (e) {
            console.warn(`[CommonStorage:${this.appKey}] Erreur de lecture:`, e);
            this._cache = {};
        }
        return this._cache;
    }

    /** Persiste le cache en localStorage */
    _save() {
        try {
            localStorage.setItem(this.appKey, JSON.stringify(this._cache));
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
    get(key, defaultValue = null) {
        const data = this._load();
        return key in data ? data[key] : defaultValue;
    }

    /**
     * Définir une valeur par clé dans l'objet racine
     * @param {string} key
     * @param {*} value
     */
    set(key, value) {
        this._load();
        this._cache[key] = value;
        this._save();
    }

    /**
     * Supprimer une clé de l'objet racine
     * @param {string} key
     */
    remove(key) {
        this._load();
        delete this._cache[key];
        this._save();
    }

    /**
     * Récupérer l'objet racine complet
     * @returns {Object}
     */
    getAll() {
        return this._load();
    }

    /**
     * Remplacer l'objet racine complet
     * @param {Object} data
     */
    setAll(data) {
        this._cache = data && typeof data === 'object' ? data : {};
        this._save();
    }

    /**
     * Vérifie si l'app a des données
     * @returns {boolean}
     */
    hasData() {
        return Object.keys(this._load()).length > 0;
    }

    /**
     * Supprimer toutes les données de cette app
     */
    clear() {
        this._cache = {};
        localStorage.removeItem(this.appKey);
    }

    /**
     * Invalider le cache (force une relecture depuis localStorage)
     */
    invalidateCache() {
        this._cache = null;
    }
}

window.CommonStorage = CommonStorage;