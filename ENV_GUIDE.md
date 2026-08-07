# Environment Variables Guide

This guide explains what each environment variable does and what to replace it with when you deploy your application or when you want to use real information.

## Backend \`.env\` File (\`/Backend/.env\`)
This file is used by your Node.js/Express backend server.

- **\`PORT\`**: The port number your backend server runs on.
  - *Default:* \`3000\`
  - *Replacement:* In production, your hosting provider (like Heroku or Render) usually sets this automatically. Locally, you can change it if 3000 is taken.
- **\`DATABASE_URL\`**: The connection string or path to your database.
  - *Default:* \`./mandm.sqlite\` (used for local development)
  - *Replacement:* When you switch to a production database (like PostgreSQL or MySQL), replace this with the real database connection string provided by your host.
- **\`JWT_SECRET\`**: A secret key used to sign JSON Web Tokens (if you add authentication).
  - *Default:* \`your_jwt_secret_here\`
  - *Replacement:* Generate a long, random, secure string (e.g., using \`openssl rand -hex 32\`) and use it here. Never share this!

## Frontend \`.env\` File (\`/Frontend/.env\`)
This file is used by your Vite React application. Note that in Vite, only variables prefixed with \`VITE_\` are exposed to your frontend code.

- **\`VITE_API_BASE_URL\`**: The base URL where your frontend will make API requests to your backend.
  - *Default:* \`http://localhost:3000/api\`
  - *Replacement:* When you deploy your backend to the internet, replace this with your real backend URL (e.g., \`https://api.yourdomain.com/api\`).

## Security Note
The \`.env\` files contain sensitive information (like passwords and API keys). Because we have added \`.env\` to your \`.gitignore\` file, git will **not** track these files, and they will **never** be pushed to GitHub or any public repository. 

Whenever you clone this repository to a new computer, you will need to manually create these \`.env\` files and fill in the information using this guide.
