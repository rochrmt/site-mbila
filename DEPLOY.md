# Déploiement Mbila sur le VPS Hostinger

Architecture : **un seul routeur Traefik wildcard** → un seul conteneur Next.js.
L'app lit le `Host` de chaque requête et sert le site correspondant au sous-domaine.
Aucune config par client, jamais.

```
resto.mbila.ca ─┐
ecole.mbila.ca ─┼─ DNS wildcard *.mbila.ca ─→ Traefik ─→ conteneur "mbila" ─→ site rendu
n'importe.quoi ─┘    cert wildcard *.mbila.ca (émis une fois, renouvelé tout seul)
```

---

## Étape 0 — Token Hostinger (sur hPanel, pas le VPS)

hPanel → **Dev Tools → API → Generate Token** → nom `traefik-dns` → copier le token
(il n'est affiché qu'une fois). Il permet à Traefik de créer les TXT `_acme-challenge`
pour prouver à Let's Encrypt que tu possèdes `mbila.ca`.

## Étape 1 — Ajouter le DNS-01 au Traefik existant (resolver séparé)

⚠️ **Ne touche pas le resolver `letsencrypt` existant** (HTTP-01) : il sert
`mbila.pro` et tes autres apps — le basculer en DNS-01 Hostinger casserait leurs
certificats si leur zone n'est pas sur ce compte.

Ajoute un **deuxième resolver** `letsencrypt-dns`, réservé à `mbila.ca`, dans le
`command:` de `/opt/traefik/docker-compose.yml` :

```yaml
command:
  # ── existant, inchangé ──
  - --certificatesresolvers.letsencrypt.acme.httpchallenge=true
  - --certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web
  - --certificatesresolvers.letsencrypt.acme.email=rochrmt@gmail.com
  - --certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json
  # ── NOUVEAU : DNS-01 Hostinger, uniquement pour mbila.ca ──
  - --certificatesresolvers.letsencrypt-dns.acme.dnschallenge.provider=hostinger
  - --certificatesresolvers.letsencrypt-dns.acme.dnschallenge.delaybeforecheck=10
  - --certificatesresolvers.letsencrypt-dns.acme.email=rochrmt@gmail.com
  - --certificatesresolvers.letsencrypt-dns.acme.storage=/letsencrypt/acme.json
```

Et dans `environment:` du service traefik :

```yaml
- HOSTINGER_API_TOKEN=colle_ton_token_ici
```

Le routeur `mbila` (labels du docker-compose de l'app) utilise `letsencrypt-dns` ;
les domaines clients personnalisés écrits par l'app restent sur `letsencrypt` (HTTP-01).

```bash
docker compose up -d    # dans /opt/traefik
docker logs -f traefik  # "unrecognized DNS provider" = Traefik trop vieux → image traefik:v3
```

**Option prudence** : pour le premier test, ajoute
`--certificatesresolvers.letsencrypt-dns.acme.caserver=https://acme-staging-v02.api.letsencrypt.org/directory`
(certificat de test, pas de rate-limit). Quand tout passe : retire la ligne et
`up -d` → le vrai cert wildcard se génère (pas besoin de supprimer acme.json, les
deux resolvers ont des entrées séparées).

## Étape 2 — Déployer l'app

```bash
mkdir -p /opt/mbila && cd /opt/mbila
# copier le projet (git clone ou scp)
docker compose up -d --build
docker logs -f traefik   # tu verras le challenge DNS-01 pour *.mbila.ca (~1 min)
```

Le `docker-compose.yml` du repo se branche sur ton réseau `traefik-proxy` existant
et réutilise ton resolver `letsencrypt` + tes middlewares `gzip@file` et
`security-headers@file`. Le volume `mbila-data` contient la base SQLite et les uploads.

**`.env` obligatoire** (à côté du `docker-compose.yml`, voir `.env.example`) :

```bash
ADMIN_EMAILS=toi@mbila.ca            # accès /admin — plusieurs emails : virgules
SMTP_USER=mbilaservice@gmail.com     # emails de vérification de compte + alertes
SMTP_PASS=mot-de-passe-application   # mot de passe d'application Google
MAIL_TO=mbilaservice@gmail.com
```

Sans `SMTP_*`, les clients ne reçoivent pas leur email d'activation (le compte reste
bloqué sur « Confirmez votre email ») et l'admin n'est pas alerté des demandes.

