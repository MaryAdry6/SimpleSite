# TEMA 1
#
# Torrente -> peer to peer
# lsof -i : port -> porturi disponibile
# clientul si serverul comunica mereu in bytes --> bytestream
# Host --> singurul header obligatoriu de la HTTP




import socket
import os

# creeaza un server socket
serversocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
# specifica ca serverul va rula pe portul 5678, accesibil de pe orice ip al serverului
serversocket.bind(('', 5678))
# serverul poate accepta conexiuni; specifica cati clienti pot astepta la coada
serversocket.listen(5) 

while True:
    print ('#########################################################################')
    print ('Serverul asculta potentiali clienti.')
    # asteapta conectarea unui client la server

    # metoda `accept` este blocanta => clientsocket, care reprezinta socket-ul corespunzator clientului conectat
    (clientsocket, address) = serversocket.accept()
    print ('S-a conectat un client.')

    # se proceseaza cererea si se citeste prima linie de text
    cerere = ''
    linieDeStart = ''

    while True:
        data = clientsocket.recv(1024) # se citesc cate 1024 de bytes
        if not data: # previne bucla infinita daca browserul inchide conexiunea brusc
            break
        cerere = cerere + data.decode()
        print ('S-a citit mesajul: \n---------------------------\n' + cerere + '\n---------------------------')
        pozitie = cerere.find('\r\n')
        if (pozitie > -1):
            linieDeStart = cerere[0:pozitie]
            print ('S-a citit linia de start din cerere: ##### ' + linieDeStart + '#####')
            break
        
    # daca conexiunea s-a inchis inainte sa primim o cerere valida, trecem peste
    if not linieDeStart:
        clientsocket.close()
        continue



    elemente = linieDeStart.split(' ')
    if len(elemente) > 1:
        resursa_ceruta = elemente[1]
    else:
        resursa_ceruta = '/'

    # resursa implicita este index.html
    if resursa_ceruta == '/':
        resursa_ceruta = '/index.html'

    cale_fisier = 'continut' + resursa_ceruta

    # citire fisier si trimitere raspuns
    try:
        with open(cale_fisier, 'rb') as fisier:
            continut_fisier = fisier.read()
            
        dimensiune = len(continut_fisier)
        
        raspuns_headers = (
            "HTTP/1.1 200 OK\r\n"
            f"Content-Length: {dimensiune}\r\n"
            "Connection: close\r\n"
            "\r\n"
        )
        
        clientsocket.sendall(raspuns_headers.encode() + continut_fisier)
        print(f'S-a trimis fisierul: {cale_fisier} ({dimensiune} bytes)')

    except FileNotFoundError:
        mesaj_eroare = b"Eroare 404: Fisierul nu a fost gasit."
        dimensiune_eroare = len(mesaj_eroare)
        
        raspuns_headers_404 = (
            "HTTP/1.1 404 Not Found\r\n"
            f"Content-Length: {dimensiune_eroare}\r\n"
            "Content-Type: text/plain; charset=utf-8\r\n"
            "Connection: close\r\n"
            "\r\n"
        )
        
        clientsocket.sendall(raspuns_headers_404.encode() + mesaj_eroare)
        print(f'EROARE 404: Resursa {cale_fisier} nu exista.')

    clientsocket.close()
    print ('S-a terminat cititrea.')

    # cerinta 1
    # # TODO interpretarea sirului de caractere `linieDeStart` pentru a extrage numele resursei cerute
    # elemente = linieDeStart.split(' ')
    # resursa_ceruta = elemente[1]

    # # TODO trimiterea răspunsului HTTP
    # mesaj = "Hello World! - " + resursa_ceruta

    # raspuns_http = (
    #     "HTTP/1.1 200 OK\r\n"
    #     "Content-Type: text/plain; charset=utf-8\r\n"
    #     "Connection: close\r\n"
    #     "\r\n"
    #     f"{mesaj}"
    # )
    # clientsocket.sendall(raspuns_http.encode()) # trimitere codificat ca bytestream


    clientsocket.close()
    print ('S-a terminat comunicarea cu clientul.')