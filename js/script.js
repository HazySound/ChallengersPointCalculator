let currentWeeksInput, currentDaysInput, targetWeeksInput, targetDaysInput, attendanceThisWeekInput, bossTable, currentScoreInput, targetLevelInput;

document.addEventListener('DOMContentLoaded', () => {

    // Initialize global variables
    currentWeeksInput = document.getElementById('current-weeks');
    currentDaysInput = document.getElementById('current-days');
    targetWeeksInput = document.getElementById('target-weeks');
    targetDaysInput = document.getElementById('target-days');
    attendanceThisWeekInput = document.getElementById('attendance-this-week');
    currentScoreInput = document.getElementById('current-score');
    targetLevelInput = document.getElementById('target-level');
    currentLevelInput = document.getElementById('current-level'); // Add this line to initialize currentLevelInput
    targetScoreInput = document.getElementById('target-score'); // Add this line

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

    // Calculate and update current score
    const calculateCurrentScore = () => {
        const weeksInput = document.getElementById('current-weeks');
        const daysInput = document.getElementById('current-days');
        const levelInput = document.getElementById('current-level');
        const bossTable = document.getElementById('boss-table');

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

            // Call updateTargetScoreMinimum to update target score validation
            updateTargetScoreMinimum();
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


    const calculateMaxAttendance = () => {
        const today = new Date();
        const targetDate = new Date(2025, 4, 21); // 2025년 5월 21일
    
        // 총 남은 일수 계산 (오늘 포함)
        const totalDays = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24)) + 1;
    
        // 현재 출석 일수 계산
        const currentWeeks = parseInt(currentWeeksInput.value.replace(/[^0-9]/g, ''), 10) || 0;
        const currentDays = parseInt(currentDaysInput.value.replace(/[^0-9]/g, ''), 10) || 0;
        const currentTotalDays = currentWeeks * 5 + currentDays;
    
        // 오늘 출석 여부 확인
        const attendedToday = document.getElementById('attended-today').checked;
    
        // 이번 주 남은 출석 가능 일수 계산
        const currentDay = today.getDay(); // 0: 일요일, ..., 6: 토요일
        const daysUntilWednesday = (3 - currentDay + 7) % 7; // 이번 주 수요일까지 남은 일수
        const attendanceThisWeek = parseInt(attendanceThisWeekInput.value, 10) || 0;
        const remainingThisWeek = Math.max(5 - attendanceThisWeek, 0);
    
        // 오늘 출석 여부에 따라 남은 일수 조정
        const effectiveRemainingDaysThisWeek = attendedToday
            ? Math.min(remainingThisWeek, daysUntilWednesday)
            : Math.min(remainingThisWeek, daysUntilWednesday + 1);
    
        // 남은 주간 출석 계산
        const remainingDaysAfterThisWeek = totalDays - effectiveRemainingDaysThisWeek;
        const remainingWeeks = Math.floor(remainingDaysAfterThisWeek / 7); // 완전한 주 수
        const remainingExtraDays = remainingDaysAfterThisWeek % 7;
    
        // 최대 출석 가능한 일수 (현재 출석 포함)
        const maxTotalDays = Math.min(
            currentTotalDays + effectiveRemainingDaysThisWeek + remainingWeeks * 5 + Math.min(remainingExtraDays, 5),
            110
        );
        const maxWeeks = Math.floor(maxTotalDays / 5);
        const maxDays = maxTotalDays % 5;
    
        return { maxWeeks, maxDays, maxTotalDays };
    };
    

    // Calculate and validate maximum and minimum target attendance weeks and days
    const calculateAndSetTargetAttendance = () => {
        const targetWeeksInput = document.getElementById('target-weeks');
        const targetDaysInput = document.getElementById('target-days');
    
        const validateInput = () => {
            const targetWeeks = parseInt(targetWeeksInput.value.replace(/[^0-9]/g, ''), 10) || 0;
            const targetDays = parseInt(targetDaysInput.value.replace(/[^0-9]/g, ''), 10) || 0;
            const inputTotalDays = targetWeeks * 5 + targetDays;
    
            const { maxTotalDays } = calculateMaxAttendance();
    
            // 최대값 초과 시 조정
            if (inputTotalDays > maxTotalDays) {
                targetWeeksInput.value = `${Math.floor(maxTotalDays / 5)}주`;
                targetDaysInput.value = `${maxTotalDays % 5}일`;
            }
        };
    
        const initializeMaxValues = () => {
            const { maxWeeks, maxDays } = calculateMaxAttendance();
    
            // 입력 필드 초기화
            targetWeeksInput.max = maxWeeks;
            targetDaysInput.max = maxDays;
        };
    
        // 이벤트 리스너 추가
        targetWeeksInput.addEventListener('input', validateInput);
        targetDaysInput.addEventListener('input', validateInput);
    
        // 초기화
        initializeMaxValues();
        validateInput();
    };



    const addTargetAttendanceValidation = () => {
        const targetWeeksInput = document.getElementById('target-weeks');
        const targetDaysInput = document.getElementById('target-days');
    
        targetWeeksInput.addEventListener('blur', validateTargetAttendanceRange);
        targetDaysInput.addEventListener('blur', validateTargetAttendanceRange);
    };

    const validateTargetAttendanceRange = () => {
        const { maxWeeks, maxDays, maxTotalDays } = calculateMaxAttendance();
    
        // 최소값 계산
        const currentWeeks = parseInt(currentWeeksInput.value.replace(/[^0-9]/g, ''), 10) || 0;
        const currentDays = parseInt(currentDaysInput.value.replace(/[^0-9]/g, ''), 10) || 0;
        const minTotalDays = currentWeeks * 5 + currentDays;
    
        // 입력값 검증
        const targetWeeks = parseInt(targetWeeksInput.value.replace(/[^0-9]/g, ''), 10) || 0;
        const targetDays = parseInt(targetDaysInput.value.replace(/[^0-9]/g, ''), 10) || 0;
        const targetTotalDays = targetWeeks * 5 + targetDays;
    
        if (targetTotalDays < minTotalDays) {
            targetWeeksInput.value = `${Math.floor(minTotalDays / 5)}주`;
            targetDaysInput.value = `${minTotalDays % 5}일`;
        } else if (targetTotalDays > maxTotalDays) {
            targetWeeksInput.value = `${Math.floor(maxTotalDays / 5)}주`;
            targetDaysInput.value = `${maxTotalDays % 5}일`;
        }
    };


    // Update target score minimum value and enforce input validation
    const updateTargetScoreMinimum = () => {
        const targetScoreInput = document.getElementById('target-score');

        // Get the current score and validate target score
        const currentScore = parseInt(currentScoreInput.value.replace(/[^0-9]/g, ''), 10) || 0;
        const targetScore = parseInt(targetScoreInput.value.replace(/[^0-9]/g, ''), 10) || 0;

        // Update minimum value for target score
        targetScoreInput.min = currentScore;

        // If target score is less than current score, set it to current score
        if (targetScore < currentScore) {
            targetScoreInput.value = `${formatNumberWithCommas(currentScore)}점`;
        }
    };

    // Set target score to minimum (current score) if input value is less than minimum on blur
    const setTargetScoreToMinimum = () => {
        const targetScoreInput = document.getElementById('target-score');

        // Function to enforce minimum value when blur event occurs
        const enforceMinimumScore = () => {
            const currentScore = parseInt(currentScoreInput.value.replace(/[^0-9]/g, ''), 10) || 0;
            const targetScore = parseInt(targetScoreInput.value.replace(/[^0-9]/g, ''), 10) || 0;

            // If target score is less than current score, set it to the current score
            if (targetScore < currentScore) {
                targetScoreInput.value = `${formatNumberWithCommas(currentScore)}점`;
            }
        };

        // Add event listener for blur event on target score input
        targetScoreInput.addEventListener('blur', enforceMinimumScore);
    };

    // Set and validate target level minimum value based on current level
    const updateTargetLevelMinimum = () => {
        const targetLevelInput = document.getElementById('target-level');
        const currentLevelInput = document.getElementById('current-level');

        // Function to enforce minimum value on blur
        const enforceMinimumLevel = () => {
            const currentLevel = parseInt(currentLevelInput.value.replace(/[^0-9]/g, ''), 10) || 0;
            const targetLevel = parseInt(targetLevelInput.value.replace(/[^0-9]/g, ''), 10) || 0;

            // If target level is less than current level, set it to the current level
            if (targetLevel < currentLevel) {
                targetLevelInput.value = `Lv. ${currentLevel}`;
            }
        };

        // Function to update minimum value dynamically and sync target level if needed
        const setMinimumLevel = () => {
            const currentLevel = parseInt(currentLevelInput.value.replace(/[^0-9]/g, ''), 10) || 0;
            const targetLevel = parseInt(targetLevelInput.value.replace(/[^0-9]/g, ''), 10) || 0;

            // Update target level's minimum value
            targetLevelInput.min = currentLevel;

            // If target level is not empty and is less than the current level, update it
            if (targetLevelInput.value.trim() !== '' && targetLevel < currentLevel) {
                targetLevelInput.value = `Lv. ${currentLevel}`;
            }
        };

        // Add event listener to current level input to update minimum dynamically
        currentLevelInput.addEventListener('input', setMinimumLevel);

        // Add event listener to target level input to enforce minimum value on blur
        targetLevelInput.addEventListener('blur', enforceMinimumLevel);
    };
    
    
    const calculateLevelScore = (currentTotalScore, targetScore, currentLevel, targetLevelInput) => {
        // Step 1: 목표 레벨 설정
        const targetLevel = parseInt(targetLevelInput.value.replace(/[^0-9]/g, ''), 10) || 280;
    
        // Step 2: 레벨 점수 테이블
        const levelThresholds = [
            { level: 260, score: 1000 },
            { level: 265, score: 2000 },
            { level: 270, score: 3000 },
            { level: 275, score: 5000 },
            { level: 280, score: 7000 }
        ];
    
        let levelScore = 0;
        let finalAchievedLevel = currentLevel;
    
        // 시작 레벨을 255 이상이면 가장 가까운 5의 배수로 설정
        let nextLevel = currentLevel >= 255 ? Math.ceil(currentLevel / 5) * 5 : 260;
    
        // 목표 레벨까지 점수를 추가
        while (nextLevel <= targetLevel) {
            const threshold = levelThresholds.find(t => t.level === nextLevel);
            if (threshold) {
                levelScore += threshold.score;
                currentTotalScore += threshold.score;
    
                // 목표 점수 도달 확인
                if (currentTotalScore >= targetScore) {
                    return { levelScore, currentTotalScore, finalAchievedLevel: nextLevel };
                }
            }
    
            finalAchievedLevel = nextLevel;
            nextLevel += 5;
        }
    
        return { levelScore, currentTotalScore, finalAchievedLevel };
    };
    
    const updateAchievementStatus = (isAchieved, currentTotalScore, targetScore) => {
        const achievementStatus = document.getElementById('achievement-status');
    
        if (isAchieved) {
            achievementStatus.textContent = "축하합니다! 목표 점수를 달성하셨습니다!";
            achievementStatus.classList.add('success');
            achievementStatus.classList.remove('fail');
            alert(`축하합니다!! 목표 점수를 달성하셨습니다! 최종 점수: ${currentTotalScore.toLocaleString()}점`);
        } else {
            achievementStatus.textContent = "목표 점수를 달성하지 못했습니다ㅠㅠ";
            achievementStatus.classList.add('fail');
            achievementStatus.classList.remove('success');
            alert(`목표 점수를 달성하지 못했습니다ㅠㅠ 최종 점수: ${currentTotalScore.toLocaleString()}점`);
        }
    };
    

    const calculateFinalAttendanceDate = (startDate, currentAttendanceDays, additionalAttendanceDays, currentTotalScore, targetScore, attendedToday) => {
        let currentDate = new Date(startDate);
        let attendedDays = currentAttendanceDays;
        let thisWeekRemainingAttendance = 5 - (attendedDays % 5); // 이번 주 남은 출석 가능 일수
        let attendanceScore = 0;
    
        // 오늘 출석 여부를 반영
        if (!attendedToday && thisWeekRemainingAttendance > 0) {
            attendedDays++;
            attendanceScore += 100; // 하루 출석 점수 100점
            currentTotalScore += 100;
            thisWeekRemainingAttendance--;
    
            if (currentTotalScore >= targetScore) {
                return { lastDate: currentDate, totalScore: currentTotalScore };
            }
        }
    
        // 다음 날부터 출석 시작
        while (attendedDays < currentAttendanceDays + additionalAttendanceDays) {
            currentDate.setDate(currentDate.getDate() + 1); // 다음 날로 이동
            const dayOfWeek = currentDate.getDay(); // 0: 일요일, ..., 6: 토요일
    
            // 주간 출석 가능 일수 초기화 (목요일 시작)
            if (dayOfWeek === 4) {
                thisWeekRemainingAttendance = 5; // 새로운 주 시작
            }
    
            // 주간 출석 가능 일수 남아 있으면 출석 진행
            if (thisWeekRemainingAttendance > 0) {
                attendedDays++;
                attendanceScore += 100; // 하루 출석 점수 100점
                currentTotalScore += 100;
                thisWeekRemainingAttendance--;
    
                if (currentTotalScore >= targetScore) {
                    return { lastDate: currentDate, totalScore: currentTotalScore };
                }
            }
        }
    
        return { lastDate: currentDate, totalScore: currentTotalScore };
    };
    
    
    
    

    
    const updateFinalResults = (lastAttendanceDate, finalAchievedLevel, requiredBosses, totalScore) => {
        // 최종 출석
        const finalAttendanceLabel = document.getElementById('final-attendance');
        finalAttendanceLabel.textContent = `${lastAttendanceDate.toLocaleDateString()} (${lastAttendanceDate.toLocaleString('ko-KR', { weekday: 'long' })})`;
    
        // 달성해야 할 레벨
        const finalLevelLabel = document.getElementById('final-level');
        finalLevelLabel.textContent = `Lv. ${finalAchievedLevel}`;
    
        // 추가로 잡아야 할 보스
        const bossList = document.getElementById('boss-list');
        const bossToggle = document.getElementById('boss-toggle');
        if (bossList && bossToggle) {
            if (requiredBosses.length > 0) {
                const bossListItems = requiredBosses
                    .map(boss => `<li>${boss.bossName} (${boss.level})</li>`)
                    .join('');
                bossList.innerHTML = bossListItems;
    
                // 보스 목록 자동으로 펼치기
                bossList.classList.add('open');
                bossToggle.textContent = '보스 목록 접기 ▲';
            } else {
                bossList.innerHTML = '<li>추가로 처치할 보스가 없습니다!</li>';
    
                // 보스 목록 닫기
                bossList.classList.remove('open');
                bossToggle.textContent = '보스 목록 펼치기 ▼';
            }
        }
    
        // 최종 점수
        const totalScoreLabel = document.getElementById('final-score');
        totalScoreLabel.textContent = `${totalScore.toLocaleString()}점`;
    };
    
    
    
    

    const calculateBossScore = (currentTotalScore, targetScore, bossTable) => {
        let bossScore = 0;
        const additionalBosses = [];
    
        // 노란색 체크박스 배경만 초기화
        const checkboxes = bossTable.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            const label = checkbox.closest('label');
            const backgroundColor = window.getComputedStyle(label).backgroundColor;

            // 배경색이 노란색(`rgb(255, 242, 204)`)인 경우만 초기화
            if (backgroundColor === 'rgb(255, 242, 204)') {
                label.style.backgroundColor = ''; // 흰색(기본 상태)으로 복구
            }
        });
    
        // 남은 보스 목록 가져오기
        const bossRows = bossTable.querySelectorAll('tbody tr');
        bossRows.forEach(row => {
            const checkboxes = row.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                if (!checkbox.checked) {
                    const bossName = checkbox.dataset.boss;
                    const level = checkbox.dataset.level;
                    const score = bossScores[bossName][level];
    
                    // 남은 보스 추가
                    additionalBosses.push({ bossName, level, score, checkbox });
                }
            });
        });
    
        // 점수가 낮은 순서대로 정렬
        additionalBosses.sort((a, b) => a.score - b.score);
    
        const requiredBosses = [];
    
        // 보스 점수 추가
        for (const boss of additionalBosses) {
            if (currentTotalScore >= targetScore) break; // 목표 점수를 초과하면 종료
            bossScore += boss.score;
            currentTotalScore += boss.score;
    
            // 보스 체크박스 강조
            boss.checkbox.closest('label').style.backgroundColor = '#FFF2CC'; // 노란색 강조
            requiredBosses.push(boss); // 추가로 처치해야 하는 보스
        }
    
        return { bossScore, currentTotalScore, requiredBosses };
    };
    


    const validateTargetAttendance = () => {
        const targetWeeksInput = document.getElementById('target-weeks');
        const targetDaysInput = document.getElementById('target-days');
        const attendanceThisWeekInput = document.getElementById('attendance-this-week');
    
        const targetWeeksValue = targetWeeksInput.value.replace(/[^0-9]/g, '').trim();
        const targetDaysValue = targetDaysInput.value.replace(/[^0-9]/g, '').trim();
        const attendanceThisWeek = parseInt(attendanceThisWeekInput.value, 10) || 0; // 이번 주 출석한 일수
    
        // **추가: 현재 출석 주/일수 계산**
        const currentWeeks = parseInt(currentWeeksInput.value.replace(/[^0-9]/g, ''), 10) || 0;
        const currentDays = parseInt(currentDaysInput.value.replace(/[^0-9]/g, ''), 10) || 0;
    
        // 목표 출석 주/일 수가 비어 있을 경우
        if (!targetWeeksValue && !targetDaysValue) {
            // 남은 출석 기간 계산
            const currentAttendanceDays = currentWeeks * 5 + currentDays; // 현재까지 출석한 일수
            const remainingDays = Math.max(110 - currentAttendanceDays - attendanceThisWeek, 0); // 남은 출석 가능 일수
            const maxWeeks = Math.floor(remainingDays / 5); // 최대 주 수
            const maxDays = remainingDays % 5; // 최대 일 수
    
            // 최대값으로 목표 출석 주/일 설정
            targetWeeksInput.value = `${maxWeeks}주`;
            targetDaysInput.value = `${maxDays}일`;
        }
        else if(targetWeeksValue && !targetDaysValue){
            targetDaysInput.value = `${0}일`;
        }
    };
    
    

    //계산! 버튼 기능 구현
    const calculateButton = document.getElementById('calculate-button'); // 계산 버튼

    calculateButton.addEventListener('click', (event) => {
        event.preventDefault();

        // 필수 입력 필드 검증
        const currentWeeksValue = currentWeeksInput.value.trim();
        const currentDaysValue = currentDaysInput.value.trim();
        const currentLevelValue = currentLevelInput.value.trim();

        if (!currentWeeksValue) {
            alert("현재 출석 주를 입력해주세요.");
            currentWeeksInput.focus();
            return;
        }

        if (!currentDaysValue) {
            alert("현재 출석 일을 입력해주세요.");
            currentDaysInput.focus();
            return;
        }

        if (!currentLevelValue) {
            alert("현재 레벨을 입력해주세요.");
            currentLevelInput.focus();
            return;
        }
    
        // Step 1: 목표 출석 주/일 검증
        validateTargetAttendance();
    
        // Step 2: 필수 입력 필드 검증
        const currentWeeks = parseInt(currentWeeksInput.value.replace(/[^0-9]/g, ''), 10) || 0;
        const currentDays = parseInt(currentDaysInput.value.replace(/[^0-9]/g, ''), 10) || 0;
        const currentLevel = parseInt(currentLevelInput.value.replace(/[^0-9]/g, ''), 10) || 0;
        const targetWeeks = parseInt(targetWeeksInput.value.replace(/[^0-9]/g, ''), 10);
        const targetDays = parseInt(targetDaysInput.value.replace(/[^0-9]/g, ''), 10);
        const targetScore = parseInt(targetScoreInput.value.replace(/[^0-9]/g, ''), 10);
    
        // 초기 값 설정 및 계산 시작
        let currentTotalScore = parseInt(currentScoreInput.value.replace(/[^0-9]/g, ''), 10) || 0;
        const additionalAttendanceDays = (targetWeeks * 5 + targetDays) - (currentWeeks * 5 + currentDays);
    
         // Step 2: 출석 점수 계산
        const { lastDate, totalScore } = calculateFinalAttendanceDate(
            new Date(), // 시작 날짜
            currentWeeks * 5 + currentDays, // 현재 출석 일수
            additionalAttendanceDays, // 추가 출석 일수
            currentTotalScore, // 현재 점수
            targetScore, // 목표 점수
            document.getElementById('attended-today').checked // 오늘 출석 여부
        );

        currentTotalScore = totalScore;

        if (currentTotalScore >= targetScore) {
            updateAchievementStatus(true, currentTotalScore, targetScore);
            updateFinalResults(
                lastDate,
                currentLevel, // 최종 레벨
                [], // 추가로 잡아야 할 보스
                currentTotalScore
            );
            return;
        }
    
        const { levelScore, currentTotalScore: updatedTotalAfterLevel, finalAchievedLevel } =
            calculateLevelScore(currentTotalScore, targetScore, currentLevel, targetLevelInput);
    
        currentTotalScore = updatedTotalAfterLevel;

        if (currentTotalScore >= targetScore) {
            updateAchievementStatus(true, currentTotalScore, targetScore);
            updateFinalResults(
                lastDate,
                finalAchievedLevel, // 최종 레벨
                [], // 추가로 잡아야 할 보스
                currentTotalScore
            );
            return;
        }
    
        const { bossScore, currentTotalScore: updatedTotalAfterBoss, requiredBosses } =
            calculateBossScore(currentTotalScore, targetScore, bossTable);
    
        currentTotalScore = updatedTotalAfterBoss;

    
        // 최종 결과 출력
        const isAchieved = currentTotalScore >= targetScore;
        updateAchievementStatus(isAchieved, currentTotalScore, targetScore);
        // 최종 결과 출력
        updateFinalResults(
            lastDate,
            finalAchievedLevel, // 최종 레벨(예시값)
            requiredBosses, // 추가로 잡아야 할 보스(예시값)
            currentTotalScore,
        );
    });    

    // 모든 입력 필드에 대해 툴팁 생성
    document.querySelectorAll('.tooltip-container').forEach(label => {
        const tooltipText = label.getAttribute('data-tooltip'); // data-tooltip 속성 내용 가져오기

        if (tooltipText) {
            // 툴팁 요소 생성
            const tooltipElement = document.createElement('div');
            tooltipElement.className = 'tooltip-text';
            tooltipElement.innerHTML = tooltipText.replaceAll('\\n', '<br>'); // 줄바꿈 처리

            // 툴팁 요소를 DOM에 추가
            label.appendChild(tooltipElement);
        }
    });

    const refreshBanner = document.getElementById('refresh-banner');

    refreshBanner.addEventListener('click', () => {
        location.reload(); // 웹페이지 새로고침
    });


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

    // 목표 출석 주/일수 최소값 및 범위 검증 이벤트 추가
    addTargetAttendanceValidation();

    // Call the function to ensure proper behavior
    setTargetScoreToMinimum();

    // Call the function to ensure proper behavior
    updateTargetLevelMinimum();

    // Automatically set example current score
    currentScoreInput.value = `${formatNumberWithCommas(0)}점`;
});
