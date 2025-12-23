# Feature Specification: MarkEdit Markdown Linter & Formatter

**Feature Branch**: `001-markdown-linter`
**Created**: 2025-12-23
**Status**: Draft
**Input**: Plugin di linting e formattazione Markdown per MarkEdit (editor macOS). Validazione in tempo reale, regole configurabili (MD001-MD022), formattazione automatica con comando, configurazione via .markdownlintrc. Quick fix, statistiche, integrazione AppleScript.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Real-time Markdown Validation (Priority: P1)

Un utente sta scrivendo un documento Markdown in MarkEdit. Mentre digita, il plugin analizza automaticamente il contenuto e mostra indicatori visivi (marker colorati nella gutter) per segnalare problemi di formattazione, stile e struttura. L'utente può vedere immediatamente dove ci sono errori o warning senza dover eseguire comandi manuali.

**Why this priority**: La validazione in tempo reale è il valore core del plugin. Senza questa funzionalità, l'utente non avrebbe feedback immediato sulla qualità del proprio Markdown, rendendo le altre funzionalità meno utili.

**Independent Test**: Può essere testato aprendo un file Markdown con errori noti (es. heading che salta livelli, spazi trailing) e verificando che i marker appaiano nella posizione corretta.

**Acceptance Scenarios**:

1. **Given** un documento Markdown con un heading che salta dal livello 1 al livello 3, **When** l'utente apre il file, **Then** viene mostrato un marker di errore rosso sulla riga del heading di livello 3
2. **Given** un documento Markdown valido, **When** l'utente aggiunge spazi alla fine di una riga, **Then** appare un marker di errore sulla riga modificata entro 500ms
3. **Given** un documento con problemi, **When** l'utente posiziona il cursore su un marker, **Then** viene mostrato un tooltip con la descrizione del problema e il codice della regola violata

---

### User Story 2 - Automatic Document Formatting (Priority: P1)

Un utente ha un documento Markdown con vari problemi di formattazione (spazi inconsistenti, stili misti per liste, troppi blank lines consecutivi). Con un singolo comando, il plugin corregge automaticamente tutti i problemi risolvibili, preservando il contenuto semantico del documento.

**Why this priority**: La formattazione automatica è il secondo pilastro del plugin. Permette agli utenti di risolvere rapidamente i problemi senza doverli correggere uno per uno manualmente.

**Independent Test**: Può essere testato creando un documento con problemi noti, eseguendo il comando di formattazione, e verificando che il documento risultante sia conforme alle regole attive.

**Acceptance Scenarios**:

1. **Given** un documento con trailing spaces su 5 righe, **When** l'utente esegue Format Document, **Then** tutti i trailing spaces vengono rimossi
2. **Given** un documento con 3 righe vuote consecutive, **When** l'utente esegue Format Document, **Then** le righe vuote vengono ridotte a massimo 1
3. **Given** un documento con liste miste (-, *, +), **When** l'utente esegue Format Document con regola "consistent" attiva, **Then** tutte le liste usano lo stesso marker

---

### User Story 3 - Quick Fix for Single Issues (Priority: P2)

Un utente vede un marker di errore su una specifica riga e vuole correggere solo quel problema senza formattare l'intero documento. Posizionando il cursore sulla riga problematica e usando la scorciatoia Quick Fix, ottiene suggerimenti di correzione specifici che può applicare con un click.

**Why this priority**: Le quick fix offrono controllo granulare, ma sono meno critiche della validazione base e della formattazione globale.

**Independent Test**: Può essere testato posizionandosi su una riga con errore, attivando Quick Fix, e verificando che la correzione suggerita risolva il problema specifico.

**Acceptance Scenarios**:

1. **Given** una riga con heading senza spazio dopo #, **When** l'utente attiva Quick Fix, **Then** viene offerta l'opzione "Aggiungi spazio dopo #"
2. **Given** una riga con problema correggibile, **When** l'utente seleziona una quick fix, **Then** la correzione viene applicata e il marker scompare
3. **Given** una riga con problema non auto-correggibile, **When** l'utente attiva Quick Fix, **Then** viene mostrato solo un messaggio informativo senza opzioni di correzione automatica

---

### User Story 4 - Custom Rule Configuration (Priority: P2)

Un utente vuole personalizzare quali regole sono attive e con quale severità. Crea o modifica un file `.markdownlintrc` nella root del progetto o nella home directory, specificando regole da abilitare/disabilitare e parametri specifici (es. indentazione liste a 4 spazi invece di 2).

**Why this priority**: La configurabilità è importante per adattare il plugin a diversi stili e contesti, ma il plugin deve funzionare con defaults ragionevoli anche senza configurazione.

