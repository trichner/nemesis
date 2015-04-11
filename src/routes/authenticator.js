
module.exports = function(path){
    return function(req, res, next) {
        if(req.session.verified){
            next();
        }else if(req.path==path){
            next();
        }else{
            var err = new Error('Please authenticate.')
            err.status = 401;
            return next(err);
        }
    };
}
