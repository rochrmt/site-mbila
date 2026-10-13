# Produits Chariow à créer — grille Mbila

Règle d'or : **le prix du produit Chariow = ce que le client paie vraiment**.
Le `price` dans `CHARIOW_PRODUCTS` ne sert que pour le libellé du bouton : au moment
du paiement, l'app récupère le prix réel du produit via l'API Chariow. **Tu peux donc
changer un prix dans Chariow sans toucher au .env** — seul l'affichage du bouton
resterait temporairement sur l'ancien prix jusqu'à mise à jour du `price` ici.

Clé d'envoi : `"<plan>:<mois>:<prixMensuel>"` — le prix mensuel distingue les
catégories Essentiel (sans ça, un portfolio paierait le prix d'un cabinet).

Pour chaque produit : **type `license`**, nom + description ci-dessous à copier-coller,
prix en XAF/FCFA, mêmes méthodes de paiement que ton produit test (OM, MoMo, carte…).

---

## 15 produits — nom, prix, description prête à coller

### Essentiel Portfolio (3 000 F/mois) — catégorie `portfolio`

**1.** Nom : `Mbila Essentiel Portfolio — 1 mois` · Prix : **3 000 F** · Clé : `essentiel:1:3000`
> Licence Mbila Essentiel Portfolio valable 1 mois. Publication de votre site sur son adresse .mbila.ca : hébergement, HTTPS, éditeur et messages inclus. Activation automatique après paiement.

**2.** Nom : `Mbila Essentiel Portfolio — 6 mois` · Prix : **16 200 F** · Clé : `essentiel:6:3000`
> Licence Mbila Essentiel Portfolio valable 6 mois (−10 %). Publication de votre site sur son adresse .mbila.ca : hébergement, HTTPS, éditeur et messages inclus. Activation automatique après paiement.

**3.** Nom : `Mbila Essentiel Portfolio — 1 an` · Prix : **30 000 F** · Clé : `essentiel:12:3000`
> Licence Mbila Essentiel Portfolio valable 12 mois (2 mois offerts). Publication de votre site sur son adresse .mbila.ca : hébergement, HTTPS, éditeur et messages inclus. Activation automatique après paiement.

### Essentiel Standard (5 500 F/mois) — boutique, resto, école, salon, sport…

**4.** Nom : `Mbila Essentiel — 1 mois` · Prix : **5 500 F** · Clé : `essentiel:1:5500`
> Licence Mbila Essentiel valable 1 mois. Publication de votre site sur son adresse .mbila.ca : hébergement, HTTPS, éditeur, messages et images inclus. Activation automatique après paiement.

**5.** Nom : `Mbila Essentiel — 6 mois` · Prix : **29 700 F** · Clé : `essentiel:6:5500`
> Licence Mbila Essentiel valable 6 mois (−10 %). Publication de votre site sur son adresse .mbila.ca : hébergement, HTTPS, éditeur, messages et images inclus. Activation automatique après paiement.

**6.** Nom : `Mbila Essentiel — 1 an` · Prix : **55 000 F** · Clé : `essentiel:12:5500`
> Licence Mbila Essentiel valable 12 mois (2 mois offerts). Publication de votre site sur son adresse .mbila.ca : hébergement, HTTPS, éditeur, messages et images inclus. Activation automatique après paiement.

### Essentiel Pro (7 500 F/mois) — cabinets, santé, BTP, immobilier, transport…

**7.** Nom : `Mbila Essentiel Pro — 1 mois` · Prix : **7 500 F** · Clé : `essentiel:1:7500`
> Licence Mbila Essentiel valable 1 mois, tarif activité professionnelle. Publication de votre site sur son adresse .mbila.ca : hébergement, HTTPS, éditeur, messages et images inclus. Activation automatique après paiement.

**8.** Nom : `Mbila Essentiel Pro — 6 mois` · Prix : **40 500 F** · Clé : `essentiel:6:7500`
> Licence Mbila Essentiel valable 6 mois (−10 %), tarif activité professionnelle. Publication de votre site sur son adresse .mbila.ca : hébergement, HTTPS, éditeur, messages et images inclus. Activation automatique après paiement.

**9.** Nom : `Mbila Essentiel Pro — 1 an` · Prix : **75 000 F** · Clé : `essentiel:12:7500`
> Licence Mbila Essentiel valable 12 mois (2 mois offerts), tarif activité professionnelle. Publication de votre site sur son adresse .mbila.ca : hébergement, HTTPS, éditeur, messages et images inclus. Activation automatique après paiement.

### Essentiel Hôtel (8 500 F/mois) — catégorie `hotel`

**10.** Nom : `Mbila Essentiel Hôtel — 1 mois` · Prix : **8 500 F** · Clé : `essentiel:1:8500`
> Licence Mbila Essentiel valable 1 mois, tarif hôtellerie. Publication de votre site sur son adresse .mbila.ca : hébergement, HTTPS, éditeur, messages, images et réservations inclus. Activation automatique après paiement.

**11.** Nom : `Mbila Essentiel Hôtel — 6 mois` · Prix : **45 900 F** · Clé : `essentiel:6:8500`
> Licence Mbila Essentiel valable 6 mois (−10 %), tarif hôtellerie. Publication de votre site sur son adresse .mbila.ca : hébergement, HTTPS, éditeur, messages, images et réservations inclus. Activation automatique après paiement.

**12.** Nom : `Mbila Essentiel Hôtel — 1 an` · Prix : **85 000 F** · Clé : `essentiel:12:8500`
> Licence Mbila Essentiel valable 12 mois (2 mois offerts), tarif hôtellerie. Publication de votre site sur son adresse .mbila.ca : hébergement, HTTPS, éditeur, messages, images et réservations inclus. Activation automatique après paiement.

### Premium (11 500 F/mois — toutes catégories)

**13.** Nom : `Mbila Premium — 1 mois` · Prix : **11 500 F** · Clé : `premium:1`
> Licence Mbila Premium valable 1 mois. Tout l'Essentiel, plus votre propre nom de domaine (ex. votreentreprise.com) acheté et configuré pour vous. Activation automatique après paiement.

**14.** Nom : `Mbila Premium — 6 mois` · Prix : **62 100 F** · Clé : `premium:6`
> Licence Mbila Premium valable 6 mois (−10 %). Tout l'Essentiel, plus votre propre nom de domaine (ex. votreentreprise.com) acheté et configuré pour vous. Activation automatique après paiement.

**15.** Nom : `Mbila Premium — 1 an` · Prix : **115 000 F** · Clé : `premium:12`
> Licence Mbila Premium valable 12 mois (2 mois offerts). Tout l'Essentiel, plus votre propre nom de domaine (ex. votreentreprise.com) acheté et configuré pour vous. Activation automatique après paiement.

---

## `CHARIOW_PRODUCTS` prêt à compléter

Copier dans `.env` (VPS : `/opt/mbila/.env`) — remplacer les `prd_…` par les vrais ids :

```json
{
  "essentiel:1:3000":  { "id": "prd_6hr8fhj2", "price": 3000 },
  "essentiel:6:3000":  { "id": "prd_sw44w33o", "price": 16200 },
  "essentiel:12:3000": { "id": "prd_ybsgitj3", "price": 30000 },
  "essentiel:1:5500":  { "id": "prd_7p3kh2gj", "price": 5500 },
  "essentiel:6:5500":  { "id": "prd_agn57pdi", "price": 29700 },
  "essentiel:12:5500": { "id": "prd_31sja1a7", "price": 55000 },
  "essentiel:1:7500":  { "id": "prd_ni2xkyux", "price": 7500 },
  "essentiel:6:7500":  { "id": "prd_alv2oin5", "price": 40500 },
  "essentiel:12:7500": { "id": "prd_5r9sgfvz", "price": 75000 },
  "essentiel:1:8500":  { "id": "prd_dke0fzm7", "price": 8500 },
  "essentiel:6:8500":  { "id": "prd_r6tu86p6", "price": 45900 },
  "essentiel:12:8500": { "id": "prd_fhcbq3zi", "price": 85000 },
  "premium:1":         { "id": "prd_e7bb83xe", "price": 11500 },
  "premium:6":         { "id": "prd_k2d1lzix", "price": 62100 },
  "premium:12":        { "id": "prd_q7czu3dn", "price": 115000 }
}
```

## Notes importantes

- **Commission Chariow ≈ 15 %** (observée : 97,5 F prélevés sur 650 F) — le client
  paie le montant affiché, mais ta marge réelle = prix − 15 %. À intégrer dans tes
  tarifs si tu veux préserver la marge.
- **Minimum de départ** : tu peux créer seulement les 5 produits les plus vendus
  (les `essentiel:*:5500` + `premium:1` + `essentiel:1:3000`) — les clients des
  catégories sans produit verront simplement le parcours manuel Orange Money.
- **Repli automatique** : si `essentiel:6:7500` n'existe pas, l'app utilise
  `essentiel:6` puis `essentiel` si présents — tu peux donc aussi faire des
  produits génériques par durée.
- L'id produit `prd_7p3kh2gj` (Mbila essentiel, 650 F en test) est déjà mappé sur
  `essentiel:1:5500` — **pense à repasser son prix à 5 500 F** dans Chariow le
  jour J, ou crée un produit séparé.
- Type de produit : **license** (comme ton produit test) — cocher les mêmes
  options de paiement (OM, MoMo, Moov, Wave, carte).
