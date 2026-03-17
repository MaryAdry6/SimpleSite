/*
BOM = BROWSER OBJECT MODEL = toata structura site-ului
DOM = DOCUMENT OBJECT MODEL = modalitate de a parsa html intr-un arbore

window.addEventListener("load", initpage);
function initpage() {
    document.getElementById("nume_id").innerHTML = "Data Curenta" + new Date();
}
Locatie: window.navigator.geolocation;

setInterval(changeDate, 1000); //in ms => 1 secunda

ctx.fillRect(Xmin, Ymin, width, height);
ctx.strokeRect(Xmin, Ymin, width, height);
event.offsetX;

*/

//SECTIUNEA 1
window.addEventListener("load", initpage);

function initpage() {
    //DATA + ORA
    function changeDate() {
        const acum = new Date();
        document.getElementById('info-data').innerHTML = acum.toLocaleString('ro-RO');
    }
    setInterval(changeDate, 1000);
    changeDate();

    //ADRESA URL
    document.getElementById('info-url').innerHTML = window.location.href;

    //BROWSER + SO
    function detecteazaSistemul() {
        const x = window.navigator.userAgent;
        let browser = "Necunoscut";
        let os = "Necunoscut";

        if (x.indexOf("Win") !== -1) os = "Windows";
        else if (x.indexOf("Mac") !== -1) os = "MacOS";
        else if (x.indexOf("Linux") !== -1) os = "Linux";
        else if (x.indexOf("Android") !== -1) os = "Android";
        else if (x.indexOf("like Mac") !== -1) os = "iOS";

        if (x.indexOf("Firefox") !== -1) browser = "Mozilla Firefox";
        else if (x.indexOf("Opera") !== -1 || x.indexOf("OPR") !== -1) browser = "Opera";
        else if (x.indexOf("Edge") !== -1 || x.indexOf("Edg") !== -1) browser = "Microsoft Edge";
        else if (x.indexOf("Chrome") !== -1) browser = "Google Chrome";
        else if (x.indexOf("Safari") !== -1) browser = "Apple Safari";

        return { browser, os };
    }

    const sysInfo = detecteazaSistemul();
    document.getElementById('info-browser').innerHTML = sysInfo.browser;
    document.getElementById('info-os').innerHTML = sysInfo.os;

    //LOCATIA
    const locSpan = document.getElementById('info-locatie');
    if ("geolocation" in window.navigator) {
        window.navigator.geolocation.getCurrentPosition(
            function(pozitie) {
                locSpan.innerHTML = `Lat: ${pozitie.coords.latitude.toFixed(4)}, Long: ${pozitie.coords.longitude.toFixed(4)}`;
            },
            function(eroare) {
                locSpan.innerHTML = "Permisiune refuzată sau locație indisponibilă.";
            }
        );
    } else {
        locSpan.innerHTML = "Geolocația nu este suportată de browser-ul tău.";
    }
    


    //SECTIUNEA 2
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    const culoareContur = document.getElementById("contur");
    const culoareUmplere = document.getElementById("umplere");
    
    ctx.lineWidth = 2;
    
    let nrClickuri = 0;
    let startX = 0;
    let startY = 0;
    
    canvas.addEventListener("click", function(event) {
        if (nrClickuri === 0) {
            startX = event.offsetX;
            startY = event.offsetY;
            nrClickuri = 1;
        } else {
            let endX = event.offsetX;
            let endY = event.offsetY;
    
            let Xmin = Math.min(startX, endX);
            let Ymin = Math.min(startY, endY);
            
            let width = Math.abs(endX - startX);
            let height = Math.abs(endY - startY);
    
            ctx.fillStyle = culoareUmplere.value;
            ctx.strokeStyle = culoareContur.value;
    
            ctx.strokeRect(Xmin, Ymin, width, height);
            ctx.fillRect(Xmin, Ymin, width, height);
    
            nrClickuri = 0;
        }
    });
    
    
    
    //SECTIUNEA 3
}

