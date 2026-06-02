# Backend Implementation Guide - Results Delete Functionality

## Overview
This guide provides the exact backend implementation required to support the frontend delete functionality for Results management. The frontend now supports single and bulk result deletion with comprehensive delete confirmation.

---

## 1. API ENDPOINTS

### 1.1 Delete Single Result
**Endpoint:** `DELETE /admin/results/:resultId`

**Request:**
```
DELETE /admin/results/{resultId}
Authorization: Bearer {token}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Result deleted successfully",
  "deletedResult": {
    "id": "uuid",
    "studentId": "uuid",
    "departmentId": "uuid"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Result not found" // or appropriate error
}
```

**HTTP Status Codes:**
- `200 OK` - Successfully deleted
- `403 Forbidden` - Admin not authorized
- `404 Not Found` - Result doesn't exist
- `500 Internal Server Error` - Server error

---

### 1.2 Delete Multiple Results (Bulk)
**Endpoint:** `POST /admin/results/bulk-delete`

**Request:**
```json
{
  "resultIds": ["uuid1", "uuid2", "uuid3"]
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "3 results deleted successfully",
  "deletedCount": 3,
  "failedIds": []
}
```

**Response (Partial Success - 207):**
```json
{
  "success": true,
  "message": "2 of 3 results deleted",
  "deletedCount": 2,
  "failedIds": [
    {
      "id": "uuid3",
      "error": "Result not found"
    }
  ]
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "error": "Invalid request - resultIds must be an array"
}
```

---

## 2. DATABASE OPERATIONS (Cascade Delete)

### 2.1 Related Tables to Delete/Update

When deleting a result, the following operations must occur:

#### a) Result Items
**Table:** `ResultItems` or `result_items`
**Operation:** DELETE all items where `resultId = :resultId`
**Reason:** Result items are directly tied to a result and cannot exist independently

```sql
DELETE FROM result_items WHERE result_id = ?
```

#### b) Edit Logs
**Table:** `ResultEditLogs` or `result_edit_logs`
**Operation:** DELETE all logs where `resultId = :resultId`
**Reason:** Edit history is tied to the specific result

```sql
DELETE FROM result_edit_logs WHERE result_id = ?
```

#### c) Related References (Check if applicable)
- **Student Results Reference:** Update count if tracking total results per student
- **Result Notifications:** DELETE any notifications related to this result
- **Result Audit Trail:** Archive if auditing is required (soft delete option)

### 2.2 Data Integrity Considerations

**Option A: Hard Delete (Recommended for standard operations)**
```
Delete directly from database
- Fastest performance
- Use when audit logs are not critical
- No recovery possible
```

**Option B: Soft Delete (Recommended for audit compliance)**
```
UPDATE results SET deleted_at = NOW(), is_deleted = 1 WHERE id = ?
UPDATE result_items SET deleted_at = NOW() WHERE result_id = ?
UPDATE result_edit_logs SET deleted_at = NOW() WHERE result_id = ?
```
Benefits: Maintains audit trail, allows recovery, respects referential integrity

---

## 3. CONTROLLER IMPLEMENTATION

### 3.1 Delete Single Result Controller

```javascript
// ResultsController.js or results.controller.js

export const deleteResult = async (req, res) => {
  try {
    const { resultId } = req.params;
    const adminId = req.user?.id; // From auth middleware

    // Validation
    if (!resultId) {
      return res.status(400).json({
        success: false,
        error: "Result ID is required"
      });
    }

    // Check authorization (admin must own this result or be super admin)
    const result = await Result.findById(resultId);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: "Result not found"
      });
    }

    // Optional: Check if result belongs to admin's school/institution
    if (result.adminId !== adminId && !req.user.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        error: "You are not authorized to delete this result"
      });
    }

    // Begin transaction for data consistency
    const transaction = await db.transaction();

    try {
      // Delete result items first (foreign key constraint)
      await ResultItem.destroy({
        where: { resultId },
        transaction
      });

      // Delete edit logs
      await ResultEditLog.destroy({
        where: { resultId },
        transaction
      });

      // Delete any notifications related to this result
      await Notification.destroy({
        where: { resultId },
        transaction
      });

      // Delete the result itself
      await Result.destroy({
        where: { id: resultId },
        transaction
      });

      // Commit transaction
      await transaction.commit();

      // Log this action for audit
      await AuditLog.create({
        action: "DELETE_RESULT",
        adminId,
        resultId,
        timestamp: new Date(),
        metadata: {
          studentId: result.studentId,
          examId: result.examId
        }
      });

      return res.status(200).json({
        success: true,
        message: "Result deleted successfully",
        deletedResult: {
          id: resultId,
          studentId: result.studentId
        }
      });

    } catch (txError) {
      await transaction.rollback();
      throw txError;
    }

  } catch (error) {
    console.error("Error deleting result:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error - could not delete result"
    });
  }
};
```

