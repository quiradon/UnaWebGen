fetch("https://una-api.arkanus.app/info")
  .then(response => response.json())
  .then(data => {
    document.getElementById("version").innerHTML = data.version;
    const c = document.getElementById("userAmount"),
          d = document.getElementById("serverAmount"),
          e = document.getElementById("commandAmount");
    let bUsers = 0, bGuilds = 0, bCommands = 0;
    const gUsers = data.users / 100,
          gGuilds = data.guilds / 100,
          gCommands = data.commands / 100;
    const updateField = (current, increment, max, element) => {
      current += increment;
      if (current >= max) {
        element.innerHTML = max;
        return max;
      } else {
        element.innerHTML = Math.round(current);
        return current;
      }
    };
    const update = () => {
      bUsers = updateField(bUsers, gUsers, data.users, c);
      bGuilds = updateField(bGuilds, gGuilds, data.guilds, d);
      bCommands = updateField(bCommands, gCommands, data.commands, e);
      if (bUsers >= data.users && bGuilds >= data.guilds && bCommands >= data.commands) {
        clearInterval(intervalId);
      }
    };

    const intervalId = setInterval(update, 50);
  })
  .catch(error => console.error('Erro ao buscar dados:', error));