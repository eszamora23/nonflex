# Nonflex Architecture

This repository begins with a lightweight directory structure for the project:

```
infra/
server/
  routes/
  services/
  models/
  lib/
client/
  src/
    pages/
    components/
website/
postman/
```

- **infra/** – infrastructure and deployment-related files.
- **server/** – backend application code, organised into routes, services, models and library helpers.
- **client/** – frontend source code under `src/`, separated into reusable components and page-level views.
- **website/** – assets for the public-facing website or documentation.
- **postman/** – collections and environments for API testing.

This README will expand as the project evolves.

## Development

To run the project locally:

1. **Seed the database**

   ```bash
   npm run seed
   ```

2. **Start the backend server**

   ```bash
   npm run dev:server
   ```

3. **Start the frontend**

   ```bash
   npm run dev:client
   ```

4. **Expose the server for Twilio webhooks**

   ```bash
   npm run tunnel
   ```

   Use the generated HTTPS URL as the webhook URL in Twilio.
