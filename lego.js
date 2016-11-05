'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

var PERFORMING_PRIORITIES = {
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


/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection) {
    var functions = [].slice.call(arguments);
    functions.splice(0, 1);
    var copied = copyCollection(collection);
    functions.sort(function (func1, func2) {
        if (PERFORMING_PRIORITIES[func1.name] > PERFORMING_PRIORITIES[func2.name]) {
            return 1;
        }
        if (PERFORMING_PRIORITIES[func1.name] === PERFORMING_PRIORITIES[func2.name]) {
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
    var fields = [].slice.call(arguments);

    return function select(collection) {
        return collection.map(function (elem) {
            var selected = {};
            for (var i = 0; i < fields.length; i++) {
                if (elem.hasOwnProperty(fields[i])) {
                    selected[fields[i]] = elem[fields[i]];
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
        return collection.filter(function (elem) {
            return values.indexOf(elem[property]) !== -1;
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
    return function sortBy(collection) {
        return copyCollection(collection)
            .sort(function (elem1, elem2) {
                return (elem1[property] > elem2[property] ? 1 : -1) *
                (order === 'asc' ? 1 : -1);
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
        return collection.map(function (elem) {
            var copied = clone(elem);
            copied[property] = formatter(elem[property]);

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
    if (count < 0) {
        throw RangeError('Count must be >= 0!')
    }

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
        var functions = [].slice.call(arguments);

        return function or(collection) {
            return collection.filter(function (elem) {
                return functions.some(function (func) {
                    return func(collection).indexOf(elem) !== -1;
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
        var functions = [].slice.call(arguments);

        return function and(collection) {
            return collection.filter(function (elem) {
                return functions.every(function (func) {
                    return func(collection).indexOf(elem) !== -1;
                });
            });
        };
    };
}
