import { join } from 'path';
import { readdirSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function loadEvents(client, baseDir) {
  const eventsDir = join(baseDir, 'events');
  const files = readdirSync(eventsDir).filter(f => f.endsWith('.js'));

  for (const file of files) {
    try {
      const event = await import(`file://${join(eventsDir, file)}`);
      const eventData = event.default;

      if (eventData.once) {
        client.once(eventData.name, (...args) => eventData.execute(client, ...args));
      } else {
        client.on(eventData.name, (...args) => eventData.execute(client, ...args));
      }

      console.log(`✅ Loaded event: ${eventData.name}`);
    } catch (err) {
      console.error(`❌ Error loading event ${file}:`, err);
    }
  }
}

