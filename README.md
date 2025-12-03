# TYPIQUEL

A lightweight typing practice app inspired by Monkeytype. Written in vanilla HTML/CSS/JavaScript.

Features
- Per-character correctness highlighting while typing
- Persistent mistake tracking (mistakes count even if corrected/backspaced)
- Random meaningful sentences fetched from the Quotable API (fallback sample included)
- Simple, elegant UI with customizable fonts and styles

How to run locally
1. Open `index.html` in your browser (double-click or serve the folder).
2. The app will load a random sentence automatically; type into the input area to start.

Developer notes
- The main files are:
  - `index.html` — page markup
  - `style.css` — UI styles
  - `script.js` — typing logic, sentence loading, and accuracy/WPM calculation
- Sentences are fetched from the [Quotable API](https://github.com/lukePeavey/quotable). If the API is unavailable, the built-in sample sentences are used.

Push & repo
- This repository was created and pushed from the local machine using the GitHub CLI and is available at:
  `https://github.com/hecker-200/TYPIQUEL`

License
- Add a license file if you want to publish permissively (MIT recommended).

Contributing
- Open a PR or push to a branch and create a PR for changes.

Enjoy! — created from local CLI by the author
