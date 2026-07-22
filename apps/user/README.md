
  # Design polished user flow (Community)

  This is a code bundle for Design polished user flow (Community). The original project is available at https://www.figma.com/design/c65nWVXjiObGVVjhS3CsLz/Design-polished-user-flow--Community-.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the frontend development server.

  ## Backend scaffold

  A separate backend scaffold has been added under the `server/` folder. It contains an Express + TypeScript foundation with a health endpoint, logging, error handling, Swagger docs, and Drizzle ORM database configuration.

  A database schema scaffold is available under `database/schema/`.

  Run `cd server && npm install` to install backend dependencies.

  Run `cd server && npm run dev` to start the backend server locally.

  The backend scaffold now includes sample category and product APIs using repository-service-controller architecture, central error handling, and Swagger documentation at `/docs`.

  