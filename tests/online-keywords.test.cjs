const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');

const workerSource = readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');

function createWorker(fetchMock, timer = setTimeout) {
    const storage = {};
    const navigations = [];
    const alarms = new Map();
    const event = () => ({ addListener() {} });
    const noop = async () => {};
    const context = vm.createContext({
        console,
        URLSearchParams,
        AbortController,
        setTimeout: timer,
        clearTimeout,
        fetch: fetchMock,
        chrome: {
            runtime: { onInstalled: event(), onStartup: event(), onMessage: event() },
            storage: {
                local: {
                    get: async (key) => ({ [key]: structuredClone(storage[key]) }),
                    set: async (values) => Object.assign(storage, structuredClone(values))
                }
            },
            alarms: {
                onAlarm: event(),
                create: (name, options) => alarms.set(name, options),
                get: async (name) => alarms.get(name),
                clear: async (name) => alarms.delete(name)
            },
            tabs: {
                onRemoved: event(),
                get: async (id) => ({ id, windowId: 10 }),
                update: async (id, { url }) => {
                    navigations.push(url);
                    return { id, windowId: 10 };
                },
                remove: noop
            },
            windows: {
                onRemoved: event(),
                create: async ({ url }) => {
                    navigations.push(url);
                    return { id: 10, tabs: [{ id: 11 }] };
                },
                remove: noop
            },
            action: { setBadgeText: noop, setBadgeBackgroundColor: noop }
        }
    });
    vm.runInContext(workerSource, context);
    return { run: (code) => vm.runInContext(code, context), storage, navigations, alarms };
}

function response(pages) {
    return { ok: true, json: async () => ({ query: { pages } }) };
}

test('Vietnamese text, nested entities and Unicode survive the search URL', () => {
    const worker = createWorker(async () => response([]));
    const query = worker.run("cleanOnlineQuery('<b>Khai gi&amp;#7843;ng kh&#243;a h&#x1ECD;c</b> &amp; AI')");
    assert.equal(query, 'Khai gi\u1ea3ng kh\u00f3a h\u1ecdc & AI');
    const url = worker.run("createSearchUrl(cleanOnlineQuery('Khai gi&amp;#7843;ng kh&#243;a h&#x1ECD;c &amp; AI'))");
    assert.equal(new URL(url).searchParams.get('q'), query);
    assert.equal(worker.run("cleanOnlineQuery('A &unknown; topic')"), '');
    assert.equal(worker.run("cleanOnlineQuery('123456')"), '');
    assert.equal(worker.run("cleanOnlineQuery('&#x110000;')"), '');
});

test('each run fetches new topics and uses only online results when sufficient', async () => {
    const requests = [];
    const worker = createWorker(async (url, options) => {
        requests.push(url);
        assert.equal(options.cache, 'no-store');
        assert.equal(options.credentials, 'omit');
        const parsed = new URL(url);
        assert.equal(parsed.searchParams.get('generator'), 'random');
        assert.equal(parsed.searchParams.get('grnnamespace'), '0');
        return response(Array.from({ length: 30 }, (_, index) => ({
            ns: 0, title: `Fetched subject ${requests.length} number ${index}`
        })));
    });
    worker.run("buildRunQueries = () => { throw new Error('Unexpected built-in keywords'); }");
    const first = await worker.run("prepareRunQueries(30, 'online')");
    const second = await worker.run("prepareRunQueries(30, 'online')");
    assert.equal(first.source, 'online');
    assert.equal(first.onlineCount, 30);
    assert.equal(new Set(first.queries).size, 30);
    assert.equal(requests.length, 4);
    assert.ok(first.queries.every((query) => !second.queries.includes(query)));
    assert.equal(new Set(requests.map((url) => new URL(url).hostname)).size, 2);
});

test('a failed source keeps useful online topics before filling backup slots', async () => {
    const worker = createWorker(async (url) => {
        if (new URL(url).hostname === 'en.wikipedia.org') {
            return { ok: false, status: 503 };
        }
        return response([
            { ns: 0, title: 'Ph\u1ed1 c\u1ed5 H\u1ed9i An' },
            { ns: 0, title: '  Ph\u1ed1 c\u1ed5 H\u1ed9i An  ' },
            { ns: 0, title: 'Ocean currents' },
            { ns: 0, title: 'Ambiguous title', pageprops: { disambiguation: '' } },
            { ns: 1, title: 'Talk:Unwanted topic' },
            { ns: 0, title: 'Deleted page', missing: true },
            { ns: 0, title: 'Entity &unhandled; title' }
        ]);
    });
    const result = await worker.run("prepareRunQueries(10, 'online')");
    assert.equal(result.source, 'mixed');
    assert.equal(result.onlineCount, 2);
    assert.equal(result.queries.length, 10);
    assert.equal(new Set(result.queries.map((query) => query.toLowerCase())).size, 10);
    assert.deepEqual(new Set(Array.from(result.queries.slice(0, 2))), new Set(['Ph\u1ed1 c\u1ed5 H\u1ed9i An', 'Ocean currents']));
});

