document.addEventListener('DOMContentLoaded', function () {
    // ----- Popup -----
    const popup = document.getElementById('post1');
    const close = document.getElementById('popup1');
    window.addEventListener('load', function () {
        popup.style.display = 'block';
        close.addEventListener('click', function () {
            popup.style.display = 'none';
        });
    });

    // ----- Body -----
    const body = document.querySelector('body');

    // ----- Historique des parties -----
    const statsDiv = document.createElement('div');
    statsDiv.id = 'stats';
    statsDiv.innerHTML = `Historique des parties :<br>Gagnées : 0 | Perdues : 0 | Moyenne d'essais : 0`;
    body.appendChild(statsDiv);

    // ----- Grille -----
    const MotusTableDiv = document.createElement('div');
    MotusTableDiv.classList.add('garden');

    // ---- Animation rideau ----
    MotusTableDiv.style.overflow = 'hidden';
    MotusTableDiv.style.height = '0px';
    MotusTableDiv.style.transition = 'height 1s ease-out';
    body.appendChild(MotusTableDiv);

    // ----- Textes victoire/défaite -----
    const victoryTxt = document.createElement('div');
    victoryTxt.classList.add('VictoryTxt');
    const loseTxt = document.createElement('div');
    loseTxt.classList.add('LoseTxt');

    // ----- Boutons -----
    const restartBtn = document.createElement('button');
    restartBtn.classList.add('btn-start');
    restartBtn.innerText = 'Commencer';
    body.appendChild(restartBtn);

    const validateBtn = document.createElement('button');
    validateBtn.classList.add('validateBtn');
    validateBtn.innerText = 'Valider';
    body.appendChild(validateBtn);

    // ----- Compteur d'essais -----
    const counterDiv = document.createElement('div');
    counterDiv.id = 'counter';
    body.appendChild(counterDiv);

    // ----- Variables du jeu -----
    let wordlist = ['POMME', 'POIRE', 'BANANES', 'ORANGE', 'KIWI', 'FRAISE', 'MANGUES', 'ANANAS', 'RAISIN', 'CERISE'];
    let wordToGuess = [];
    let currentRow = 0;
    let currentCol = 1;
    let foundLetters = [];
    let maxAttempts = 6;
    let gameOver = false;
    let totalGames = 0;
    let wonGames = 0;
    let lostGames = 0;
    let totalAttempts = 0;

    // ----- Mise à jour curseur  -----
    function Curseur() {
        if (gameOver) return;
        const rows = MotusTableDiv.querySelectorAll('.ligne');
        if (!rows[currentRow]) return;
        rows.forEach(row => row.querySelectorAll('.cursor').forEach(c => c.remove()));
        const cells = rows[currentRow].querySelectorAll('.cell');
        if (cells[currentCol]) {
            const cursor = document.createElement('span');
            cursor.classList.add('cursor');
            cursor.textContent = '_';
            cells[currentCol].appendChild(cursor);
        }
    }

    // ----- Mise à jour clavier -----
    function updateKeyboard(cells) {
        const keys = document.querySelectorAll('#virtualKeyboard .key');
        cells.forEach(cell => {
            const letter = cell.textContent.toUpperCase();
            if (!letter) return;
            const keyButton = [...keys].find(btn => btn.value === letter);
            if (!keyButton) return;
            const bg = cell.style.backgroundColor;
            if (bg === 'green') { keyButton.style.backgroundColor = 'green'; keyButton.style.color = 'white'; }
            else if (bg === 'orange' && keyButton.style.backgroundColor !== 'green') { keyButton.style.backgroundColor = 'orange'; keyButton.style.color = 'white'; }
            else if (bg === 'grey' && !['green', 'orange'].includes(keyButton.style.backgroundColor)) { keyButton.style.backgroundColor = 'grey'; keyButton.style.color = 'white'; }
        });
    }

    // ----- Validation ligne (bouton valider) -----
    validateBtn.addEventListener('click', function () {
        if (gameOver) return;
        const rows = MotusTableDiv.querySelectorAll('.ligne');
        const cells = rows[currentRow].querySelectorAll('.cell');
        let userWord = '';
        for (let i = 0; i < cells.length; i++) {
            if (i === 0) continue;
            if (cells[i].textContent.trim() === '') {
                alert("⚠️ Vous devez compléter toutes les cases avant de valider !");
                return;
            }
        }
        cells.forEach((cell, index) => {
            const userLetter = cell.textContent.toUpperCase();
            const correctLetter = wordToGuess[index];
            userWord += userLetter;
            setTimeout(() => {
                if (userLetter === correctLetter) {
                    cell.style.backgroundColor = 'green';
                    cell.setAttribute('aria-label', `Lettre ${userLetter}, correcte`);
                    foundLetters[index] = correctLetter;
                } else if (wordToGuess.includes(userLetter)) {
                    cell.style.backgroundColor = 'orange';
                    cell.setAttribute('aria-label', `Lettre ${userLetter}, présente mais mauvaise place`);
                } else {
                    cell.style.backgroundColor = 'grey';
                    cell.setAttribute('aria-label', `Lettre ${userLetter}, absente`);
                }
                cell.classList.add('flip');
                cell.addEventListener('animationend', () => cell.classList.remove('flip'), { once: true });
            }, index * 150);
        });
        setTimeout(() => updateKeyboard(cells), cells.length * 150);
        counterDiv.innerText = `Essais restants : ${maxAttempts - (currentRow + 1)}`;

        if (userWord === wordToGuess.join('')) {
            victoryTxt.setAttribute('role', 'alert');
            victoryTxt.innerText = "🎉 Vous avez gagné !";
            body.insertBefore(victoryTxt, MotusTableDiv);
            gameOver = true;
            document.querySelectorAll('.cursor').forEach(c => c.remove());
        } else if (currentRow === maxAttempts - 1) {
            loseTxt.setAttribute('role', 'alert');
            loseTxt.innerText = "😢 Dommage, essaye encore !";
            body.insertBefore(loseTxt, MotusTableDiv);
            gameOver = true;
            document.querySelectorAll('.cursor').forEach(c => c.remove());
        }

        if (gameOver) {
            totalGames++;
            totalAttempts += (currentRow + 1);
            if (userWord === wordToGuess.join('')) wonGames++; else lostGames++;
            const avg = (totalAttempts / totalGames).toFixed(2);
            statsDiv.innerHTML = `Historique des parties :<br>Gagnées : ${wonGames} | Perdues : ${lostGames} | Moyenne d'essais : ${avg}`;
        }

        //pré-remplir les lettres déjà trouvées + curseur
        setTimeout(() => {
            if (gameOver) return;
            currentRow++;
            currentCol = 1;
            const rows = MotusTableDiv.querySelectorAll('.ligne');
            if (currentRow < rows.length) {
                const nextCells = rows[currentRow].querySelectorAll('.cell');
                foundLetters.forEach((letter, idx) => {
                    if (letter) {
                        nextCells[idx].textContent = letter;
                        nextCells[idx].style.backgroundColor = 'green';
                        nextCells[idx].setAttribute('aria-label', `Lettre ${letter}, correcte`);
                    }
                });
                Curseur();
            }
        }, cells.length * 150 + 50);
    });

    // ----- Génération du mot -----
    restartBtn.addEventListener('click', function () {
        gameOver = false;
        restartBtn.innerText = "Rejouer";
        const motIndex = Math.floor(Math.random() * wordlist.length);
        wordToGuess = wordlist[motIndex].split('');
        MotusTableDiv.innerText = '';
        victoryTxt.innerText = '';
        loseTxt.innerText = '';
        currentRow = 0;
        currentCol = 1;
        foundLetters = new Array(wordToGuess.length).fill('');

        // Reset clavier
        const keys = document.querySelectorAll('#virtualKeyboard .key');
        keys.forEach(key => { key.style.backgroundColor = ''; key.style.color = ''; });

        counterDiv.innerText = `Essais restants : ${maxAttempts}`;

        for (let i = 0; i < maxAttempts; i++) {
            const row = document.createElement('div');
            row.classList.add('ligne');
            for (let j = 0; j < wordToGuess.length; j++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.setAttribute('role', 'textbox');
                cell.setAttribute('aria-label', `Case ${j + 1}, ligne ${i + 1}, vide`);
                row.appendChild(cell);
                if (j === 0 & i === 0) cell.textContent = wordToGuess[j];
            }
            MotusTableDiv.appendChild(row);
        }
        Curseur();

        // ---- Ouvrir rideau après commencer ----
        setTimeout(() => {
            MotusTableDiv.style.height = MotusTableDiv.scrollHeight + 'px';
        }, 50);
    });

    // ----- Placement lettre -----
    function placeLetter(letter) {
        if (gameOver) return;
        const rows = MotusTableDiv.querySelectorAll('.ligne');
        if (!rows[currentRow]) return;
        const cells = rows[currentRow].querySelectorAll('.cell');
        if (!cells[currentCol]) return;
        cells[currentCol].textContent = letter.toUpperCase();
        cells[currentCol].setAttribute('aria-label', `Lettre ${letter.toUpperCase()}, saisie`);
        currentCol++;
        Curseur();
    }

    // ----- Clavier virtuel -----
    const keyboard = document.createElement('div');
    keyboard.id = 'virtualKeyboard';
    body.appendChild(keyboard);

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    letters.forEach(letter => {
        const key = document.createElement('button');
        key.innerText = letter;
        key.classList.add('key');
        key.value = letter;
        key.setAttribute('aria-label', `Lettre ${letter}`);
        key.addEventListener('click', () => placeLetter(key.value));
        keyboard.appendChild(key);
    });

    const enterBtn = document.createElement('button');
    enterBtn.innerText = 'Enter';
    enterBtn.classList.add('key');
    enterBtn.setAttribute('aria-label', 'Valider la ligne');
    enterBtn.addEventListener('click', () => validateBtn.click());
    keyboard.appendChild(enterBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.innerText = 'Delete';
    deleteBtn.classList.add('key');
    deleteBtn.setAttribute('aria-label', 'Supprimer la dernière lettre');
    deleteBtn.addEventListener('click', deleteLetter);
    keyboard.appendChild(deleteBtn);

    document.addEventListener('keydown', function (press) {
        const pressedKey = press.key.toUpperCase();
        if (pressedKey === 'ENTER') { press.preventDefault(); validateBtn.click(); }
        else if (pressedKey === 'BACKSPACE') { deleteLetter(); }
        else {
            const keyButton = [...keyboard.querySelectorAll('.key')].find(btn => btn.value === pressedKey);
            if (keyButton) keyButton.click();
        }
    });

    // ----- Supprimer lettre -----
    function deleteLetter() {
        if (gameOver) return;
        const rows = MotusTableDiv.querySelectorAll('.ligne');
        if (!rows[currentRow]) return;
        const cells = rows[currentRow].querySelectorAll('.cell');
        if (currentCol > 1) {
            currentCol--;
            cells[currentCol].textContent = '';
            cells[currentCol].setAttribute('aria-label', `Case ${currentCol + 1}, ligne ${currentRow + 1}, vide`);
        }
        Curseur();
    }
});

