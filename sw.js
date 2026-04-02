const STORAGE_KEY = 'bingAutoState';
const NEXT_SEARCH_ALARM = 'bing-auto-next-search';
const COMPLETE_RUN_ALARM = 'bing-auto-complete-run';
const CLOSE_TAB_ALARM_PREFIX = 'bing-auto-close-tab-';
const MAX_LOG_ENTRIES = 100;
const RUNNER_WINDOW_WIDTH = 1180;
const RUNNER_WINDOW_HEIGHT = 880;

const DEFAULT_STATE = {
    searchCount: 30,
    interval: 10,
    isRunning: false,
    currentSearch: 0,
    totalSearches: 0,
    currentQuery: 'Waiting...',
    status: 'Idle',
    log: [],
    usedQueries: [],
    queryQueue: [],
    openTabIds: [],
    runnerTabId: null,
    runnerWindowId: null,
    startedAt: null,
    completedAt: null
};

const STATIC_SEARCH_QUERIES = [
    'artificial intelligence trends 2026', 'best smartphones 2026', 'cloud computing basics',
    'cybersecurity tips for beginners', 'machine learning tutorial', 'best laptop for students',
    'how does blockchain work', 'quantum computing explained', 'top programming languages',
    'web development framework comparison', 'data science career path', 'IoT smart home devices',
    'best coding bootcamps', 'software engineering salary', 'tech startup ideas',
    'virtual reality headsets review', 'augmented reality apps', 'robotics for beginners',
    'best antivirus software', 'how to learn Python', 'how do black holes form',
    'NASA Mars mission update', 'climate change solutions', 'renewable energy sources',
    'human genome project results', 'ocean exploration discoveries', 'how do vaccines work',
    'space tourism companies', 'endangered species list 2026', 'photosynthesis process explained',
    'periodic table elements', 'evolution theory summary', 'what causes earthquakes',
    'solar system planets facts', 'DNA structure discovery', 'healthy breakfast recipes',
    'best exercises for weight loss', 'yoga for beginners', 'mental health tips',
    'benefits of meditation', 'how to improve sleep quality', 'vitamin D deficiency symptoms',
    'running tips for beginners', 'healthy meal prep ideas', 'stress management techniques',
    'benefits of drinking water', 'home workout routines', 'intermittent fasting guide',
    'protein rich foods list', 'how to build muscle', 'study tips for students',
    'online learning platforms', 'how to write an essay', 'scholarship applications tips',
    'best universities in the world', 'math problem solving strategies', 'history of ancient Rome',
    'how to learn a new language', 'physics formulas cheat sheet', 'chemistry experiment ideas',
    'philosophy famous thinkers', 'geography world capitals', 'literature classic books list',
    'algebra basics tutorial', 'SAT preparation guide', 'best movies 2026',
    'top Netflix series recommendations', 'new music releases this week', 'video game reviews 2026',
    'best books to read', 'celebrity news today', 'upcoming movie trailers',
    'best podcasts to listen to', 'board games for family', 'anime recommendations list',
    'best comedy shows', 'music festivals 2026', 'streaming service comparison',
    'best documentaries', 'popular TikTok trends', 'best travel destinations 2026',
    'budget travel tips', 'what to pack for vacation', 'best airlines review',
    'national parks to visit', 'travel insurance comparison', 'beach destinations tropical',
    'European cities to visit', 'travel photography tips', 'solo travel safety tips',
    'best hostels in Europe', 'cruise ship vacation deals', 'hiking trails near me',
    'best food around the world', 'cultural festivals worldwide', 'easy dinner recipes',
    'how to make pasta from scratch', 'best pizza recipe', 'baking tips for beginners',
    'coffee brewing methods', 'vegan recipes collection', 'how to grill steak',
    'homemade bread recipe', 'smoothie recipes healthy', 'Asian cuisine recipes',
    'dessert recipes chocolate', 'meal planning weekly', 'spice combinations cooking',
    'food preservation methods', 'cooking techniques guide', 'how to invest in stocks',
    'cryptocurrency market update', 'personal finance tips', 'small business ideas 2026',
    'tax filing tips', 'real estate market trends', 'passive income ideas',
    'retirement planning guide', 'credit score improvement', 'budgeting apps comparison',
    'entrepreneurship advice', 'marketing strategy tips', 'remote work best practices',
    'freelancing platforms review', 'stock market analysis', 'football match results today',
    'NBA standings current season', 'Olympic games history', 'tennis grand slam winners',
    'formula 1 race schedule', 'best soccer players 2026', 'swimming training tips',
    'basketball shooting techniques', 'marathon training plan', 'golf swing improvement',
    'extreme sports adventure', 'esports tournament results', 'home decoration ideas',
    'minimalist living tips', 'DIY craft projects', 'gardening for beginners',
    'pet care guide dogs', 'fashion trends 2026', 'skincare routine steps',
    'how to organize closet', 'productivity tips daily', 'sustainable living practices',
    'digital detox benefits', 'morning routine ideas', 'how to save money',
    'relationship advice tips', 'time management techniques', 'what is trending today',
    'fun facts about animals', 'world records guinness', 'optical illusions explained',
    'mythology stories Greek', 'random facts history', 'how tall is Mount Everest',
    'deepest ocean trench', 'fastest land animal', 'most spoken languages world',
    'interesting science experiments', 'weird laws around world', 'amazing architecture buildings',
    'natural wonders of world', 'mysterious places earth', 'latest AI tools for work',
    'best free productivity apps', 'healthy dinner ideas quick', 'travel destinations in Asia 2026',
    'how to improve English speaking', 'simple stretching routine at home', 'best headphones under 100',
    'Microsoft Rewards search tips', 'latest space telescope discoveries', 'how to make iced coffee',
    'best Chrome extensions for study', 'top side hustle ideas 2026', 'cheap weekend getaway ideas',
    'easy vegetarian lunch ideas', 'best monitor for coding', 'what is prompt engineering',
    'how to use spreadsheets better', 'latest climate tech startups', 'best budget smartphones 2026',
    'home office setup ideas', 'how to protect online privacy', 'beginner strength training plan',
    'best YouTube channels to learn coding', 'top museums in Europe', 'how to write better emails',
    'best keyboard for programmers', 'morning stretching routine', 'latest astronomy news',
    'best rainy day activities', 'simple meal ideas for work', 'travel checklist printable',
    'top electric cars 2026', 'best free photo editors', 'daily habits for focus',
    'how to reduce screen time', 'top healthy snacks', 'best anime movies to watch',
    'how to stay motivated', 'what is quantum internet', 'best camping gear checklist',
    'popular museums in Japan', 'how to clean laptop safely', 'best resume tips 2026',
    'latest fintech trends', 'easy soup recipes homemade', 'top weekend projects at home',
    'best podcasts for learning', 'famous inventions that changed the world', 'how to learn chess openings',
    'best places to watch sunsets', 'simple budget planner ideas', 'top coding interview tips',
    'healthy smoothie bowl ideas', 'best study music playlists', 'top cafes around the world',
    'how to start journaling', 'best smart home gadgets 2026', 'easy breakfast for busy mornings',
    'how to improve public speaking', 'top biographies to read', 'latest renewable energy news',
    'best city breaks in Europe', 'how to declutter your room', 'daily walking benefits'
];

