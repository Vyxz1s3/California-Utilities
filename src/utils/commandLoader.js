import { join } from 'path';
import { readdirSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function loadCommands(client, baseDir) {
  const commandsDir = join(baseDir, 'commands');
  const categories = readdirSync(commandsDir);

  for (const category of categories) {
    const categoryPath = join(commandsDir, category);
    const files = readdirSync(categoryPath).filter(f => f.endsWith('.js'));

    for (const file of files) {
      try {
        const command = await import(`file://${join(categoryPath, file)}`);
        const commandData = command.default;

        if (commandData.data) {
          // Slash command
          client.slashCommands.set(commandData.data.name, commandData);
          client.commands.set(commandData.data.name, commandData);
        }

        if (commandData.name) {
          // Prefix command
          client.prefixCommands.set(commandData.name, commandData);
          client.commands.set(commandData.name, commandData);
        }

        console.log(`✅ Loaded command: ${commandData.data?.name || commandData.name} (${category})`);
      } catch (err) {
        console.error(`❌ Error loading command ${file}:`, err);
      }
    }
  }

  console.log(`📦 Total commands loaded: ${client.commands.size}`);
}

