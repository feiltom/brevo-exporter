# brevo-exporter

Simple exporter to expose metrics from the Brevo (formerly Sendinblue) API

## Rationale

I fork this very simple Prometheus exporter because I wanted to monitor the amount of e-mails sent and store the usage in a TSDB.
fork from https://github.com/lazaroblanc/brevo-exporter

## Usage

If not already present: Generate an API key -> https://app.brevo.com/settings/keys/api

### Docker CLI

```
docker run -e BREVO_API_KEY='your-brevo-api-key' -p 3000:3000 ghcr.io/feiltom/brevo-exporter:latest
```

### docker-compose

```yaml
services:
  server:
    image: ghcr.io/feiltom/brevo-exporter:latest
    environment:
      BREVO_API_KEY: 'your-brevo-api-key'
    ports:
      - 9587:3000
```

### Prometheus config

```yaml
- job_name: "brevo"
  scrape_interval: 5m
  static_configs:
    - targets:
        - localhost:9587 # brevo-exporter
```

## Metrics

| Name          | Description                                               |
|---------------|-----------------------------------------------------------|
| brevo_credits | Number of credits remaining in the Brevo account per plan |
| brevo_stats   | Stats of transactionnal mail                              |
