# Déploiement Mbila sur le VPS Hostinger
ver » → l'app écrit `domains/<domaine>.yml` (routeur `Host` → service `mbila@docker`, certResolver letsencrypt) → cert Let's Encrypt auto au premier hit (HTTP-01) → le site répond sur le domaine + `slug.mbila.ca` reste actif.
