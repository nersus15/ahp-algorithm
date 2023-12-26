$(document).ready(function(){
    var mainData = {
        kriteria: [],
        subkriteria: [],
        bobotKriteria: {},
        bobotSubKriteria: {},
    };

    var cackey = 'key-data';

    // Event listener
    $("#load-cache").click(function(){
        var cache = localStorage.getItem(cackey);

        if(!cache){
            alert("Cache kosong!!");
            return;
        }

        mainData = JSON.parse(cache);
        setTimeout(function(){
            if(mainData.kriteria.length > 0){
                mainData.kriteria.forEach(k => {
                    if(k){
                        addKriteria(k, false);
                    }
                })
            }
        }, 1000)
        setTimeout(function(){
            if(mainData.subkriteria.length > 0){
                mainData.subkriteria.forEach(k => {
                    if(k){
                        console.log(k);
                        addSubKriteria(k, false)
                    }
                })
            }
        }, 1000)
    });

    $("#save-cache").click(function(){
        localStorage.setItem(cackey, JSON.stringify(mainData));
        alert("Data saved as cache")
    });
    $("#kriteria, #sub-kriteria").keyup(function(){
        var ini = $(this);
        var id = ini.attr('id');
        // if(ini.val())
            // $("#alias-" + id).text("Alias: " + ini.val().replaceAll(' ', ''));
    });

    $("#input-bobot").click(function(){
        if(mainData.kriteria.length > 0)
            renderInputBobotKriteria(mainData.bobotKriteria);
        if(mainData.subkriteria.length > 0)
            setTimeout(function(){
                renderInputBobotSubKriteria(mainData.bobotSubKriteria);
            }, 1000);
    });

    $("#btn-kriteria, #btn-sub-kriteria").click(function(){
        var id = $(this).attr('id');
        var el = id == 'btn-kriteria' ? $("#kriteria") : $("#sub-kriteria");
        if(id == 'btn-kriteria' && el.val())
            addKriteria(el.val());
        else
            addSubKriteria(el.val());
        el.val('');
    });

    $("#proses").click(function(){
        if(mainData.kriteria.length < 2)
            return;

        console.log("=====> Proccess Started <======");
        render_table(mainData.bobotKriteria, 'kriteria');

        if(Object.keys(mainData.bobotSubKriteria).length > 0){
            Object.keys(mainData.bobotSubKriteria).forEach( k =>{
                    if(Object.keys(mainData.bobotSubKriteria[k]).length > 0)
                        render_table(mainData.bobotSubKriteria[k], k);
                }
            );
        }
    });

    function addKriteria(kriteria, add = true){
        if(add)
            mainData.kriteria.push(kriteria);
        renderKriteria();
        if(!mainData.bobotSubKriteria[kriteria.toLowerCase().replaceAll(' ', '-')])
            mainData.bobotSubKriteria[kriteria.toLowerCase().replaceAll(' ', '-')] = {};
    }

    function removeKriteria(kriteria){
        var index = mainData.kriteria.indexOf(kriteria);
        mainData.kriteria.splice(index, 1);

        renderKriteria();

        if(mainData.bobotSubKriteria[kriteria.toLowerCase().replaceAll(' ', '-')])
            delete mainData.bobotSubKriteria[kriteria.toLowerCase().replaceAll(' ', '-')];
    }

    function renderKriteria(){
        var el = $("#list-kriteria");
        el.empty();
        mainData.kriteria.forEach(k => {
            el.append('<li>' + k + ' <button data-val="'+ k +'" class="btn btn-danger btn-sm btn-remove-kriteria">hapus</button> </li>')
        });

        $(".btn-remove-kriteria").off('click');
        $(".btn-remove-kriteria").click(function(){
            removeKriteria($(this).data('val'));
        });
    }

    function addSubKriteria(subkriteria, add = true){
        if(add)
            mainData.subkriteria.push(subkriteria);
        renderSubKriteria();
    }

    function removeSubKriteria(subkriteria){
        var index = mainData.subkriteria.indexOf(subkriteria);
        mainData.subkriteria.splice(index, 1);

        renderSubKriteria();
    }

    function renderSubKriteria(){
        var el = $("#list-subkriteria");
        el.empty();

        mainData.subkriteria.forEach(k => {
            el.append('<li>' + k + ' <button data-val="'+ k +'" class="btn btn-danger btn-sm btn-remove-sub-kriteria">hapus</button> </li>')
        });

        $(".btn-remove-sub-kriteria").off('click');
        $(".btn-remove-sub-kriteria").click(function(){
            removeSubKriteria($(this).data('val'));
        });
    }

    function renderInputBobotKriteria(initialValue = {}){
        var el = $("#bobot-kriteria");
        el.empty();
        mainData.bobotKriteria = {};
        if(mainData.kriteria.length < 2)
            return;

        var listed = [];
        for (let i = 0; i < mainData.kriteria.length - 1; i++) {
            for (let j = 1; j < mainData.kriteria.length; j++) {
                var key = mainData.kriteria[i] + '-' + mainData.kriteria[j];
                var key2 = mainData.kriteria[j] + '-' + mainData.kriteria[i];
                if(i == j || listed.indexOf(key) >= 0 || listed.indexOf(key2) >= 0) continue;
                listed.push(key);
                var value = initialValue[key] ? initialValue[key] : "" ;
                el.append('<li>' + key + ' <input value="'+ value +'" data-key="'+ key +'" class="bobot-kriteria form-control"> </li>')

            }
        }
        
        $(".bobot-kriteria").off('blur');

        $(".bobot-kriteria").blur(function(){
            var nilai = $(this).val();
            var key = $(this).data('key');

            if(nilai && nilai > 0){
                mainData.bobotKriteria[key] = parseFloat(nilai);
            }
        });

        if(Object.keys(initialValue).length > 0) $('.bobot-kriteria').trigger('blur')
    }

    function renderInputBobotSubKriteria(initialValue = {}){
        var el = $("#bobot-subkriteria");
        el.html('<h4>Bobot Sub Kriteria </h4>');
        mainData.bobotSubKriteria = {};
        if(mainData.subkriteria.length < 2)
            return;

        var ids = [];
        mainData.kriteria.forEach(k => {
            var id = k.toLowerCase().replaceAll(' ', '-');
            el.append('<ol id="bobot-' + id + '"> <p>'+k+'</p><hr></ol>');
            ids.push(id);
        });

        var listed2 = [];
        for (let i = 0; i < mainData.subkriteria.length - 1; i++) {
            for (let j = 1; j < mainData.subkriteria.length; j++) {
                var key = mainData.subkriteria[i] + '-' + mainData.subkriteria[j];
                var key2 = mainData.subkriteria[j] + '-' + mainData.subkriteria[i];
                if(i == j || listed2.indexOf(key) >= 0 || listed2.indexOf(key2) >= 0) continue;
                listed2.push(key);

                ids.forEach(id => {
                    var value = initialValue[id] && initialValue[id][key] ? initialValue[id][key] : "" ;
                    $("#bobot-" + id).append('<li>' + key + ' <input value="'+ value +'" data-parent="'+id+'" data-key="'+ key +'" class="bobot-subkriteria form-control"> </li>')   
                });
            }
        }
        
        
        $(".bobot-subkriteria").off('blur');

        $(".bobot-subkriteria").blur(function(){
            var nilai = $(this).val();
            var key = $(this).data('key');
            var parent = $(this).data('parent');

            if(nilai && nilai > 0 && mainData.bobotSubKriteria[parent]){
                mainData.bobotSubKriteria[parent][key] = parseFloat(nilai);
            }
        });

        if(Object.keys(initialValue).length > 0) $('.bobot-subkriteria').trigger('blur')
    }




    var render_table = function(data, key){
        var main = $('main');
        
        main.append("<h3 class='mt-5'>Proses perhitungan " + key.replaceAll('-', ' ') + ' </h5> <hr>');
        // Save to cache
        var data = buatMatrixPerbandingan(data).buatMatrixEigen().hitunKonsistensi().hasil();
        window.data = data;
        // Render Table Perbandingan
        console.log(data.matrixPerbandingan);
        var tablePerbandingan = "<h5> Tabel Perbandingan </h5><table class='table table-striped table-bordered' id='tabel-perbandingan-"+key+"'><thead></tr><th>Kriteria</th></tr></thead><tbody></tbody></table>";
        main.append(tablePerbandingan);
        tablePerbandingan = $("#tabel-perbandingan-" + key);

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
        var tableBobotKriteria = "<h5> Tabel Bobot Kriteria </h5><table class='table table-striped table-bordered' id='tabel-bobot-kriteria-"+key+"'><thead></tr><th>Kriteria</th></tr></thead><tbody></tbody></table>";
        main.append(tableBobotKriteria);
        tableBobotKriteria = $("#tabel-bobot-kriteria-" + key);

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
        var tableBobotKonsistensi1 = "<h5> Menghitung Nilai Konsistensi </h5><table class='table table-striped table-bordered' id='tabel-bobot-konsistensi1-"+key+"'><thead><tr id='ket'><th>Bobot Kriteria</th></tr><tr><th></th></tr></thead><tbody></tbody></table>";
        main.append(tableBobotKonsistensi1);
        tableBobotKonsistensi1 = $("#tabel-bobot-konsistensi1-" + key);

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

        // Render CI, CR, Lambda Max, kesimpulan

        main.append("<p class='mt-3'>&lambda; Max = " + data.lambdaMax + " </p>");
        main.append("<p class=''>CI = " + data.consistencyIndex + " </p>");
        main.append("<p class=''>CR = " + data.consistencyRasio + " </p>");
        main.append("<p class=''>" + data.kesimpulan + " </p>");

    };
});

