function inverseValue(value){
    if(Number.isInteger(value))
        return parseFloat((1/value).toFixed(4));
    else
        return searchPairingValue(value);
}

function searchPairingValue (decimal){
    for (let i = 1; i <= 100; i++) {
        if(parseFloat((1/i).toFixed(4)) == decimal.toFixed(4))
            return i;
    }
}

function Ahp (data){
    if(typeof(data) != "object"){
        console.warn("Format data yang dikirim harus object");
        return;
    }

    this.kriteria = null;
    this.matrixPerbandingan = {};
    this.buatMatrixPerbandingan = function(data){
        var columns = [];
        var temp = {};

        Object.keys(data).forEach(key => {
            var k = key.split('-');
            if(!columns.includes(k[0]))
                columns.push(k[0]);
            
            if(!columns.includes(k[1]))
                columns.push(k[1]);
        });

        columns.forEach(key => {
            if(temp[key] == undefined)
                temp[key] = {};
        });
        columns.forEach(key => {
           columns.forEach(key1 => {
                if(data[key + '-' + key1] != undefined)
                    temp[key][key1] = data[key + '-' + key1];
                else if(key == key1)
                    temp[key][key1] = 1;
                else
                    temp[key][key1] = null;
           })
        });

        Object.keys(temp).forEach(column => {
            for (const row in temp[column]) {
                if (Object.hasOwnProperty.call(temp[column], row)) {
                    if(temp[column][row] == null && Object.hasOwnProperty.call(temp[row], column) && temp[row][column] != null)
                        temp[column][row] = inverseValue(temp[row][column]);      
                }
            }
        });
        // Menghitung jumlah perbaris
        temp['jumlah'] = {};
        Object.keys(temp).forEach(row => {
            if(row == 'jumlah') return;
            var column = Object.keys(temp[row]);
            column.forEach(col => {
                if(temp['jumlah'][col] == undefined)
                    temp['jumlah'][col] = temp[row][col];
                else
                    temp['jumlah'][col] += temp[row][col];
            });
        });
        var matrix = Object.assign({}, temp);
    
        // Fiexed matrixPerbandingan
        Object.keys(matrix.jumlah).forEach(k => {
            matrix.jumlah[k] = parseFloat(matrix.jumlah[k].toFixed(4))
        });

        return matrix;
    }
    this.proses = function(){

        // Buat matrix perbandingan untuk kriteria
        this.matrixPerbandingan['kriteria'] = this.buatMatrixPerbandingan(data.kriteria);
        
        // Buat matrix perbandingan untuk sub-kriteria
        this.matrixPerbandingan['subkriteria'] = this.buatMatrixPerbandingan(data.subkriteria);


        return this.matrixPerbandingan;
    };
}

function buatMatrixPerbandingan(kriteria, perandingan = null){
    if(typeof(kriteria) != "object"){
        console.warn("Format Kriteria yang dikirim harus object");
        return;
    }
    var temp = {};
    var columns = [];
    
    this.matrixEigen = {};
    this.matrixPerbandingan = {};
    this.matrixKonsistensi = {};
    this.eigenMaximum = null;
    this.consistencyIndex = null;
    this.consistencyRasio = null;
    this.lambdaMax = null;
    var RI = [0, 0, 0.58, 0.90, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49, 1.51, 1.48, 1.56, 1.57, 1.59];
    Object.keys(kriteria).forEach(key => {
        var k = key.split('-');
        if(!columns.includes(k[0]))
            columns.push(k[0]);
        
        if(!columns.includes(k[1]))
            columns.push(k[1]);
    });
    this.columns = columns;
    columns.forEach(key => {
        if(temp[key] == undefined)
            temp[key] = {};
    });
    columns.forEach(key => {
       columns.forEach(key1 => {
            if(kriteria[key + '-' + key1] != undefined)
                temp[key][key1] = kriteria[key + '-' + key1];
            else if(key == key1)
                temp[key][key1] = 1;
            else
                temp[key][key1] = null;
       })
    });

    Object.keys(temp).forEach(column => {
        for (const row in temp[column]) {
            if (Object.hasOwnProperty.call(temp[column], row)) {
                if(temp[column][row] == null && Object.hasOwnProperty.call(temp[row], column) && temp[row][column] != null)
                    temp[column][row] = inverseValue(temp[row][column]);      
            }
        }
    });
    // Menghitung jumlah perbaris
    temp['jumlah'] = {};
    Object.keys(temp).forEach(row => {
        if(row == 'jumlah') return;
        var column = Object.keys(temp[row]);
        column.forEach(col => {
            if(temp['jumlah'][col] == undefined)
                temp['jumlah'][col] = temp[row][col];
            else
                temp['jumlah'][col] += temp[row][col];
        });
    });
    this.matrixPerbandingan = Object.assign({}, temp);

    // Fiexed matrixPerbandingan
    Object.keys(this.matrixPerbandingan.jumlah).forEach(k => {
        this.matrixPerbandingan.jumlah[k] = parseFloat(this.matrixPerbandingan.jumlah[k].toFixed(4))
    });


    
    return this;
}

