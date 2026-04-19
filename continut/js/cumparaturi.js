class Produs {
    constructor(id, nume, cantitate) {
        this.id = id;
        this.nume = nume;
        this.cantitate = cantitate;
    }
}

class BazaStocare {
    constructor(metoda) {
        this.metoda = metoda;
    }

    async preia() { throw new Error("Trebuie implementat!"); }
    async salveaza(date) { throw new Error("Trebuie implementat!"); }
    async goleste() { throw new Error("Trebuie implementat!"); }
}

//***********************************************************************************************************
//Local Storage
class StocareLocalStorage extends BazaStocare {
    constructor() {
        super("Local Storage");
    }

    async preia() {
        const date = localStorage.getItem('listaCumparaturi');
        return date ? JSON.parse(date) : [];
    }

    async salveaza(produse) {
        localStorage.setItem('listaCumparaturi', JSON.stringify(produse));
        return "Salvat cu succes în Local Storage!";
    }

    async goleste() {
        localStorage.removeItem('listaCumparaturi');
    }
}

//***********************************************************************************************************
//IndexedDB
class StocareIndexedDB extends BazaStocare {
    constructor() {
        super("IndexedDB");
        this.dbName = "MagazinDB";
        this.storeName = "setari";
    }

    //initializare conexiune cu baza de date
    _conectareDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);
            
            //ruleaza doar cand se creeaza baza de date
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: "id" });
                }
            };
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject("Eroare la deschiderea IndexedDB");
        });
    }

    async preia() {
        const db = await this._conectareDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], "readonly");
            const store = transaction.objectStore(this.storeName);
            const request = store.get("listaProduse");

            request.onsuccess = () => {
                resolve(request.result ? request.result.date : []);
            };
            request.onerror = () => reject("Eroare la preluarea din IndexedDB");
        });
    }

    async salveaza(produse) {
        const db = await this._conectareDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], "readwrite");
            const store = transaction.objectStore(this.storeName);
            
            const request = store.put({ id: "listaProduse", date: produse });
            
            request.onsuccess = () => resolve("Salvat cu succes în IndexedDB!");
            request.onerror = () => reject("Eroare la salvarea în IndexedDB");
        });
    }

    async goleste() {
        const db = await this._conectareDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], "readwrite");
            const store = transaction.objectStore(this.storeName);
            const request = store.delete("listaProduse");
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject("Eroare la golirea IndexedDB");
        });
    }
}

let stocareActiva = new StocareLocalStorage();

async function afiseazaLista() {
    const corpTabel = document.getElementById('zona-tabel-body');
    if (!corpTabel) return;

    const produse = await stocareActiva.preia();

    if (produse.length === 0) {
        corpTabel.innerHTML = "<tr><td colspan='3'>Coșul este gol.</td></tr>";
        return;
    }

    let html = "";
    produse.forEach((p, index) => {
        html += `<tr>
                    <td>${index + 1}</td>
                    <td>${p.nume}</td>
                    <td>${p.cantitate}</td>
                 </tr>`;
    });
    
    corpTabel.innerHTML = html;
}

function initCumparaturi() {
    const form = document.getElementById('form-cumparaturi');
    const mesajInfo = document.getElementById('mesaj');
    const metodaAleasa = document.querySelectorAll('input[name="metoda_stocare"]');

    if (!form) return;

    afiseazaLista();

    metodaAleasa.forEach(radio => {
        radio.addEventListener('change', (event) => {
            if (event.target.value === 'localstorage') {
                stocareActiva = new StocareLocalStorage();
            } else {
                stocareActiva = new StocareIndexedDB();
            }

            afiseazaLista();
            mesajInfo.textContent = `Ai comutat pe ${stocareActiva.metoda}`;
            setTimeout(() => { mesajInfo.textContent = ""; }, 3000);
        });
    });


    let workerCumparaturi;
    if (window.Worker) {
        workerCumparaturi = new Worker('js/worker.js');
        workerCumparaturi.onmessage = function(event) {
            if (event.data === "actualizeaza_tabel") {
                afiseazaLista();
            }
        };
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const numeProdus = document.getElementById('nume-prod').value;
        const cantitateProdus = document.getElementById('cantitate').value;

        if (numeProdus === "") {
            mesajInfo.textContent = "Te rugăm să alegi un produs!";
            return;
        }

        try {
            const produseExistente = await stocareActiva.preia();
            const produsGasit = produseExistente.find(p => p.nume === numeProdus);

            if (produsGasit) {
                produsGasit.cantitate = parseInt(produsGasit.cantitate) + parseInt(cantitateProdus);
            } else {
                let urmatorulId = 1;
                if (produseExistente.length > 0) {
                    urmatorulId = Math.max(...produseExistente.map(p => p.id)) + 1;
                }
                produseExistente.push(new Produs(urmatorulId, numeProdus, parseInt(cantitateProdus)));
            }

            const raspunsSalvare = await stocareActiva.salveaza(produseExistente);

            mesajInfo.textContent = `${raspunsSalvare} (${numeProdus} x ${cantitateProdus})`;
            form.reset();
            setTimeout(() => { mesajInfo.textContent = ""; }, 3000);

            if (workerCumparaturi) {
                workerCumparaturi.postMessage({ nume: numeProdus, cantitate: cantitateProdus });
            } else {
                afiseazaLista();
            }

        } catch (eroare) {
            mesajInfo.textContent = eroare;
        }
    });

    const btnGoleste = document.getElementById('btn-goleste-lista');
    if (btnGoleste) {
        btnGoleste.addEventListener('click', async () => {
            if (confirm(`Ești sigur că vrei să ștergi coșul din ${stocareActiva.metoda}?`)) {
                
                await stocareActiva.goleste();
                
                afiseazaLista();
                mesajInfo.textContent = `Coșul a fost golit din ${stocareActiva.metoda}!`;
                setTimeout(() => { mesajInfo.textContent = ""; }, 3000);
            }
        });
    }
}