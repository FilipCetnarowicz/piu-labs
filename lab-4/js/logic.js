(function () {
    // js logic defined -------------------------------------------------------------------------------------------------

    // defining variables /////////////////////////////////////////////

    const columns = {
        ToDo: document.getElementById('ToDo'),
        Doing: document.getElementById('Doing'),
        Done: document.getElementById('Done'),
    };
    const columnsNames = ['ToDo', 'Doing', 'Done'];

    let cards = [];

    // HTMLCollection-s of cards in columns for later use
    const liveToDo = columns['ToDo'].getElementsByClassName('card');
    const liveDoing = columns['Doing'].getElementsByClassName('card');
    const liveDone = columns['Done'].getElementsByClassName('card');

    // creating card blocks ////////////////////////////////////////////

    function generateID() {
        return 'card-' + Math.random().toString(10).slice(2);
    }
    function generateColor() {
        const r = 150 + Math.floor(Math.random() * 100);
        const g = 150 + Math.floor(Math.random() * 100);
        const b = 150 + Math.floor(Math.random() * 100);
        return `rgb(${r}, ${g}, ${b})`;
    }

    // card - id, column, text, color
    function createCard(card) {
        const cardHTML = document.createElement('div');
        cardHTML.className = 'card';
        cardHTML.id = card.id;
        cardHTML.style.backgroundColor = card.color;

        const controls = document.createElement('div');
        controls.className = 'CardControls';

        const btnLeft = document.createElement('button');
        btnLeft.className = 'BtnMoveLeft';
        btnLeft.textContent = '←';

        const btnRight = document.createElement('button');
        btnRight.className = 'BtnMoveRight';
        btnRight.textContent = '→';

        const btnRecolor = document.createElement('button');
        btnRecolor.className = 'BtnRecolorCard';
        btnRecolor.textContent = '🎨';

        const btnDelete = document.createElement('button');
        btnDelete.className = 'BtnDeleteCard';
        btnDelete.textContent = 'x';

        controls.append(btnLeft, btnRight, btnRecolor, btnDelete);

        const body = document.createElement('div');
        body.innerText = card.text || '';
        body.className = 'CardBody';
        body.contentEditable = 'true';

        // const title = document.createElement('div');
        // body.innerText = '';
        // body.className = 'CardTitle';
        // body.contentEditable = 'true';

        cardHTML.append(controls, body);
        return cardHTML;
    }

    // defining handlers /////////////////////////////////////////////////

    function addCardHandler(column) {
        // JS
        const newCard = {
            id: generateID(),
            column: column,
            // title: 'title',
            text: '...',
            color: generateColor(),
        };
        cards.push(newCard);
        updateState();

        //DOM
        const columnContainer = columns[newCard.column].querySelector('.cards');
        columnContainer.appendChild(createCard(newCard));

        updateCounters();
    }

    function deleteCardHandler(id) {
        //JS
        cards = cards.filter((c) => c.id !== id);
        updateState();

        //DOM
        document.getElementById(id).remove();

        updateCounters();
    }

    function moveCardHandler(id, direction) {
        //JS
        const card = cards.find((c) => c.id === id);
        const currentIndex = columnsNames.indexOf(card.column);
        const newIndex = currentIndex + direction;

        if (!(newIndex in columnsNames)) return;

        card.column = columnsNames[newIndex];
        updateState();

        //DOM
        renderState(); // ma w sobie już updateCounters();
    }

    function recolorCardHandler(id) {
        // czary mary na skroty bo pierwotnie zrobilem na generateColor();
        const card = cards.find((c) => c.id === id);
        const picker = document.createElement('input');
        picker.type = 'color';
        picker.style.display = 'none';
        document.body.appendChild(picker);
        picker.addEventListener('input', () => {
            card.color = picker.value;
            updateState();
            renderState();
            picker.remove();
        });
        picker.click();
    }

    function recolorColumnHandler(column) {
        cards
            .filter((c) => c.column === column)
            .forEach((c) => {
                c.color = generateColor();
            });
        updateState();
        renderState();
    }

    function sortColumnHandler(column) {
        const alphabeticOrder = cards
            .filter((c) => c.column === column)
            .sort((a, b) => a.text.localeCompare(b.text, 'pl'));

        let i = 0;
        cards = cards.map((c) =>
            c.column === column ? alphabeticOrder[i++] : c
        );

        updateState();
        renderState();
    }

    // handler-listener attachment ///////////////////////////////////////////////////
    function AttachListeners() {
        columnsNames.forEach((column) => {
            const section = columns[column];
            const columnContainer = section.querySelector('.cards');

            section
                .querySelector('.BtnAddCard')
                .addEventListener('click', () => addCardHandler(column));

            section
                .querySelector('.BtnRecolorColumn')
                .addEventListener('click', () => recolorColumnHandler(column));

            section
                .querySelector('.BtnSortColumn')
                .addEventListener('click', () => sortColumnHandler(column));

            columnContainer.addEventListener('click', (event) => {
                const button = event.target.closest('button');
                if (!button) return;
                const card = event.target.closest('.card');
                if (!card) return;
                const id = card.id;
                if (!id) return;

                if (button.classList.contains('BtnDeleteCard')) {
                    deleteCardHandler(id);
                } else if (button.classList.contains('BtnMoveLeft')) {
                    moveCardHandler(id, -1);
                } else if (button.classList.contains('BtnMoveRight')) {
                    moveCardHandler(id, 1);
                } else if (button.classList.contains('BtnRecolorCard')) {
                    recolorCardHandler(id);
                }
            });

            columnContainer.addEventListener('input', (event) => {
                if (!event.target.classList.contains('CardBody')) return;

                const pickedCard = event.target.closest('.card');
                if (!pickedCard) return;

                const card = cards.find((c) => c.id === pickedCard.id);
                card.text = event.target.innerText;
                updateState();
            });
        });
    }

    // localstorage handling --------------------------------------------------------------------------------------

    const storageKey = 'kanbanState';

    // on update ///////////////////////////////////////////////////

    function updateState() {
        const cardsState = { cards };
        localStorage.setItem(storageKey, JSON.stringify(cardsState));
    }

    function updateCounters() {
        columns['ToDo'].querySelector('.CardsCount').textContent =
            liveToDo.length;
        columns['Doing'].querySelector('.CardsCount').textContent =
            liveDoing.length;
        columns['Done'].querySelector('.CardsCount').textContent =
            liveDone.length;
    }

    // on reloading page ///////////////////////////////////////////////////

    function loadState() {
        const rawStorage = localStorage.getItem(storageKey);
        if (!rawStorage) {
            cards = [];
            return;
        }
        try {
            const jsonStorage = JSON.parse(rawStorage);
            cards = Array.isArray(jsonStorage.cards) ? jsonStorage.cards : [];
        } catch {
            cards = [];
        }
    }

    function renderState() {
        columnsNames.forEach((column) => {
            const columnContainer = columns[column].querySelector('.cards');
            columnContainer.innerHTML = '';
        });
        cards.forEach((card) => {
            const columnContainer =
                columns[card.column].querySelector('.cards');
            columnContainer.appendChild(createCard(card));
        });
        updateCounters();
    }

    // loading js logic and localstorage -----------------------------------------------------------------------------------
    document.addEventListener('DOMContentLoaded', () => {
        loadState();
        renderState();
        AttachListeners();
    });
})();
