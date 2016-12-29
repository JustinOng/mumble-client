// http://stackoverflow.com/a/34253749
module.exports.val2key = function(val,array){
    for (var key in array) {
        this_val = array[key];
        if(this_val == val){
            return key;
            break;
        }
    }
}