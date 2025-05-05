import { app } from "./app";
import db from "./infrastructure/database/prisma";

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        // Connect to the database
        await db.$connect();
        console.log('Connected to database');

        // Start the Express server
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        await db.$disconnect();
        process.exit(1);
    }
}

// Handle server shutdown
process.on('SIGINT', async () => {
    await db.$disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await db.$disconnect();
    process.exit(0);
});

startServer();