**Paiement en ligne Chariow (optionnel)** — si tu veux l'activation automatique après
paiement OM/MoMo/carte en plus du transfert manuel :

```bash
CHARIOW_API_KEY=sk_live_…        # Chariow → Développeurs → API keys
CHARIOW_PULSE_SECRET=whsec_…     # secret affiché à la création du pulse (étape ci-dessous)
CHARIOW_PRODUCTS={"essentiel:1":{"id":"prd_…","price":XXXX}}
```

Puis dans le dashboard Chariow : **Automatisation → Pulses → Créer** :

- URL : `https://mbila.ca/api/pulse`
- Événements : `successful.sale` (+ `failed.sale`, `abandoned.sale`)
- Secret de signature affiché → `CHARIOW_PULSE_SECRET` dans `.env`

Le Pulse notifie `successful.sale` signé → le site du client passe en ligne tout seul.
`ROOT_DOMAIN` est déjà `mbila.ca` dans le compose → les liens retour après paiement
(`redirect_url`) pointent automatiquement sur `https://mbila.ca/payer/…`.

Puis connecte-toi : un lien **Admin** apparaît dans le header du dashboard et
`/admin` devient accessible (modèles, images, stats).

## Étape 3 — Vérifier

```bash
curl https://mbila.ca                 # landing du SaaS
curl https://test123.mbila.ca         # 404 joli = tout marche (site inexistant)
# navigateur : cadenas valide, certificat *.mbila.ca
```

---

## Après — plus rien à faire, jamais

| Quand un client publie son site | Ce qui se passe |
|---|---|
| DNS | Rien — le wildcard `*.mbila.ca` couvre tout |
| Certificat | Rien — le cert wildcard est déjà émis, renouvelé par Traefik |
| Traefik | Rien — le router wildcard envoie tout à l'app |
| Publication | Une ligne en base → le site est en ligne instantanément |

## Dépannage rapide

| Symptôme | Cause probable |
|---|---|
| `unrecognized DNS provider: hostinger` | Image Traefik trop vieille → `traefik:v3` |
| Challenge échoue / timeout ACME | Token Hostinger invalide ou scope insuffisant |
| `DNS:4008` dans les logs | Record en conflit dans la zone Hostinger |
| Site en 404 alors qu'il existe | `Host` non wildcard : vérifier le label `HostRegexp` (syntaxe v3 = regex pure, `{x:...}` = v2) |
| Cert autosigné | Tu es encore sur le caserver staging |

---

## Domaines personnalisés clients (optionnel, à faire une fois)

Pour servir `client.com` sur un site Mbila (bouton « Activer » dans `/admin/hebergement`) :

### Sur le VPS — Traefik

```bash
mkdir -p /opt/traefik/dynamic/domains
```

Dans `/opt/traefik/docker-compose.yml`, remplacer le provider fichier unique par un dossier surveillé :

```yaml
command:
  - "--providers.file.directory=/dynamic"      # au lieu de --providers.file.filename=/dynamic/dynamic.yml
  - "--providers.file.watch=true"
```

`docker compose up -d` dans `/opt/traefik` — Traefik recharge à chaud chaque nouveau `.yml`.

### Dans `docker-compose.yml` de Mbila (déjà en place)

- Volume `/opt/traefik/dynamic/domains:/dynamic-domains` + env `TRAEFIK_DOMAINS_DIR`
- Optionnel : `HOSTINGER_API_TOKEN` (même token que le DNS-01) + `VPS_PUBLIC_IP` → l'app crée elle-même l'enregistrement `A` quand le domaine est sur ton compte Hostinger. Sans token : tu tapes les 2 lignes DNS à la main après l'achat.

### Flow

Client demande son domaine → `/admin/hebergement` → « Activer » → l'app écrit `domains/<domaine>.yml` (routeur `Host` → service `mbila@docker`, certResolver letsencrypt) → cert Let's Encrypt auto au premier hit (HTTP-01) → le site répond sur le domaine + `slug.mbila.ca` reste actif.
