const commands = [
    {
        "name" : {
            "en" : "d",
            "pt-BR" : "d"
        },
        "tag" : "rpg",
        "description" : {
            "pt-BR" : "Sistema de rolagem de dados de RPG de mesa, definitivamente um dos comandos mais complexos do bot, porém o mais util para sua mesa de RPG.",
            "en" : "Tabletop RPG dice rolling system, definitely one of the most complex commands of the bot, but the most useful for your RPG table."
        },
        "params" : [
            {
                "name" : {
                    "en" : "dice",
                    "pt-BR" : "dado"
                },
                "description" : {
                    "pt-BR" : "O Sistema de rolagem de dados é bem complexo por isso temos uma página dedicada somente a ele [Clique Aqui para Visitar](https://rpg.arkanus.app/pt/posts/dices)\nAlém disso você pode rolar os dados macros salvos através do autocomplete.",
                    "en" : "The dice rolling system is very complex so we have a page dedicated only to it [Click Here to Visit](https://rpg.arkanus.app/posts/dices)"
                }
            }
        ]
    },
    {
        "name" : {
            "en" : "dh",
            "pt-BR" : "dh"
        },
        "tag" : "rpg",
        "description" : {
            "pt-BR" : "Rola um dado que apenas você pode ver o resultado.",
            "en" : "Roll a dice that only you can see the result."	
        },
        "params" : [
            {
                "name" : {
                    "en" : "dice",
                    "pt-BR" : "dado"
                },
                "description" : {
                    "pt-BR" : "O Sistema de rolagem de dados é bem complexo por isso temos uma página dedicada somente a ele [Clique Aqui para Visitar](https://rpg.arkanus.app/pt/posts/dices)\nAlém disso você pode rolar os dados macros salvos através do autocomplete.",
                    "en" : "The dice rolling system is very complex so we have a page dedicated only to it [Click Here to Visit](https://rpg.arkanus.app/posts/dices)"
                }
            }
        ]
    },
    {
        "name" : {
            "en" : "di",
            "pt-BR" : "di"
        },
        "tag" : "rpg",
        "description" : {
            "pt-BR" : "Rola um dado inteligente, baseado na ficha de personagem, com modificadores e vantagens automáticas.",
            "en" : "Roll an intelligent die, based on the character sheet, with automatic modifiers and advantages."
        },
        params : [
            {
                "name" : {
                    "en" : "dice",
                    "pt-BR" : "dado"
                },
                "description" : {
                    "pt-BR" : "O Sistema de rolagem de dados é bem complexo por isso temos uma página dedicada somente a ele [Clique Aqui para Visitar](https://rpg.arkanus.app/pt/posts/dices)",
                    "en" : "The dice rolling system is very complex so we have a page dedicated only to it [Click Here to Visit](https://rpg.arkanus.app/posts/dices)"
                }
            }
        ]
    },
    {
        "name" : {
            "en" : "analise",
            "pt-BR" : "analise"
        },
        "tag" : "fun",
        "description" : {
            "en" : "Make a server analysis.",
            "pt-BR" : "Faz uma analise do seu servidor."
        }
    },
    {
        "name" : {
            "en" : "config",
            "pt-BR" : "configurar"
        },
        "tag" : "config",
        "description" : {
            "pt-BR" : "Comando para configurar o bot, Defina o Sistema de RPG, Cargo do Mestre, Privacidade de Fichas e muito mais.",
            "en" : "Command to configure the bot, Set the RPG System, Master Role, Sheet Privacy and much more."
        }
    },
    {
        "name" : {
            "en" : "sheet",
            "pt-BR" : "ficha"
        },
        "tag" : "rpg",
        "description" : {
            "pt-BR" : "Comando para criar, editar e visualizar fichas de RPG.",
            "en" : "Command to create, edit and view RPG sheets."
        },
        "params" : [
            {
                "name" : {
                    "en" : "?user",
                    "pt-BR" : "?usuario"
                },
                "description" : {
                    "pt-BR" : "Mencione um usuário para ver a ficha dele.",
                    "en" : "Mention a user to see his sheet."
                }
            },
            {
                "name" : {
                    "en" : "?character",
                    "pt-BR" : "?personagem"
                },
                "description" : {
                    "pt-BR" : "Nome da ficha.",
                    "en" : "Sheet name."
                }
            }
        ]
    },
    {
        "name" : {
            "en" : "help",
            "pt-BR" : "ajuda"
        },
        "tag" : "misc",
        "description" : {
            "pt-BR" : "Comando para obter ajuda e ver lista de comandos.",
            "en" : "Command to get help and see command list."
        }
    },
    {
        "name" : {
            "en" : "timer",
            "pt-BR" : "timer"
        },
        "tag" : "util",
        "description" : {
            "pt-BR" : "Cria um cronometro para você.",
            "en" : "Create a timer for you."
        },
        "params" : [
            {
                "name" : {
                    "en" : "time",
                    "pt-BR" : "tempo"
                },
                "description" : {
                    "pt-BR" : "Tempo em Minutos. (Máximo 60)",
                    "en" : "Time in Minutes. (Max 60)"
                }
            }
        ]
    },
    {
        "name" : {
            "pt-BR" : "suporte",
            "en" : "support"
    },
    "tag" : "misc",
    "description" : {
        "pt-BR" : "Comando para obter acesso aos canais de suporte.",
        "en" : "Command to get support."
    }
},
{
    "name" : {
        "pt-BR" : "sugerir",
        "en" : "suggest"
    },
    "tag" : "misc",
    "description" : {
        "pt-BR" : "Comando para sugerir uma ideia para o bot, estamos sempre abertos a sugestões.",
        "en" : "Command to suggest an idea for the bot, we are always open to suggestions."
    }
},
{
    "name" : {
        "pt-BR" : "votar",
        "en" : "vote"
    },
    "tag" : "economy",
    "description" : {
        "pt-BR" : "Comando para votar no bot e receber recompensas.",
        "en" : "Command to vote on the bot and receive rewards."
    }
},
{
    "name" : {
        "pt-BR" : "daily",
        "en" : "daily"
    },
    "tag" : "economy",
    "description" : {
        "pt-BR" : "Receba sua recompensa diária.",
        "en" : "Get your daily reward."
    }
},
{
    "name" : {
        "pt-BR" : "kc atm",
        "en" : "kc atm"
    },
    "tag" : "economy",
    "description" : {
        "pt-BR" : "Comando para ver seu saldo de Kraken Coins moedas da Fortuna.",
        "en" : "Command to see your Kraken Coins balance."
    },
    "params" : [
        {
            "name" : {
                "pt-BR" : "?user",
                "en" : "?user"
            },
            "description" : {
                "pt-BR" : "Mencione um usuário para ver o saldo dele.",
                "en" : "Mention a user to see his balance."
            }
        }
    ]
},
{
    "name" : {
        "pt-BR" : "kc pagar",
        "en" : "kc pay"
    },
    "tag" : "economy",
    "description" : {
        "pt-BR" : "Comando para enviar Kraken Coins para alguém.",
        "en" : "Command to send Kraken Coins to someone."
    },
    "params" : [
        {
            "name" : {
                "pt-BR" : "user",
                "en" : "user"
            },
            "description" : {
                "pt-BR" : "Mencione um usuário.",
                "en" : "Mention a user."
            }
        },
        {
            "name" : {
                "pt-BR" : "amount",
                "en" : "amount"
            },
            "description" : {
                "pt-BR" : "Quantidade de Kraken Coins.",
                "en" : "Amount of Kraken Coins."
            }
        }
    ]

},
{
    "name" : {
        "pt-BR" : "kc top",
        "en" : "kc top"
    },
    "tag" : "economy",
    "description" : {
        "pt-BR" : "Comando para ver o top 10 de Kraken Coins.",
        "en" : "Command to see the top 10 of Kraken Coins."
    }
},
{
    "name" : {
        "pt-BR" : "loja dados",
        "en" : "dice store"
    },
    "tag" : "economy",
    "description" : {
        "pt-BR" : "Comando para ver a loja de dados, deixe suas rolagens com a sua cara.",
        "en" : "Command to see the dice store, leave your rolls with your face."
    },
    params : [
        {
            "name" : {
                "en" : "?page",
                "pt-BR" : "?pagina"
            },
            "description" : {
                "pt-BR" : "Página da loja.",
                "en" : "Store page."
            }
        }
    ]
},
{
    "name" : {
        "pt-BR" : "ping",
        "en" : "ping"
    },
    "tag" : "misc",
    "description" : {
        "pt-BR" : "Comando para ver o ping do bot.",
        "en" : "Command to see the bot's ping."
    }
},
{
    "name" : {
        "pt-BR" : "baralho poker",
        "en" : "deck poker"
    },
    "tag" : "util",
    "description" : {
        "pt-BR" : "Gera uma carta de Poker aleatoria.",
        "en" : "Generates a random Poker card."
    }
},
{
    "name" : {
        "pt-BR" : "baralho Tarot",
        "en" : "Tarot Deck"
},
"tag" : "util",
"description" : {
    "pt-BR" : "Gera uma carta de Tarot aleatoria.",
    "en" : "Generates a random Tarot card."
},
"params" : [
    {
        "name" : {
            "pt-BR" : "?reversed",
            "en" : "?reversed"
        },
        "description" : {
            "pt-BR" : "Gera a carta de Tarot invertida.",
            "en" : "Generates the reversed Tarot card."
        }
    }
]
},
{
    "name" : {
        "pt-BR" : "baralho wyrt",
        "en" : "wyrt deck"
},
"tag" : "util",
"description" : {
    "pt-BR" : "Gera uma carta de Wyrt aleatoria.",
    "en" : "Generates a random Wyrt card."
}
},
{
    "name" : {
        "pt-BR" : "resgatar",
        "en" : "redeem"
    },
    "tag" : "config",
    "description" : {
        "pt-BR" : "Comando para resgatar um código promocional.",
        "en" : "Command to redeem a promotional code."
    },
    "params" : [
        {
            "name" : {
                "pt-BR" : "code",
                "en" : "code"
            },
            "description" : {
                "pt-BR" : "Código promocional.",
                "en" : "Promotional code."
            }
        }
    ]
},
{
    "name" : {
        "pt-BR" : "user avatar",
        "en" : "user avatar"
    },
    "tag" : "discord",
    "description" : {
        "pt-BR" : "Comando para ver o avatar de um usuário.",
        "en" : "Command to see a user's avatar."
    },
    "params" : [
        {
            "name" : {
                "pt-BR" : "?user",
                "en" : "?user"
            },
            "description" : {
                "pt-BR" : "Mencione um usuário.",
                "en" : "Mention a user."
            }
        }
    ]
},
{
    "name" : {
        "pt-BR" : "user banner",
        "en" : "user banner"
    },
    "tag" : "discord",
    "description" : {
        "pt-BR" : "Comando para ver o banner de um usuário.",
        "en" : "Command to see a user's banner."
    },
    "params" : [
        {
            "name" : {
                "pt-BR" : "?user",
                "en" : "?user"
            },
            "description" : {
                "pt-BR" : "Mencione um usuário.",
                "en" : "Mention a user."
            }
        }
    ]
},
{
    "name" : {
        "pt-BR" : "user info",
        "en" : "user info"
    },
    "tag" : "discord",
    "description" : {
        "pt-BR" : "Comando para ver informações de um usuário.",
        "en" : "Command to see user information."
    },
    "params" : [
        {
            "name" : {
                "pt-BR" : "?user",
                "en" : "?user"
            },
            "description" : {
                "pt-BR" : "Mencione um usuário.",
                "en" : "Mention a user."
            }
        }
    ]
},
{
    "name" : {
        "pt-BR" : "server info",
        "en" : "server info"
    },
    "tag" : "discord",
    "description" : {
        "pt-BR" : "Comando para ver informações do servidor.",
        "en" : "Command to see server information."
    }
},
{
    "name" : {
        "pt-BR" : "server icone",
        "en" : "server icon"
    },
    "tag" : "discord",
    "description" : {
        "pt-BR" : "Comando para ver o icone do servidor.",
        "en" : "Command to see the server icon."
    }
},
{
    "name" : { 
        "pt-BR" : "mc skin",
        "en" : "mc skin"
    },
    "tag" : "games",
    "description" : {
        "pt-BR" : "Comando para ver a skin de um jogador de Minecraft.",
        "en" : "Command to see a Minecraft player's skin."
    },
    "params" : [
        {
            "name" : {
                "pt-BR" : "user",
                "en" : "user"
            },
            "description" : {
                "pt-BR" : "Nome do jogador.",
                "en" : "Player name."
            }
        }
    ]
},
{
    "name" : {
        "pt-BR" : "mc server",
        "en" : "mc server"
    },
    "tag" : "games",
    "description" : {
        "pt-BR" : "Comando para ver informações de um servidor de Minecraft.",
        "en" : "Command to see information about a Minecraft server."
    },
    "params" : [
        {
            "name" : {
                "pt-BR" : "ip",
                "en" : "ip"
            },
            "description" : {
                "pt-BR" : "IP do servidor.",
                "en" : "Server IP."
            }
        }
    ]
},
{
    "name" : {
        "pt-BR" : "mc head",
        "en" : "mc head"
    },
    "tag" : "games",
    "description" : {
        "pt-BR" : "Comando para ver a cabeça de um jogador de Minecraft.",
        "en" : "Command to see a Minecraft player's head."
    },
    "params" : [
        {
            "name" : {
                "pt-BR" : "user",
                "en" : "user"
            },
            "description" : {
                "pt-BR" : "Nome do jogador.",
                "en" : "Player name."
            }
        }
    ]
},
{
    "name" : {
        "pt-BR" : "emoji info",
        "en" : "emoji info"
    },
    "tag" : "discord",
    "description" : {
        "pt-BR" : "Comando para ver informações de um emoji.",
        "en" : "Command to see emoji information."
    },
    "params" : [
        {
            "name" : {
                "pt-BR" : "emoji",
                "en" : "emoji"
            },
            "description" : {
                "pt-BR" : "Nome do emoji.",
                "en" : "Emoji name."
            }
        }
    ]
},
{
    "name" : {
        "pt-BR" : "iniciativa",
        "en" : "inicitive"
    },
    "tag" : "rpg",
    "description" : {
        "pt-BR" : "Comando para rolar iniciativa.",
        "en" : "Command to roll initiative."
    },
    "params" : [
        {
            "name" : {
                "pt-BR" : "Carregar",
                "en" : "Load Save"
            },
            "description" : {
                "pt-BR" : "Carregar a iniciativa salva.",
                "en" : "Load the saved initiative."
            }
        }
    ]
},
{
    "name" : {
        "pt-BR" : "editar dados",
        "en" : "edit dices"
    },
    "tag" : "rpg",
    "description" : {
        "pt-BR" : "Comando para editar dados salvos.",
        "en" : "Command to edit saved dice."
    }
},
]


