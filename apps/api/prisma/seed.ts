import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface JSONData {
  _id: string;
  name: string;
  filePath: string;
  fileSize: { $numberLong: string };
  fileType: string;
  status: string;
  organizationId: string;
  departmentId: string;
  createdAt: { $date: string };
  updatedAt: { $date: string };
  metadata?: any;
  isValidatedByHuman: boolean;
  uploadedById: string;
  assignedToId?: string;
  assignedAt?: { $date: string };
  extractedData?: any;
  processedAt?: { $date: string };
  validatedData?: any;
  analyticsId?: string;
}

// Helper function to determine category from description
function categorizeItem(description: string): string {
  const desc = description?.toLowerCase() || '';
  if (desc.includes('marketing') || desc.includes('advertising')) return 'Marketing';
  if (desc.includes('facility') || desc.includes('facilities') || desc.includes('rent')) return 'Facilities';
  return 'Operations';
}

async function main() {
  console.log('🌱 Starting database seed...');

  // Read the JSON file
  const dataPath = path.join(process.cwd(), '../../Analytics_Test_Data.json');
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const data: JSONData[] = JSON.parse(rawData);

  console.log(`📊 Found ${data.length} documents to process`);

  // Clear existing data
  console.log('🧹 Clearing existing data...');
  await prisma.lineItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.document.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();
  await prisma.organization.deleteMany();

  // Collect unique organizations, departments, and users
  const organizations = new Set<string>();
  const departments = new Set<string>();
  const users = new Set<string>();

  data.forEach((doc) => {
    organizations.add(doc.organizationId);
    departments.add(doc.departmentId);
    users.add(doc.uploadedById);
    if (doc.assignedToId) users.add(doc.assignedToId);
  });

  // Create organizations
  console.log(`📦 Creating ${organizations.size} organizations...`);
  for (const orgId of organizations) {
    await prisma.organization.create({
      data: {
        id: orgId,
        name: `Organization ${orgId.slice(0, 8)}`,
      },
    });
  }

  // Create departments
  console.log(`🏢 Creating ${departments.size} departments...`);
  for (const deptId of departments) {
    const orgId = Array.from(organizations)[0]; // Assign all to first org for simplicity
    await prisma.department.create({
      data: {
        id: deptId,
        name: `Department ${deptId.slice(0, 8)}`,
        organizationId: orgId,
      },
    });
  }

  // Create users
  console.log(`👥 Creating ${users.size} users...`);
  let emailIndex = 0;
  
  for (const userId of users) {
    const orgId = Array.from(organizations)[0];
    await prisma.user.create({
      data: {
        id: userId,
        email: `user_${userId.slice(0, 8)}@example.com`,
        name: `User ${userId.slice(0, 8)}`,
        organizationId: orgId,
      },
    });
    emailIndex++;
  }

  // Create documents and related data
  console.log('📄 Creating documents and related data...');
  let processedCount = 0;

  for (const doc of data) {
    try {
      // Create document
      const document = await prisma.document.create({
        data: {
          id: doc._id,
          name: doc.name,
          filePath: doc.filePath,
          fileSize: BigInt(doc.fileSize.$numberLong),
          fileType: doc.fileType,
          status: doc.status,
          organizationId: doc.organizationId,
          departmentId: doc.departmentId,
          uploadedById: doc.uploadedById,
          assignedToId: doc.assignedToId || null,
          assignedAt: doc.assignedAt ? new Date(doc.assignedAt.$date) : null,
          isValidatedByHuman: doc.isValidatedByHuman,
          processedAt: doc.processedAt ? new Date(doc.processedAt.$date) : null,
          createdAt: new Date(doc.createdAt.$date),
          updatedAt: new Date(doc.updatedAt.$date),
          analyticsId: doc.analyticsId || null,
        },
      });

      // Create invoice if extractedData exists
      if (doc.extractedData?.llmData?.invoice) {
        const invoiceData = doc.extractedData.llmData.invoice.value;
        const summaryData = doc.extractedData.llmData.summary?.value;

        await prisma.invoice.create({
          data: {
            documentId: document.id,
            invoiceId: invoiceData.invoiceId?.value || null,
            invoiceDate: invoiceData.invoiceDate?.value
              ? new Date(invoiceData.invoiceDate.value)
              : null,
            deliveryDate: invoiceData.deliveryDate?.value
              ? new Date(invoiceData.deliveryDate.value)
              : null,
            subTotal: summaryData?.subTotal?.value || null,
            totalTax: summaryData?.totalTax?.value || null,
            invoiceTotal: summaryData?.invoiceTotal?.value || null,
            currencySymbol: summaryData?.currencySymbol?.value || 'EUR',
            documentType: summaryData?.documentType?.value || 'Invoice',
          },
        });
      }

      // Create vendor if exists
      if (doc.extractedData?.llmData?.vendor) {
        const vendorData = doc.extractedData.llmData.vendor.value;

        await prisma.vendor.create({
          data: {
            documentId: document.id,
            vendorName: vendorData.vendorName?.value || null,
            vendorPartyNumber: vendorData.vendorPartyNumber?.value || null,
            vendorAddress: vendorData.vendorAddress?.value || null,
            vendorTaxId: vendorData.vendorTaxId?.value || null,
          },
        });
      }

      // Create customer if exists
      if (doc.extractedData?.llmData?.customer) {
        const customerData = doc.extractedData.llmData.customer.value;

        await prisma.customer.create({
          data: {
            documentId: document.id,
            customerName: customerData.customerName?.value || null,
            customerAddress: customerData.customerAddress?.value || null,
          },
        });
      }

      // Create payment if exists
      if (doc.extractedData?.llmData?.payment) {
        const paymentData = doc.extractedData.llmData.payment.value;

        await prisma.payment.create({
          data: {
            documentId: document.id,
            dueDate: paymentData.dueDate?.value
              ? new Date(paymentData.dueDate.value)
              : null,
            paymentTerms: paymentData.paymentTerms?.value || null,
            bankAccountNumber: paymentData.bankAccountNumber?.value || null,
            bic: paymentData.BIC?.value || null,
            accountName: paymentData.accountName?.value || null,
            netDays: paymentData.netDays?.value || null,
            discountPercentage: paymentData.discountPercentage?.value || null,
            discountDays: paymentData.discountDays?.value || null,
            discountDueDate: paymentData.discountDueDate?.value
              ? new Date(paymentData.discountDueDate.value)
              : null,
            discountedTotal: paymentData.discountedTotal?.value || null,
          },
        });
      }

      // Create line items if exists
      if (doc.extractedData?.llmData?.lineItems?.value?.items?.value) {
        const items = doc.extractedData.llmData.lineItems.value.items.value;

        for (const item of items) {
          const description = item.description?.value || '';
          await prisma.lineItem.create({
            data: {
              documentId: document.id,
              srNo: item.srNo?.value || null,
              description,
              quantity: item.quantity?.value || null,
              unitPrice: item.unitPrice?.value || null,
              totalPrice: item.totalPrice?.value || null,
              category: categorizeItem(description),
            },
          });
        }
      }

      processedCount++;
      if (processedCount % 10 === 0) {
        console.log(`  ✅ Processed ${processedCount}/${data.length} documents`);
      }
    } catch (error) {
      console.error(`  ❌ Error processing document ${doc._id}:`, error);
    }
  }

  console.log(`✨ Successfully seeded ${processedCount} documents!`);
  console.log('📊 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
