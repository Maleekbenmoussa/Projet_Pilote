/**
 * Fichier SÉPARÉ du site web (non importé par src/, ignoré par le build React).
 *
 * Test manuel CV + IA :
 * 1. Backend : cd backend && npm run dev   (port 3001)
 * 2. FastAPI : cd ai-service && uvicorn main:app --port 8000
 * 3. Frontend : cd frontend && npm run dev  (port 5173)
 * 4. Ouvrir dans le navigateur :
 *    http://localhost:5173/project-ai-cv.html
 *
 * Cette page HTML envoie login candidat puis POST /api/cv/upload (Multer → PDF → FastAPI /score).
 * L’implémentation est dans : frontend/public/project-ai-cv.html
 */

void 0
