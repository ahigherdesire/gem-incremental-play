# Gem Incremental

A browser incremental game about rolling for gems, building a
collection and crafting equipment that improves the next roll.

Every action that changes the save is decided by a Supabase Edge
Function, so the client never grants itself money, gems or
equipment. The pages here are a static front end over that API —
there is no build step.

## Playing

- **Roll** — pull one gem from the deposit. Each roll has a
  server-enforced cooldown. `R` or `Space` rolls too.
- **Inventory** — lock the gems you want to keep, sell the rest,
  and buy storage upgrades.
- **Crafting** — spend gems and money on pickaxes, lanterns,
  boots and bags. Auto Craft deposits matching gems the moment
  they are rolled.
- **Gem Index** — a record of every gem, revealed as you find it.
- **Stats** — your bonuses and lifetime records.
- **Settings** — theme, accent colour and automation.

### Automation

Auto roll and auto sell live in Settings, and on the Roll page
itself. Both are device preferences, not server state: the
server still authorises every individual roll and sale.

- **Auto roll** keeps rolling while the Roll page is open. It
  stops on its own if the inventory fills up or several rolls
  fail in a row.
- **Auto sell** sells freshly rolled gems up to the tier you
  choose. Anything rarer is kept, and locked gems are never
  touched.

### Accounts

Players start as an anonymous guest so the game is playable
immediately. Signing in with Google *links* that identity to the
existing guest account, so the save carries over rather than
starting again.

## Layout

```
index.html          Roll page
inventory/          Collection and storage upgrades
crafting/           Recipes, deposits and Auto Craft
gem-index/          Gem encyclopaedia
debug/              Stats page
settings/           Appearance, automation, account
src/data/           Gem and recipe tables (shared with the server)
src/logic/          Pure game rules, unit tested under tests/
src/backend/        Supabase client, auth and cloud reads
src/ui/             Shell, theme, toasts, dialogs, formatting
src/styles/app.css  Design tokens and shared components
tests/              Node test scripts and one-off migration pages
```

## Running locally

Any static file server works, as long as it serves the directory
root — the pages use relative paths and ES modules, which will
not load over `file://`.

```bash
python -m http.server 8423
```

Then open <http://localhost:8423>.

## Supabase setup

The client is pointed at a project via the publishable key in
`src/backend/supabase.js`. Two things must be configured in the
Supabase dashboard for a deployment to work end to end.

### 1. Create a `players` row for every new user

The Edge Functions reject requests with `Player record not
found.` unless `public.players` has a row for the signed-in
user. The client creates one on first load as a fallback, but
the reliable fix is a trigger:

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.players (id)
  values (new.id)
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

### 2. Google sign-in

- Enable the **Google** provider under *Authentication →
  Providers*, with a Google OAuth client ID and secret.
- Enable **Manual linking** under *Authentication → Settings*.
  Without it a guest cannot attach Google to an existing save,
  and the game falls back to offering a separate account.
- Add the deployed origin to the **Redirect URLs** allow list,
  including the sub-pages players can sign in from:

  ```
  https://<your-domain>/**
  http://localhost:8423/**
  ```

## Tests

The pure game logic has Node test scripts:

```bash
node tests/rolling-test.js
node tests/weight-test.js
node tests/inventory-test.js
node tests/roll-result-test.js
```

The `tests/*.html` files are one-off migration and diagnostic
tools, not part of the game.
