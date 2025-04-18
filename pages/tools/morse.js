const {nav, footer} = require('../../components/navbar');
const scripts = require('../../components/bootscripts');
const {head} = require('../../components/head');

async function page(idioma, rota) {
    const t = idioma;
    return `
<!DOCTYPE html>
<html lang="${t.lang}" data-bs-theme="dark">
${head(`${t.lang}${rota}`, `${t.tools.morse.title}`, `${t.tools.morse.desc}`)}
<body>
    ${nav(t, rota)}
    <div class="container">
        <div class="col-12 mb-2 mt-4">
                    <h1 class="display-5 fw-bold text-white mb-3">${t.tools.morse.title}</h1> 
                    <p class="mb-4 lead text-secondary">${t.tools.morse.desc}</p>
        </div>
        <div class="row justify-content-center">
            <div>
                <div class="card">
                    <div class="card-body">
                        <div class="mb-3">
                            <label for="morseText" class="form-label">${t.common.texto}</label>
                            <textarea id="morseText" class="form-control" rows="3" >SOS</textarea>
                        </div>
                        <div class="mb-3">
                            <label for="morseOutput" class="form-label">${t.tools.morse.title}</label>
                            <textarea id="morseOutput" class="form-control" rows="3" readonly></textarea>
                        </div>
                        <div class="mb-3">
                            <label for="morseStyle" class="form-label">${t.tools.morse.types.title}</label>
                            <select id="morseStyle" class="form-select">
                                <option value="classic">${t.tools.morse.types[0]}</option>
                                <option value="sonar">${t.tools.morse.types[1]}</option>
                                <option value="ovni">${t.tools.morse.types[2]}</option>
                                <option value="terror">${t.tools.morse.types[3]}</option>
                                <option value="tribal">${t.tools.morse.types[4]}</option>
                                <option value="space">${t.tools.morse.types[5]}</option>
                                <option value="underwater">${t.tools.morse.types[6]}</option>
                                <option value="wind">${t.tools.morse.types[7]}</option>
                            </select>
                        </div>
                        <button class="btn btn-primary w-100 mb-2" onclick="playMorse()">${t.tools.morse.btn1}</button> <button class="btn btn-secondary w-100" onclick="exportMorse()">${t.tools.morse.btn2}</button> </div>
                </div>
            </div>
        </div>
    </div>
    ${footer(t, rota)}
    ${scripts}

    
    <script>

        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const valorCampo = urlParams.get('input') ?? null
        const morseTextInput = document.getElementById('morseText');
        if (valorCampo) {
        const text = atob(valorCampo); // Decodifica o valor base64
        
        morseTextInput.value = text; // Define o valor do campo de texto
        }
        const morseMap = {
            A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.",
            G: "--.", H: "....", I: "..", J: ".---", K: "-.-", L: ".-..",
            M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.",
            S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
            Y: "-.--", Z: "--..", 0: "-----", 1: ".----", 2: "..---",
            3: "...--", 4: "....-", 5: ".....", 6: "-....", 7: "--...",
            8: "---..", 9: "----.", " ": " / " // Usar '/' para espaço entre palavras para clareza visual
        };

        const styles = {
            classic: { type: 'sine', frequency: 600, gain: 0.5 },
            sonar:   { type: 'sine', frequency: 200, gain: 0.8, pulse: true },
            ovni:    { type: 'triangle', frequency: 800, gain: 0.6, pulse: true, vibrato: true, vibratoSpeed: 7, vibratoDepth: 25, modulate: true, modSpeed: 2, modDepth: 40 },
            terror:  { type: 'sawtooth', frequency: 90, gain: 0.9, pulse: true, vibrato: true, vibratoSpeed: 5, vibratoDepth: 50, echo: true, echoDelay: 0.3, echoFeedback: 0.4 },
            tribal:  { type: 'square', frequency: 250, gain: 0.7, pulse: true, modulate: true, modSpeed: 3, modDepth: 60 },
            space:   { type: 'sine', frequency: 440, gain: 0.4, tremolo: true, tremoloSpeed: 2, tremoloDepth: 0.3, delay: true, delayTime: 0.2, delayFeedback: 0.5 },
            underwater: { type: 'sine', frequency: 300, gain: 0.6, distortion: true, distortionAmount: 0.15 },
            wind:    { type: 'white', gain: 0.2, pan: true, panValue: 0.5, fadeIn: 0.1, fadeOut: 0.3 },
        };

        // Referências aos elementos do DOM
        const morseOutputArea = document.getElementById('morseOutput');

        function textToMorse(text) {
            // Mapeia cada caractere para morse, juntando com espaço. Espaços no texto original viram '/'
            return text.trim().toUpperCase().split('').map(char => morseMap[char] || '').join(' ').replace(/ +/g, ' '); // Garante um espaço único entre códigos de letras
        }

        // Função para atualizar a área de texto do Morse
        function updateMorseOutput() {
            const text = morseTextInput.value;
            const morse = textToMorse(text);
            morseOutputArea.value = morse; // Atualiza o valor da textarea de saída
        }

        // Adiciona um event listener para atualizar o Morse enquanto digita
        morseTextInput.addEventListener('input', updateMorseOutput);

        // Chama a função uma vez no carregamento para exibir o Morse do texto inicial ('SOS')
        updateMorseOutput();


        function createBeep(ctx, startTime, duration, style) {
            const gain = ctx.createGain();
            // Ajuste inicial do ganho para evitar cliques
             gain.gain.setValueAtTime(0.0001, startTime);

            let source;
            if (style.type === 'white') {
                const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration)); // Garante bufferSize >= 1
                const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                const output = noiseBuffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    output[i] = Math.random() * 2 - 1;
                }
                source = ctx.createBufferSource();
                source.buffer = noiseBuffer;
                source.loop = false;
            } else {
                source = ctx.createOscillator();
                source.type = style.type || 'sine';
                // Usar setTargetAtTime para mudanças suaves de frequência se necessário, mas setValueAtTime é ok aqui
                source.frequency.setValueAtTime(style.frequency || 440, startTime);
            }

            // Aplica ganho e envelope
             const targetGain = style.gain !== undefined ? style.gain : (style.type === 'white' ? 0.2 : 0.5);
            if (style.pulse && style.type !== 'white') {
                gain.gain.linearRampToValueAtTime(targetGain, startTime + duration * 0.05); // Rampa de subida rápida
                gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
            } else if (style.fadeIn) {
                 gain.gain.linearRampToValueAtTime(targetGain, startTime + style.fadeIn);
                 if (style.fadeOut && (startTime + duration - style.fadeOut) >= 0) {
                     gain.gain.linearRampToValueAtTime(0.0001, startTime + duration - style.fadeOut);
                 } else {
                     const safeEndTime = Math.max(0, startTime + duration - 0.01);
                     gain.gain.setValueAtTime(targetGain, safeEndTime); // Mantém o ganho até quase o fim
                     gain.gain.linearRampToValueAtTime(0.0001, Math.max(0, startTime + duration)); // Rampa de descida rápida no final
                 }
            }
             else {
                gain.gain.linearRampToValueAtTime(targetGain, startTime + 0.005); // Pequena rampa de subida
                gain.gain.setValueAtTime(targetGain, startTime + duration - 0.01); // Mantém o ganho até quase o fim
                gain.gain.linearRampToValueAtTime(0.0001, startTime + duration); // Rampa de descida rápida no final
            }


             let currentNode = source;

             // Aplica Efeitos
             if (style.vibrato && style.type !== 'white') {
                 const vibrato = ctx.createOscillator();
                 const vibratoGain = ctx.createGain();
                 vibrato.frequency.setValueAtTime(style.vibratoSpeed || 6, startTime);
                 vibratoGain.gain.setValueAtTime(style.vibratoDepth || 20, startTime);
                 vibrato.connect(vibratoGain).connect(source.frequency); // Conecta ao parâmetro de frequência
                 vibrato.start(startTime);
                 vibrato.stop(startTime + duration);
             }

            if (style.modulate && style.type !== 'white') {
                 const mod = ctx.createOscillator();
                 const modGain = ctx.createGain();
                 mod.frequency.setValueAtTime(style.modSpeed || 2, startTime);
                 modGain.gain.setValueAtTime(style.modDepth || 40, startTime);
                 mod.connect(modGain).connect(source.frequency); // Conecta ao parâmetro de frequência
                 mod.start(startTime);
                 mod.stop(startTime + duration);
            }


             if (style.distortion && style.type !== 'white') {
                 const distortion = ctx.createWaveShaper();
                 function makeDistortionCurve(amount) {
                     const k = typeof amount === 'number' ? amount : 50;
                     const n_samples = 44100;
                     const curve = new Float32Array(n_samples);
                     const deg = Math.PI / 180;
                     let i = 0;
                     let x;
                     for ( ; i < n_samples; ++i ) {
                         x = i * 2 / n_samples - 1;
                         //curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x)); // Curva original mais simples
                        curve[i] = (3 + k) * Math.atan(Math.sinh(x * 0.25) * 5) / (Math.PI + k * Math.abs(x)); // Curva mais complexa

                     }
                     return curve;
                 }
                 distortion.curve = makeDistortionCurve(style.distortionAmount * 400); // Ajuste o multiplicador conforme necessário
                 distortion.oversample = '4x'; // Melhora a qualidade da distorção
                 currentNode.connect(distortion);
                 currentNode = distortion; // O próximo nó se conecta a este
             }


             currentNode.connect(gain); // Conecta a fonte (ou o último efeito na cadeia) ao ganho
            currentNode = gain; // Agora o ganho é o último nó principal

             // Efeitos de Pós-Ganho (Delay, Echo, Tremolo, Pan)
             if (style.tremolo && style.type !== 'white') {
                 const tremolo = ctx.createOscillator();
                 const tremoloGain = ctx.createGain(); // Ganho para controlar a profundidade do tremolo
                 tremolo.frequency.setValueAtTime(style.tremoloSpeed || 5, startTime);
                 tremoloGain.gain.setValueAtTime(1.0, startTime); // Começa com ganho total

                 // Cria um nó de ganho que será modulado pelo tremolo
                 const tremoloEffectGain = ctx.createGain();
                 currentNode.connect(tremoloEffectGain); // Conecta o nó atual (ganho) a este novo nó de ganho
                 currentNode = tremoloEffectGain; // Este nó é agora o último na cadeia principal

                 // Conecta o oscilador de tremolo ao ganho do nó de efeito
                 // Precisamos deslocar e escalar a saída do oscilador (-1 a 1) para modular o ganho (0 a 1)
                 const tremoloDepth = ctx.createGain();
                 tremoloDepth.gain.setValueAtTime(style.tremoloDepth || 0.4, startTime);
                 tremolo.connect(tremoloDepth).connect(tremoloEffectGain.gain); // Conecta direto ao parâmetro gain

                 // Precisamos ajustar o ganho base para que ele não vá a zero a menos que a profundidade seja 1
                 tremoloEffectGain.gain.setValueAtTime(1.0 - (style.tremoloDepth || 0.4), startTime); // Ganho base

                 tremolo.start(startTime);
                 tremolo.stop(startTime + duration);
             }


            if (style.echo && style.type !== 'white') {
                 const delay = ctx.createDelay(5.0); // Max delay time 5s
                 delay.delayTime.setValueAtTime(style.echoDelay || 0.2, startTime);
                 const feedback = ctx.createGain();
                 feedback.gain.setValueAtTime(style.echoFeedback || 0.3, startTime);

                 currentNode.connect(delay);
                 delay.connect(feedback);
                 feedback.connect(delay); // Feedback loop

                 // Mix original signal and delayed signal
                 const wetMix = ctx.createGain(); // Ganho para o sinal com delay
                 wetMix.gain.setValueAtTime(0.6, startTime); // Ajuste o volume do delay
                 delay.connect(wetMix);

                 const dryMix = ctx.createGain(); // Ganho para o sinal original
                 dryMix.gain.setValueAtTime(0.7, startTime); // Ajuste o volume original
                 currentNode.connect(dryMix);


                 const merger = ctx.createChannelMerger(1); // Usar merger pode não ser ideal aqui, melhor somar os ganhos
                 // Vamos usar um nó de ganho final para somar
                 const outputNode = ctx.createGain();
                 dryMix.connect(outputNode);
                 wetMix.connect(outputNode);

                 currentNode = outputNode; // O nó de saída combinado é o último
             } else if (style.delay && style.type !== 'white') {
                 const delayNode = ctx.createDelay(5.0); // Max delay 5s
                 delayNode.delayTime.setValueAtTime(style.delayTime || 0.2, startTime);
                 const feedbackNode = ctx.createGain();
                 feedbackNode.gain.value = style.delayFeedback || 0.5;

                 currentNode.connect(delayNode);
                 delayNode.connect(feedbackNode);
                 feedbackNode.connect(delayNode); // Feedback loop

                 // Mix original and delayed signal
                  const wetMix = ctx.createGain();
                 wetMix.gain.setValueAtTime(0.6, startTime); // Ajuste o volume do delay
                 delayNode.connect(wetMix);

                 const dryMix = ctx.createGain();
                 dryMix.gain.setValueAtTime(0.7, startTime); // Ajuste o volume original
                 currentNode.connect(dryMix);

                  const outputNode = ctx.createGain();
                 dryMix.connect(outputNode);
                 wetMix.connect(outputNode);


                 currentNode = outputNode;
             }


             if (style.pan && style.type === 'white') {
                 const panNode = ctx.createStereoPanner();
                 panNode.pan.setValueAtTime(style.panValue || 0, startTime);
                 currentNode.connect(panNode);
                 currentNode = panNode; // O panner é agora o último nó
             }

             // Conecta o último nó da cadeia ao destino
             currentNode.connect(ctx.destination);

             // Inicia e para a fonte original
             source.start(startTime);
             // Adiciona um pequeno buffer ao tempo de parada para garantir que os efeitos (delay/echo) tenham chance de terminar
             const stopTime = startTime + duration + (style.echo || style.delay ? Math.max(style.echoDelay || 0, style.delayTime || 0) * 5 : 0.05); // Duração extra para efeitos
             source.stop(stopTime);

              // Garante que os nós criados para efeitos que precisam de stop sejam parados
              // (Vibrato, Modulate, Tremolo já têm stop)
              // O 'source' será parado, o que interrompe o fluxo para os nós conectados.
        }

        function playMorse() {
            const text = morseTextInput.value; // Pega do input de texto
            const style = styles[document.getElementById('morseStyle').value];
            const morse = textToMorse(text); // Gera o morse a partir do texto
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            let time = ctx.currentTime + 0.1; // Pequeno delay inicial

            const dotDuration = 0.08; // Duração do ponto
            const dashDuration = dotDuration * 3; // Duração do traço
            const intraCharSpace = dotDuration; // Espaço entre pontos/traços dentro de uma letra
            const interCharSpace = dotDuration * 3; // Espaço entre letras
            const wordSpace = dotDuration * 7; // Espaço entre palavras

            for (let i = 0; i < morse.length; i++) {
                const char = morse[i];
                if (char === '.') {
                    createBeep(ctx, time, dotDuration, style);
                    time += dotDuration + intraCharSpace;
                } else if (char === '-') {
                    createBeep(ctx, time, dashDuration, style);
                    time += dashDuration + intraCharSpace;
                } else if (char === ' ') {
                     // Verifica se é um espaço entre palavras (marcado por '/') ou entre letras
                     if (i > 0 && morse[i-1] !== ' ' && i < morse.length - 1 && morse[i+1] !== ' ') {
                         // Espaço entre letras: subtrai o último intraCharSpace e adiciona interCharSpace
                         time += interCharSpace - intraCharSpace;
                    }
                } else if (char === '/') {
                    // Espaço entre palavras: subtrai o último intraCharSpace e adiciona wordSpace
                     time += wordSpace - intraCharSpace;
                 }
            }
        }

        function exportMorse() {
             const text = morseTextInput.value;
             const style = styles[document.getElementById('morseStyle').value];
             const morse = textToMorse(text);

             // Calcula a duração total estimada com mais precisão
             const dotDuration = 0.08;
             const dashDuration = dotDuration * 3;
             const intraCharSpace = dotDuration;
             const interCharSpace = dotDuration * 3;
             const wordSpace = dotDuration * 7;
             let estimatedDuration = 0.1; // Start offset
             for (let i = 0; i < morse.length; i++) {
                 const char = morse[i];
                 if (char === '.') estimatedDuration += dotDuration + intraCharSpace;
                 else if (char === '-') estimatedDuration += dashDuration + intraCharSpace;
                 else if (char === ' ') {
                      if (i > 0 && morse[i-1] !== ' ' && i < morse.length - 1 && morse[i+1] !== ' ') {
                         estimatedDuration += interCharSpace - intraCharSpace;
                     }
                 } else if (char === '/') {
                     estimatedDuration += wordSpace - intraCharSpace;
                 }
             }
             // Adiciona buffer extra para caudas de efeitos como delay/echo
             estimatedDuration += (style.echo || style.delay ? Math.max(style.echoDelay || 0, style.delayTime || 0) * 5 : 1.0); // Buffer de 1 segundo ou mais se houver delay/echo

             const sampleRate = 44100;
             const totalSamples = Math.ceil(sampleRate * estimatedDuration);
             const ctx = new OfflineAudioContext(1, totalSamples, sampleRate); // Mono, Duração total, Sample Rate

             let time = 0.1; // Offset inicial igual ao playMorse
             for (let i = 0; i < morse.length; i++) {
                 const char = morse[i];
                  if (char === '.') {
                    createBeep(ctx, time, dotDuration, style);
                    time += dotDuration + intraCharSpace;
                } else if (char === '-') {
                    createBeep(ctx, time, dashDuration, style);
                    time += dashDuration + intraCharSpace;
                } else if (char === ' ') {
                     if (i > 0 && morse[i-1] !== ' ' && i < morse.length - 1 && morse[i+1] !== ' ') {
                         time += interCharSpace - intraCharSpace;
                    }
                } else if (char === '/') {
                     time += wordSpace - intraCharSpace;
                 }
            }

             ctx.startRendering().then(renderedBuffer => {
                // Verifica se o buffer renderizado não está vazio
                if (renderedBuffer.length === 0) {
                     console.error("Rendered buffer is empty. Cannot create WAV.");
                     alert("Erro ao gerar o áudio. O buffer está vazio.");
                     return;
                 }
                try {
                     const blob = bufferToWav(renderedBuffer);
                     const url = URL.createObjectURL(blob);
                     const a = document.createElement('a');
                     a.style.display = 'none'; // Oculta o link
                    a.href = url;
                    a.download = 'morse_minikraken.wav';
                    document.body.appendChild(a); // Adiciona ao DOM para garantir funcionamento em todos os browsers
                    a.click();
                    // Limpeza
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                 } catch (error) {
                     console.error("Error creating WAV blob:", error);
                     alert("Ocorreu um erro ao criar o arquivo WAV.");
                 }
             }).catch(error => {
                console.error("Error rendering audio:", error);
                alert("Ocorreu um erro ao renderizar o áudio Morse.");
             });
         }


        // Função bufferToWav precisa ser robusta
        function bufferToWav(buffer) {
             const numChannels = buffer.numberOfChannels;
             const sampleRate = buffer.sampleRate;
             const numSamples = buffer.length;
             const bytesPerSample = 2; // 16-bit PCM
             const blockAlign = numChannels * bytesPerSample;
             const byteRate = sampleRate * blockAlign;
             const dataSize = numSamples * blockAlign;
             const bufferLength = 44 + dataSize;

             const wavBuffer = new ArrayBuffer(bufferLength);
             const view = new DataView(wavBuffer);

             let offset = 0;

             function writeString(str) {
                 for (let i = 0; i < str.length; i++) {
                     view.setUint8(offset++, str.charCodeAt(i));
                 }
             }

             function writeUint32(val) {
                 view.setUint32(offset, val, true); // true for little-endian
                 offset += 4;
             }

             function writeUint16(val) {
                 view.setUint16(offset, val, true); // true for little-endian
                 offset += 2;
             }

             function writeInt16(val) {
                 view.setInt16(offset, val, true); // true for little-endian
                 offset += 2;
             }

             // RIFF header
             writeString('RIFF');
             writeUint32(36 + dataSize); // Chunk size: 36 + size of data chunk
             writeString('WAVE');

             // fmt subchunk
             writeString('fmt ');
             writeUint32(16); // Subchunk1 size (16 for PCM)
             writeUint16(1); // Audio format (1 for PCM)
             writeUint16(numChannels);
             writeUint32(sampleRate);
             writeUint32(byteRate);
             writeUint16(blockAlign);
             writeUint16(bytesPerSample * 8); // Bits per sample (16)

             // data subchunk
             writeString('data');
             writeUint32(dataSize);

             // Write audio data samples
             const channels = [];
             for (let i = 0; i < numChannels; i++) {
                 channels.push(buffer.getChannelData(i));
             }

             for (let i = 0; i < numSamples; i++) {
                 for (let ch = 0; ch < numChannels; ch++) {
                     const sample = channels[ch][i];
                     // Clamp the sample value between -1 and 1
                     const clampedSample = Math.max(-1, Math.min(1, sample));
                     // Convert to 16-bit integer
                     const intSample = Math.floor(clampedSample < 0 ? clampedSample * 32768 : clampedSample * 32767);
                     writeInt16(intSample);
                 }
             }

             return new Blob([view], { type: 'audio/wav' });
         }

    </script>
</body>
</html>
`;
}

module.exports = {
    page
};