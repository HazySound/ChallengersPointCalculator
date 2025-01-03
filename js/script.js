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

    // Calculate and update attendance score
    const calculateCurrentScore = () => {
        const weeksInput = document.getElementById('current-weeks');
        const daysInput = document.getElementById('current-days');
        const levelInput = document.getElementById('current-level');
        const bossTable = document.getElementById('boss-table');
        const currentScoreInput = document.getElementById('current-score');

        const getNumericValue = (input) => {
            return parseInt(input.value.replace(/[^0-9]/g, ''), 10) || 0;
        };

        const updateScore = () => {
            let weeks = getNumericValue(weeksInput);
            let days = getNumericValue(daysInput);
            let level = getNumericValue(levelInput);

            // Cap weeks at 22
            if (weeks > 22) {
                weeks = 22;
                weeksInput.value = '22주'; // Update input field visually
            }

            // Cap days at 110
            if (days > 110) {
                days = 110;
                daysInput.value = '110일'; // Update input field visually
            }

            // Calculate attendance score
            const attendanceScore = Math.min((weeks * 5 + days) * 100, 11000);

            // Determine score based on level
            let levelScore = 0;
            if (level >= 260 && level <= 264) {
                levelScore = 1000;
            } else if (level >= 265 && level <= 269) {
                levelScore = 3000;
            } else if (level >= 270 && level <= 274) {
                levelScore = 6000;
            } else if (level >= 275 && level <= 279) {
                levelScore = 11000;
            } else if (level >= 280) {
                levelScore = 18000;
            }

            // Sum up all scores from the boss table
            const bossScores = Array.from(bossTable.querySelectorAll('tbody tr td:first-child'))
            .map(cell => parseInt(cell.textContent.replace(/[^0-9]/g, ''), 10) || 0)
            .reduce((acc, score) => acc + score, 0);

            const totalScore = attendanceScore + levelScore + bossScores;

            // Update current score field
            currentScoreInput.value = `${formatNumberWithCommas(totalScore)}점`;
        };

        // Add event listeners to update score on input change
        weeksInput.addEventListener('input', updateScore);
        daysInput.addEventListener('input', updateScore);

        // Add event listener to update score on input change
        levelInput.addEventListener('input', updateScore);

        // Add event listener to update score on checkbox change
        bossTable.addEventListener('change', updateScore);

        // Initialize with current values
        updateScore();
    };

    // Calculate and validate maximum and minimum target attendance weeks and days
    const calculateAndSetTargetAttendance = () => {
        const targetWeeksInput = document.getElementById('target-weeks');
        const targetDaysInput = document.getElementById('target-days');
        const currentWeeksInput = document.getElementById('current-weeks');
        const currentDaysInput = document.getElementById('current-days');

        const calculateDaysFromWeeksAndDays = (weeks, days) => weeks * 5 + days;

        const calculateMaxAttendance = () => {
            const today = new Date();
            const targetDate = new Date(2025, 4, 21); // May 21, 2025

            const totalDays = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24)) + 1;

            const daysUntilThursday = (4 - today.getDay() + 7) % 7; // Days until next Thursday
            const daysUntilWednesday = (3 - today.getDay() + 7) % 7; // Days until next Wednesday
            const daysThisWeek = Math.min(daysUntilWednesday + 1, 5); // Days left this week (max 5)

            const firstThursday = new Date(today.getTime() + daysUntilThursday * (1000 * 60 * 60 * 24));
            const remainingWeeks = Math.floor((targetDate - firstThursday) / (1000 * 60 * 60 * 24 * 7)) + 1;

            const maxTotalDays = Math.min(totalDays, remainingWeeks * 5 + daysThisWeek);
            const maxWeeks = Math.floor(maxTotalDays / 5);
            const maxDays = maxTotalDays % 5;

            return { maxWeeks, maxDays, maxTotalDays };
        };

        const validateInput = () => {
            const getNumericValue = (input) => parseInt(input.value.replace(/[^0-9]/g, ''), 10) || 0;

            const currentWeeks = getNumericValue(currentWeeksInput);
            const currentDays = getNumericValue(currentDaysInput);
            const currentTotalDays = calculateDaysFromWeeksAndDays(currentWeeks, currentDays);

            const targetWeeks = getNumericValue(targetWeeksInput);
            const targetDays = getNumericValue(targetDaysInput);
            const targetTotalDays = calculateDaysFromWeeksAndDays(targetWeeks, targetDays);

            const { maxTotalDays } = calculateMaxAttendance();
            const adjustedMaxDays = Math.min(maxTotalDays + currentTotalDays, 110); // Limit to 110 days (22 weeks)

            // Minimum total days is based on current attendance
            const adjustedMinDays = currentTotalDays;

            // Adjust input if it exceeds maximum or falls below minimum
            if (targetTotalDays > adjustedMaxDays) {
                targetWeeksInput.value = `${Math.floor(adjustedMaxDays / 5)}주`;
                targetDaysInput.value = `${adjustedMaxDays % 5}일`;
            } else if (targetTotalDays < adjustedMinDays) {
                targetWeeksInput.value = `${Math.floor(adjustedMinDays / 5)}주`;
                targetDaysInput.value = `${adjustedMinDays % 5}일`;
            } else {
                // Reapply prefix/suffix
                targetWeeksInput.value = `${targetWeeks}주`;
                targetDaysInput.value = `${targetDays}일`;
            }
        };

        const initializeMaxAndMinValues = () => {
            const getNumericValue = (input) => parseInt(input.value.replace(/[^0-9]/g, ''), 10) || 0;

            const currentWeeks = getNumericValue(currentWeeksInput);
            const currentDays = getNumericValue(currentDaysInput);
            const currentTotalDays = calculateDaysFromWeeksAndDays(currentWeeks, currentDays);

            const { maxTotalDays } = calculateMaxAttendance();
            const adjustedMaxDays = Math.min(maxTotalDays + currentTotalDays, 110); // Limit to 110 days (22 weeks)

            // Set maximum values
            const maxWeeks = Math.floor(adjustedMaxDays / 5);
            const maxDays = adjustedMaxDays % 5;

            // Set minimum values
            const minWeeks = Math.floor(currentTotalDays / 5);
            const minDays = currentTotalDays % 5;

            targetWeeksInput.max = maxWeeks;
            targetDaysInput.max = maxDays;

            targetWeeksInput.min = minWeeks;
            targetDaysInput.min = minDays;

            // Set default values
            targetWeeksInput.value = `${maxWeeks}주`;
            targetDaysInput.value = `${maxDays}일`;
        };

        const attachListenersToCurrentAttendance = () => {
            const getNumericValue = (input) => parseInt(input.value.replace(/[^0-9]/g, ''), 10) || 0;

            const validateInputOnCurrentAttendanceChange = () => {
                initializeMaxAndMinValues();
                validateInput();
            };

            // Add event listeners to recalculate max/min values and validate inputs
            currentWeeksInput.addEventListener('input', validateInputOnCurrentAttendanceChange);
            currentDaysInput.addEventListener('input', validateInputOnCurrentAttendanceChange);
        };

        // Add event listeners to validate target attendance input
        targetWeeksInput.addEventListener('input', validateInput);
        targetDaysInput.addEventListener('input', validateInput);

        // Initialize maximum and minimum values on page load
        initializeMaxAndMinValues();
        validateInput();
        attachListenersToCurrentAttendance();
    };
    
    // Apply prefix and suffix to input fields
    addPrefixSuffix('current-weeks', '', '주');
    addPrefixSuffix('current-days', '', '일');
    addPrefixSuffix('target-weeks', '', '주');
    addPrefixSuffix('target-days', '', '일');
    addPrefixSuffix('current-level', 'Lv. ', '');
    addPrefixSuffix('target-level', 'Lv. ', '');
    addPrefixSuffix('target-score', '', '점');

    initializeBossScores();
    updateBossScores();

    // Call the function to set up listeners and initialize score
    calculateCurrentScore();

    // Call the function to calculate and validate target attendance
    calculateAndSetTargetAttendance();

    // Automatically set example current score
    const currentScoreInput = document.getElementById('current-score');
    currentScoreInput.value = `${formatNumberWithCommas(0)}점`;
});
