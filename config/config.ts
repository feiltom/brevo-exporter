import * as dotenv from 'dotenv';

dotenv.config();

export default {
    appPort: process.env.PORT || 3000,
    brevoApiKey: process.env.BREVO_API_KEY
};