### 3.2 Delete Bulk Results Controller

```javascript
export const deleteBulkResults = async (req, res) => {
  try {
    const { resultIds } = req.body;
    const adminId = req.user?.id;

    // Validation
    if (!Array.isArray(resultIds) || resultIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: "resultIds must be a non-empty array"
      });
    }

    if (resultIds.length > 500) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete more than 500 results at once"
      });
    }

    // Fetch all results to check authorization
    const results = await Result.findAll({
      where: { id: resultIds }
    });

    // Check authorization for all results
    const unauthorized = results.filter(r => 
      r.adminId !== adminId && !req.user.isSuperAdmin
    );

    if (unauthorized.length > 0) {
      return res.status(403).json({
        success: false,
        error: "You are not authorized to delete some of these results"
      });
    }

    const failedIds = [];
    let deletedCount = 0;

    // Begin transaction
    const transaction = await db.transaction();

    try {
      for (const resultId of resultIds) {
        try {
          // Delete result items
          await ResultItem.destroy({
            where: { resultId },
            transaction
          });

          // Delete edit logs
          await ResultEditLog.destroy({
            where: { resultId },
            transaction
          });

          // Delete notifications
          await Notification.destroy({
            where: { resultId },
            transaction
          });

          // Delete result
          const deleted = await Result.destroy({
            where: { id: resultId },
            transaction
          });

          if (deleted) {
            deletedCount++;
          }

        } catch (itemError) {
          failedIds.push({
            id: resultId,
            error: itemError.message
          });
        }
      }

      await transaction.commit();

      // Log bulk action
      await AuditLog.create({
        action: "DELETE_BULK_RESULTS",
        adminId,
        metadata: {
          totalRequested: resultIds.length,
          deletedCount,
          failedCount: failedIds.length
        }
      });

      // Determine response status
      const statusCode = failedIds.length === 0 ? 200 : 207;

      return res.status(statusCode).json({
        success: true,
        message: `${deletedCount} of ${resultIds.length} results deleted successfully`,
        deletedCount,
        failedIds
      });

    } catch (txError) {
      await transaction.rollback();
      throw txError;
    }

  } catch (error) {
    console.error("Error deleting bulk results:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error - could not delete results"
    });
  }
};
```

---

## 4. ROUTE DEFINITIONS

### 4.1 Express Route Setup

```javascript
// routes/results.routes.js

import { Router } from 'express';
import { verifyToken, verifyAdmin } from '../middleware/auth.middleware.js';
import {
  fetchResults,
  fetchResultDetail,
  updateResult,
  deleteResult,
  deleteBulkResults
} from '../controllers/results.controller.js';

const router = Router();

// Middleware: Apply auth check to all routes
router.use(verifyToken);
router.use(verifyAdmin);

// Existing routes
router.get('/results', fetchResults);
router.get('/results/:resultId', fetchResultDetail);
router.put('/results/:resultId', updateResult);

// New delete routes
router.delete('/results/:resultId', deleteResult);
router.post('/results/bulk-delete', deleteBulkResults);

export default router;
```

---

## 5. ERROR HANDLING & VALIDATION

### 5.1 Input Validation Middleware

