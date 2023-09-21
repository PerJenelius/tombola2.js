const useLocalStorage = {
    set: function(key, value, expiry=false) {
        const now = new Date();
        const item = expiry ? {
            value: value,
            expiry: now.getTime() + expiry,
        } : { value: value }
        localStorage.setItem(key, JSON.stringify(item));
        return localStorage[key];
    },
    get: function(key, defaultValue=undefined) {
        const now = new Date();
        let value = localStorage.getItem(key) || defaultValue;
        if(!value) {
            throw `${key} hittades inte i localStorage`;
        }
        if (value !== defaultValue) {
            const item = JSON.parse(value);
            if (now.getTime() > item.expiry) {
                localStorage.removeItem(key);
                value = defaultValue;
            }
        }
        return value;
    },
    clear: function() {
        return localStorage.clear();
    },
    remove: function(key) {
        return localStorage.removeItem(key);
    },
}