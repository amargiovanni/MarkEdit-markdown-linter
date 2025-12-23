# MarkEdit Markdown Linter & Formatter

> Validazione e formattazione automatica del Markdown secondo le migliori pratiche.

Un plugin per [MarkEdit](https://github.com/MarkEdit-app/MarkEdit) che mantiene il tuo Markdown pulito, consistente e conforme agli standard, con correzioni automatiche in tempo reale.

## ✨ Caratteristiche

### 🔍 Validazione in Tempo Reale
- Controlla la qualità del Markdown mentre scrivi
- Evidenzia problemi e suggerisce correzioni
- Supporta configurazioni personalizzate per diversi stili

### ✅ Regole Supportate
- **Heading**: Consistenza di stili (#, spazi, ordine gerarchico)
- **Liste**: Formato coerente (-, *, +), indentazione corretta
- **Link**: URL validi, testo descrittivo, evitare link rotti
- **Immagini**: Alt text obbligatorio, percorsi relativi
- **Codice**: Sintassi dei code block, indentazione
- **Formattazione**: Bold/Italic, spazi, line endings
- **Whitespace**: Righe vuote, trailing spaces, indentazione
- **Struttura**: Tabelle markdown, blockquote, orizzontali

### 🔧 Formattazione Automatica
- Corregge automaticamente problemi comuni
- Unifica lo stile del documento
- Preserva il significato del contenuto
- Comando: `Format Document` (⌘+Shift+F)

### ⚙️ Configurazione
Personalizza le regole attraverso `.markdownlintrc`:
{
  "rules": {
    "MD001": true,
    "MD003": { "style": "consistent" },
    "MD004": { "style": "consistent" },
    "MD007": { "indent": 2 }
  },
  "extends": "default"
}

## 📦 Installazione

### Tramite GitHub
1. Scarica l'ultima release dal [repository](https://github.com/amargiovanni/MarkEdit-markdown-linter)
2. Estrai il file `.zip`
3. Copia in `~/Library/Application Support/MarkEdit/extensions/`
4. Riavvia MarkEdit

### Tramite Homebrew
brew install markedit-markdown-linter

## 🚀 Quick Start

1. **Apri un file Markdown** in MarkEdit
2. **Visualizza i problemi** nella gutter (marche colorate sul lato sinistro)
3. **Usa le Quick Fix** (⌘+.) per correzioni automatiche
4. **Formatta il documento** con ⌘+Shift+F

### Scorciatoie da Tastiera

| Azione | Scorciatoia |
|--------|-------------|
| Quick Fix | `⌘ + .` |
| Format Document | `⌘ + Shift + F` |
| Toggle Plugin | `⌘ + Shift + L` |
| Open Settings | `⌘ + Shift + ,` |

## 📋 Regole Disponibili

### Livello di Severità
- 🔴 **Error** - Problemi critici
- 🟡 **Warning** - Problemi consigliati
- 🔵 **Info** - Suggerimenti opzionali

| ID | Nome | Descrizione | Default |
|----|------|-------------|---------|
| MD001 | heading-increment | Heading aumentano di 1 livello | Error |
| MD003 | heading-style | Stile heading consistente | Warning |
| MD004 | ul-style | Stile liste consistente | Warning |
| MD005 | list-indent | Indentazione lista consistente | Error |
| MD007 | ul-indent | Lista indentata correttamente | Warning |
| MD009 | no-trailing-spaces | Nessuno spazio a fine riga | Error |
| MD010 | no-hard-tabs | Nessun tab, solo spazi | Error |
| MD012 | no-multiple-blanks | Max 1 riga vuota consecutiva | Warning |
| MD013 | line-length | Max 80 caratteri per riga | Info |
| MD014 | commands-show-output | Code block non iniziano con `$` | Info |
| MD018 | no-missing-space-atx | Spazio dopo `#` heading | Error |
| MD019 | no-multiple-space-atx | Un solo spazio dopo `#` | Warning |
| MD020 | no-missing-space-closed-atx | Spazio prima di chiusura `#` | Error |
| MD021 | no-multiple-space-closed-atx | Un solo spazio prima `#` | Warning |
| MD022 | blanks-around-headings | Righe vuote intorno heading | Warning |

## 🎯 Casi d'Uso

### Per Bloggatori
Mantieni il blog consistente con uno stile uniforme per tutti gli articoli.

### Per Documentazione Tecnica
Assicura che la documentazione segua gli standard del progetto.

### Per Team
Condividi `.markdownlintrc` nel repository per mantenere lo stesso stile in tutto il team.

### Per Studenti/Ricercatori
Scrivi documenti accademici ben strutturati con regole di formatting automatiche.

## 🔗 Integrazione

### AppleScript
Controlla il plugin da automazioni macOS:
tell application "MarkEdit"
    activate
    run script "plugin:markdown-linter:format"
end tell

### Shortcuts
Crea automazioni tramite l'app Nativa di macOS Shortcuts.

## 📊 Statistiche

Il plugin fornisce anche metriche utili:
- Numero totale di problemi
- Problemi per categoria
- % di conformità
- Tempo medio di correzione

## ⚙️ Configurazione Avanzata

### Profile di Stile

#### Google Style
{
  "extends": "google",
  "rules": {
    "MD013": false,
    "MD024": false
  }
}

#### Commonmark Style
{
  "extends": "commonmark"
}

### Ignorare Blocchi di Codice
<!-- markdownlint-disable MD013 -->
Questo testo ignorerà la regola MD013
<!-- markdownlint-enable MD013 -->

## 🐛 Troubleshooting

### Il plugin non si avvia
1. Verifica che MarkEdit sia aggiornato all'ultima versione
2. Controlla i log: `~/Library/Logs/MarkEdit/`
3. Ricrea la configurazione: cancella `~/.markdownlintrc`

### Le regole non vengono applicate
1. Verifica il file di configurazione
2. Ricarica il plugin: Preference > Extensions > Reload
3. Controlla che il file Markdown sia salvato

### Performance issues con file grandi
1. Disabilita regole non necessarie
2. Aumenta `debounce` nella configurazione
3. Riduci la complessità delle regex personalizzate

## 📖 Documentazione Completa

Per guide avanzate, esempi e sviluppo estensioni, visita il [wiki ufficiale](https://github.com/yourusername/MarkEdit-markdown-linter/wiki).

## 🤝 Contribuire

Aiutaci a migliorare! Scopri come:

- **Segnalare bug**: Apri un [issue](https://github.com/yourusername/MarkEdit-markdown-linter/issues)
- **Suggerire feature**: Apri una [discussion](https://github.com/yourusername/MarkEdit-markdown-linter/discussions)
- **Contribuire codice**: Vedi [CONTRIBUTING.md](CONTRIBUTING.md)
- **Traduzioni**: Aiutaci a localizzare in altre lingue

## 📝 Licenza

Questo plugin è rilasciato sotto licenza **MIT**, in linea con MarkEdit.

MIT License

Copyright (c) 2025 MarkEdit Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

## 🔗 Link Utili

- **MarkEdit GitHub**: https://github.com/MarkEdit-app/MarkEdit
- **markdownlint**: https://github.com/DavidAnson/markdownlint
- **CodeMirror 6**: https://codemirror.net/
- **MarkEdit API**: https://github.com/MarkEdit-app/MarkEdit/wiki

## 💬 Support

- **Email**: support@example.com
- **Mastodon**: [@MarkEditApp](https://mastodon.social/@MarkEditApp)
- **GitHub Discussions**: [Community Forum](https://github.com/yourusername/MarkEdit-markdown-linter/discussions)

---

**Fatto con ❤️ per la comunità di MarkEdit**

Versione: 1.0.0 | Ultimo aggiornamento: Dicembre 2025