// Extra ASCII-only queries to avoid odd entity rendering while still widening the keyword pool.
const LOCAL_SEARCH_QUERIES = [
    'du lich da lat tu tuc', 'kinh nghiem di hoi an 3 ngay 2 dem', 'dia diem an sang ngon o ha noi',
    'quan cafe dep o sai gon', 'lich nghi le 2026', 'mua nao du lich phu quoc dep nhat',
    'cach lam banh flan tai nha', 'cach nau bun bo hue don gian', 'mon an ngon cho bua toi',
    'thuc don giam can 7 ngay', 'cach giam can an toan', 'bai tap cardio tai nha',
    'lich tap gym cho nguoi moi', 'cach cai thien tu the ngoi', 'thoi quen buoi sang hieu qua',
    'meo giu tap trung khi hoc', 'cach lap ke hoach hoc tap', 'kinh nghiem on thi toeic',
    'mau cv xin viec don gian', 'cach viet email xin viec', 'cau hoi phong van pho bien',
    'kinh nghiem lam viec tu xa', 'cach quan ly chi tieu ca nhan', 'ung dung ghi chu tot nhat',
    'meo sap xep ban lam viec gon gang', 'cach backup du lieu dien thoai', 'meo bao mat tai khoan online',
    'cach tao slide powerpoint dep', 'mau ke hoach marketing co ban', 'cach ban hang online hieu qua',
    'y tuong kinh doanh nho 2026', 'cach mo shop online', 'kinh nghiem mua laptop cho sinh vien',
    'tai nghe bluetooth nao tot', 'camera mini cho ban hoc', 'den ban hoc chong can',
    'ghe cong thai hoc gia re', 'ban phim co nao tot cho van phong', 'man hinh tot cho lap trinh',
    'chuot khong day pin lau', 'loa bluetooth nho gon', 'sac du phong dung luong cao',
    'dong ho thong minh cho nguoi tap luyen', 'giay chay bo cho nguoi moi', 'ao khoac di mua dep',
    'cach cham soc da dau', 'routine duong da co ban', 'mau toc ngan dep 2026',
    'phoi do di hoc don gian', 'trang phuc cong so mua he', 'meo giat do khong phai mau',
    'cach don phong nhanh gon', 'meo giu nha bep sach', 'cay trong trong nha de song',
    'cach trong rau tai ban cong', 'kinh nghiem nuoi meo con', 'cach cham soc cho con',
    'dia diem cam trai gan sai gon', 'lich trinh du lich ninh binh', 'dia diem check in da nang',
    'kinh nghiem san may ta xua', 'tour du lich quy nhon gia tot', 'mon ngon da lat nen thu',
    'quan bun cha ngon o ha noi', 'am thuc hue co gi ngon', 'quan an khuya o da nang',
    'tin tuc bong da hom nay', 'ket qua ngoai hang anh moi nhat', 'lich thi dau champions league',
    'bang xep hang laliga', 'tin chuyen nhuong bong da', 'ket qua nba hom nay',
    'lich thi dau cau long', 'giai tennis grand slam moi nhat', 'tin cong nghe moi nhat',
    'dien thoai sap ra mat 2026', 'cap nhat windows moi nhat', 'meo su dung excel nhanh',
    'cach dung chatgpt hieu qua', 'prompt hay cho hoc tap', 'cong cu ai cho dan van phong',
    'tin tuc ai va robot', 'xu huong lap trinh web 2026', 'hoc react tu dau',
    'hoc javascript cho nguoi moi', 'cach hoc tieng anh giao tiep', 'ung dung hoc tu vung',
    'meo luyen nghe tieng anh', 'cach hoc tieng nhat co ban', 'cach hoc tieng han nhanh',
    'lich am hom nay', 'du bao thoi tiet cuoi tuan', 'gia vang hom nay', 'gia xang moi nhat',
    'lich nghi tet duong lich 2026', 'ke hoach du lich tet 2026', 'mau bai phat bieu khai giang nam hoc moi',
    'kich ban chuong trinh khai giang', 'ke hoach to chuc le tong ket nam hoc', 'mau loi cam on trong su kien',
    'cach viet thong bao noi bo', 'mau noi dung poster su kien', 'cach to chuc workshop thanh cong',
    'y tuong trang tri lop hoc', 'mau checklist to chuc su kien', 'mau chu de team building vui nhon'
];

