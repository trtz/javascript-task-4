'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

var PRIORITIES = {
    'or': 1,
    'and': 1,
    'filterIn': 1,
    'sortBy': 3,
    'select': 5,
    'limit': 10,
    'format': 10
};

function clone(origin) {
    return Object.assign({}, origin);
}

function copyCollection(collection) {
    return collection.map(function (element) {
        return clone(element);
    });
}

function getValues(obj) {
    var keys = Object.keys(obj);

    return keys.map(function (key) {
        return obj[key];
    });
}

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection) {
    var functions = getValues(arguments);
    functions.splice(0, 1);
    var copied = copyCollection(collection);
    functions.sort(function (fFirst, fSecond) {
        if (PRIORITIES[fFirst.name] > PRIORITIES[fSecond.name]) {
            return 1;
        }
        if (PRIORITIES[fFirst.name] === PRIORITIES[fSecond.name]) {
            return 0;
        }

        return -1;
    });
    functions.forEach(function (func) {
        copied = func(copied);
    });

    return copied;
};

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = function () {
    var properties = getValues(arguments);

    return function select(collection) {
        return collection.map(function (el) {
            var selected = {};
            for (var i = 0; i < properties.length; i++) {
                if (el.hasOwnProperty(properties[i])) {
                    selected[properties[i]] = el[properties[i]];
                }
            }

            return selected;
        });
    };
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {Function}
 */
exports.filterIn = function (property, values) {
    return function filterIn(collection) {
        return collection.filter(function (el) {
            return values.indexOf(el[property]) !== -1;
        });
    };
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Function}
 */
exports.sortBy = function (property, order) {
    order = (order === 'asc') ? 1 : -1;

    return function sortBy(collection) {
        return getValues(collection)
            .sort(function (elFirst, elSecond) {
                return (elFirst[property] > elSecond[property] ? 1 : -1) *
                    order;
            });
    };
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {Function}
 */
exports.format = function (property, formatter) {
    return function format(collection) {
        return collection.map(function (el) {
            var copied = clone(el);
            copied[property] = formatter(el[property]);

            return copied;
        });
    };
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Function}
 */
exports.limit = function (count) {
    return function limit(collection) {
        return collection.slice(0, count);
    };
};


if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.or = function () {
        var functions = getValues(arguments);

        return function or(collection) {
            return collection.filter(function (el) {
                return functions.some(function (func) {
                    return func(collection).indexOf(el) !== -1;
                });
            });
        };
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
    exports.and = function () {
        var functions = getValues(arguments);

        return function and(collection) {
            return collection.filter(function (el) {
                return functions.every(function (func) {
                    return func(collection).indexOf(el) !== -1;
                });
            });
        };
    };
}
