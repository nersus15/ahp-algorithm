$(document).ready(function(){
    var render_table = function(){
        var main = $('main');
        var kriteria = {
            "Harga-Storage": 5,
            "Harga-Kamera": 4, 
            "Kamera-Storage": 2,
            "Harga-Tampilan": 7,
            "Storage-Tampilan": 3,
            "Kamera-Tampilan": 3,
    
        }
        var data = buatMatrixPerbandingan(kriteria).buatMatrixEigen().hitunKonsistensi().hasil();
        
        // Render Table Perbandingan
        console.log(data.matrixPerbandingan);
        var tablePerbandingan = "<h5> Tabel Perbandingan </h5><table class='table table-striped table-bordered' id='tabel-perbandingan'><thead></tr><th>Kriteria</th></tr></thead><tbody></tbody></table>";
        main.append(tablePerbandingan);
        tablePerbandingan = $("#tabel-perbandingan");

        Object.keys(data.matrixPerbandingan).forEach((row, index) => {
            if(row != 'jumlah')
                tablePerbandingan.find('thead tr').append('<th>' + row + '</th>');
            tablePerbandingan.find('tbody').append("<tr><th>" + row + "</th></tr>")
            Object.keys(data.matrixPerbandingan[row]).forEach(column => {
                var rowEl = tablePerbandingan.find('tbody tr');
                $(rowEl[index]).append("<td>" + data.matrixPerbandingan[row][column] + "</td>");
            });
        }); 

        // Render Table Bobot Kriteria
        console.log(data.matrixEigen);
        var tableBobotKriteria = "<h5> Tabel Bobot Kriteria </h5><table class='table table-striped table-bordered' id='tabel-bobot-kriteria'><thead></tr><th>Kriteria</th></tr></thead><tbody></tbody></table>";
        main.append(tableBobotKriteria);
        tableBobotKriteria = $("#tabel-bobot-kriteria");

        Object.keys(data.matrixEigen).forEach((row, index) => {
            tableBobotKriteria.find('thead tr').append('<th>' + row + '</th>');
            tableBobotKriteria.find('tbody').append("<tr><th>" + row + "</th></tr>")
            Object.keys(data.matrixEigen[row]).forEach(column => {
                if(column == 'jumlah') return
                var rowEl = tableBobotKriteria.find('tbody tr');
                $(rowEl[index]).append("<td>" + data.matrixEigen[row][column] + "</td>");
            });
        }); 
        tableBobotKriteria.find('thead tr').append('<th>Bobot Kriteria</th>');        
       

        // Render Table Konsistensi 1
        console.log(data.matrixKonsistensi);
        var tableBobotKonsistensi1 = "<h5> Menghitung Nilai Konsistensi </h5><table class='table table-striped table-bordered' id='tabel-bobot-konsistensi1'><thead><tr id='ket'><th>Bobot Kriteria</th></tr><tr><th></th></tr></thead><tbody></tbody></table>";
        main.append(tableBobotKonsistensi1);
        tableBobotKonsistensi1 = $("#tabel-bobot-konsistensi1");

        Object.keys(data.matrixKonsistensi).forEach((row, index) => {
            tableBobotKonsistensi1.find('thead tr#ket').append('<th>' + data.matrixEigen[row]['vector eigen'] + '</th>');
            tableBobotKonsistensi1.find('thead tr:not("#ket")').append('<th>' + row + '</th>');
            tableBobotKonsistensi1.find('tbody').append("<tr><th>" + row + "</th></tr>")
            Object.keys(data.matrixKonsistensi[row]).forEach(column => {
                if(column == 'jumlah' || column == 'rasio') return
                var rowEl = tableBobotKonsistensi1.find('tbody tr');
                $(rowEl[index]).append("<td>" + data.matrixPerbandingan[row][column] + " * " +  data.matrixEigen[column]['vector eigen'] + " = " + data.matrixKonsistensi[row][column] + "</td>");
            });
        });

    }();
});