const SEARCH_SUBJECTS = [
    'artificial intelligence tools', 'machine learning projects', 'cloud computing platforms',
    'cybersecurity habits', 'web development workflows', 'data science portfolio ideas',
    'python automation ideas', 'JavaScript learning path', 'remote work productivity systems',
    'note taking apps', 'project management methods', 'digital marketing ideas',
    'email organization habits', 'public speaking practice', 'creative writing prompts',
    'language learning strategies', 'study routine planning', 'coding interview preparation',
    'resume writing strategies', 'portfolio website inspiration', 'budget travel planning',
    'city break ideas', 'museum trip planning', 'healthy breakfast planning',
    'meal prep routines', 'home workout programs', 'strength training routines',
    'running recovery habits', 'sleep improvement habits', 'morning routine ideas',
    'stress management methods', 'mindfulness exercises', 'personal finance habits',
    'budgeting systems', 'passive income research', 'small business workflows',
    'side hustle planning', 'customer service ideas', 'online privacy habits',
    'password manager setup', 'cloud storage choices', 'smart home automation',
    'home office setup', 'desk organization ideas', 'minimalist room design',
    'indoor gardening tips', 'pet care routines', 'sustainable living habits',
    'healthy snack ideas', 'coffee brewing methods', 'tea tasting basics',
    'baking practice ideas', 'easy dinner planning', 'vegetarian lunch ideas',
    'travel photography ideas', 'mobile photo editing', 'video editing basics',
    'podcast discovery ideas', 'book club ideas', 'board game recommendations',
    'documentary watchlists', 'anime starter recommendations', 'astronomy discoveries',
    'space exploration updates', 'renewable energy projects', 'climate technology ideas',
    'ocean conservation topics', 'wildlife facts', 'geography learning topics',
    'history study ideas', 'ancient civilization facts', 'philosophy reading ideas',
    'museum architecture topics', 'electric vehicle research', 'fintech trends',
    'ecommerce ideas', 'spreadsheet workflows', 'time management methods',
    'focus improvement habits', 'journaling prompts', 'weekend hobby ideas',
    'DIY room upgrades', 'closet organization tips', 'healthy smoothie ideas',
    'camping trip planning', 'hiking trail research', 'chess improvement strategies',
    'music discovery ideas', 'festival planning tips', 'restaurant research ideas',
    'career growth strategies', 'freelance workflow ideas', 'virtual reality experiences',
    'robotics learning basics', 'biology study topics', 'chemistry revision ideas',
    'physics concept reviews', 'math problem solving', 'earth science facts',
    'renewable home upgrades', 'study break activities', 'daily planning systems',
    'viet nam travel planning', 'da lat cafe guide', 'ha noi food guide',
    'da nang weekend plan', 'sai gon lifestyle tips', 'personal branding ideas',
    'presentation design ideas', 'event planning checklists', 'classroom activity ideas',
    'team building activities', 'career switch planning', 'freelancer pricing ideas',
    'small room organization', 'digital note systems', 'healthy office lunch ideas',
    'exam preparation routines', 'mobile productivity habits', 'email writing templates',
    'workout recovery routines', 'budget meal planning', 'home cleaning routines',
    'pet training basics', 'study motivation ideas', 'museum visit planning',
    'book summary ideas', 'podcast note taking', 'calendar planning habits'
];

const SEARCH_PRODUCT_TOPICS = [
    'budget smartphones', 'wireless earbuds', 'noise cancelling headphones',
    'portable bluetooth speakers', 'laptops for students', 'monitors for coding',
    'keyboards for programmers', 'ergonomic office chairs', 'standing desks',
    'tablet note taking devices', 'smartwatches', 'fitness trackers',
    'portable chargers', 'travel backpacks', 'carry on luggage', 'coffee makers',
    'air fryers', 'robot vacuums', 'smart home hubs', 'wifi routers',
    'webcams for meetings', 'microphones for streaming', 'budget cameras',
    'photo editing apps', 'video editing software', 'vpn services',
    'password managers', 'antivirus software', 'budgeting apps',
    'language learning apps', 'meal planning apps', 'cloud storage plans',
    'e readers', 'running shoes', 'mechanical keyboards', 'desk lamps',
    'camping tents', 'hiking backpacks', 'portable projectors', 'study planners',
    'air purifiers', 'corded vacuum cleaners', 'water bottles', 'meal prep containers',
    'wireless mice', 'usb c hubs', 'portable ssds', 'gaming monitors',
    'office backpacks', 'travel pillows', 'notebooks for students', 'reading lamps',
    'standing desk converters', 'budget tablets', 'android phones', 'iphone accessories',
    'home routers', 'mesh wifi systems', 'action cameras', 'bike helmets'
];

