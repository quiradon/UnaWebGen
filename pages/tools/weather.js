const { head } = require('../../components/head')
const { nav } = require('../../components/navbar')
const { footer } = require('../../components/navbar')
const scripts = require('../../components/bootscripts')
const { TitleAndSubtitle } = require('../../components/blogpost')

function generateWeather(type) {
    let temp, weather, wind, intensity;
    
    switch(type) {
        case 'cold':
            temp = Math.floor(Math.random() * 25) - 20; // -20°C to 5°C
            weather = Math.random() < 0.4 ? 'blizzard' : 
                     Math.random() < 0.7 ? 'snow' :
                     Math.random() < 0.9 ? 'cloudy' : 'clear';
            wind = Math.floor(Math.random() * 60) + 10; // 10-70 km/h
            intensity = Math.random() < 0.3 ? 'severe' : 
                       Math.random() < 0.7 ? 'moderate' : 'mild';
            break;
        case 'temperate':
            temp = Math.floor(Math.random() * 30) + 0; // 0°C to 30°C
            weather = Math.random() < 0.3 ? 'thunderstorm' :
                     Math.random() < 0.5 ? 'heavy_rain' :
                     Math.random() < 0.7 ? 'light_rain' :
                     Math.random() < 0.85 ? 'cloudy' : 'clear';
            wind = Math.floor(Math.random() * 40) + 5; // 5-45 km/h
            intensity = Math.random() < 0.2 ? 'severe' :
                       Math.random() < 0.6 ? 'moderate' : 'mild';
            break;
        case 'desert':
            temp = Math.floor(Math.random() * 35) + 15; // 15°C to 50°C
            weather = Math.random() < 0.6 ? 'clear' :
                     Math.random() < 0.8 ? 'sandstorm' :
                     Math.random() < 0.9 ? 'dust_devil' : 'cloudy';
            wind = Math.floor(Math.random() * 50) + 15; // 15-65 km/h
            intensity = Math.random() < 0.3 ? 'severe' :
                       Math.random() < 0.7 ? 'moderate' : 'mild';
            break;
        default: // random
            const types = ['cold', 'temperate', 'desert'];
            return generateWeather(types[Math.floor(Math.random() * types.length)]);
    }
    
    return { temp, weather, wind, intensity };
}

async function page(idioma, rota) {
    const t = idioma
    return `
<!DOCTYPE html>
<html lang="${t.lang}" data-bs-theme="dark">
${head(`${t.lang}${rota}`, "Gerador de Clima - Simulador de Condições Climáticas", "Ferramenta gratuita para gerar condições climáticas aleatórias para RPG. Simule climas em regiões polares, temperadas e desérticas para suas aventuras de RPG de mesa.")}
<body>
    ${nav(t, rota)}
    <div class="container">
        <div class="col-12 text-center mb-2 mt-4">
            ${TitleAndSubtitle("gerador de climas para RPG", "Gere climas variados para suas aventuras")}
        </div>
        <div class="row justify-content-center">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <div class="mb-3">
                            <label for="climateType" class="form-la bel">Selecione o bioma</label>
                            <select class="form-select" id="climateType">
                                <option value="random">aleatório</option>
                                <option value="cold">região polar</option>
                                <option value="temperate">região temperada</option>
                                <option value="desert">região desértica</option>
                            </select>
                        </div>
                        <button class="btn btn-primary w-100" onclick="generateWeather()">Gerar Clima</button>
                        <div id="weatherResult" class="mt-3 text-center" style="display: none;">
                            <h3 class="weather-condition mb-3"></h3>
                            <div class="intensity mb-2"></div>
                            <div class="temperature mb-2"></div>
                            <div class="wind-speed"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    ${footer(t, rota)}
    ${scripts}
    <script>
        function generateWeather() {
            const type = document.getElementById('climateType').value;
            const result = ${generateWeather.toString()}(type);
            
            const weatherResult = document.getElementById('weatherResult');
            const weatherIcons = {
                clear: '☀️',
                cloudy: '☁️',
                light_rain: '🌦️',
                heavy_rain: '🌧️',
                thunderstorm: '⛈️',
                snow: '❄️',
                blizzard: '🌨️',
                sandstorm: '🌪️',
                dust_devil: '🌪️'
            };
            
            const translations = {
                clear: 'céu limpo',
                cloudy: 'nublado',
                light_rain: 'chuva leve',
                heavy_rain: 'chuva forte',
                thunderstorm: 'tempestade com raios',
                snow: 'neve',
                blizzard: 'nevasca',
                sandstorm: 'tempestade de areia',
                dust_devil: 'redemoinho de areia'
            };

            const intensityTranslations = {
                mild: 'Intensidade: Suave',
                moderate: 'Intensidade: Moderada',
                severe: 'Intensidade: Severa'
            };

            document.querySelector('.weather-condition').innerHTML = 
                \`\${weatherIcons[result.weather]} \${translations[result.weather]}\`;
            document.querySelector('.intensity').innerHTML = 
                \`\${intensityTranslations[result.intensity]}\`;
            document.querySelector('.temperature').innerHTML = 
                \`Temperatura: \${result.temp}°C\`;
            document.querySelector('.wind-speed').innerHTML = 
                \`Velocidade do Vento: \${result.wind} km/h\`;
            
            weatherResult.style.display = 'block';
        }
    </script>
</body>
</html>
`
}

module.exports = {
    page
}