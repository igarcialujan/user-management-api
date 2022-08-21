import dotenv from 'dotenv';
const dotenvResult = dotenv.config();
if (dotenvResult.error) {
    throw dotenvResult.error;
}

export const env = {
	NODE_ENV: process.env.NODE_ENV || 'development',
	PORT: process.env.PORT || 8000,
	JWT_SECRET: process.env.JWT_SECRET,
	DOMAIN: process.env.DOMAIN,
	MONGO_URI: process.env.MONGO_URI,
	SMTP: {
		auth: {
			pass: process.env.SMTP_PASSWORD || '',
			user: process.env.SMTP_USERNAME || ''
		},
		host: process.env.SMTP_HOST || '',
		port: process.env.SMTP_PORT || '',
		tls: {
			rejectUnauthorized: false
		}
	}
};

export const mails = {
	support: 'support@my-company.com'
};