const SEARCH_ACTIONS = [
    'learn Python faster', 'improve English speaking', 'build a morning routine',
    'organize a small bedroom', 'plan a budget trip', 'write clearer emails',
    'reduce screen time', 'start journaling', 'prepare healthy lunches',
    'train for a 5k', 'improve public speaking', 'clean a laptop safely',
    'save money every month', 'set up a home office', 'cook simple dinners',
    'declutter a closet', 'stay focused while studying', 'make iced coffee at home',
    'build a workout habit', 'start a side hustle', 'learn chess openings',
    'practice meditation daily', 'write a stronger resume', 'build a portfolio website',
    'grow herbs indoors', 'take better travel photos', 'plan a weekend project',
    'prepare for coding interviews', 'protect online privacy', 'improve sleep quality',
    'meal prep for the week', 'choose running shoes', 'use spreadsheets better',
    'start a small garden', 'improve posture at work', 'build better money habits',
    'study without procrastination', 'pack light for travel', 'find better study music',
    'improve note taking', 'compare laptop options', 'plan a weekend city break',
    'set realistic fitness goals', 'edit photos on mobile', 'find healthier snacks',
    'write a simple speech', 'organize a school event', 'design a clean slide deck',
    'prepare for a presentation', 'plan a class activity', 'set up a study desk',
    'save battery on a laptop', 'clean up phone storage', 'track personal expenses',
    'build a reading habit', 'plan meals on a budget', 'improve walking stamina',
    'build a better sleep routine', 'learn faster with flashcards', 'practice interview answers',
    'choose a monitor for work', 'pick a travel backpack', 'find cafes for remote work',
    'plan a trip to da lat', 'find places to eat in ha noi', 'organize files on a computer'
];

const SEARCH_DESTINATIONS = [
    'Tokyo', 'Seoul cafes', 'Paris museums', 'Rome history walks',
    'Bangkok street food', 'Singapore attractions', 'Hanoi weekend trip',
    'Da Nang beaches', 'Kyoto temples', 'London city break',
    'Barcelona art spots', 'Prague old town', 'Amsterdam canals',
    'New York city highlights', 'San Francisco viewpoints', 'Bali travel ideas',
    'Chiang Mai cafes', 'Taipei night markets', 'Osaka food spots',
    'Hoi An lantern town', 'Dubai travel route', 'Istanbul cultural sites',
    'Vancouver nature spots', 'Sydney coastal walks', 'Lisbon weekend trip',
    'Melbourne cafes', 'Hong Kong food spots', 'Busan beaches',
    'Da Lat viewpoints', 'Phu Quoc island', 'Nha Trang beaches',
    'Ha Giang loop', 'Sapa rice terraces', 'Hue citadel',
    'Quy Nhon coast', 'Ninh Binh boat trip', 'Can Tho floating market',
    'Vung Tau weekend', 'Phan Thiet food spots', 'Buon Ma Thuot coffee places'
];

const SEARCH_FACT_SUBJECTS = [
    'black holes', 'quantum internet', 'photosynthesis', 'volcanoes', 'solar eclipses',
    'DNA structure', 'coral reefs', 'tsunamis', 'planet orbits', 'vaccines',
    'lightning', 'climate models', 'ancient Rome', 'glaciers', 'deep sea creatures',
    'bird migration', 'ocean currents', 'human memory', 'machine learning models',
    'electric cars', 'satellites', 'earthquakes', 'mushrooms', 'sleep cycles',
    'renewable energy grids', 'blockchain networks', 'inflation', 'coffee chemistry',
    'cat behavior', 'hummingbirds', 'plate tectonics', 'rainforests',
    'typhoons', 'El Nino', 'battery technology', 'wifi signals',
    'ocean plastic', 'urban heat islands', 'volcanic islands', 'human digestion',
    'muscle recovery', 'lunar eclipses', 'meteor showers', 'tidal energy'
];

const SEARCH_ANGLES = [
    'beginner guide', 'simple tips', 'best practices', 'step by step',
    'explained simply', 'checklist', 'ideas and examples', 'common mistakes',
    'quick overview', 'detailed review', 'buying guide', 'setup guide',
    'comparison', 'trends', 'practical advice', 'daily habits',
    'expert recommendations', 'frequently asked questions', 'pros and cons',
    'updated guide', 'easy plan', 'starter checklist', 'real examples',
    'simple workflow', 'best free tools', 'quick wins', 'template ideas'
];

const SEARCH_SCENARIOS = [
    'for beginners', 'for students', 'for work', 'for remote workers',
    'for families', 'on a budget', 'at home', 'for small business',
    'for daily use', 'for travel', 'for busy people', 'for apartment living',
    'without expensive equipment', 'with free tools', 'with simple steps',
    'with low effort', 'for weekend planning', 'for long term use',
    'for school events', 'for office workers', 'for creators', 'for solo travelers',
    'for home study', 'for presentation prep', 'for quick results', 'for first time users'
];

