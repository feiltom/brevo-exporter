

import { createServer, IncomingMessage, ServerResponse } from 'http';

import config from './config/config';

const getBrevoAccountMetrics = async () => {
    const response = await fetch('https://api.brevo.com/v3/account', {
        method: 'GET',
        cache: 'no-cache',
        headers: {
            'api-key': config.brevoApiKey as string
        }
    });

    const jsonData = await response.json() as any;

    console.log(jsonData);

    let plans = jsonData.plan.filter((plan: any) => {
        return plan.creditsType == 'sendLimit';
    })

    let metric = '';

    metric += '# TYPE brevo_credits gauge\n';
    metric += '# HELP brevo_credits Number of credits remaining in the Brevo account per plan\n';

    plans.forEach((plan: any) => metric += `brevo_credits{type="${plan.type}"} ${plan.credits}\n`);

    // mail metrics
    const responseStats = await fetch('https://api.brevo.com/v3/smtp/statistics/reports?days=1', {
        method: 'GET',
        cache: 'no-cache',
        headers: {
            'api-key': config.brevoApiKey as string
        }
    });

    const jsonDataStats = await responseStats.json() as any;

    console.log(jsonDataStats.reports[0]);

    /*    
        let plans = jsonData.plan.filter((plan) => {
            return plan.creditsType == 'sendLimit';
        })
    
        metric += '# TYPE brevo_credits gauge\n';
        metric += '# HELP brevo_credits Number of credits remaining in the Brevo account per plan\n';
    
        plans.forEach(plan => {
            metric += `brevo_credits{type="${plan.type}"} ${plan.credits}\n`;
        });
    */

    metric += `# TYPE brevo_stats gauge\n`;

    const stats = jsonDataStats.reports[0];

    for (const attributename in stats) {
        if (attributename != 'date') {
            console.log(attributename + ": " + stats[attributename]);

            metric += `brevo_stats{type="${attributename}"} ${stats[attributename]}\n`;
        }
    }

    return metric;
}

const requestHandler = async (request: IncomingMessage, response: ServerResponse) => {
    switch (request.url) {
        case '/metrics':
            response.writeHead(200, {
                'Content-Type': 'text/plain',
                'Cache-Control': 'no-cache'
            });

            response.write(await getBrevoAccountMetrics());
            response.end();
            break;
        default:
            response.end('<a href="/metrics">Metrics</a>');
            break;
    }
};

(async () => {
    if (!process.env.BREVO_API_KEY) {
        console.error('BREVO_API_KEY environment variable is not set');
        process.exit(1);
    }

    const server = createServer((req, res) => void requestHandler(req, res));

    server.once('error', (err) => {
        console.error('Error starting webserver', err);
        process.exit(1);
    });

    server.listen(config.appPort, () => {
        console.log(`Webserver is listening on http://localhost:${config.appPort}`);
    });
})();

