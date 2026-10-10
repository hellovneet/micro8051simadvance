<div align="center">

# Micro8051SiM

### A hands-on 8051 assembly simulator and virtual electronics lab

Write assembly, inspect the CPU, explore memory, and experiment with virtual peripherals—all from your browser.

[Getting Started](#-getting-started) · [Features](#-what-you-can-explore) · [Deploy with GitHub](#-deploy-with-github-pages) · [Troubleshooting](#-troubleshooting)

</div>

---

## About the project

Micro8051SiM is a learning-focused workbench for exploring the Intel 8051 microcontroller. It brings assembly coding, execution, debugging, and virtual hardware into a single interface, so you can follow what your program is doing instead of treating the microcontroller as a black box.

It is intended for students, educators, and anyone who wants to practise 8051 programming without needing a physical development board for every experiment.

## What you can explore

- **Assembly workflow** — write and assemble 8051 code in the editor.
- **CPU and registers** — follow register and processor state as a program runs.
- **Memory inspection** — examine internal memory and related state while debugging.
- **Execution controls** — run code and step through instructions to understand program flow.
- **Instruction reference** — look up instruction details while learning assembly.
- **Virtual hardware bench** — experiment with simulated peripherals and visual outputs, including LEDs, switches, serial communication, LCD/7-segment displays, and other available components.
- **Learning views and examples** — use the built-in examples and guided interface to get started.

> Available controls and peripherals may vary by view. Explore the app to see the features included in this version.

## Getting started

### Requirements

- Node.js **22 or newer** (Node.js 22 LTS is recommended)
- npm, included with Node.js
- Git, if you plan to clone the repository

### 1. Get the source

Clone your repository, then move into the project directory:

```bash
git clone https://github.com/<your-username>/<your-repository>.git
cd <your-repository>
```

Alternatively, download the repository ZIP from GitHub and extract it.

### 2. Install dependencies

```bash
npm install --legacy-peer-deps
```

The compatibility flag helps npm resolve the dependency tree used by this project. If the project later adds a committed lockfile, prefer `npm ci` with a lockfile generated and tested for the repository.

### 3. Start the development server

```bash
npm run dev
```

Open the local URL printed by Vite in your terminal (the project currently uses port `3000`). Changes to source files will be reflected during development.

### 4. Create a production build

```bash
npm run build
```

Vite writes the production-ready static site to `dist/`. To preview that build locally, run:

```bash
npm run preview
```

## Deploy with GitHub Pages

This repository includes a GitHub Actions workflow at `.github/workflows/deploy.yml`. After it is pushed to GitHub, the workflow installs dependencies, builds the site, and publishes `dist/` to GitHub Pages whenever you push to `main` or `master`. You can also start a deployment manually from the **Actions** tab.

### One-time GitHub setup

1. Push the project to a GitHub repository.
2. Open **Settings → Pages** in that repository.
3. Under **Build and deployment → Source**, select **GitHub Actions**.
4. Open **Actions** and make sure workflows are enabled for the repository.
5. Push a commit to `main` (or `master`), or run **Deploy to GitHub Pages** manually from the Actions tab.
6. When the workflow completes successfully, open the Pages URL shown in the deployment/job summary.

No personal access token is needed for the standard workflow: GitHub's built-in `GITHUB_TOKEN` is used with the permissions declared in the workflow.

### Important note about AI/API secrets

Never commit API keys to Git. A static GitHub Pages site cannot safely keep a secret API key private if browser-side code needs to use it. If you enable an AI feature that requires a private Gemini key, route requests through a trusted backend/serverless function and keep the key in that server's environment variables. Do not put a private key in frontend source or in a public repository secret that gets bundled into client-side code.

## Project scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local Vite development server on port 3000 |
| `npm run build` | Compile the application for production into `dist/` |
| `npm run preview` | Serve the production build locally for a quick check |
| `npm run lint` | Run TypeScript checking with `tsc --noEmit` |

## Repository layout

```text
.
├── .github/workflows/deploy.yml  # Automated GitHub Pages deployment
├── src/
│   ├── components/               # Editor, debugger, views, and virtual bench UI
│   ├── core/                     # CPU, assembler, instruction set, and tests
│   ├── peripherals/              # Peripheral and pin simulation logic
│   ├── simulator/                # Execution control
│   ├── examples/                 # Example assembly programs
│   ├── App.tsx                   # Main application
│   └── main.tsx                  # Frontend entry point
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Troubleshooting

**Dependency installation reports a peer-dependency conflict**

Try the install command documented above:

```bash
npm install --legacy-peer-deps
```

**The Pages deployment does not start**

Check that the repository's Pages source is set to **GitHub Actions**, workflows are enabled, and the latest run under **Actions** has permission to deploy Pages.

**The build succeeds but the published site is missing assets**

Check the workflow log and the Vite `base` setting. This project currently uses a relative base path (`./`) to support static hosting paths.

**An AI-powered feature cannot access its API**

Check the feature's configuration and use a backend for private API credentials. A `.env` file on your computer is not automatically available to a GitHub Pages deployment.

## Contributing

Issues and improvements are welcome. Before submitting a change, please run the production build locally and describe what you tested. For feature proposals, include the learning problem being addressed and a short example of the expected behaviour.

## License and credits

Please check the repository for a license before redistributing or reusing this project. Unless a license is added, all rights remain with the respective copyright holders.

---

<div align="center">

Built for learning, experimenting, and making 8051 concepts easier to understand.

**© 2026 Vineet Sharma and Chaman Vashishth**

</div>
