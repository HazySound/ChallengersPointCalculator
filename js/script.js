document.addEventListener('DOMContentLoaded', () => {
    // Function to format numbers with commas
    const formatNumberWithCommas = (number) => {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    // Function to add prefix and suffix
    const addPrefixSuffix = (id, prefix = '', suffix = '') => {
        const inputField = document.getElementById(id);

        inputField.addEventListener('input', (event) => {
            let value = event.target.value.replace(/[^0-9]/g, ''); // Remove non-numeric characters

            // Remove leading zeros unless the input is "0"
            if (value.length > 1 && value.startsWith('0')) {
                value = value.replace(/^0+/, '');
            }

            if (value) {
                // Format with commas and apply prefix/suffix
                event.target.value = `${prefix}${formatNumberWithCommas(value)}${suffix}`;

                // Move cursor before the suffix (if suffix exists)
                const cursorPosition = suffix ? event.target.value.length - suffix.length : event.target.value.length;
                setTimeout(() => {
                    event.target.setSelectionRange(cursorPosition, cursorPosition);
                }, 0);
            } else {
                event.target.value = ''; // Clear input if empty
            }
        });

        inputField.addEventListener('focus', (event) => {
            // Remove prefix/suffix and commas on focus
            event.target.value = event.target.value.replace(/[^0-9]/g, '');
        });

        inputField.addEventListener('blur', (event) => {
            let value = event.target.value.replace(/[^0-9]/g, '');
            if (value) {
                // Reapply prefix/suffix and format on blur
                event.target.value = `${prefix}${formatNumberWithCommas(value)}${suffix}`;
            }
        });
    };

    // Toggle boss list
    const bossToggle = document.getElementById('boss-toggle');
    const bossList = document.getElementById('boss-list');

    bossToggle.addEventListener('click', () => {
        if (bossList.classList.contains('open')) {
            bossList.classList.remove('open');
            bossToggle.textContent = '보스 목록 펼치기 ▼';
        } else {
            bossList.classList.add('open');
            bossToggle.textContent = '보스 목록 접기 ▲';
        }
    });

    // Initialize scores and checkbox interactions
    const bossTable = document.getElementById('boss-table');

    // Define scores for each boss and level
    const bossScores = {
        "시그너스": { "easy": 50, "normal": 100 },
        "자쿰": { "chaos": 100 },
        "힐라": { "hard": 50 },
        "핑크빈": { "chaos": 100 },
        "피에르": { "chaos": 100 },
        "반반": { "chaos": 100 },
        "블러디퀸": { "chaos": 100 },
        "매그너스": { "hard": 200 },
        "벨룸": { "chaos": 200 },
        "파풀라투스": { "chaos": 250 },
        "스우": { "normal": 350, "hard": 1500 },
        "데미안": { "normal": 350, "hard": 1500 },
        "가엔슬": { "normal": 500, "chaos": 2500 },
        "루시드": { "easy": 500, "normal": 1000, "hard": 2000 },
        "윌": { "easy": 500, "normal": 1000, "hard": 2500 },
        "더스크": { "normal": 1000, "chaos": 2500 },
        "진힐라": { "normal": 2000, "hard": 3000 },
        "듄켈": { "normal": 1000, "hard": 3000 },
    };

    const initializeBossScores = () => {
        const bossRows = bossTable.querySelectorAll('tbody tr');
        bossRows.forEach(row => {
            const scoreCell = row.querySelector('td:first-child');
            if (scoreCell) {
                scoreCell.textContent = '0'; // Set initial score to 0
            }
        });
    };

    const updateBossScores = () => {
        bossTable.addEventListener('change', (event) => {
            if (event.target.type === 'checkbox') {
                const checkbox = event.target;
                const bossName = checkbox.dataset.boss;
                const level = checkbox.dataset.level;

                // Find the score cell for the corresponding boss
                const row = checkbox.closest('tr');
                const scoreCell = row.querySelector('td:first-child');
                let currentScore = parseInt(scoreCell.textContent, 10) || 0;


                // Additional logic for checkbox hierarchy
                const allCheckboxes = bossTable.querySelectorAll(`input[data-boss="${bossName}"]`);
                const levelOrder = ['easy', 'normal', 'hard', 'chaos'];
                const currentIndex = levelOrder.indexOf(level);

                if (checkbox.checked) {
                    allCheckboxes.forEach(cb => {
                        const cbLevel = cb.dataset.level;
                        if (levelOrder.indexOf(cbLevel) <= currentIndex) {
                            if(cbLevel == level || !cb.checked){
                                cb.checked = true;
                                currentScore += bossScores[bossName][cbLevel];
                                cb.closest('label').style.backgroundColor = '#DFF2BF';
                            }
                        }
                    });
                } else {
                    const higherLevelsChecked = Array.from(allCheckboxes).some(cb =>
                        levelOrder.indexOf(cb.dataset.level) > currentIndex && cb.checked
                    );

                    if (higherLevelsChecked) {
                        checkbox.checked = true;
                    } else {
                        currentScore -= bossScores[bossName][level];
                        checkbox.closest('label').style.backgroundColor = 'white';
                    }
                }

                // Update the score cell
                scoreCell.textContent = currentScore;

                // Update boss name cell color
                const bossNameCell = Array.from(bossTable.querySelectorAll('td')).find(cell => cell.textContent === bossName);
                const allChecked = Array.from(allCheckboxes).every(cb => cb.checked);

                if (bossNameCell) {
                    bossNameCell.style.backgroundColor = allChecked ? '#DFF2BF' : 'white';
                }
            }
        });
    };

    initializeBossScores();
    updateBossScores();

    // Apply prefix and suffix to input fields
    addPrefixSuffix('current-weeks', '', '주');
    addPrefixSuffix('current-days', '', '일');
    addPrefixSuffix('target-weeks', '', '주');
    addPrefixSuffix('target-days', '', '일');
    addPrefixSuffix('current-level', 'Lv. ', '');
    addPrefixSuffix('target-level', 'Lv. ', '');
    addPrefixSuffix('target-score', '', '점');

    // Automatically set example current score
    const currentScoreInput = document.getElementById('current-score');
    currentScoreInput.value = `${formatNumberWithCommas(123456)}점`;
});
