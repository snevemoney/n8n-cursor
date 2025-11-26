{$PRIMARY_DOMAIN} {
    encode gzip

    # If you deploy a static Next.js export, serve it here
    root * /var/www/lightningflow
    file_server

    handle_path /api/* {
        reverse_proxy {$API_UPSTREAM}
    }
    handle_path /logs/* {
        reverse_proxy {$LOGS_UPSTREAM}
    }
    handle_path /ide/* {
        reverse_proxy {$IDE_UPSTREAM}
    }
}

www.{$PRIMARY_DOMAIN} {
    redir https://{$PRIMARY_DOMAIN}{uri}
}

# n8n (production)
n8ncloud.tech {
    encode gzip
    # Optional: increase body size for large file uploads
    @large {
        path /webhook/* /webhook-test/* /rest/*
    }
    reverse_proxy 127.0.0.1:5679 {
        flush_interval -1
    }
}
