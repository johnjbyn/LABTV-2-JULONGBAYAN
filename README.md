## Funzionalità Principali

### Gestione Contenuti
- **Ricerca Avanzata e Filtri Personalizzati**: Sistema di ricerca per titolo e filtri per genere
- **Dettagli Completi**: Pagine dettagliate con cast, registra, trailer e altre informazioni 

### Sistema Utenti
- **Registrazione e Login**: Autenticazione con validazione email e password

### Acquisti
- **Acquisti Film**: Sistema di acquisto con prezzi dinamici basati su rating e popolarità
- **Acquisti Stagioni**: Possibilità di acquistare singole stagioni di serie TV
- **Gestione Acquisti**: Visualizzazione cronologia e cancellazione
- **Prezzi Dinamici**: Calcolo automatico prezzi (€2.99-€6.99 per film, €2.99-€4.99 per stagioni)

### Interfaccia Utente
- **Design Responsive**: Ottimizzato per desktop e mobile
- **Componenti Riutilizzabili**: Movie cards, header, footer modulari

### Frontend (Angular)
- **Routing**: Navigazione tra Home, Contatti, Login, Registrazione, Acquisti, Catalogo
- **Servizi**: 
  - `MovieService`: Gestione API TMDB per contenuti
  - `AuthService`: Autenticazione e gestione utenti
  - `PurchaseService`: Gestione acquisti e pagamenti mock
- **Modelli**: Interfacce TypeScript per Movie, User, Purchase
- **Componenti**: Pagine e componenti riutilizzabili

### (JSON Server)
- **Database Locale**: File `db.json` con tabelle users, acquisti, film
- **Configurazione**: File `routes.json` per routing personalizzato

## Utilizzo

- **users**: Gestione utenti con ruoli (utente/amministratore)
- **acquisti**: Storico acquisti con prezzi e date
- **film**: Tracking interazioni utenti con contenuti (Click del popup viene registrato dal json)



- **Porta**: `3000`
- **Database**: File `db.json` con 3 tabelle
- **Funzione**: Salva utenti, acquisti e click sui film

#### Struttura Database
```json
{
  "users": [],      // Utenti registrati
  "acquisti": [],   // Storico acquisti  
  "film": []        // Click sui film/serie tv (Card)
}
```

#### Link Principali

**Base URL**: `http://localhost:3000`

**Link Utili**:
- **Vedi Database**: http://localhost:3000 (interfaccia web)
- **Utenti**: http://localhost:3000/users         // Utenti registrati e dati utente
- **Acquisti**: http://localhost:3000/acquisti   // Storico acquisti e dati acquisto
- **Film**: http://localhost:3000/film     //// Click sui film/serie tv (Card) in futuro da implementare con gli interessi dell'utente in base ai film visti di recente

Reset del DB.json dopo il logout dell'utente
