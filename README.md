# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/dffe5ac5-930b-4427-9d4f-27e413dd9716

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/dffe5ac5-930b-4427-9d4f-27e413dd9716) and start prompting.

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

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

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

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/dffe5ac5-930b-4427-9d4f-27e413dd9716) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Deploying to Cloudflare Pages

You can easily deploy this project to [Cloudflare Pages](https://pages.cloudflare.com/). Follow these steps:

1. **Push your code to GitHub**
   - Make sure your latest code is committed and pushed to a GitHub repository.

2. **Sign in to Cloudflare**
   - Go to [Cloudflare Pages](https://pages.cloudflare.com/) and log in with your Cloudflare account.

3. **Create a new Pages project**
   - Click **Create a Project** and connect your GitHub account if you haven't already.
   - Select your repository for this project.

4. **Configure build settings**
   - **Framework preset:** Select `Vite` (or `None` if not available).
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Environment variables:** (optional, if you use any)

5. **Deploy**
   - Click **Save and Deploy**. Cloudflare will build and deploy your site.
   - After deployment, you’ll get a public URL for your app.

6. **(Optional) Set up a custom domain**
   - In your Cloudflare Pages dashboard, go to your project settings and add a custom domain if desired.

**References:**
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
