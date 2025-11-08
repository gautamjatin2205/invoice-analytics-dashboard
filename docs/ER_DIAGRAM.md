# Database Schema - ER Diagram

## 📊 Entity Relationship Diagram

```
┌──────────────────┐
│    Document      │
├──────────────────┤
│ id (PK)          │
│ documentName     │
│ documentType     │
│ uploadedBy       │
│ uploadedAt       │
│ status           │
│ createdAt        │
│ updatedAt        │
└────────┬─────────┘
         │
         │ 1:1
         │
    ┌────┴──────┬──────────┬──────────┐
    │           │          │          │
    ▼           ▼          ▼          ▼
┌────────┐  ┌─────────┐ ┌─────────┐ ┌──────────┐
│Vendor  │  │Invoice  │ │Payment  │ │LineItem  │
├────────┤  ├─────────┤ ├─────────┤ ├──────────┤
│id (PK) │  │id (PK)  │ │id (PK)  │ │id (PK)   │
│docId(FK)│ │docId(FK)│ │docId(FK)│ │docId(FK) │
│vendor  │  │invId    │ │dueDate  │ │desc      │
│Name    │  │invDate  │ │amtDue   │ │quantity  │
│Address │  │invTotal │ │paidDate │ │unitPrice │
│...     │  │...      │ │...      │ │...       │
└────────┘  └─────────┘ └─────────┘ └──────────┘

         ┌────────────────┐
         │  TaxInfo       │
         ├────────────────┤
         │ id (PK)        │
         │ documentId(FK) │
         │ taxRate        │
         │ taxAmount      │
         │ ...            │
         └────────────────┘

         ┌────────────────┐
         │  BankInfo      │
         ├────────────────┤
         │ id (PK)        │
         │ documentId(FK) │
         │ bankName       │
         │ accountNumber  │
         │ ...            │
         └────────────────┘

         ┌────────────────┐
         │  Metadata      │
         ├────────────────┤
         │ id (PK)        │
         │ documentId(FK) │
         │ extractedAt    │
         │ source         │
         │ ...            │
         └────────────────┘
```

## 📋 Table Definitions

### 1. **Document** (Core Entity)
Central table linking all other entities.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `documentName` | String | Original document filename |
| `documentType` | String | Type (e.g., "invoice") |
| `uploadedBy` | String | User who uploaded |
| `uploadedAt` | DateTime | Upload timestamp |
| `status` | String | Processing status |
| `createdAt` | DateTime | Record creation time |
| `updatedAt` | DateTime | Last update time |

**Relationships:**
- 1:1 with Vendor
- 1:1 with Invoice
- 1:1 with Payment
- 1:Many with LineItem
- 1:1 with TaxInfo
- 1:1 with BankInfo
- 1:1 with Metadata

---

### 2. **Vendor**
Vendor/supplier information.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `documentId` | UUID | Foreign key → Document |
| `vendorName` | String | Vendor name |
| `vendorAddress` | String | Vendor address |
| `vendorEmail` | String | Contact email |
| `vendorPhone` | String | Contact phone |
| `vendorWebsite` | String | Website URL |

**Relationships:**
- Many:1 with Document

---

### 3. **Invoice**
Invoice header information.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `documentId` | UUID | Foreign key → Document |
| `invoiceId` | String | Invoice number |
| `invoiceDate` | DateTime | Invoice date |
| `dueDate` | DateTime | Payment due date |
| `invoiceTotal` | Decimal | Total amount |
| `currency` | String | Currency code |

**Relationships:**
- Many:1 with Document

---

### 4. **Payment**
Payment terms and information.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `documentId` | UUID | Foreign key → Document |
| `dueDate` | DateTime | Payment due date |
| `amountDue` | Decimal | Amount to pay |
| `paidDate` | DateTime | Actual payment date |
| `paidAmount` | Decimal | Amount paid |
| `paymentStatus` | String | Status (pending/paid) |
| `paymentMethod` | String | Payment method |

**Relationships:**
- Many:1 with Document

---

### 5. **LineItem**
Individual invoice line items.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `documentId` | UUID | Foreign key → Document |
| `description` | String | Item description |
| `quantity` | Decimal | Quantity |
| `unitPrice` | Decimal | Price per unit |
| `totalPrice` | Decimal | Line total |
| `category` | String | Item category |

**Relationships:**
- Many:1 with Document

---

### 6. **TaxInfo**
Tax-related information.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `documentId` | UUID | Foreign key → Document |
| `taxRate` | Decimal | Tax percentage |
| `taxAmount` | Decimal | Tax amount |
| `taxType` | String | Tax type |

**Relationships:**
- Many:1 with Document

---

### 7. **BankInfo**
Banking information.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `documentId` | UUID | Foreign key → Document |
| `bankName` | String | Bank name |
| `accountNumber` | String | Account number |
| `routingNumber` | String | Routing number |
| `swiftCode` | String | SWIFT code |

