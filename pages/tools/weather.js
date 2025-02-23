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
${head(`${t.lang}${rota}`, `${t.tools.clima.pageTitle} - ${t.tools.clima.pageTitleExtrea}`, `${t.tools.clima.pageDesc}`)}
<body>
    ${nav(t, rota)}
    <div class="container">
        <div class="col-12  mb-2 mt-4">
            ${TitleAndSubtitle(t.tools.clima.pageTitle, t.tools.clima.pageDesc)}
        </div>
        <div class="row justify-content-center">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <div class="mb-3">
                            <label for="climateType" class="form-la bel mb-2">${t.tools.clima.select}</label>
                            <select class="form-select" id="climateType">
                                <option value="random">${t.common.random}</option>
                                <option value="cold">${t.tools.clima.type.cold}</option>
                                <option value="temperate">${t.tools.clima.type.desert}</option>
                                <option value="desert">${t.tools.clima.type.temperate}</option>
                            </select>
                        </div>
                        <button class="btn btn-primary w-100" onclick="generateWeather()">${t.tools.clima.button}</button>
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
                clear: '${t.tools.clima.options.clear}',
                cloudy: '${t.tools.clima.options.cloudy}',
                light_rain: '${t.tools.clima.options.light_rain}',
                heavy_rain: '${t.tools.clima.options.heavy_rain}',
                thunderstorm: '${t.tools.clima.options.thunderstorm}',
                snow: '${t.tools.clima.options.snow}',
                blizzard: '${t.tools.clima.options.blizzard}',
                sandstorm: '${t.tools.clima.options.sandstorm}',
                dust_devil: '${t.tools.clima.options.dust_devil}'
            };

            const intensityTranslations = {
                mild: '${t.tools.clima.intense.mild}',
                moderate: '${t.tools.clima.intense.moderate}',
                severe: '${t.tools.clima.intense.severe}'
            };

            document.querySelector('.weather-condition').innerHTML = 
                \`\${weatherIcons[result.weather]} \${translations[result.weather]}\`;
            document.querySelector('.intensity').innerHTML = 
                \`\${intensityTranslations[result.intensity]}\`;
            document.querySelector('.temperature').innerHTML = 
                \`${t.tools.clima.temperatura}: \${result.temp}°C\`;
            document.querySelector('.wind-speed').innerHTML = 
                \`${t.tools.clima.vento} \${result.wind} km/h\`;
            
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
