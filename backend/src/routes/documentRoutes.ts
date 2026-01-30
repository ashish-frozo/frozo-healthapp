import { Router } from 'express';
import { getDocuments, addDocument, toggleVisitPack, updateDocument, deleteDocument } from '../controllers/documentController';
import { authMiddleware } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Documents
 *   description: Health document management (Prescriptions, Lab results)
 */

/**
 * @swagger
 * /documents:
 *   get:
 *     summary: Get documents for a profile
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: profileId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of documents
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Document'
 */
router.get('/', getDocuments);

/**
 * @swagger
 * /documents:
 *   post:
 *     summary: Upload a new document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [profileId, title, category, date, file]
 *             properties:
 *               profileId: { type: 'string' }
 *               title: { type: 'string' }
 *               category: { type: 'string' }
 *               date: { type: 'string', format: 'date-time' }
 *               tags: { type: 'string', description: 'Comma separated tags' }
 *               file: { type: 'string', format: 'binary' }
 *     responses:
 *       201:
 *         description: Document uploaded successfully
 */
router.post('/', upload.single('file'), addDocument);

/**
 * @swagger
 * /documents/{id}/visit-pack:
 *   patch:
 *     summary: Toggle document inclusion in visit pack
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Visit pack status updated successfully
 */
router.patch('/:id', updateDocument);
router.patch('/:id/visit-pack', toggleVisitPack);
router.delete('/:id', deleteDocument);

export default router;