**Independent Test**: Può essere testato creando un file di configurazione che disabilita una regola specifica e verificando che quella regola non generi più marker.

**Acceptance Scenarios**:

1. **Given** nessun file di configurazione presente, **When** il plugin si avvia, **Then** vengono usate le regole di default con severità standard
2. **Given** un file `.markdownlintrc` che disabilita MD013 (line-length), **When** il plugin valida un documento con righe lunghe, **Then** non vengono mostrati marker per righe lunghe
3. **Given** un file di configurazione con `"MD007": { "indent": 4 }`, **When** viene validata una lista con indentazione 2, **Then** viene mostrato un warning

---

### User Story 5 - Statistics Display (Priority: P3)

Un utente vuole avere una panoramica della qualità del proprio documento. Può visualizzare statistiche aggregate: numero totale di problemi, suddivisione per categoria/severità, e percentuale di conformità alle regole attive.

**Why this priority**: Le statistiche sono utili per avere una visione d'insieme ma non sono essenziali per l'uso quotidiano del plugin.

**Independent Test**: Può essere testato aprendo un documento con problemi noti e verificando che le statistiche mostrate corrispondano al conteggio manuale dei problemi.

**Acceptance Scenarios**:

1. **Given** un documento con 5 errori e 3 warning, **When** l'utente guarda la status bar, **Then** vengono mostrati i conteggi (es. "5 errors, 3 warnings")
2. **Given** un documento con problemi, **When** l'utente clicca sulla status bar, **Then** viene mostrato un pannello dettagliato con breakdown per categoria e percentuale conformità
3. **Given** un documento senza problemi, **When** l'utente guarda la status bar, **Then** viene mostrato un indicatore positivo (es. checkmark verde)

---

### User Story 6 - AppleScript Integration (Priority: P3)

Un utente power-user vuole automatizzare il linting/formatting dei propri documenti tramite script macOS. Può invocare le funzionalità del plugin via AppleScript per integrarle in workflow più ampi (Shortcuts, Automator, script personalizzati).

**Why this priority**: L'integrazione AppleScript è una funzionalità avanzata per utenti esperti, non essenziale per l'uso base.

**Independent Test**: Può essere testato eseguendo uno script AppleScript che invoca il comando di formattazione e verificando che il documento venga modificato.

**Acceptance Scenarios**:

1. **Given** MarkEdit aperto con un documento, **When** viene eseguito uno script AppleScript che richiama format, **Then** il documento viene formattato
2. **Given** uno script che richiede lo stato di validazione, **When** viene eseguito, **Then** restituisce il numero di problemi trovati

---

### Edge Cases

- Cosa succede quando il documento è vuoto? Il plugin non deve mostrare errori e deve indicare 100% conformità
- Cosa succede con file Markdown molto grandi (>10.000 righe)? Il plugin deve mantenere performance accettabili con validazione asincrona/debounced
- Cosa succede se il file `.markdownlintrc` contiene JSON non valido? Il plugin deve mostrare un errore chiaro e usare le regole di default
- Cosa succede con caratteri Unicode/emoji nel documento? Il plugin deve gestirli correttamente senza crash
- Cosa succede durante operazioni di undo/redo rapide? I marker devono aggiornarsi correttamente senza desincronizzazione

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Il plugin DEVE analizzare il contenuto Markdown e identificare violazioni delle regole di linting attive
- **FR-002**: Il plugin DEVE mostrare marker visivi (indicatori colorati) nella gutter dell'editor per ogni problema trovato
- **FR-003**: Il plugin DEVE distinguere visivamente tre livelli di severità: Error (rosso), Warning (giallo), Info (blu)
- **FR-004**: Il plugin DEVE fornire tooltip informativi al passaggio del mouse sui marker, mostrando descrizione e codice regola
- **FR-005**: Il plugin DEVE aggiornare la validazione in tempo reale mentre l'utente digita, con debounce configurabile
- **FR-006**: Il plugin DEVE fornire un comando "Format Document" che corregge automaticamente i problemi risolvibili
- **FR-007**: Il plugin DEVE fornire Quick Fix contestuali per problemi singoli
- **FR-008**: Il plugin DEVE preservare il significato semantico del contenuto durante la formattazione automatica
- **FR-009**: Il plugin DEVE supportare configurazione tramite file `.markdownlintrc` in formato JSON
- **FR-010**: Il plugin DEVE cercare il file di configurazione in ordine: directory del documento, home directory, defaults
- **FR-011**: Il plugin DEVE supportare l'ereditarietà di configurazioni tramite la proprietà "extends"
- **FR-012**: Il plugin DEVE fornire statistiche sui problemi: totale, per severità, per categoria, percentuale conformità
- **FR-013**: Il plugin DEVE esporre le funzionalità principali (format, validate) via AppleScript
- **FR-014**: Il plugin DEVE supportare commenti inline per disabilitare regole su blocchi specifici
- **FR-015**: Il plugin DEVE fornire scorciatoie da tastiera predefinite per le azioni principali (Format: Cmd+Shift+F, Quick Fix: Cmd+., Toggle: Cmd+Shift+L)