**Relationships:**
- Many:1 with Document

---

### 8. **Metadata**
Document processing metadata.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `documentId` | UUID | Foreign key → Document |
| `extractedAt` | DateTime | Extraction timestamp |
| `source` | String | Data source |
| `confidence` | Decimal | Extraction confidence |
| `version` | String | Schema version |

**Relationships:**
- Many:1 with Document

---

## 🔑 Key Relationships

### Primary Keys
- All tables use UUID as primary key
- Generated using `uuid-ossp` extension in PostgreSQL

### Foreign Keys
- All child tables reference `Document.id`
- Ensures referential integrity
- Cascade delete enabled (when document deleted, all related records deleted)

### Indexes
```sql
-- Document indexes
CREATE INDEX idx_document_status ON Document(status);
CREATE INDEX idx_document_type ON Document(documentType);
CREATE INDEX idx_document_uploaded_at ON Document(uploadedAt);

-- Vendor indexes
CREATE INDEX idx_vendor_name ON Vendor(vendorName);

-- Invoice indexes
CREATE INDEX idx_invoice_date ON Invoice(invoiceDate);
CREATE INDEX idx_invoice_id ON Invoice(invoiceId);

-- Payment indexes
CREATE INDEX idx_payment_due_date ON Payment(dueDate);
CREATE INDEX idx_payment_status ON Payment(paymentStatus);

-- LineItem indexes
CREATE INDEX idx_lineitem_category ON LineItem(category);
```

---

## 📊 Data Flow

### Upload → Processing → Storage

```
1. Upload Document
   ↓
2. Create Document record (status: "processing")
   ↓
3. Extract data from JSON
   ↓
4. Create related records:
   - Vendor
   - Invoice
   - Payment
   - LineItems (multiple)
   - TaxInfo
   - BankInfo
   - Metadata
   ↓
5. Update Document status to "completed"
```

---

## 🎯 Sample Query Patterns

### Get Invoice with all details
```sql
SELECT 
  d.documentName,
  v.vendorName,
  i.invoiceId,
  i.invoiceDate,
  i.invoiceTotal,
  p.dueDate,
  p.paymentStatus
FROM Document d
JOIN Vendor v ON v.documentId = d.id
JOIN Invoice i ON i.documentId = d.id
JOIN Payment p ON p.documentId = d.id
WHERE d.id = 'uuid-here';
```

### Get all line items for an invoice
```sql
SELECT 
  li.description,
  li.quantity,
  li.unitPrice,
  li.totalPrice,
  li.category
FROM LineItem li
WHERE li.documentId = 'uuid-here';
```

### Get vendor spending summary
```sql
SELECT 
  v.vendorName,
  COUNT(DISTINCT d.id) as invoiceCount,
  SUM(i.invoiceTotal) as totalSpend
FROM Vendor v
JOIN Document d ON v.documentId = d.id
JOIN Invoice i ON i.documentId = d.id
GROUP BY v.vendorName
ORDER BY totalSpend DESC;
```

---

## 📈 Database Statistics

| Table | Records | Average Size |
|-------|---------|--------------|
| Document | 50 | ~500 bytes |
| Vendor | 50 | ~300 bytes |
| Invoice | 49 | ~200 bytes |
| Payment | 40+ | ~200 bytes |
| LineItem | 150+ | ~250 bytes |
| TaxInfo | 45+ | ~150 bytes |
| BankInfo | 40+ | ~200 bytes |
| Metadata | 50 | ~150 bytes |

**Total Records:** ~500+  
**Database Size:** ~1-2 MB

---

## 🔐 Security Considerations

1. **Foreign Key Constraints:** Prevent orphaned records
2. **Cascade Deletes:** Maintain referential integrity
3. **Indexes:** Optimize query performance
4. **UUID Primary Keys:** Prevent enumeration attacks
5. **Timestamp Tracking:** Audit trail for all records

---

## 🚀 Schema Evolution

### Current Version: 1.0

**Migration Strategy:**
- Use Prisma migrations for schema changes
- Version control all migration files
- Test migrations in dev environment first
- Backup database before production migrations

**Example Migration:**
```bash
npx prisma migrate dev --name add_new_field
npx prisma migrate deploy  # Production
```

---

## 📝 Notes

- Schema is normalized to 3NF (Third Normal Form)
- All monetary values use Decimal type for precision
- DateTime fields stored in UTC
- All text fields support Unicode
- Soft delete possible by adding `deletedAt` field

---

## 🔗 References

- Prisma Schema: `apps/api/prisma/schema.prisma`
- Seed Script: `apps/api/prisma/seed.ts`
- Source Data: `data/Analytics_Test_Data.json`

---

**Schema Version:** 1.0  
**Last Updated:** November 8, 2025
