(function () {
    'use strict';

    const STORAGE_KEY = 'bingAutoState';
    const POPUP_WIDTH = 420;
    const DEFAULT_STATE = {
        searchCount: 30,
        interval: 10,
        isRunning: false,
        currentSearch: 0,
        totalSearches: 0,
        currentQuery: 'Waiting...',
        status: 'Idle',
        log: []
    };

    const hasExtensionApi = typeof chrome !== 'undefined' && chrome.runtime && chrome.storage;

    const root = document.getElementById('app');
    const widthLock = document.querySelector('.popup-width-lock');
    const versionBadge = document.getElementById('versionBadge');
    const searchCountInput = document.getElementById('searchCount');
    const intervalInput = document.getElementById('interval');
    const startBtn = document.getElementById('startBtn');
    const progressSection = document.getElementById('progressSection');
    const progressBar = document.getElementById('progressBar');
    const progressCount = document.getElementById('progressCount');
    const queryText = document.getElementById('queryText');
    const statusMessage = document.getElementById('statusMessage');
    const statusText = document.getElementById('statusText');
    const logSection = document.getElementById('logSection');
    const logList = document.getElementById('logList');
    const clearLogBtn = document.getElementById('clearLogBtn');
    const backgroundHint = document.getElementById('backgroundHint');

    let currentState = normalizeState(DEFAULT_STATE);
    let requestPending = false;
    let transientStatus = '';
    let transientStatusType = 'error';
    let transientTimer = null;

    function init() {
        enforcePopupWidth();
        setVersionBadge();
        bindEvents();

        if (!hasExtensionApi) {
            renderUnavailableMode();
            return;
        }

        chrome.storage.onChanged.addListener(handleStorageChange);
        refreshState();
    }

    function enforcePopupWidth() {
        const width = `${POPUP_WIDTH}px`;

        [document.documentElement, document.body, widthLock, root].forEach((element) => {
            if (!element) {
                return;
            }

            element.style.width = width;
            element.style.minWidth = width;
            element.style.maxWidth = width;
        });

        window.setTimeout(() => {
            [document.documentElement, document.body, widthLock, root].forEach((element) => {
                if (!element) {
                    return;
                }

                element.style.width = width;
                element.style.minWidth = width;
                element.style.maxWidth = width;
            });
        }, 60);
    }

    function setVersionBadge() {
        if (!versionBadge) {
            return;
        }

        if (hasExtensionApi && chrome.runtime.getManifest) {
            versionBadge.textContent = `v${chrome.runtime.getManifest().version}`;
            return;
        }

        versionBadge.textContent = 'local';
    }

    function bindEvents() {
        startBtn.addEventListener('click', handleStartButton);
        clearLogBtn.addEventListener('click', handleClearLog);

        [searchCountInput, intervalInput].forEach((input) => {
            input.addEventListener('input', validateInput);
            input.addEventListener('change', saveDraftSettings);
        });

        window.addEventListener('resize', enforcePopupWidth);
    }

    async function refreshState() {
        try {
            const response = await sendMessage({ type: 'GET_STATE' });
            currentState = normalizeState(response && response.state);
        } catch (_error) {
            const stored = await chrome.storage.local.get(STORAGE_KEY);
            currentState = normalizeState(stored[STORAGE_KEY]);
        }

        render();
    }

    function handleStorageChange(changes, areaName) {
        if (areaName !== 'local' || !changes[STORAGE_KEY]) {
            return;
        }

        currentState = normalizeState(changes[STORAGE_KEY].newValue);
        render();
    }

    async function handleStartButton() {
        if (!hasExtensionApi || requestPending) {
            return;
        }

        requestPending = true;
        render();

        try {
            if (currentState.isRunning) {
                await sendMessage({ type: 'STOP_SEARCH' });
                showTransientStatus('Search run stopped.', 'info');
            } else {
                const values = getValidatedValues();
                await sendMessage({
                    type: 'START_SEARCH',
                    count: values.count,
                    interval: values.interval
                });
                showTransientStatus('Search run started.', 'info');
            }
        } catch (error) {
            showTransientStatus(error.message || 'Could not reach the background worker.', 'error');
        } finally {
            requestPending = false;
            render();
        }
    }

    async function handleClearLog() {
        if (!hasExtensionApi || requestPending) {
            return;
        }

        try {
            await sendMessage({ type: 'CLEAR_LOG' });
            showTransientStatus('Search log cleared.', 'info');
        } catch (error) {
            showTransientStatus(error.message || 'Could not clear the log.', 'error');
        }
    }

    async function saveDraftSettings() {
        if (!hasExtensionApi || currentState.isRunning) {
            return;
        }

        const values = getValidatedValues();
        currentState = normalizeState({
            ...currentState,
            searchCount: values.count,
            interval: values.interval
        });

        render();
        await chrome.storage.local.set({ [STORAGE_KEY]: currentState });
    }

    function validateInput(event) {
        const input = event.target;
        const value = Number.parseInt(input.value, 10);
        const min = Number.parseInt(input.min, 10);
        const max = Number.parseInt(input.max, 10);
        const isInvalid = input.value !== '' && (Number.isNaN(value) || value < min || value > max);

        input.classList.toggle('error', isInvalid);
    }

    function getValidatedValues() {
        const count = clampInteger(searchCountInput.value, DEFAULT_STATE.searchCount, 1, 100);
        const interval = clampInteger(intervalInput.value, DEFAULT_STATE.interval, 3, 60);

        searchCountInput.value = String(count);
        intervalInput.value = String(interval);
        searchCountInput.classList.remove('error');
        intervalInput.classList.remove('error');

        return { count, interval };
    }

    function render() {
        enforcePopupWidth();

        const total = currentState.totalSearches || currentState.searchCount;
        const completed = currentState.totalSearches > 0 ? currentState.currentSearch : 0;
        const percent = currentState.totalSearches > 0
            ? Math.min(100, (currentState.currentSearch / currentState.totalSearches) * 100)
            : 0;
        const shouldShowProgress = currentState.isRunning || currentState.totalSearches > 0 || currentState.currentSearch > 0;
        const completedRun = isCompleted(currentState);

        searchCountInput.value = String(currentState.searchCount);
        intervalInput.value = String(currentState.interval);
        searchCountInput.disabled = currentState.isRunning || requestPending || !hasExtensionApi;
        intervalInput.disabled = currentState.isRunning || requestPending || !hasExtensionApi;

        startBtn.disabled = requestPending || !hasExtensionApi;
        startBtn.classList.toggle('running', currentState.isRunning);
        startBtn.textContent = requestPending
            ? 'Working...'
            : currentState.isRunning
                ? 'Stop Search Run'
                : 'Start Search Run';

        clearLogBtn.disabled = requestPending || currentState.log.length === 0;

        backgroundHint.textContent = currentState.isRunning
            ? 'The Bing popup is running. It will change to the next keyword after each interval.'
            : 'A Bing popup window will open and reuse the same window for every next keyword.';

        progressSection.classList.toggle('hidden', !shouldShowProgress);
        progressCount.textContent = `${completed} / ${total}`;
        progressBar.style.width = `${percent}%`;
        queryText.textContent = getQueryLabel(currentState);

        renderStatus(completedRun);
        renderLog(currentState.log);
    }

    function renderStatus(completedRun) {
        const showTransient = Boolean(transientStatus);

        statusMessage.classList.remove('error', 'info');

        if (showTransient) {
            statusMessage.classList.remove('hidden');
            statusMessage.classList.add(transientStatusType);
            statusText.textContent = transientStatus;
            return;
        }

        if (completedRun) {
            statusMessage.classList.remove('hidden');
            statusText.textContent = `Completed ${currentState.currentSearch} of ${currentState.totalSearches} searches.`;
            return;
        }

        if (!currentState.isRunning && currentState.status === 'Stopped' && currentState.currentSearch > 0) {
            statusMessage.classList.remove('hidden');
            statusMessage.classList.add('info');
            statusText.textContent = `Stopped after ${currentState.currentSearch} searches.`;
            return;
        }

        if (!currentState.isRunning && currentState.status === 'Error') {
            statusMessage.classList.remove('hidden');
            statusMessage.classList.add('error');
            statusText.textContent = 'The last run ended with an error.';
            return;
        }

        statusMessage.classList.add('hidden');
    }

    function renderLog(entries) {
        logSection.classList.toggle('hidden', entries.length === 0);
        logList.innerHTML = '';

        if (entries.length === 0) {
            return;
        }

        const fragment = document.createDocumentFragment();

        entries.forEach((entry) => {
            const item = document.createElement('div');
            item.className = 'log-item';

            const number = document.createElement('span');
            number.className = 'log-number';
            number.textContent = String(entry.number);

            const query = document.createElement('div');
            query.className = 'log-query';
            query.textContent = entry.query;

            const time = document.createElement('span');
            time.className = 'log-time';
            time.textContent = entry.time;

            item.append(number, query, time);
            fragment.appendChild(item);
        });

        logList.appendChild(fragment);
    }

    function renderUnavailableMode() {
        searchCountInput.disabled = true;
        intervalInput.disabled = true;
        startBtn.disabled = true;
        clearLogBtn.disabled = true;
        showTransientStatus('Load this folder as an unpacked extension to use the popup.', 'error');
    }

    function getQueryLabel(state) {
        if (state.isRunning && state.currentSearch === 0) {
            return 'Preparing...';
        }

        if (isCompleted(state)) {
            return 'Completed!';
        }

        if (!state.isRunning && state.status === 'Stopped') {
            return 'Stopped';
        }

        if (!state.isRunning && state.status === 'Error') {
            return 'Error';
        }

        return state.currentQuery || 'Waiting...';
    }

    function isCompleted(state) {
        return !state.isRunning
            && state.totalSearches > 0
            && state.currentSearch >= state.totalSearches
            && state.status === 'Completed';
    }

    function normalizeState(state) {
        const nextState = state || {};
        const totalSearches = clampInteger(nextState.totalSearches, 0, 0, 100);
        const currentSearch = clampInteger(nextState.currentSearch, 0, 0, Math.max(totalSearches, 100));

        return {
            searchCount: clampInteger(nextState.searchCount, DEFAULT_STATE.searchCount, 1, 100),
            interval: clampInteger(nextState.interval, DEFAULT_STATE.interval, 3, 60),
            isRunning: Boolean(nextState.isRunning),
            currentSearch: Math.min(currentSearch, totalSearches || currentSearch),
            totalSearches,
            currentQuery: typeof nextState.currentQuery === 'string' && nextState.currentQuery
                ? nextState.currentQuery
                : DEFAULT_STATE.currentQuery,
            status: typeof nextState.status === 'string' && nextState.status
                ? nextState.status
                : DEFAULT_STATE.status,
            log: Array.isArray(nextState.log)
                ? nextState.log
                    .filter((entry) => entry && typeof entry.query === 'string')
                    .slice(0, 100)
                    .map((entry, index) => ({
                        id: entry.id || `log-${index}`,
                        number: clampInteger(entry.number, index + 1, 1, 999),
                        query: entry.query,
                        time: typeof entry.time === 'string' ? entry.time : '--:--:--'
                    }))
                : []
        };
    }

    function clampInteger(value, fallback, min, max) {
        const parsed = Number.parseInt(value, 10);

        if (Number.isNaN(parsed)) {
            return fallback;
        }

        return Math.min(max, Math.max(min, parsed));
    }

    function showTransientStatus(message, type) {
        transientStatus = message;
        transientStatusType = type === 'info' ? 'info' : 'error';
        render();

        if (transientTimer) {
            clearTimeout(transientTimer);
        }

        transientTimer = window.setTimeout(() => {
            transientStatus = '';
            transientStatusType = 'error';
            render();
        }, 3000);
    }

    function sendMessage(message) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(message, (response) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                    return;
                }

                if (response && response.error) {
                    reject(new Error(response.error));
                    return;
                }

                resolve(response);
            });
        });
    }

    init();
})();
