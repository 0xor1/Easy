/*
0xor1   http://github.com/0xor1
*/

(function(NS){

    var ns = window[NS] = window[NS] || {};

    ns.x10d = function(old, x10dr, warn){

        var tmpOld = old
        tmpOldProto = old.prototype
        ;

        warn = (typeof warn === "boolean")? warn : true;

        old = function(){

            x10dr.apply(this, arguments);

            tmpOld.apply(this, arguments);

        };

        old.prototype = tmpOldProto;

        for(var i in x10dr.prototype){
            if(typeof old.prototype[i] !== "undefined"){
                throw {message:"ERROR: attempting to x10d over property '" + i + "' with overwrite warnings on."}
            }
            old.prototype[i] = x10dr.prototype[i];
        }

    };

})('Utils');