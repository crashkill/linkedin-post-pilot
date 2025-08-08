# LinkedIn Post Pilot 🚀

Uma aplicação completa para automação e gerenciamento de posts no LinkedIn com IA integrada.

## Project info

**URL**: https://lovable.dev/projects/6919a1e3-5caf-4cf0-9df4-f836b7e134ac

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/6919a1e3-5caf-4cf0-9df4-f836b7e134ac) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Configure Doppler for secrets management
doppler login
doppler setup
# Select: linkedin-post-pilot
# Environment: dev

# Step 5: Configure secrets in Doppler
npm run setup:doppler

# Step 6: Start the development server with Doppler
npm run dev
```

## 🔐 Secrets Management

This project uses **Doppler** for secure secrets management. All sensitive variables have been migrated from `.env` to Doppler.

### Quick Setup
```bash
# Install Doppler CLI
choco install doppler  # Windows
# or
brew install doppler   # macOS

# Configure project
doppler login
doppler setup

# Setup all secrets automatically
npm run setup:doppler

# Verify migration
node verify-doppler-migration.cjs
```

### Available Scripts
- `npm run dev` - Development with Doppler (recommended)
- `npm run dev:local` - Development without Doppler (only public vars)
- `npm run setup:doppler` - Configure all secrets in Doppler
- `npm run test:doppler` - Test Doppler configuration

### Migration Guide
See [DOPPLER_MIGRATION_GUIDE.md](./DOPPLER_MIGRATION_GUIDE.md) for complete migration instructions.

- See `DOPPLER_SETUP.md` for detailed configuration instructions
- All API keys and sensitive data are managed through Doppler
- Use `npm run dev:doppler` to run with proper environment variables

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

### Frontend
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **React** - UI framework
- **shadcn-ui** - Component library
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **React Query** - Data fetching
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Backend
- **Supabase** - Database, Auth, Storage
- **Supabase Edge Functions** - Serverless functions
- **PostgreSQL** - Database
- **Row Level Security (RLS)** - Data security

### AI & APIs
- **Groq** - Fast AI text generation
- **Google Gemini** - Advanced AI capabilities
- **Hugging Face** - Image generation
- **LinkedIn API** - Social media integration

### DevOps & Security
- **Doppler** - Secrets management
- **Vercel** - Deployment platform
- **GitHub Actions** - CI/CD
- **ESLint** - Code linting

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/6919a1e3-5caf-4cf0-9df4-f836b7e134ac) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
