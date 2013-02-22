/**
 * @author mrdoob / http://mrdoob.com/
 * @author 0xor1    http://0xor1.com/
 */
(function (NS) {

    var ns = window[NS] = window[NS] || {};

    ns.EventDispatcher = function () {

        this._listeners = {};
        
    }
    
    ns.EventDispatcher.prototype = {

        addEventListener: function (type, listener) {

            if (this._listeners[ type ] === undefined) {

                this._listeners[ type ] = [];

            }

            if (this._listeners[ type ].indexOf(listener) === -1) {

                this._listeners[ type ].push(listener);

                if (this._listeners[ type ].isDispatching) {

                    this._listeners[ type ].numListenersAdded++;

                }

            }

        },

        removeEventListener: function (type, listener) {

            var index = this._listeners[ type ].indexOf(listener);

            if (index !== -1) {

                if (this._listeners[ type ].isDispatching) {

                    this._listeners[ type ].dispatchQueueUpdated = true;

                    this._listeners[ type ].removedIndexes.push(index);

                }

                this._listeners[ type ].splice(index, 1);

            }

        },

        dispatchEvent: function (event) {

            var listenerArray = this._listeners[ event.type ];

            if (listenerArray !== undefined) {

                if (listenerArray.isDispatching) {

                    listenerArray.wasReRequested = true;

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

                if (listenerArray.wasReRequested) {

                    listenerArray.wasReRequested = false;

                    setTimeout(function () {
                        this.dispatchEvent(event);
                    }.bind(this), 0);

                }

            }

        }

    };


})('Utils');