const SEARCH_FORMAT_HINTS = [
    'guide', 'tutorial', 'overview', 'roadmap', 'summary',
    'review', 'checklist', 'planner', 'comparison', 'examples',
    'template', 'workflow', 'tips list', 'starter pack'
];

const SEARCH_LOCATIONS = [
    'in Asia', 'in Europe', 'in Japan', 'in Korea', 'in the United States',
    'in Vietnam', 'worldwide', 'for city living', 'for home offices',
    'for digital nomads', 'for tropical weather', 'for small spaces',
    'in Southeast Asia', 'in big cities', 'near universities', 'for urban apartments'
];

const SEARCH_COMPARISON_TERMS = [
    'comparison', 'vs alternatives', 'top choices', 'best options',
    'review roundup', 'side by side', 'ranked list', 'value for money',
    'pros and cons', 'best under budget'
];

const TRAVEL_ANGLES = [
    'weekend guide', 'food guide', 'hidden gems', 'walking route',
    'budget plan', 'rainy day plan', 'photo spots', '2 day itinerary',
    'must visit places', 'local experience guide', 'cafe guide',
    '1 day plan', 'sunrise spots', 'night market guide'
];

const FACT_ANGLES = [
    'explained simply', 'how it works', 'why it matters',
    'facts for students', 'quick explanation', 'easy overview',
    'simple breakdown', 'beginner summary', 'real world examples'
];

const BASE_QUERY_LIBRARY = [
    ...STATIC_SEARCH_QUERIES,
    ...LOCAL_SEARCH_QUERIES
];

let queue = Promise.resolve();

chrome.runtime.onInstalled.addListener(() => {
    enqueue(() => initializeState()).catch(logUnhandledError);
});

chrome.runtime.onStartup.addListener(() => {
    enqueue(() => recoverRunningSession()).catch(logUnhandledError);
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    enqueue(() => handleMessage(message))
        .then((response) => sendResponse(response))
        .catch(async (error) => {
            await failRun(error).catch(logUnhandledError);
            sendResponse({ ok: false, error: error.message || 'Background worker error.' });
        });

    return true;
});

chrome.alarms.onAlarm.addListener((alarm) => {
    enqueue(() => handleAlarm(alarm)).catch(async (error) => {
        logUnhandledError(error);
        await failRun(error).catch(logUnhandledError);
    });
});

chrome.tabs.onRemoved.addListener((tabId) => {
    enqueue(() => handleTabRemoved(tabId)).catch(logUnhandledError);
});

chrome.windows.onRemoved.addListener((windowId) => {
    enqueue(() => handleWindowRemoved(windowId)).catch(logUnhandledError);
});

function enqueue(task) {
    queue = queue.then(task, task);
    return queue;
}

async function handleMessage(message) {
    switch (message && message.type) {
        case 'START_SEARCH':
            return startSearch(message);
        case 'STOP_SEARCH':
            await stopSearch('Stopped');
            return { ok: true };
        case 'CLEAR_LOG':
            await clearLog();
            return { ok: true };
        case 'GET_STATE':
            return { ok: true, state: await readState() };
        default:
            return { ok: false, error: 'Unknown message type.' };
    }
}

async function handleAlarm(alarm) {
    if (!alarm || !alarm.name) {
        return;
    }

    if (alarm.name === NEXT_SEARCH_ALARM) {
        await performSearchCycle();
        return;
    }

    if (alarm.name === COMPLETE_RUN_ALARM) {
        await stopSearch('Completed');
        return;
    }

    if (alarm.name.startsWith(CLOSE_TAB_ALARM_PREFIX)) {
        const tabId = Number.parseInt(alarm.name.slice(CLOSE_TAB_ALARM_PREFIX.length), 10);
        if (!Number.isNaN(tabId)) {
            await safeRemoveTab(tabId);
            await removeLegacyTabId(tabId);
        }
    }
}

async function handleTabRemoved(tabId) {
    const state = await readState();
    let changed = false;
    const nextState = { ...state };

    if (state.runnerTabId === tabId) {
        nextState.runnerTabId = null;
        nextState.runnerWindowId = null;
        changed = true;
    }

    if (state.openTabIds.includes(tabId)) {
        nextState.openTabIds = state.openTabIds.filter((id) => id !== tabId);
        changed = true;
    }

    if (changed) {
        await saveState(nextState);
    }
}

async function handleWindowRemoved(windowId) {
    const state = await readState();

    if (state.runnerWindowId !== windowId) {
        return;
    }

    await saveState({
        ...state,
        runnerWindowId: null,
        runnerTabId: null
    });
}

async function initializeState() {
    const state = await readState();
    await saveState(state);
    await syncBadge(state);
}

async function recoverRunningSession() {
    const state = await readState();

    if (!state.isRunning) {
        await syncBadge(state);
        return;
    }

    const nextSearch = await chrome.alarms.get(NEXT_SEARCH_ALARM);
    const completion = await chrome.alarms.get(COMPLETE_RUN_ALARM);

    if (state.currentSearch >= state.totalSearches) {
        if (!completion) {
            chrome.alarms.create(COMPLETE_RUN_ALARM, {
                when: Date.now() + 1000
            });
        }
    } else if (!nextSearch) {
        chrome.alarms.create(NEXT_SEARCH_ALARM, {
            when: Date.now() + 1000
        });
    }

    await syncBadge(state);
}

