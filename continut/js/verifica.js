function valideaza() {
    var utilizatorIntrodus = document.getElementById("verifica-username").value;
    var parolaIntrodusa = document.getElementById("verifica-password").value;
    var zonaRezultat = document.getElementById("verificare");

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var utilizatori = JSON.parse(this.responseText);
            var gasit = false;

            for (var i = 0; i < utilizatori.length; i++) {
                if (utilizatori[i].utilizator === utilizatorIntrodus && 
                    utilizatori[i].parola === parolaIntrodusa) {
                    gasit = true;
                    break;
                }
            }

            if (gasit) {
                zonaRezultat.innerHTML = "Utilizator și parolă corecte!";
            } else {
                zonaRezultat.innerHTML = "Nume de utilizator sau parolă incorecte.";
            }
        }
    };
    
    xhttp.open("GET", "/resurse/utilizatori.json", true);
    xhttp.send();
}