# Contributing to Nonflex

Thanks for taking the time to contribute!

## Coding Standards
- Use two spaces for indentation and keep lines under 100 characters.
- Prefer `const`/`let` over `var`.
- Include semicolons and follow existing code style.
- Run any available linters or formatters before committing.

## Local Development Setup
1. **Install dependencies**
   ```bash
   npm install
   cd client && npm install
   ```
2. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Fill in the required values noted in the README.
3. **Optional: seed the database**
   ```bash
   npm run seed
   ```
4. **Start the services**
   - Backend: `node server/app.js`
   - Frontend: `cd client && npm run dev`

## Pull Request Process
- Fork the repository and create your branch from `main`.
- Keep commits focused and include clear messages.
- Run `npm test` before submitting your PR.
- Open a pull request describing your changes and any testing performed.

We appreciate your contributions!
