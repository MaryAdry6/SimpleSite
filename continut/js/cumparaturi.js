class Produs {
    constructor(id, nume, cantitate) {
        this.id = id;
        this.nume = nume;
        this.cantitate = cantitate;
    }
}

const preiaProduse = () => {
    return new Promise((resolve) => {
        const date = localStorage.getItem('listaCumparaturi');
        resolve(date ? JSON.parse(date) : []);
    });
};

const salveazaProduse = (produse) => {
    return new Promise((resolve, reject) => {
        try {
            localStorage.setItem('listaCumparaturi', JSON.stringify(produse));
            resolve("Produsul a fost salvat cu succes!");
        } catch (eroare) {
            reject("A apărut o eroare la salvare: " + eroare.message);
        }
    });
};

function initCumparaturi() {
    const form = document.getElementById('form-cumparaturi');
    const mesajInfo = document.getElementById('mesaj');

    if (!form) return;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const numeProdus = document.getElementById('nume-prod').value;
        const cantitateProdus = document.getElementById('cantitate').value;

        if (numeProdus === "") {
            mesajInfo.textContent = "Te rugăm să alegi un produs!";
            return;
        }

        try {
            const produseExistente = await preiaProduse();

            const produsGasit = produseExistente.find(p => p.nume === numeProdus);

            if (produsGasit) {
                produsGasit.cantitate = parseInt(produsGasit.cantitate) + parseInt(cantitateProdus);
            } else {
                let urmatorulId = 1;
                if (produseExistente.length > 0) {
                    urmatorulId = Math.max(...produseExistente.map(p => p.id)) + 1;
                }

                const produsNou = new Produs(urmatorulId, numeProdus, parseInt(cantitateProdus));
                produseExistente.push(produsNou);
            }

            const raspunsSalvare = await salveazaProduse(produseExistente);

            mesajInfo.textContent = `${raspunsSalvare} (${numeProdus} x ${cantitateProdus})`;
            
            form.reset();
            
            setTimeout(() => { mesajInfo.textContent = ""; }, 3000);

        } catch (eroare) {
            mesajInfo.textContent = eroare;
        }
    });
}