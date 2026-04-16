function incarcaPersoane() {
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            
            var xmlDoc = this.responseXML;
            
            var tabelHtml = "<table class='tabel-persoane'>";
            tabelHtml += "<tr><th>Nume</th><th>Prenume</th><th>Vârstă</th><th>Înălțime</th><th>Adresă</th><th>Hobby</th><th>Studii</th></tr>";
            
            var persoane = xmlDoc.getElementsByTagName("persoana");
            
            for (var i = 0; i < persoane.length; i++) {
                var nume = persoane[i].getElementsByTagName("nume")[0].childNodes[0].nodeValue;
                var prenume = persoane[i].getElementsByTagName("prenume")[0].childNodes[0].nodeValue;
                var varsta = persoane[i].getElementsByTagName("varsta")[0].childNodes[0].nodeValue;
                var inaltime = persoane[i].getElementsByTagName("inaltime")[0].childNodes[0].nodeValue;
                
                var strada = persoane[i].getElementsByTagName("strada")[0].childNodes[0].nodeValue;
                var numar = persoane[i].getElementsByTagName("numar")[0].childNodes[0].nodeValue;
                var localitate = persoane[i].getElementsByTagName("localitate")[0].childNodes[0].nodeValue;
                var judet = persoane[i].getElementsByTagName("judet")[0].childNodes[0].nodeValue;
                var tara = persoane[i].getElementsByTagName("tara")[0].childNodes[0].nodeValue;
                
                var adresa = strada + " nr. " + numar + ", " + localitate + ", jud. " + judet + ", " + tara;
                
                var hobby = persoane[i].getElementsByTagName("hobby")[0].childNodes[0].nodeValue;
                var studii = persoane[i].getElementsByTagName("studii")[0].childNodes[0].nodeValue;
                
                tabelHtml += "<tr>";
                tabelHtml += "<td>" + nume + "</td>";
                tabelHtml += "<td>" + prenume + "</td>";
                tabelHtml += "<td>" + varsta + " ani</td>";
                tabelHtml += "<td>" + inaltime + " m</td>";
                tabelHtml += "<td>" + adresa + "</td>";
                tabelHtml += "<td>" + hobby + "</td>";
                tabelHtml += "<td>" + studii + "</td>";
                tabelHtml += "</tr>";
            }
            tabelHtml += "</table>";
            
            document.getElementById("tabel-AJAX").innerHTML = tabelHtml;
            
        } else if (this.readyState == 4 && this.status != 200) {
            document.getElementById("tabel-AJAX").innerHTML = "<p>Eroare la încărcarea datelor!</p>";
        }
    };

    xhttp.open("GET", "/resurse/persoane.xml", true);
    xhttp.send();
}