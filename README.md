# Event Photos App

Simple app for uploading and managing event photos. Built with React + .NET.

## What it does

- Upload photos (drag & drop supported)
- View photos in a grid
- Admin panel to manage stuff
- Mobile friendly

## Stack

- Frontend: React + TypeScript + Vite + TailwindCSS
- Backend: .NET 9 API + Postgres

## Running locally

You'll need:

- Node
- .NET 9 SDK
- Postgres

Frontend:

```bash
cd frontend
npm i && npm run dev
```

Backend:

```bash
cd backend/EventPhotos.API
dotnet run
```

Or just use Docker:

```bash
docker-compose up
```

## API Docs

Check out the Swagger docs at `http://localhost:[port]/swagger` when running the backend

## License

MIT
