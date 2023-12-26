function inverseValue(value) {
    if (Number.isInteger(value))
        return ((1 / value));
    else
        return searchPairingValue(value);
}

function searchPairingValue(decimal) {
    for (let i = 1; i <= 100; i++) {
        if (parseFloat((1 / i).toFixed(4)) == decimal.toFixed(4))
            return i;
    }
}

function Ahp(data) {
    if (typeof (data) != "object") {
        console.warn("Format data yang dikirim harus object");
        return;
    }
    this.mapIR = [0.00, 0.00, 0.58, 1.90, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49, 1.51, 1.48, 1.56, 1.57, 1.59];
    this.kriteria = null;
    this.matrixPerbandingan = {};
    this.matrixNormalisasi = {};
    this.konsistensi = {};
    this.matrixAlternatif = {};
    this.buatMatrixPerbandingan = function (data) {
        var columns = [];
        var temp = {};

        Object.keys(data).forEach(key => {
            var k = key.split('-');
            if (!columns.includes(k[0]))
                columns.push(k[0]);

            if (!columns.includes(k[1]))
                columns.push(k[1]);
        });
        columns.forEach(key => {
            if (temp[key] == undefined)
                temp[key] = {};
        });
        columns.forEach(key => {
            columns.forEach(key1 => {
                if (data[key + '-' + key1] != undefined)
                    temp[key][key1] = data[key + '-' + key1];
                else if (key == key1)
                    temp[key][key1] = 1;
                else
                    temp[key][key1] = null;
            })
        });

        Object.keys(temp).forEach(column => {
            for (const row in temp[column]) {
                if (Object.hasOwnProperty.call(temp[column], row)) {
                    if (temp[column][row] == null && Object.hasOwnProperty.call(temp[row], column) && temp[row][column] != null)
                        temp[column][row] = inverseValue(temp[row][column]);
                }
            }
        });
        // Menghitung jumlah perbaris
        temp['jumlah'] = {};
        Object.keys(temp).forEach(row => {
            if (row == 'jumlah') return;
            var column = Object.keys(temp[row]);
            column.forEach(col => {
                if (temp['jumlah'][col] == undefined)
                    temp['jumlah'][col] = temp[row][col];
                else
                    temp['jumlah'][col] += temp[row][col];
            });
        });
        var matrix = Object.assign({}, temp);

        // Fiexed matrixPerbandingan
        for (baris in matrix) {
            for (kolom in matrix[baris]) {
                matrix[baris][kolom] = parseFloat((matrix[baris][kolom]).toFixed(4))
            }
        }

        return matrix;
    }

    this.normalisasiData = function (perbandingan) {
        var normalisasi = { jumlah: {} };
        for (key in perbandingan) {
            if (key == 'jumlah') continue;
            if (!normalisasi[key])
                normalisasi[key] = { jumlah: 0 };
            for (key1 in perbandingan) {
                if (key1 == 'jumlah') continue;
                normalisasi[key][key1] = ((perbandingan[key][key1] / perbandingan.jumlah[key1]));
                normalisasi[key].jumlah += ((normalisasi[key][key1]));
            }

        }

        for (key in normalisasi) {
            for (key1 in normalisasi[key]) {
                normalisasi[key][key1] = parseFloat((normalisasi[key][key1]).toFixed(4))
            }
            if (key != 'jumlah') {
                normalisasi[key].prioritas = normalisasi[key].jumlah / (Object.keys(perbandingan).length - 1)
                normalisasi[key].eigen = perbandingan.jumlah[key] * normalisasi[key].prioritas;
            }
        }

        // Buat Total per kolom
        for (baris in normalisasi) {
            for (kolom in normalisasi[baris]) {
                if (!normalisasi.jumlah[kolom]) {
                    normalisasi.jumlah[kolom] = normalisasi[baris][kolom];
                } else {
                    normalisasi.jumlah[kolom] += normalisasi[baris][kolom];
                }
            }
        }


        for (key in normalisasi) {
            for (key1 in normalisasi[key]) {
                normalisasi[key][key1] = parseFloat((normalisasi[key][key1]).toFixed(4))
            }
        }

        return normalisasi;
    }

    this.hitungKonsistensi = function (normalisasi) {
        var konsistensi = {};
        var n = Object.keys(normalisasi).length - 1;
        var lambdaMax = normalisasi.jumlah.eigen;
        var CI = parseFloat(((lambdaMax - n) / (n - 1)).toFixed(2));
        var CR = parseFloat((CI / this.mapIR[n - 1]).toFixed(3));

        return {
            'CI': CI,
            'CR': CR
        };
    }

    /**
     * 
     * @param {*} normalisasi Matrix Normalisasi 
     * @param {*} nSK Jumlah sub kriteria
     * @returns Matrix alternatif
     */
    this.buatMatrixAlternatif = function (normalisasi, nSK) {
        var matrix = {};
        sk = [];
        for (let i = 1; i <= nSK; i++) {
            sk.push('SK' + i)
        }
        sk.forEach((baris, i) => {
            i = i + 1
            matrix['A' + i] = {};
            for (kolom in normalisasi.kriteria) {
                if (kolom == 'jumlah') continue;
                var indexKolom = kolom.substr(1);
                var key = 'A' + i;
                var key1 = 'K' + indexKolom;

                matrix[key][key1] = normalisasi['subkriteria_' + kolom][baris].prioritas * normalisasi['kriteria'][kolom].prioritas;

            }
        });

        for (k in matrix) {
            for (key1 in matrix[k]) {
                matrix[k][key1] = parseFloat(matrix[k][key1].toFixed(4));
            }
        }
        for (key in matrix) {
            for (key1 in matrix[key]) {
                if (!matrix[key]['jumlah'])
                    matrix[key]['jumlah'] = matrix[key][key1];
                else
                    matrix[key]['jumlah'] += matrix[key][key1];
            }
        }
        return matrix;
    }

    this.proses = function () {
        // Buat matrix perbandingan untuk kriteria
        this.matrixPerbandingan['kriteria'] = this.buatMatrixPerbandingan(data.kriteria);

        // Buat matrix perbandingan untuk sub-kriteria
        for (k in data.subkriteria) {
            this.matrixPerbandingan['subkriteria_' + k] = this.buatMatrixPerbandingan(data.subkriteria[k]);
        }
        // Normalisasi
        this.matrixNormalisasi['kriteria'] = this.normalisasiData(this.matrixPerbandingan.kriteria)
        for (k in data.subkriteria) {
            this.matrixNormalisasi['subkriteria_' + k] = this.normalisasiData(this.matrixPerbandingan['subkriteria_' + k])
        }

        this.konsistensi['kriteria'] = this.hitungKonsistensi(this.matrixNormalisasi['kriteria'])
        for (k in data.subkriteria) {
            this.konsistensi['subkriteria_' + k] = this.hitungKonsistensi(this.matrixNormalisasi['subkriteria_' + k])
        }

        //    hitung alternatif
        this.matrixAlternatif = this.buatMatrixAlternatif(this.matrixNormalisasi, 5);
        
        // Urutkan alternatif berdasarkan total
        var orderedAlternaif = [];
        var keyPairAlternatif = {};
        var a = {};
        var arrayOfAlternatifValue = [];
        for(k in this.matrixAlternatif){
            keyPairAlternatif[k] = this.matrixAlternatif[k].jumlah;
            arrayOfAlternatifValue.push(this.matrixAlternatif[k].jumlah);
        }

        arrayOfAlternatifValue.sort((a, b) => a - b);
        arrayOfAlternatifValue.forEach(v => {
            for(k in keyPairAlternatif){
                if(keyPairAlternatif[k] == v)
                    orderedAlternaif.push({nilai: v, alternatif: k});
            }
        })

        return {
            'matrixPerbandingan': this.matrixPerbandingan,
            'matrixNormalisasi': this.matrixNormalisasi,
            'nilaiKonsistensi': this.konsistensi,
            'matrixAlternatif': this.matrixAlternatif,
            'orderedAlternaifValue': arrayOfAlternatifValue,
            'orderedAlternaif': orderedAlternaif
        };
    };
    return this;
}
