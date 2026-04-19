self.addEventListener('message', function(eveniment) {
    const datePrimite = eveniment.data;
    console.log(`[Worker] Utilizatorul a adăugat produsul: ${datePrimite.nume} (Cantitate: ${datePrimite.cantitate})`);
    self.postMessage("actualizeaza_tabel");
});