```javascript
export const validateDeleteRequest = (req, res, next) => {
  const { resultId } = req.params;
  const { resultIds } = req.body;

  if (resultId && !/^[a-f0-9-]{36}$/.test(resultId)) {
    return res.status(400).json({
      success: false,
      error: "Invalid result ID format"
    });
  }

  if (resultIds) {
    if (!Array.isArray(resultIds)) {
      return res.status(400).json({
        success: false,
        error: "resultIds must be an array"
      });
    }

    if (resultIds.some(id => !/^[a-f0-9-]{36}$/.test(id))) {
      return res.status(400).json({
        success: false,
        error: "Invalid result ID format in array"
      });
    }
  }

  next();
};

// Apply middleware to routes
router.delete('/results/:resultId', validateDeleteRequest, deleteResult);
router.post('/results/bulk-delete', validateDeleteRequest, deleteBulkResults);
```

### 5.2 Authorization Middleware

```javascript
export const checkResultOwnership = async (req, res, next) => {
  try {
    const { resultId } = req.params;
    const adminId = req.user?.id;

    const result = await Result.findByPk(resultId);

    if (!result) {
      return res.status(404).json({
        success: false,
        error: "Result not found"
      });
    }

    // Check ownership or super admin status
    if (result.adminId !== adminId && !req.user.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized access to this result"
      });
    }

    // Attach result to request for use in controller
    req.resultData = result;
    next();

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Authorization check failed"
    });
  }
};
```

---

## 6. TESTING CHECKLIST

### 6.1 Unit Tests

