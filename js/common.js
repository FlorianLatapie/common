/**
 * CommonStorage - Wrapper localStorage pour florianlatapie.github.io
 *
 * Chaque application utilise une clé racine unique dans le localStorage.
 * Toutes les données de l'app sont stockées comme un objet JSON sous cette clé.
 *
 * Usage :
 *   const storage = new CommonStorage('velib');  // 'velib' est chargé dans l'ojbet racine
 *   storage.set('stations', [...]);              // stocke les stations dans la clé 'stations' de l'objet racine dans 'velib'
 *   storage.get('stations');                     // récupère les stations depuis la clé 'stations' de l'objet racine dans 'velib'
 *   storage.getAll();                            // récupère l'objet racine complet { stations: [...] }
 *   storage.setAll({ stations: [...] });         // remplace l'objet racine complet par { stations: [...] }
 *   storage.clear();                             // supprime toutes les données de cette app
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

    /** Charge l'objet racine depuis le localStorage */
    _load() {
        try {
            const raw = localStorage.getItem(this.appKey);
            return raw ? JSON.parse(raw) : null;
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
    get(key, defaultValue = null) {
        const data = this._load();
        //return key in data ? data[key] : defaultValue;
        return data && key in data ? data[key] : defaultValue;
    }

    /**
     * Définir une valeur par clé dans l'objet racine
     * @param {string} key
     * @param {*} value
     */
    set(key, value) {
        const data = this._load();
        data[key] = value;
        this._save(data);
    }

    /**
     * Supprimer une clé de l'objet racine
     * @param {string} key
     */
    remove(key) {
        const data = this._load();
        delete data[key];
        this._save(data);
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
        const safeData = data && typeof data === 'object' ? data : {};
        this._save(safeData);
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
}

window.CommonStorage = CommonStorage;