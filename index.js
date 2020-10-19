const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const redis = require('redis')
const client = redis.createClient()

// Init app
const app = express()

// Set Port
const PORT = 3000

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(express.json()) // => reg.body

// get berdasarkan id
app.get("/siswa/:id", (req, res) => {
    const id = req.params.id

    client.hgetall(id, (err, obj) => {
        if (!obj) {
            console.log(err);
            res.send('data tidak ditemukan orang') // if no user is associated with that id/key return this
        } else {
            obj.id = id

            res.send({
                'data': obj // if user is found return details
            })
        }
    })
})

//get semua data
app.get("/siswa", function(req, res, next) {
    let return_data = []

    client.keys('*', (err, id) => {
        let multi = client.multi()
        let keys = Object.keys(id)
        let i = 0

        keys.forEach((l) => {
            client.hgetall(id[l], (err, obj) => {
                i++
                if (err) { console.log(err) } else {
                    temp_data = { 'id': id[l], 'data': obj }
                    return_data.push(temp_data)
                }

                if (i == keys.length) {
                    res.send({ user: return_data })
                }
            })
        })
    })
})

app.post("/siswa/tambah", (req, res) => {

    //untuk menangkap nilai yang dikirimkan melalui form-html(body)
    const { id } = req.body;
    const { nama_siswa } = req.body;
    const { nisn } = req.body;
    const { email } = req.body;
    const { kelas } = req.body;
    const { alamat } = req.body;
    client.hmset(id, [
        'nama_siswa', nama_siswa,
        'nisn', nisn,
        'email', email,
        'kelas', kelas,
        'alamat', alamat

    ], (err, reply) => {
        if (err) {
            console.log(err) // callback to log errors
        }

        console.log(reply) // log success message
        res.send('data telah ditambahkan orang') // response back to the client
    });


});

//untuk menghapus data siswa
app.delete("/delete/:id", (req, res, next) => {
    // find key associated with the id and deletes it
    client.del(req.params.id, (err, reply) => {
        if (err) {
            console.log(err) // callback incase something goes wrong
        }

        console.log(reply) // log success message
        res.send('data siswa telah di hapus') // response back to the client
    })
});

//untuk mengedit
app.put("/edit/:id", (req, res, next) => {
    // put Parameters
    const { id } = req.body;
    const { nama_siswa } = req.body;
    const { nisn } = req.body;
    const { email } = req.body;
    const { kelas } = req.body;
    const { alamat } = req.body;

    // make id the key and assign the id to the other Parameters
    client.hmset(id, [
        'id', id,
        'nama_siswa', nama_siswa,
        'nisn', nisn,
        'email', email,
        'kelas', kelas,
        'alamat', alamat
    ], (err, reply) => {
        if (err) {
            console.log(err) // callback to log errors
        }

        console.log(reply) // log success message
        res.send("Data telah di update") // response to client
    })
});





app.listen(3000, () => {
    console.log(`Localhostnya memakai port  ${PORT}`);
});