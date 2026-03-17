# H000007 Movie

HTML/browser preview of the Movie Watching task built with `psyflow-web`.
The trial procedure and timing are aligned to local `T000007-movie`, including pre-movie fixation, lead-in, and movie playback stages.

## Layout

- `main.ts`: task orchestration
- `config/config.yaml`: declarative config
- `src/run_trial.ts`: trial logic
- `src/utils.ts`: deterministic condition generator

## Run

From `e:\xhmhc\TaskBeacon\psyflow-web`:

```powershell
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:4173/?task=H000007-movie
```
