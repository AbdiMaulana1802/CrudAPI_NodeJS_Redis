"use strict";

var express = require('express');

var path = require('path');

var bodyParser = require('body-parser');

var redis = require('redis');

var client = redis.createClient(); // Init app

var app = express(); // Set Port

var PORT = 3000;
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(express.json()); // => reg.body
// get berdasarkan id

app.get("/siswa/:id", function (req, res) {
  var id = req.params.id;
  client.hgetall(id, function (err, obj) {
    if (!obj) {
      console.log(err);
      res.send('data tidak ditemukan orang'); // if no user is associated with that id/key return this
    } else {
      obj.id = id;
      res.send({
        'data': obj // if user is found return details

      });
    }
  });
}); //get semua data

app.get("/siswa", function (req, res, next) {
  var return_data = [];
  client.keys('*', function (err, id) {
    var multi = client.multi();
    var keys = Object.keys(id);
    var i = 0;
    keys.forEach(function (l) {
      client.hgetall(id[l], function (err, obj) {
        i++;

        if (err) {
          console.log(err);
        } else {
          temp_data = {
            'id': id[l],
            'data': obj
          };
          return_data.push(temp_data);
        }

        if (i == keys.length) {
          res.send({
            user: return_data
          });
        }
      });
    });
  });
});
app.post("/siswa/tambah", function (req, res) {
  //untuk menangkap nilai yang dikirimkan melalui form-html(body)
  var id = req.body.id;
  var nama_siswa = req.body.nama_siswa;
  var nisn = req.body.nisn;
  var email = req.body.email;
  var kelas = req.body.kelas;
  var alamat = req.body.alamat;
  client.hmset(id, ['nama_siswa', nama_siswa, 'nisn', nisn, 'email', email, 'kelas', kelas, 'alamat', alamat], function (err, reply) {
    if (err) {
      console.log(err); // callback to log errors
    }

    console.log(reply); // log success message

    res.send('data telah ditambahkan orang'); // response back to the client
  });
}); //untuk menghapus data siswa

app["delete"]("/delete/:id", function (req, res, next) {
  // find key associated with the id and deletes it
  client.del(req.params.id, function (err, reply) {
    if (err) {
      console.log(err); // callback incase something goes wrong
    }

    console.log(reply); // log success message

    res.send('data siswa telah di hapus'); // response back to the client
  });
}); //untuk mengedit

app.put("/edit/:id", function (req, res, next) {
  // put Parameters
  var id = req.body.id;
  var nama_siswa = req.body.nama_siswa;
  var nisn = req.body.nisn;
  var email = req.body.email;
  var kelas = req.body.kelas;
  var alamat = req.body.alamat; // make id the key and assign the id to the other Parameters

  client.hmset(id, ['id', id, 'nama_siswa', nama_siswa, 'nisn', nisn, 'email', email, 'kelas', kelas, 'alamat', alamat], function (err, reply) {
    if (err) {
      console.log(err); // callback to log errors
    }

    console.log(reply); // log success message

    res.send("Data telah di update"); // response to client
  });
});
app.listen(3000, function () {
  console.log("Localhostnya memakai port  ".concat(PORT));
});