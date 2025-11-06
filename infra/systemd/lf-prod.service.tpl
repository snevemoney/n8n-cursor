[Unit]
Description=LightningFlow Production Stack
After=network-online.target docker.service
Wants=network-online.target docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory={{REPO_DIR}}
Environment=ENV_FILE={{REPO_DIR}}/infra/env/env.production
ExecStart=/usr/bin/env bash -c 'source ${ENV_FILE} && docker compose -f infra/docker/docker-compose.prod.yml up -d'
ExecStop=/usr/bin/env bash -c 'source ${ENV_FILE} && docker compose -f infra/docker/docker-compose.prod.yml down'
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