var buatMatrixEigen = function(){
    Object.keys(this.matrixPerbandingan).forEach(row => {
        if(row == 'jumlah') return;
        if(this.matrixEigen[row] == undefined)
            this.matrixEigen[row] = {};
        Object.keys(this.matrixPerbandingan[row]).forEach(column => {
            this.matrixEigen[row][column] = parseFloat((this.matrixPerbandingan[row][column]/this.matrixPerbandingan['jumlah'][column]).toFixed(4));
            if(this.matrixEigen[row]['jumlah'] == undefined)
                this.matrixEigen[row]['jumlah'] = parseFloat((this.matrixEigen[row][column]).toFixed(4));
            else
                this.matrixEigen[row]['jumlah'] = parseFloat((this.matrixEigen[row][column] + this.matrixEigen[row]['jumlah']).toFixed(4));
        });
    });
    Object.keys(this.matrixEigen).forEach(row => {
        this.matrixEigen[row]['vector eigen'] = parseFloat((this.matrixEigen[row]['jumlah'] / columns.length).toFixed(4));
    });
    Object.keys(this.matrixEigen).forEach(row => {
        if(this.eigenMaximum == null)
            this.eigenMaximum = parseFloat((this.matrixEigen[row]['vector eigen'] * this.matrixPerbandingan['jumlah'][row]).toFixed(4));
        else
            this.eigenMaximum = parseFloat((this.eigenMaximum + (this.matrixEigen[row]['vector eigen'] * this.matrixPerbandingan['jumlah'][row])).toFixed(4));

    });        
    return this;
}
var tunKonsistensi = function(){
    if(Object.keys(this.matrixEigen).length == 0){
        console.warn("Buat Matrix Eigen Terlebih dahulu");
        return;
    }
    
    Object.keys(this.matrixPerbandingan).forEach(row => {
        if(row == 'jumlah') return;
        if(!this.matrixKonsistensi[row])
            this.matrixKonsistensi[row] = {};
        Object.keys(this.matrixPerbandingan[row]).forEach(column => {
            this.matrixKonsistensi[row][column] = parseFloat((this.matrixPerbandingan[row][column] * this.matrixEigen[column]['vector eigen']).toFixed(4));
            if(this.matrixKonsistensi[row]['jumlah'])
                this.matrixKonsistensi[row]['jumlah'] = parseFloat((this.matrixKonsistensi[row]['jumlah'] + this.matrixKonsistensi[row][column]).toFixed(4));
            else
                this.matrixKonsistensi[row]['jumlah'] = parseFloat((this.matrixKonsistensi[row][column]).toFixed(4));
            
        });
        if(!this.matrixKonsistensi[row]['rasio']){
            console.log(this.matrixPerbandingan['jumlah'][row] + ' * ' + this.matrixEigen[row]['vector eigen']);
            this.matrixKonsistensi[row]['rasio'] = parseFloat((this.matrixPerbandingan['jumlah'][row] * this.matrixEigen[row]['vector eigen']).toFixed(4));
        }
        if(this.lambdaMax == null) 0;
        this.lambdaMax = parseFloat((this.matrixKonsistensi[row]['rasio'] + this.lambdaMax).toFixed(4));
        console.log("LambdaMax ===>", this.lambdaMax);

    });
    return this;
};

var hasil = function(){
    if(this.lambdaMax == null){
        console.warn("Anda melewati proses untuk menghitung konsistensi");
        return;
    }
    // if(this.lambdaMax != null) parseFloat(this.lambdaMax.toFixed(4));
    this.consistencyIndex = parseFloat(((this.lambdaMax - columns.length)/(columns.length - 1)).toFixed(4));
    this.consistencyRasio = parseFloat((this.consistencyIndex / RI[columns.length - 1]).toFixed(4));
    
    if(this.consistencyRasio < 0.10){
        this.kesimpulan = "karena nilai CR adalah "+ this.consistencyRasio +" untuk proporsi ketidakkonsistenan CR (Consistency Rasio) kurang dari 0.10 yang merupakan standar yang dapat kami asumsikan bahwa metrik ini cukup konsisten";
    }else{
        this.kesimpulan = "karena nilai CR adalah "+ this.consistencyRasio +" untuk proporsi ketidakkonsistenan CR (Consistency Rasio) lebih dari 0.10 yang merupakan standar yang dapat kami asumsikan bahwa metrik ini tidak cukup konsisten";
    }
    var sortable = [];
    Object.keys(this.matrixEigen).forEach(row => {
        sortable.push({
            'kriteria': row,
            'bobot': this.matrixEigen[row]['vector eigen'],
            'persentase': (this.matrixEigen[row]['vector eigen'] * 100).toFixed(2) + "%"
        });
    });

    // Sort array
    sortable.sort(function(a, b) {
        return b.bobot - a.bobot;
    });
    return {
        matrixEigen: this.matrixEigen,
        matrixPerbandingan: this.matrixPerbandingan,
        matrixKonsistensi: this.matrixKonsistensi,
        eigenMaximum: this.eigenMaximum,
        consistencyIndex: this.consistencyIndex,
        consistencyRasio: this.consistencyRasio,
        lambdaMax: this.lambdaMax,
        kesimpulan: this.kesimpulan,
        RI: RI,
    };
}