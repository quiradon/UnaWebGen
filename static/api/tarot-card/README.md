
# Random Tarot Card API

An extremely simple API that returns a random Tarot Card with a minimalist design, can be used by discord bots for example

## Request Exemples

### JS

```js
var card = Math.floor(Math.random() * 22) + 1;
var result = `https://apis.arkanus.app/tarot-card/${card}.webp`
console.log(result)
```

### python

```py
import random
card = random.randint(1,22)
result = f"https://apis.arkanus.app/tarot-card/${card}.webp"
print(result)
```

### c#

```c#
using System;

Random rand = new Random();
int card = rand.Next(1, 22);
string result = "https://apis.arkanus.app/tarot-card + "/" + card + ".png";
Console.WriteLine(result);
```

## Cards Design Screenshots

![App Screenshot](https://raw.githubusercontent.com/Mini-Kraken/api-random_tarot/main/files/13.png)

![App Screenshot](https://raw.githubusercontent.com/Mini-Kraken/api-random_tarot/main/files/19.png)

![App Screenshot](https://raw.githubusercontent.com/Mini-Kraken/api-random_tarot/main/files/20.png)

## Licence
CC BY-NC
