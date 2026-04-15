# Tester uniquement `project-.jsx`

Ce dossier est **indépendant** : pas besoin des dossiers `frontend` ni `backend` du reste du site.

Le composant est importé depuis le fichier parent : **`../project-.jsx`**.

## Commandes

```bash
cd standalone-cv-upload
npm install
npm run dev
```

Ouvre l’URL affichée (souvent **http://localhost:5173**).

Après avoir déposé un CV :

1. **Analyse** — jauge de score + barres de compétences (simulation locale ; un fichier `.txt` affiche un extrait).
2. **Recherche** — champs mots-clés + lieu pour filtrer des offres de démo.

Pour un **vrai** score IA + parsing PDF, il faut le backend + FastAPI (voir le projet principal).
