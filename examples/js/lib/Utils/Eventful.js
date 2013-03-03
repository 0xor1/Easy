/**
 * 0xor1    https://github.com/0xor1
 *
 * Make all objects Eventful
 *
 * Adapted from Mrdoob's EventDispatcher.js https://github.com/mrdoob/eventdispatcher.js
 */


Object.prototype.addEventListener = function (type, listener) {

    var listeners = this._eventListeners = this._eventListeners || {};

    listeners[ type ] = listeners[ type ] || [];

    if (listeners[ type ].indexOf(listener) === -1) {

        listeners[ type ].push(listener);

        if (listeners[ type ].isDispatching) {

            listeners[ type ].numListenersAdded++;

        }

    }

};


Object.prototype.removeEventListener = function (type, listener) {

    var listeners = this._eventListeners
        , index
        ;

    if (typeof listeners === 'undefined') {
        return;
    }

    index = listeners[ type ].indexOf(listener);

    if (index !== -1) {

        if (listeners[ type ].isDispatching) {

            listeners[ type ].dispatchQueueUpdated = true;

            listeners[ type ].removedIndexes.push(index);

        }

        listeners[ type ].splice(index, 1);

    }

};


Object.prototype.dispatchEvent = function (event) {

    if (typeof this._eventListeners === 'undefined') {
        return;
    }

    var listenerArray = this._eventListeners[ event.type ];

    if (listenerArray !== undefined) {

        if (listenerArray.isDispatching) {

            return;

        }

        listenerArray.isDispatching = true;

        listenerArray.dispatchQueueUpdated = false;

        listenerArray.removedIndexes = [];

        listenerArray.numListenersAdded = 0;

        event.dispatcher = this;

        for (var i = 0, l = listenerArray.length; i < l; i++) {

            if (listenerArray.dispatchQueueUpdated) {

                l = listenerArray.length - listenerArray.numListenersAdded;

                var iOld = i;

                for (var j = 0, k = listenerArray.removedIndexes.length; j < k; j++) {

                    if (listenerArray.removedIndexes[ j ] < iOld) {

                        i--;

                    }

                }

                listenerArray.removedIndexes = [];

                listenerArray.dispatchQueueUpdated = false;

            }

            listenerArray[ i ].call(this, event);

        }

        listenerArray.isDispatching = false;

    }

};

