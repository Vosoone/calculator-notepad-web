// Initial Setup
document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle 
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.add(currentTheme);
    if (currentTheme === 'dark') {
        themeToggle.checked = true;
    }

    themeToggle.addEventListener('change', () => {
        if (themeToggle.checked) {
            document.body.classList.replace('light', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.replace('dark', 'light');
            localStorage.setItem('theme', 'light');
        }
    });

    // Date and Time
    const dateEl = document.getElementById('date');
    const timeEl = document.getElementById('time');

    function updateDateTime() {
        const now = new Date();
        const optionsDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const optionsTime = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
        dateEl.textContent = now.toLocaleDateString('cs-CZ', optionsDate);
        timeEl.textContent = now.toLocaleTimeString('cs-CZ', optionsTime);
    }

    setInterval(updateDateTime, 1000);
    updateDateTime();

    // Calculator Setup
    const calculatorTypeSelect = document.getElementById('calculator-type');
    const calcButtons = document.getElementById('calc-buttons');
    const calcDisplay = document.getElementById('calc-display');
    let currentCalculator = calculatorTypeSelect.value;
    let history = JSON.parse(localStorage.getItem('calc-history')) || [];

    function generateButtons(type) {
        calcButtons.innerHTML = '';
        let buttons = [];
        if (type === 'standard') {
            buttons = [
                'C', '←', '(', ')', '/',
                '7', '8', '9', '*', '√',
                '4', '5', '6', '-', '^',
                '1', '2', '3', '+', 'log',
                '0', '.', '=', 'π', 'ANS'
            ];
        } else if (type === 'scientific') {
            buttons = [
                'C', '←', 'sin', 'cos', 'tan',
                '7', '8', '9', '/', '√',
                '4', '5', '6', '*', '^',
                '1', '2', '3', '-', 'log',
                '0', '.', '=', '+', 'ANS',
                'ln', 'e', '(', ')'
            ];
        } else if (type === 'programmer') {
            buttons = [
                'C', '←', 'AND', 'OR', 'XOR',
                '7', '8', '9', '/', '<<',
                '4', '5', '6', '*', '>>',
                '1', '2', '3', '-', 'NOT',
                '0', 'A', 'B', '+', 'C',
                'D', 'E', 'F', '=', 'ANS'
            ];
        }

        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.textContent = btn;
            button.dataset.value = btn;
            calcButtons.appendChild(button);
        });
    }

    generateButtons(currentCalculator);

    calculatorTypeSelect.addEventListener('change', (e) => {
        currentCalculator = e.target.value;
        generateButtons(currentCalculator);
        calcDisplay.textContent = '0';
        expression = '';
    });

    // Calculator Logic
    calcButtons.addEventListener('click', (e) => {
        if (e.target.tagName !== 'BUTTON') return;
        const value = e.target.dataset.value;
        handleInput(value);
    });

    let expression = '';
    let lastAnswer = '';

    function handleInput(value) {
        if (value === '=') {
            try {
                let result = evalExpression(expression);
                addToHistory(`${expression} = ${result}`);
                calcDisplay.textContent = result;
                lastAnswer = result.toString();
                expression = result.toString();
            } catch (error) {
                calcDisplay.textContent = 'Error';
                expression = '';
            }
        } else if (value === 'C') {
            expression = '';
            calcDisplay.textContent = '0';
        } else if (value === '←') {
            expression = expression.slice(0, -1);
            calcDisplay.textContent = expression || '0';
        } else if (value === 'ANS') {
            expression += lastAnswer;
            calcDisplay.textContent = expression;
        } else {
            expression += mapButtonValue(value);
            calcDisplay.textContent = expression;
        }
    }

    function mapButtonValue(value) {
        const mapping = {
            'π': Math.PI,
            'e': Math.E,
            'sin': 'Math.sin(',
            'cos': 'Math.cos(',
            'tan': 'Math.tan(',
            'log': 'Math.log10(',
            'ln': 'Math.log(',
            '√': 'Math.sqrt(',
            '^': '**',
            'AND': '&',
            'OR': '|',
            'XOR': '^',
            'NOT': '~',
            '<<': '<<',
            '>>': '>>',
            'ANS': lastAnswer
        };
        return mapping[value] !== undefined ? mapping[value] : value;
    }

    function evalExpression(expr) {
        // Replace known function patterns to ensure valid JS syntax
        expr = expr.replace(/sin\(/g, 'Math.sin(')
                   .replace(/cos\(/g, 'Math.cos(')
                   .replace(/tan\(/g, 'Math.tan(')
                   .replace(/log\(/g, 'Math.log10(')
                   .replace(/ln\(/g, 'Math.log(')
                   .replace(/√\(/g, 'Math.sqrt(')
                   .replace(/π/g, Math.PI)
                   .replace(/e/g, Math.E)
                   .replace(/ANS/g, lastAnswer);
        // Evaluate the expression safely
        // Note: For a production app, consider using a math parser library instead of eval
        return Function('"use strict";return (' + expr + ')')();
    }

    // History Handling
    const historyButton = document.getElementById('view-history');
    const historyModal = document.getElementById('history-modal');
    const closeModal = document.querySelector('.close');
    const historyList = document.getElementById('history-list');

    historyButton.addEventListener('click', () => {
        populateHistory();
        historyModal.style.display = 'block';
    });

    closeModal.addEventListener('click', () => {
        historyModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target == historyModal) {
            historyModal.style.display = 'none';
        }
    });

    function addToHistory(entry) {
        history.push(entry);
        localStorage.setItem('calc-history', JSON.stringify(history));
    }

    function populateHistory() {
        historyList.innerHTML = '';
        history.slice().reverse().forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            historyList.appendChild(li);
        });
    }

    // Notepad Functionality
    const notepadContent = document.getElementById('notepad-content');
    const notepadPlaceholder = document.getElementById('notepad-placeholder');
    const downloadPdfBtn = document.getElementById('download-pdf');
    const downloadTxtBtn = document.getElementById('download-txt');
    const clearNotepadBtn = document.getElementById('clear-notepad');
    const formatButtons = document.querySelectorAll('.format-btn');
    const textColorPicker = document.getElementById('text-color-picker');
    const brushToolBtn = document.getElementById('brush-tool');
    const drawingCanvas = document.getElementById('drawing-canvas');
    let isDrawing = false;
    let brushColor = '#000000';
    let canvasCtx = drawingCanvas.getContext('2d');

    // Resize canvas to match notepad content size
    function resizeCanvas() {
        drawingCanvas.width = notepadContent.clientWidth;
        drawingCanvas.height = notepadContent.clientHeight;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Placeholder Handling
    notepadContent.addEventListener('focus', () => {
        notepadPlaceholder.style.display = 'none';
    });

    notepadContent.addEventListener('blur', () => {
        if (notepadContent.innerHTML.trim() === '' || notepadContent.innerHTML === '<br>') {
            notepadPlaceholder.style.display = 'block';
        }
    });

    // Initial placeholder visibility
    if (notepadContent.innerHTML.trim() === '' || notepadContent.innerHTML === '<br>') {
        notepadPlaceholder.style.display = 'block';
    } else {
        notepadPlaceholder.style.display = 'none';
    }

    // Formatting Buttons
    formatButtons.forEach(button => {
        button.addEventListener('click', () => {
            const command = button.dataset.command;
            if (command === 'delete') {
                document.execCommand('delete');
            } else {
                document.execCommand(command, false, null);
            }
            notepadContent.focus();
        });
    });

    // Change Text Color
    textColorPicker.addEventListener('input', () => {
        document.execCommand('foreColor', false, textColorPicker.value);
        notepadContent.focus();
    });

    // Clear Notepad
    clearNotepadBtn.addEventListener('click', () => {
        if (confirm('POZOR! Všechny poznámky budou nevratně smazány. Chcete to opravdu udělat?')) {
        notepadContent.innerHTML = '';
        notepadPlaceholder.style.display = 'block';
        // Clear Canvas
        canvasCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    }});

    // Download as PDF
    downloadPdfBtn.addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const text = notepadContent.innerText;
        const lines = doc.splitTextToSize(text, 180);
        doc.text(lines, 10, 10);
        doc.save('notepad.pdf');
    });

    // Download as TXT
    downloadTxtBtn.addEventListener('click', () => {
        const blob = new Blob([notepadContent.innerText], { type: "text/plain;charset=utf-8" });
        saveAs(blob, "notepad.txt");
    });

    // Drawing Functionality
    brushToolBtn.addEventListener('click', () => {
        if (drawingCanvas.style.display === 'block') {
            // Switch to text mode
            drawingCanvas.style.display = 'none';
            notepadContent.contentEditable = 'true';
            brushToolBtn.classList.remove('active');
        } else {
            // Switch to drawing mode
            drawingCanvas.style.display = 'block';
            notepadContent.contentEditable = 'false';
            brushToolBtn.classList.add('active');
            notepadContent.blur();
        }
    });

    // Brush Color Picker (optional: can be added to toolbar)
    // For simplicity, we'll use a fixed brush color or reuse the text color picker
    // Here, using the text color picker for both text and brush
    textColorPicker.addEventListener('input', () => {
        brushColor = textColorPicker.value;
    });

    // Mouse Events for Drawing
    drawingCanvas.addEventListener('mousedown', (e) => {
        if (drawingCanvas.style.display !== 'block') return;
        isDrawing = true;
        const rect = drawingCanvas.getBoundingClientRect();
        canvasCtx.beginPath();
        canvasCtx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    });

    drawingCanvas.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;
        const rect = drawingCanvas.getBoundingClientRect();
        canvasCtx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        canvasCtx.strokeStyle = brushColor;
        canvasCtx.lineWidth = 2;
        canvasCtx.stroke();
    });

    drawingCanvas.addEventListener('mouseup', () => {
        if (!isDrawing) return;
        isDrawing = false;
    });

    drawingCanvas.addEventListener('mouseleave', () => {
        if (!isDrawing) return;
        isDrawing = false;
    });

    // Keyboard Support for Backspace in Text Editor
    document.addEventListener('keydown', (e) => {
        if (e.target !== notepadContent && e.target !== document.body) return;
        if (e.key === 'Backspace') {
            // Handle Backspace in text editor
            if (drawingCanvas.style.display === 'block') {
                // If in drawing mode, do not interfere
                return;
            }
            // Otherwise, default behavior applies
        }
    });

    // Optional: Prevent Backspace from navigating back when not focused on input
    window.addEventListener('keydown', function(e) {
        if (e.key === 'Backspace') {
            const activeElement = document.activeElement;
            if (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA' && activeElement !== notepadContent) {
                e.preventDefault();
            }
        }
    });

    // Initial History Population
    populateHistory();

    // Ensure canvas resizes with notepad
    const observer = new MutationObserver(resizeCanvas);
    observer.observe(notepadContent, { childList: true, subtree: true, characterData: true });
});
