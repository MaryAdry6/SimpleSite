# Torrente -> peer to peer
# lsof -i : port -> porturi disponibile
# clientul si serverul comunica mereu in bytes --> bytestream
# Host --> singurul header obligatoriu de la HTTP


import socket
import os
import gzip
import threading


# ***********************************************************************************************************
# cerinta 3
def proceseaza_client(clientsocket, address):
    print(f"[Thread Nou] Un client s-a conectat de la {address}")
    
    try:
        cerere = ''
        linieDeStart = ''

        while True:
            data = clientsocket.recv(1024)
            if not data:
                break
            cerere = cerere + data.decode()
            pozitie = cerere.find('\r\n')
            if (pozitie > -1):
                linieDeStart = cerere[0:pozitie]
                print(f"[{address}] S-a citit linia de start: {linieDeStart}")
                break
            
        if not linieDeStart:
            return

        elemente = linieDeStart.split(' ')
        if len(elemente) > 1:
            resursa_ceruta = elemente[1]
        else:
            resursa_ceruta = '/'

        if resursa_ceruta == '/':
            resursa_ceruta = '/index.html'

        cale_fisier = 'continut' + resursa_ceruta

        try:
            with open(cale_fisier, 'rb') as fisier:
                continut_fisier = fisier.read()


            if cale_fisier.endswith('.json'):
                tip_continut = 'application/json'
            elif cale_fisier.endswith('.xml'):
                tip_continut = 'application/xml'
            elif cale_fisier.endswith('.css'):
                tip_continut = 'text/css'
            elif cale_fisier.endswith('.js'):
                tip_continut = 'application/javascript'
            elif cale_fisier.endswith('.png') or cale_fisier.endswith('.ico'):
                tip_continut = 'image/png'
            else:
                # Daca e .html sau nu recunoastem extensia, il tratam ca html
                tip_continut = 'text/html'
                

            # compresia gzip
            continut_comprimat = gzip.compress(continut_fisier)
            dimensiune = len(continut_comprimat)
            
            raspuns_headers = (
                "HTTP/1.1 200 OK\r\n"
                f"Content-Length: {dimensiune}\r\n"
                f"Content-Type: {tip_continut}; charset=utf-8\r\n"
                "Content-Encoding: gzip\r\n"
                "Connection: close\r\n"
                "\r\n"
            )
            
            clientsocket.sendall(raspuns_headers.encode() + continut_comprimat)
            print(f"[{address}] Trimis: {cale_fisier} (Comprimat: {dimensiune} bytes)")

        except FileNotFoundError:
            mesaj_eroare = b"Eroare 404: Fisierul nu a fost gasit."
            mesaj_eroare_comprimat = gzip.compress(mesaj_eroare)
            dimensiune_eroare = len(mesaj_eroare_comprimat)
            
            raspuns_headers_404 = (
                "HTTP/1.1 404 Not Found\r\n"
                f"Content-Length: {dimensiune_eroare}\r\n"
                "Content-Type: text/plain; charset=utf-8\r\n"
                "Content-Encoding: gzip\r\n"
                "Connection: close\r\n"
                "\r\n"
            )
            
            clientsocket.sendall(raspuns_headers_404.encode() + mesaj_eroare_comprimat)
            print(f"[{address}] EROARE 404: Resursa {cale_fisier} nu exista.")

    except Exception as e:
        print(f"[{address}] Eroare neasteptata: {e}")
    finally:    
        clientsocket.close()
        print(f"[Thread Inchis] S-a terminat comunicarea cu clientul {address}.\n")
# ***********************************************************************************************************











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

    thread_client = threading.Thread(target=proceseaza_client, args=(clientsocket, address))
    thread_client.start()









    # ***********************************************************************************************************
    # cerinta 2
    # # se proceseaza cererea si se citeste prima linie de text
    # cerere = ''
    # linieDeStart = ''

    # while True:
    #     data = clientsocket.recv(1024) # se citesc cate 1024 de bytes
    #     if not data: # previne bucla infinita daca browserul inchide conexiunea brusc
    #         break
    #     cerere = cerere + data.decode()
    #     print ('S-a citit mesajul: \n---------------------------\n' + cerere + '\n---------------------------')
    #     pozitie = cerere.find('\r\n')
    #     if (pozitie > -1):
    #         linieDeStart = cerere[0:pozitie]
    #         print ('S-a citit linia de start din cerere: ##### ' + linieDeStart + '#####')
    #         break
        
    # # daca conexiunea s-a inchis inainte sa primim o cerere valida, trecem peste
    # if not linieDeStart:
    #     clientsocket.close()
    #     continue



    # elemente = linieDeStart.split(' ')
    # if len(elemente) > 1:
    #     resursa_ceruta = elemente[1]
    # else:
    #     resursa_ceruta = '/'

    # # resursa implicita este index.html
    # if resursa_ceruta == '/':
    #     resursa_ceruta = '/index.html'

    # cale_fisier = 'continut' + resursa_ceruta

    # # citire fisier si trimitere raspuns
    # try:
    #     with open(cale_fisier, 'rb') as fisier:
    #         continut_fisier = fisier.read()
            
    #     dimensiune = len(continut_fisier)
        
    #     raspuns_headers = (
    #         "HTTP/1.1 200 OK\r\n"
    #         f"Content-Length: {dimensiune}\r\n"
    #         # "Content-Type: \r\n"
    #         "Connection: close\r\n"
    #         "\r\n"
    #     )
        
    #     clientsocket.sendall(raspuns_headers.encode() + continut_fisier)
    #     print(f'S-a trimis fisierul: {cale_fisier} ({dimensiune} bytes)')

    # except FileNotFoundError:
    #     mesaj_eroare = b"Eroare 404: Fisierul nu a fost gasit."
    #     dimensiune_eroare = len(mesaj_eroare)
        
    #     raspuns_headers_404 = (
    #         "HTTP/1.1 404 Not Found\r\n"
    #         f"Content-Length: {dimensiune_eroare}\r\n"
    #         "Content-Type: text/plain; charset=utf-8\r\n"
    #         "Connection: close\r\n"
    #         "\r\n"
    #     )
        
    #     clientsocket.sendall(raspuns_headers_404.encode() + mesaj_eroare)
    #     print(f'EROARE 404: Resursa {cale_fisier} nu exista.')
    # ***********************************************************************************************************








    # ***********************************************************************************************************
    # inchiderea se face in functie
    # clientsocket.close()
    # print ('S-a terminat cititrea.')
    # ***********************************************************************************************************










    # ***********************************************************************************************************
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
    # ***********************************************************************************************************









    # ***********************************************************************************************************
    # inchiderea se face in functie
    # clientsocket.close()
    # print ('S-a terminat comunicarea cu clientul.')
    # ***********************************************************************************************************











'''
***********************************************************************************************************
conexiune de pe alta masina:
trebuie conectata la aceeasi retea WI-FI ca masina serverului
de pe masina serverului, cu ipconfig se afla adresa ip cu care se acceseaza site-ul (ultima de jos)
va fi de forma: http://192.168.X.X:5678/
***********************************************************************************************************
'''
