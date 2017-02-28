var mongo = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/learnyoumongo';
var express = require('express');
var app = express();
var db;

mongo.connect (url, function(err, database){
    if (err) return console.error(err);
    db = database;
    app.listen(process.env.PORT || 80, () => {
        console.log('application listening on port 80');
    });
    //db.collection('shorts').remove();
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/new*', function (req, res){
    var site = req.params['0'].substring(1, this.length);
    if (!site.match(/^(http\:\/\/|https\:\/\/)?([a-z0-9][a-z0-9\-]*\.)+[a-z0-9][a-z0-9\-]*$/)) {
        res.send('site address does not correspond to template');
        //db.close();
    } else {
        var shorts = db.collection('shorts');
        shorts.find({site: site}).toArray(function(err, docs){
            if (err) console.error(err);
            //console.log('docs', docs);
            if (docs.length < 1) {
                //there is no site needed in our database
                shorts.count(function (err, count){
                    //console.log('count', count)
                    if (!err && count === 0) {
                        var new_site = {
                            '_id': 1,
                            'site': site
                        };
                        shorts.insert(new_site);
                        res.json(new_site);    
                    } else {
                        shorts.findOne({$query:{},$orderby:{_id:-1}}, function(err, data){
                           // console.log(data);
                            var new_site = {
                                '_id': ++data['_id'],
                                'site': site
                            };
                            shorts.insert(new_site);
                            res.json(new_site);    
                        });
                    }
                });
            } else {
                //we already have site in our database
                res.json(docs[0]);
                //res.redirect(docs[0]['site']);
            }
        });
    }
})
app.get('/[0-9]+', function(req, res){
    var index = req.url.substr(1, req.url.length)
    var shorts = db.collection('shorts');
    shorts.find({_id: +index}).toArray( function(err, docs) {
        if (err) return console.error(err);
        if (docs.length < 1){
            res.send('Site with such id is missing in database');
        } else {
            res.redirect(docs[0]['site']);
        }
    })
})