function replaceText(text) {
    text = text.replace(/\n/g, '<br />');
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/@(\w+)/g, '<span class="text-primary">@$1</span>');
    text = text.replace(/`(.*?)`/g, '<span class="text-bg-primary">$1</span>');
    text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
    return text;
}

function GenerateCard(name, description, params, lang) {
    let paramsSpans = '';
    let paramsDescriptions = '';
    if (params) {
        paramsSpans = params.map(param => {
            let paramName = param.name[lang];
            if (paramName.startsWith('?')) {
                paramName = paramName.slice(1) + ' (opcional)';
            }
            return `
                <span class="badge rounded-pill bg-primary text-center d-flex d-xxl-flex justify-content-center align-items-center justify-content-xxl-center me-1">
                    <span style="color: rgb(238, 238, 238);">${paramName}</span>
                </span>
            `;
        }).join('');
        paramsDescriptions = params.map(param => {
            let paramName = param.name[lang];
            if (paramName.startsWith('?')) {
                paramName = paramName.slice(1) + ' (opcional)';
            }
            return `🞄 ${paramName}: ${replaceText(param.description[lang])}<br />`;
        }).join('');
    }
    return `
        <div class="col mt-1 mb-1">
            <div class="card border-primary border-1 shadow-none">
                <div class="card-body border-secondary">
                    <div class="d-flex align-items-center align-content-center flex-wrap">
                        <h3 class="text-light d-inline-block pt-2 me-2">/${name[lang]}</h3>
                        ${paramsSpans}
                    </div>
                    <p class="card-text">${replaceText(description[lang])}<br /><br />${paramsDescriptions}</p>
                </div>
            </div>
        </div>
    `;
}

function GenerateCards(cmds, lang) {
    let cardsPlacer = document.getElementById('cards');
    let cards = cmds.map(cmd => GenerateCard(cmd.name, cmd.description, cmd.params, lang)).join('');
    cardsPlacer.innerHTML = cards;
}

function OrdenarComandosOrdemAlfabetica(commands, lang) {
    commands.sort((a, b) => {
        if (a.name[lang] < b.name[lang]) {
            return -1;
        }
        if (a.name[lang] > b.name[lang]) {
            return 1;
        }
        return 0;
    });

    return commands;
}

function ClearCards() {
    let cardsPlacer = document.getElementById('cards');
    cardsPlacer.innerHTML = '';
}

function FilterTags(commands, tag) {
    return commands.filter(cmd => cmd.tag === tag);
}


GenerateCards(OrdenarComandosOrdemAlfabetica(commands,"pt-BR"), 'pt-BR');