async function startSearch(message) {
    const count = clampInteger(message && message.count, DEFAULT_STATE.searchCount, 1, 100);
    const interval = clampInteger(message && message.interval, DEFAULT_STATE.interval, 3, 60);
    const previousState = await readState();

    await clearRunArtifacts(previousState);

    const state = await saveState({
        ...previousState,
        searchCount: count,
        interval,
        isRunning: true,
        currentSearch: 0,
        totalSearches: count,
        currentQuery: 'Preparing...',
        status: 'Running',
        log: [],
        usedQueries: [],
        queryQueue: buildRunQueries(count),
        openTabIds: [],
        runnerTabId: null,
        runnerWindowId: null,
        startedAt: Date.now(),
        completedAt: null
    });

    await syncBadge(state);

    try {
        await performSearchCycle();
        return { ok: true };
    } catch (error) {
        await failRun(error, state);
        throw error;
    }
}

async function clearLog() {
    const state = await readState();
    await saveState({
        ...state,
        log: []
    });
}

async function performSearchCycle() {
    const state = await readState();

    if (!state.isRunning) {
        return state;
    }

    if (state.currentSearch >= state.totalSearches) {
        chrome.alarms.create(COMPLETE_RUN_ALARM, {
            when: Date.now() + (state.interval * 1000)
        });
        return state;
    }

    const query = state.queryQueue[state.currentSearch] || getFallbackQuery(state.usedQueries);
    const nextSearchNumber = state.currentSearch + 1;
    const searchUrl = createSearchUrl(query);
    const runner = await ensureRunnerWindow(searchUrl, state);

    const nextState = await saveState({
        ...state,
        currentSearch: nextSearchNumber,
        currentQuery: query,
        status: nextSearchNumber >= state.totalSearches ? 'Finalizing' : 'Running',
        log: [createLogEntry(nextSearchNumber, query), ...state.log].slice(0, MAX_LOG_ENTRIES),
        usedQueries: [...state.usedQueries, query].slice(-250),
        openTabIds: [],
        runnerTabId: runner.tabId,
        runnerWindowId: runner.windowId
    });

    if (nextSearchNumber >= nextState.totalSearches) {
        chrome.alarms.create(COMPLETE_RUN_ALARM, {
            when: Date.now() + (nextState.interval * 1000)
        });
    } else {
        chrome.alarms.create(NEXT_SEARCH_ALARM, {
            when: Date.now() + (nextState.interval * 1000)
        });
    }

    await syncBadge(nextState);
    return nextState;
}

async function stopSearch(reason) {
    const state = await readState();

    await clearRunArtifacts(state);

    const nextState = await saveState({
        ...state,
        isRunning: false,
        currentQuery: getTerminalQuery(reason),
        status: reason,
        usedQueries: [],
        queryQueue: [],
        openTabIds: [],
        runnerTabId: null,
        runnerWindowId: null,
        completedAt: reason === 'Completed' ? Date.now() : state.completedAt
    });

    await syncBadge(nextState);
    return nextState;
}

async function failRun(error, stateOverride) {
    const state = stateOverride || await readState();

    await clearRunArtifacts(state);

    const nextState = await saveState({
        ...state,
        isRunning: false,
        currentQuery: 'Error',
        status: 'Error',
        usedQueries: [],
        queryQueue: [],
        openTabIds: [],
        runnerTabId: null,
        runnerWindowId: null
    });

    await syncBadge(nextState);
    logUnhandledError(error);
    return nextState;
}

async function clearRunArtifacts(state) {
    await clearRunAlarms(state);
    await closeRunnerWindow(state);
    await closeLegacyTabs(state.openTabIds);
}

async function clearRunAlarms(state) {
    await chrome.alarms.clear(NEXT_SEARCH_ALARM);
    await chrome.alarms.clear(COMPLETE_RUN_ALARM);

    const closeAlarmNames = Array.isArray(state.openTabIds)
        ? state.openTabIds.map((tabId) => `${CLOSE_TAB_ALARM_PREFIX}${tabId}`)
        : [];

    await Promise.all(closeAlarmNames.map((alarmName) => chrome.alarms.clear(alarmName)));
}

async function closeRunnerWindow(state) {
    if (Number.isInteger(state.runnerWindowId)) {
        try {
            await chrome.windows.remove(state.runnerWindowId);
        } catch (error) {
            if (!isMissingWindowError(error)) {
                throw error;
            }
        }
    }

    if (Number.isInteger(state.runnerTabId)) {
        await safeRemoveTab(state.runnerTabId);
    }
}

async function closeLegacyTabs(tabIds) {
    if (!Array.isArray(tabIds) || tabIds.length === 0) {
        return;
    }

    await Promise.all(tabIds.map((tabId) => safeRemoveTab(tabId)));
}

async function ensureRunnerWindow(searchUrl, state) {
    if (Number.isInteger(state.runnerTabId)) {
        try {
            const existingTab = await chrome.tabs.get(state.runnerTabId);
            const updatedTab = await chrome.tabs.update(existingTab.id, { url: searchUrl });

            return {
                tabId: updatedTab.id,
                windowId: updatedTab.windowId || existingTab.windowId || state.runnerWindowId
            };
        } catch (error) {
            if (!isMissingTabError(error)) {
                throw error;
            }
        }
    }

    const popupWindow = await chrome.windows.create({
        url: searchUrl,
        type: 'popup',
        focused: true,
        width: RUNNER_WINDOW_WIDTH,
        height: RUNNER_WINDOW_HEIGHT
    });

    const tabId = await resolveWindowTabId(popupWindow);

    return {
        tabId,
        windowId: Number.isInteger(popupWindow.id) ? popupWindow.id : null
    };
}

