export function checkCooldown(client, userId, commandName, cooldownSeconds = 3) {
  if (!client.cooldowns.has(commandName)) {
    client.cooldowns.set(commandName, new Map());
  }

  const now = Date.now();
  const timestamps = client.cooldowns.get(commandName);
  const cooldownAmount = cooldownSeconds * 1000;

  if (timestamps.has(userId)) {
    const expirationTime = timestamps.get(userId) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return { onCooldown: true, timeLeft: timeLeft.toFixed(1) };
    }
  }

  timestamps.set(userId, now);
  setTimeout(() => timestamps.delete(userId), cooldownAmount);

  return { onCooldown: false };
}