test('network errors, invalid JSON and API errors all use a complete backup queue', async () => {
    const failingFetches = [
        async () => { throw new Error('Network disconnected'); },
        async () => ({ ok: true, json: async () => { throw new SyntaxError('Invalid JSON'); } }),
        async () => ({ ok: true, json: async () => ({ error: { code: 'ratelimited' } }) }),
        async () => response([])
    ];
    for (const fetchMock of failingFetches) {
        const worker = createWorker(fetchMock);
        const result = await worker.run("prepareRunQueries(100, 'online')");
        assert.equal(result.source, 'fallback');
        assert.equal(result.onlineCount, 0);
        assert.equal(result.queries.length, 100);
        assert.equal(new Set(result.queries).size, 100);
    }
});

test('slow requests are aborted and fall back instead of stalling the run', async () => {
    let aborted = 0;
    const worker = createWorker((_url, { signal }) => new Promise((_resolve, reject) => {
        signal.addEventListener('abort', () => {
            aborted += 1;
            reject(new Error('Aborted'));
        }, { once: true });
    }), (callback, duration) => {
        assert.equal(duration, 7000);
        return setTimeout(callback, 10);
    });
    const result = await worker.run("prepareRunQueries(5, 'online')");
    assert.equal(aborted, 2);
    assert.equal(result.source, 'fallback');
    assert.equal(result.queries.length, 5);
});

test('built-in mode makes no network requests', async () => {
    let requests = 0;
    const worker = createWorker(async () => {
        requests += 1;
        return response([]);
    });
    const result = await worker.run("prepareRunQueries(30, 'offline')");
    assert.equal(result.source, 'offline');
    assert.equal(result.queries.length, 30);
    assert.equal(requests, 0);
});

test('start, progress, stop and settings preserve the persisted online queue', async () => {
    let requests = 0;
    const worker = createWorker(async () => {
        requests += 1;
        return response([
            { ns: 0, title: 'Ph\u1ed1 c\u1ed5 H\u1ed9i An' },
            { ns: 0, title: 'Ocean currents' },
            { ns: 0, title: 'Renewable energy' }
        ]);
    });
    await worker.run("handleMessage({ type: 'START_SEARCH', count: 3, interval: 3, keywordSource: 'online' })");
    let state = worker.storage.bingAutoState;
    assert.equal(state.querySource, 'online');
    assert.equal(state.onlineQueryCount, 3);
    assert.equal(state.currentSearch, 1);
    assert.equal(state.queryQueue.length, 3);
    assert.equal(new URL(worker.navigations[0]).searchParams.get('q'), state.queryQueue[0]);
    const savedQueue = state.queryQueue.slice();
    await worker.run("handleMessage({ type: 'UPDATE_SETTINGS', count: 99, keywordSource: 'offline' })");
    assert.deepEqual(worker.storage.bingAutoState.queryQueue, savedQueue);
    assert.equal(worker.storage.bingAutoState.keywordSource, 'online');
    await worker.run('performSearchCycle()');
    assert.equal(requests, 2);
    assert.equal(worker.storage.bingAutoState.currentSearch, 2);
    assert.equal(new URL(worker.navigations[1]).searchParams.get('q'), savedQueue[1]);
    await worker.run("handleMessage({ type: 'STOP_SEARCH' })");
    await worker.run("handleMessage({ type: 'UPDATE_SETTINGS', count: 10, interval: 4, keywordSource: 'offline' })");
    state = worker.storage.bingAutoState;
    assert.equal(state.isRunning, false);
    assert.equal(state.keywordSource, 'offline');
    assert.equal(state.searchCount, 10);
    assert.equal(state.onlineQueryCount, 3);
    assert.equal(state.log.length, 2);
    assert.equal(state.runnerTabId, null);
    assert.equal(worker.alarms.size, 0);
});