async function resolveWindowTabId(popupWindow) {
    if (popupWindow && Array.isArray(popupWindow.tabs) && popupWindow.tabs[0] && Number.isInteger(popupWindow.tabs[0].id)) {
        return popupWindow.tabs[0].id;
    }

    if (popupWindow && Number.isInteger(popupWindow.id)) {
        const tabs = await chrome.tabs.query({ windowId: popupWindow.id });
        if (tabs[0] && Number.isInteger(tabs[0].id)) {
            return tabs[0].id;
        }
    }

    throw new Error('Could not create the Bing runner window.');
}

async function removeLegacyTabId(tabId) {
    const state = await readState();

    if (!state.openTabIds.includes(tabId)) {
        return;
    }

    await saveState({
        ...state,
        openTabIds: state.openTabIds.filter((id) => id !== tabId)
    });
}

async function readState() {
    const stored = await chrome.storage.local.get(STORAGE_KEY);
    return normalizeState(stored[STORAGE_KEY]);
}

async function saveState(state) {
    const normalized = normalizeState(state);
    await chrome.storage.local.set({ [STORAGE_KEY]: normalized });
    return normalized;
}

function normalizeState(state) {
    const nextState = state || {};
    const totalSearches = clampInteger(nextState.totalSearches, DEFAULT_STATE.totalSearches, 0, 100);
    const currentSearch = clampInteger(nextState.currentSearch, DEFAULT_STATE.currentSearch, 0, Math.max(totalSearches, 100));

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
                .slice(0, MAX_LOG_ENTRIES)
                .map((entry, index) => ({
                    id: entry.id || `log-${index}`,
                    number: clampInteger(entry.number, index + 1, 1, 999),
                    query: entry.query,
                    time: typeof entry.time === 'string' ? entry.time : '--:--:--'
                }))
            : [],
        usedQueries: Array.isArray(nextState.usedQueries)
            ? nextState.usedQueries.filter((query) => typeof query === 'string').slice(-250)
            : [],
        queryQueue: Array.isArray(nextState.queryQueue)
            ? nextState.queryQueue.filter((query) => typeof query === 'string').slice(0, 150)
            : [],
        openTabIds: Array.isArray(nextState.openTabIds)
            ? nextState.openTabIds
                .map((tabId) => Number.parseInt(tabId, 10))
                .filter((tabId) => Number.isInteger(tabId))
            : [],
        runnerTabId: Number.isInteger(nextState.runnerTabId) ? nextState.runnerTabId : null,
        runnerWindowId: Number.isInteger(nextState.runnerWindowId) ? nextState.runnerWindowId : null,
        startedAt: typeof nextState.startedAt === 'number' ? nextState.startedAt : null,
        completedAt: typeof nextState.completedAt === 'number' ? nextState.completedAt : null
    };
}

function buildRunQueries(count) {
    const targetPoolSize = Math.max(count * 10, 1000);
    const pooledQueries = uniqueQueries([
        ...BASE_QUERY_LIBRARY,
        ...buildGeneratedQueryPool(targetPoolSize)
    ]);
    const shuffled = shuffleArray(pooledQueries);

    if (shuffled.length >= count) {
        return shuffled.slice(0, count);
    }

    const queries = shuffled.slice();
    while (queries.length < count) {
        queries.push(getFallbackQuery(queries));
    }

    return queries;
}

function getFallbackQuery(existingQueries) {
    const existing = new Set(
        Array.isArray(existingQueries)
            ? existingQueries.map((query) => normalizeQueryValue(query)).filter(Boolean)
            : []
    );
    const context = createQueryContext();
    let attempts = 0;

    while (attempts < 400) {
        const query = buildDynamicQuery(context);
        const normalized = normalizeQueryValue(query);

        if (normalized && !existing.has(normalized)) {
            return query;
        }

        attempts += 1;
    }

    return `bing search topic ${Date.now()}`;
}

function buildGeneratedQueryPool(targetSize) {
    const context = createQueryContext();
    const queries = [];
    const seen = new Set();
    let attempts = 0;
    const maxAttempts = targetSize * 40;

    while (queries.length < targetSize && attempts < maxAttempts) {
        const query = buildDynamicQuery(context);
        const normalized = normalizeQueryValue(query);

        if (normalized && !seen.has(normalized)) {
            seen.add(normalized);
            queries.push(query);
        }

        attempts += 1;
    }

    return queries;
}

function buildDynamicQuery(context) {
    const builder = pickRandom(QUERY_BUILDERS);
    return builder(context);
}

function createQueryContext() {
    const year = new Date().getFullYear();

    return {
        yearHints: [
            `${year}`,
            `updated ${year}`,
            `${year} guide`,
            `${year} trends`,
            `${year} checklist`,
            'latest',
            'this year'
        ]
    };
}

