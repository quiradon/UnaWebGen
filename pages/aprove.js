const {nav, footer} = require('../components/navbar')
const scripts = require('../components/bootscripts')
const {head} = require('../components/head')
const {idiomaR} = require('../caminho')
const config = require('../config.json')
const icons = require('../components/icons')

function page(idioma, rota) {
    const t = idioma
    const lang = idiomaR(t)
    
    return `
<!DOCTYPE html>
<html lang="${t.lang}" data-bs-theme="dark">
${head(`${t.lang}${rota}`, t.aprove.title, t.aprove.desc)}
<body>
    ${nav(t, rota)}

    <main>
        <!-- Hero Section -->
        <section class="py-5 mt-5">
            <div class="container">
                <div class="row align-items-center">
                    <div class="col-lg-8 mx-auto text-center">
                        <div class="mb-5">
                            <h4 class="fw-semibold text-primary mb-0">${t.aprove.subtitle}</h4>
                            <h1 class="display-4 fw-bold mt-0">${t.aprove.title}</h1>
                            <p class="lead text-secondary">${t.aprove.desc}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Success Message -->
        <section class="py-4">
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-lg-8">
                        <div class="alert alert-success d-flex align-items-center" role="alert">
                            ${icons.check}
                            <div class="ms-3">
                                <h5 class="alert-heading mb-1">${t.aprove.success.title}</h5>
                                <p class="mb-0">${t.aprove.success.message}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Instructions Section -->
        <section class="py-5">
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-lg-10">
                        <div class="mb-5 text-center">
                            <h2 class="fw-bold">${t.aprove.instructions.title}</h2>
                            <p class="text-secondary">${t.aprove.instructions.subtitle}</p>
                        </div>

                        <div class="row g-4">
                            <!-- Option 1: Discord Support -->
                            <div class="col-lg-6">
                                <div class="card h-100 border-primary">
                                    <div class="card-body p-4">
                                        <div class="d-flex align-items-center mb-3">
                                            ${icons.discord}
                                            <h4 class="fw-bold mb-0 ms-3">${t.aprove.options.discord.title}</h4>
                                        </div>
                                        <p class="text-secondary mb-4">${t.aprove.options.discord.desc}</p>
                                        
                                        <div class="mb-4">
                                            <h6 class="fw-semibold mb-2">${t.aprove.steps.title}:</h6>
                                            <ol class="text-secondary">
                                                <li>${t.aprove.options.discord.steps.step1}</li>
                                                <li>${t.aprove.options.discord.steps.step2}</li>
                                                <li>${t.aprove.options.discord.steps.step3}</li>
                                                <li>${t.aprove.options.discord.steps.step4}</li>
                                            </ol>
                                        </div>

                                        <a href="${config.discord_invite}" target="_blank" class="btn btn-primary w-100">
                                            ${icons.discord}
                                            <span class="ms-2">${t.aprove.options.discord.button}</span>
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <!-- Option 2: Email Support -->
                            <div class="col-lg-6">
                                <div class="card h-100 border-secondary">
                                    <div class="card-body p-4">
                                        <div class="d-flex align-items-center mb-3">
                                            ${icons.email}
                                            <h4 class="fw-bold mb-0 ms-3">${t.aprove.options.email.title}</h4>
                                        </div>
                                        <p class="text-secondary mb-4">${t.aprove.options.email.desc}</p>
                                        
                                        <div class="mb-4">
                                            <h6 class="fw-semibold mb-2">${t.aprove.steps.title}:</h6>
                                            <ol class="text-secondary">
                                                <li>${t.aprove.options.email.steps.step1}</li>
                                                <li>${t.aprove.options.email.steps.step2}</li>
                                                <li>${t.aprove.options.email.steps.step3}</li>
                                            </ol>
                                        </div>

                                        <a href="mailto:support@arkanus.app?subject=${encodeURIComponent(t.aprove.options.email.subject)}" class="btn btn-secondary w-100">
                                            ${icons.email}
                                            <span class="ms-2">${t.aprove.options.email.button}</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Important Information -->
        <section class="py-5">
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-lg-8">
                        <div class="alert alert-info" role="alert">
                            <div class="d-flex align-items-start">
                                ${icons.info}
                                <div class="ms-3">
                                    <h6 class="alert-heading mb-2">${t.aprove.important.title}</h6>
                                    <ul class="mb-0 text-secondary">
                                        <li>${t.aprove.important.info1}</li>
                                        <li>${t.aprove.important.info2}</li>
                                        <li>${t.aprove.important.info3}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>        <!-- FAQ Section -->
        <section class="py-5">
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-lg-10">
                        <div class="mb-5 text-center">
                            <h3 class="fw-bold">${t.aprove.faq.title}</h3>
                            <p class="text-secondary">Encontre respostas para as dúvidas mais comuns</p>
                        </div>

                        <div class="row g-4">                            <!-- FAQ Card 1 -->
                            <div class="col-lg-4">
                                <div class="card h-100 border-0 shadow-sm">
                                    <div class="card-body p-4">
                                        <div class="d-flex align-items-center mb-3">
                                            ${icons.info}
                                            <div class="ms-3">
                                                <div class="badge bg-primary-subtle text-primary mb-2">FAQ</div>
                                            </div>
                                        </div>
                                        <h5 class="fw-bold mb-3">${t.aprove.faq.q1.question}</h5>
                                        <p class="text-secondary mb-0">${t.aprove.faq.q1.answer}</p>
                                    </div>
                                </div>
                            </div>                            <!-- FAQ Card 2 -->
                            <div class="col-lg-4">
                                <div class="card h-100 border-0 shadow-sm">
                                    <div class="card-body p-4">
                                        <div class="d-flex align-items-center mb-3">
                                            ${icons.info}
                                            <div class="ms-3">
                                                <div class="badge bg-primary-subtle text-primary mb-2">FAQ</div>
                                            </div>
                                        </div>
                                        <h5 class="fw-bold mb-3">${t.aprove.faq.q2.question}</h5>
                                        <p class="text-secondary mb-0">${t.aprove.faq.q2.answer}</p>
                                    </div>
                                </div>
                            </div>                            <!-- FAQ Card 3 -->
                            <div class="col-lg-4">
                                <div class="card h-100 border-0 shadow-sm">
                                    <div class="card-body p-4">
                                        <div class="d-flex align-items-center mb-3">
                                            ${icons.info}
                                            <div class="ms-3">
                                                <div class="badge bg-primary-subtle text-primary mb-2">FAQ</div>
                                            </div>
                                        </div>
                                        <h5 class="fw-bold mb-3">${t.aprove.faq.q3.question}</h5>
                                        <p class="text-secondary mb-0">${t.aprove.faq.q3.answer}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </main>

    ${footer(t, rota)}
    ${scripts}
</body>
</html>
`
}

module.exports = {
    page
}
