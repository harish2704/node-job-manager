function clone(obj){
    var newObj = {};
    Object.keys(obj).forEach(function(k){ newObj[k] = obj[k]; });
    return newObj;
}

function defaults( def, newValue ){
    var out = clone( def );
    if(newValue)
    Object.keys(newValue).forEach(function(k){ out[k] = newValue[k]; });
    return out;
}
function range(n){
    var x=Array(n);
    var i=0;
    while(i<n){ x[i] = i;i++; }
    return x;
}

function createEnum(a){
    var out = {};
    a.forEach(function(v, k){
        out[v.toUpperCase()] = {index: k, name: v.toLowerCase() };
    });
    return out;
}

exports.clone = clone;
exports.defaults = defaults;
exports.range = range;
exports.createEnum = createEnum;