### Regole di Linting Supportate

Il plugin DEVE implementare le seguenti regole markdownlint:

| ID | Nome | Descrizione | Default |
|----|------|-------------|---------|
| MD001 | heading-increment | Heading aumentano di 1 livello alla volta | Error |
| MD003 | heading-style | Stile heading consistente (atx vs setext) | Warning |
| MD004 | ul-style | Stile liste non ordinate consistente | Warning |
| MD005 | list-indent | Indentazione lista consistente | Error |
| MD007 | ul-indent | Lista non ordinata indentata correttamente | Warning |
| MD009 | no-trailing-spaces | Nessuno spazio a fine riga | Error |
| MD010 | no-hard-tabs | Nessun tab, solo spazi | Error |
| MD012 | no-multiple-blanks | Massimo 1 riga vuota consecutiva | Warning |
| MD013 | line-length | Lunghezza massima riga (default 80) | Info |
| MD014 | commands-show-output | Code block non iniziano con $ | Info |
| MD018 | no-missing-space-atx | Spazio richiesto dopo # in heading | Error |
| MD019 | no-multiple-space-atx | Un solo spazio dopo # | Warning |
| MD020 | no-missing-space-closed-atx | Spazio prima di # di chiusura | Error |
| MD021 | no-multiple-space-closed-atx | Un solo spazio prima # chiusura | Warning |
| MD022 | blanks-around-headings | Righe vuote intorno agli heading | Warning |

### Key Entities

- **Diagnostic**: Rappresenta un singolo problema trovato (posizione nel documento, codice regola, messaggio, severità, fix automatico disponibile)
- **Rule**: Definizione di una regola di linting (ID, nome, descrizione, severità default, parametri configurabili, funzione di fix)
- **Configuration**: Set di regole attive con relativi parametri, caricato da file o defaults
- **Document**: Il documento Markdown attualmente in analisi (contenuto, path, stato di validazione)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: I marker di errore appaiono entro 500ms dall'ultima modifica dell'utente
- **SC-002**: Il comando Format Document completa l'elaborazione di un documento di 1000 righe in meno di 2 secondi
- **SC-003**: Il plugin non causa rallentamenti percepibili durante la digitazione normale (latenza input <50ms)
- **SC-004**: Almeno il 90% dei problemi comuni (trailing spaces, multiple blanks, heading style) sono auto-correggibili
- **SC-005**: La configurazione personalizzata viene applicata senza richiedere riavvio dell'applicazione
- **SC-006**: Gli utenti possono identificare e comprendere un problema guardando il marker e il tooltip in meno di 5 secondi
- **SC-007**: Il plugin gestisce correttamente documenti fino a 10.000 righe senza degradazione significativa delle performance

## Clarifications

### Session 2025-12-23

- Q: Come si integra il plugin con MarkEdit? → A: Plugin JavaScript per CodeMirror 6 (WebView embedded in MarkEdit)
- Q: Come vengono visualizzate le statistiche? → A: Status bar in fondo all'editor con conteggio errori/warning (click per dettagli)
- Q: Quale lingua per l'interfaccia utente? → A: Solo inglese (messaggi, tooltip, UI)

## Assumptions

- MarkEdit utilizza CodeMirror 6 come editor embedded in una WebView, e il plugin sarà un'estensione JavaScript che sfrutta le API di CodeMirror 6 per decorazioni, comandi e interazioni
- MarkEdit supporta la registrazione di comandi personalizzati con scorciatoie da tastiera
- MarkEdit permette l'integrazione AppleScript per estensioni
- L'utente ha familiarità base con il formato Markdown
- I file di configurazione seguono la sintassi standard di markdownlint

## Out of Scope

- Validazione di link esterni (URL broken)
- Spell checking del contenuto
- Conversione Markdown verso altri formati (HTML, PDF)
- Sincronizzazione configurazione tra dispositivi
- Integrazione con sistemi di CI/CD
- Preview live del Markdown renderizzato
- Localizzazione/i18n (interfaccia solo in inglese)