const QUERY_BUILDERS = [
    () => joinQuery(pickRandom(SEARCH_SUBJECTS), pickRandom(SEARCH_ANGLES)),
    () => joinQuery(pickRandom(SEARCH_SUBJECTS), pickRandom(SEARCH_SCENARIOS)),
    () => joinQuery(pickRandom(SEARCH_SUBJECTS), pickRandom(SEARCH_ANGLES), pickRandom(SEARCH_SCENARIOS)),
    (context) => joinQuery(pickRandom(SEARCH_SUBJECTS), pickRandom(context.yearHints)),
    (context) => joinQuery(pickRandom(SEARCH_SUBJECTS), pickRandom(SEARCH_LOCATIONS), pickRandom(context.yearHints)),
    (context) => joinQuery('best', pickRandom(SEARCH_PRODUCT_TOPICS), pickRandom(SEARCH_SCENARIOS), pickRandom(context.yearHints)),
    () => joinQuery(pickRandom(SEARCH_PRODUCT_TOPICS), pickRandom(SEARCH_COMPARISON_TERMS)),
    (context) => joinQuery(pickRandom(SEARCH_PRODUCT_TOPICS), pickRandom(SEARCH_FORMAT_HINTS), pickRandom(context.yearHints)),
    () => joinQuery('how to', pickRandom(SEARCH_ACTIONS)),
    () => joinQuery('how to', pickRandom(SEARCH_ACTIONS), pickRandom(SEARCH_SCENARIOS)),
    (context) => joinQuery(pickRandom(SEARCH_DESTINATIONS), pickRandom(TRAVEL_ANGLES), pickRandom(context.yearHints)),
    () => joinQuery(pickRandom(SEARCH_DESTINATIONS), pickRandom(TRAVEL_ANGLES)),
    (context) => joinQuery(pickRandom(SEARCH_FACT_SUBJECTS), pickRandom(FACT_ANGLES), pickRandom(context.yearHints)),
    () => joinQuery(pickRandom(SEARCH_SUBJECTS), pickRandom(SEARCH_FORMAT_HINTS), pickRandom(SEARCH_LOCATIONS)),
    () => joinQuery(pickRandom(BASE_QUERY_LIBRARY), pickRandom(['guide', 'review', 'tips', 'explained', 'checklist'])),
    () => joinQuery(pickRandom(LOCAL_SEARCH_QUERIES), pickRandom(['tips', 'huong dan', 'kinh nghiem', 'tong hop', 'mau tham khao'])),
    () => joinQuery(pickRandom(SEARCH_ACTIONS), pickRandom(['checklist', 'template', 'simple guide'])),
    () => joinQuery(pickRandom(SEARCH_PRODUCT_TOPICS), pickRandom(['for students', 'for office', 'budget pick', 'best value']))
];

function uniqueQueries(queries) {
    const unique = new Map();

    queries.forEach((query) => {
        const normalized = normalizeQueryValue(query);

        if (normalized && !unique.has(normalized)) {
            unique.set(normalized, query.trim());
        }
    });

    return Array.from(unique.values());
}

function joinQuery(...parts) {
    const compacted = parts
        .filter((part) => typeof part === 'string' && part.trim())
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()
        .split(' ')
        .filter((token, index, tokens) => index === 0 || token.toLowerCase() !== tokens[index - 1].toLowerCase());

    return compacted.join(' ');
}

function normalizeQueryValue(query) {
    return joinQuery(query).toLowerCase();
}

function createSearchUrl(query) {
    return `https://www.bing.com/search?q=${encodeURIComponent(query)}&form=QBLH`;
}

function createLogEntry(number, query) {
    return {
        id: `${Date.now()}-${number}-${Math.random().toString(36).slice(2, 8)}`,
        number,
        query,
        time: new Intl.DateTimeFormat('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }).format(new Date())
    };
}

function shuffleArray(items) {
    for (let index = items.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        const current = items[index];
        items[index] = items[swapIndex];
        items[swapIndex] = current;
    }

    return items;
}

function pickRandom(items) {
    return items[Math.floor(Math.random() * items.length)];
}

function getTerminalQuery(reason) {
    if (reason === 'Completed') {
        return 'Completed!';
    }

    if (reason === 'Error') {
        return 'Error';
    }

    return 'Stopped';
}

function clampInteger(value, fallback, min, max) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) {
        return fallback;
    }

    return Math.min(max, Math.max(min, parsed));
}

function isMissingTabError(error) {
    const message = error && error.message ? error.message : '';
    return message.includes('No tab with id') || message.includes('Tabs cannot be edited right now');
}

function isMissingWindowError(error) {
    const message = error && error.message ? error.message : '';
    return message.includes('No window with id');
}

async function safeRemoveTab(tabId) {
    if (!Number.isInteger(tabId)) {
        return;
    }

    try {
        await chrome.tabs.remove(tabId);
    } catch (error) {
        if (!isMissingTabError(error)) {
            throw error;
        }
    }
}

async function syncBadge(state) {
    if (state.isRunning) {
        await chrome.action.setBadgeBackgroundColor({ color: '#0066ff' });
        await chrome.action.setBadgeText({ text: 'RUN' });
        return;
    }

    if (state.totalSearches > 0 && state.currentSearch >= state.totalSearches && state.status === 'Completed') {
        await chrome.action.setBadgeBackgroundColor({ color: '#00aa66' });
        await chrome.action.setBadgeText({ text: 'OK' });
        return;
    }

    await chrome.action.setBadgeText({ text: '' });
}

function logUnhandledError(error) {
    console.error('[bing-auto]', error);
}