```javascript
describe('DELETE /admin/results/:resultId', () => {
  test('Should delete a result and cascade to related records', async () => {
    // Create test data
    const result = await Result.create({ /* ... */ });
    const resultItems = await ResultItem.create({ resultId: result.id });

    // Delete
    const response = await request(app)
      .delete(`/admin/results/${result.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    // Verify cascade delete
    const deletedResult = await Result.findByPk(result.id);
    const deletedItems = await ResultItem.findAll({ where: { resultId: result.id } });

    expect(deletedResult).toBeNull();
    expect(deletedItems.length).toBe(0);
  });

  test('Should return 404 if result does not exist', async () => {
    const response = await request(app)
      .delete('/admin/results/nonexistent-id')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
  });

  test('Should return 403 if admin is not authorized', async () => {
    // Create result with different admin
    const result = await Result.create({ adminId: 'other-admin-id' });

    const response = await request(app)
      .delete(`/admin/results/${result.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
  });
});

describe('POST /admin/results/bulk-delete', () => {
  test('Should delete multiple results', async () => {
    const results = await Result.bulkCreate([
      { /* ... */ },
      { /* ... */ },
      { /* ... */ }
    ]);

    const response = await request(app)
      .post('/admin/results/bulk-delete')
      .set('Authorization', `Bearer ${token}`)
      .send({ resultIds: results.map(r => r.id) });

    expect(response.status).toBe(200);
    expect(response.body.deletedCount).toBe(3);
  });

  test('Should handle partial failures', async () => {
    const validId = (await Result.create({ /* ... */ })).id;
    const invalidId = 'nonexistent-id';

    const response = await request(app)
      .post('/admin/results/bulk-delete')
      .set('Authorization', `Bearer ${token}`)
      .send({ resultIds: [validId, invalidId] });

    expect(response.status).toBe(207); // Multi-status
    expect(response.body.deletedCount).toBe(1);
    expect(response.body.failedIds.length).toBe(1);
  });
});
```

### 6.2 Integration Tests

- Test cascade deletion with multiple result items
- Test audit log creation
- Test transaction rollback on error
- Test authorization checks
- Test concurrent deletion requests

---

## 7. DATABASE SCHEMA (Reference)

### Results Table
```sql
CREATE TABLE results (
  id VARCHAR(36) PRIMARY KEY,
  student_id VARCHAR(36) NOT NULL,
  department_id VARCHAR(36),
  class_id VARCHAR(36),
  year_id VARCHAR(36),
  exam_id VARCHAR(36),
  admin_id VARCHAR(36) NOT NULL,
  courses_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  -- Optional: For soft delete
  deleted_at TIMESTAMP NULL,
  is_deleted BOOLEAN DEFAULT FALSE
);
```

### Result Items Table
```sql
CREATE TABLE result_items (
  id VARCHAR(36) PRIMARY KEY,
  result_id VARCHAR(36) NOT NULL,
  course_code VARCHAR(50),
  course_title VARCHAR(255),
  score DECIMAL(5,2),
  grade VARCHAR(2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (result_id) REFERENCES results(id)
);
```

### Result Edit Logs Table
```sql
CREATE TABLE result_edit_logs (
  id VARCHAR(36) PRIMARY KEY,
  result_id VARCHAR(36) NOT NULL,
  admin_id VARCHAR(36),
  change_type VARCHAR(50),
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (result_id) REFERENCES results(id)
);
```

---

## 8. SECURITY CONSIDERATIONS

### 8.1 Authentication & Authorization
- ✅ Verify JWT token is valid
- ✅ Verify admin owns the result (or is super admin)
- ✅ Check admin permissions/role

### 8.2 Data Validation
- ✅ Validate UUID format for resultIds
- ✅ Validate array size limits (max 500 per request)
- ✅ Sanitize input to prevent injection

### 8.3 Audit Trail
- ✅ Log all delete operations with admin ID and timestamp
- ✅ Include metadata (which results, how many)
- ✅ Support investigation of data loss

### 8.4 Rate Limiting (Recommended)
```javascript
import rateLimit from 'express-rate-limit';

const deleteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  message: 'Too many delete requests, please try again later'
});

router.delete('/results/:resultId', deleteLimiter, deleteResult);
router.post('/results/bulk-delete', deleteLimiter, deleteBulkResults);
```

---

## 9. DEPLOYMENT CHECKLIST

- [ ] Database migrations for new audit logs table (if not exists)
- [ ] Add indexes on resultId in related tables for faster cascade deletes
- [ ] Set up database backups before enabling delete functionality
- [ ] Test delete operations in staging environment
- [ ] Monitor delete API performance
- [ ] Verify audit logs are being created
- [ ] Set up alerts for bulk deletes > 50 results
- [ ] Document rollback procedure if issues arise
- [ ] Train admins on delete functionality

---

## 10. PERFORMANCE OPTIMIZATION

### 10.1 Index Strategy
```sql
-- Add indexes for faster cascade deletes
CREATE INDEX idx_result_items_result_id ON result_items(result_id);
CREATE INDEX idx_result_edit_logs_result_id ON result_edit_logs(result_id);
CREATE INDEX idx_results_admin_id ON results(admin_id);
CREATE INDEX idx_results_created_at ON results(created_at);
```

### 10.2 Query Optimization
- Use bulk delete operations
- Consider using stored procedures for cascade deletes
- Cache frequently accessed data
- Monitor slow query logs

---

## 11. MONITORING & LOGGING

### 11.1 Log Levels
```javascript
logger.info(`Delete request received for result: ${resultId}`);
logger.debug(`Checking authorization for admin: ${adminId}`);
logger.warn(`Failed delete attempt - unauthorized: ${resultId}`);
logger.error(`Database error during cascade delete: ${error.message}`);
```

### 11.2 Metrics to Track
- Total deletes per day/week
- Failed delete attempts
- Average deletion time
- Cascade delete impact (items deleted)
- Authorization failures

---

## 12. ROLLBACK PROCEDURE

If issues arise after deployment:

1. **Disable delete endpoints temporarily**
   ```javascript
   router.delete('/results/:resultId', (req, res) => {
     res.status(503).json({
       success: false,
       error: "Delete functionality temporarily disabled"
     });
   });
   ```

2. **Restore from backup** if data loss occurred

3. **Review audit logs** to identify affected records

4. **Contact affected admins** to verify data integrity

5. **Re-enable after fixes** and thorough testing

---

## Summary

This implementation provides:
- ✅ Secure single and bulk result deletion
- ✅ Cascade delete of related records
- ✅ Full audit trail
- ✅ Transaction support for data consistency
- ✅ Comprehensive error handling
- ✅ Authorization checks
- ✅ Performance optimization
- ✅ Testing strategies

All frontend delete requests will be handled correctly with this backend implementation.
