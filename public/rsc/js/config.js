const CONFIG = {
    API: {
        BASE_URL: "http://sslsirlic.test/api/v1",
        ENDPOINTS: {
            PROVINCE_COUNT: "/province_count",
            MUNICIPALITY_COUNT: "/municipality_count",
            BARANGAY_COUNT: "/barangay_count",
            READINGS: "/readings",
        },
    },
    MAP: {
        ZOOM_LEVELS: {
            CITY: 10.13,
            MUNICIPALITY: 14,
        },
    },
    PROVINCES: {
        CODES: {
            "Surigao Del Sur": "SDS",
            "Agusan Del Norte": "ADN",
            "Agusan Del Sur": "ADS",
            "Dinagat Islands": "DIN",
            "Surigao Del Norte": "SDN",
        },
    },
};

Object.freeze(CONFIG);

console.log(`
    _________ _________.____       _________._____________.____    .____________   _________
   /   _____//   _____/|    |     /   _____/|   \\\______   \\\    |   |   \\_   ___ \\ /   _____/
   \\_____  \\ \\_____  \\ |    |     \\_____  \\ |   ||       _/    |   |   /    \\  \\/ \\_____  \\
   /        \\/        \\|    |___  /        \\|   ||    |   \\    |___|   \\     \\____/        \\
  /_______  /_______  /|_______ \\/_______  /|___||____|_  /_______ \\___|\\_______  /_______  /
          \\/        \\/         \\/        \\/             \\/        \\/           \\/        \\/
                                                                                                :D
  `);
