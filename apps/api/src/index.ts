import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GET /stats - Returns totals for overview cards
app.get('/api/stats', async (req: Request, res: Response) => {
  try {
    const currentYear = new Date().getFullYear();
    const ytdStart = new Date(currentYear, 0, 1);

    // Total invoices processed
    const totalInvoices = await prisma.invoice.count();

    // Total documents uploaded
    const totalDocuments = await prisma.document.count();

    // Total spend (YTD) - sum of all invoice totals this year
    const invoicesYTD = await prisma.invoice.findMany({
      where: {
        invoiceDate: {
          gte: ytdStart,
        },
      },
      select: {
        invoiceTotal: true,
      },
    });

    const totalSpend = invoicesYTD.reduce(
      (sum, inv) => sum + Math.abs(inv.invoiceTotal || 0),
      0
    );

    // Average invoice value
    const avgInvoiceValue = totalInvoices > 0 ? totalSpend / totalInvoices : 0;

    // Calculate percentage changes (mock data for now)
    const lastMonthInvoices = Math.floor(totalInvoices * 0.94); // simulate 6% increase
    const invoicesChange =
      ((totalInvoices - lastMonthInvoices) / lastMonthInvoices) * 100;

    const lastMonthDocs = Math.floor(totalDocuments * 0.86); // simulate 14% decrease
    const docsChange = ((totalDocuments - lastMonthDocs) / lastMonthDocs) * 100;

    res.json({
      totalSpend: parseFloat(totalSpend.toFixed(2)),
      totalSpendChange: 8.2, // YTD growth percentage
      totalInvoices,
      totalInvoicesChange: parseFloat(invoicesChange.toFixed(2)),
      documentsUploaded: totalDocuments,
      documentsUploadedChange: parseFloat(docsChange.toFixed(2)),
      averageInvoiceValue: parseFloat(avgInvoiceValue.toFixed(2)),
      averageInvoiceValueChange: 12.5,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// GET /api/invoice-trends - Returns monthly invoice count and spend
app.get('/api/invoice-trends', async (req: Request, res: Response) => {
  try {
    // Get all invoices with dates
    const invoices = await prisma.invoice.findMany({
      where: {
        invoiceDate: {
          not: null,
        },
      },
      select: {
        invoiceDate: true,
        invoiceTotal: true,
      },
      orderBy: {
        invoiceDate: 'asc',
      },
    });

    // Group by month
    const monthlyData: {
      [key: string]: { count: number; total: number };
    } = {};

    invoices.forEach((invoice) => {
      if (invoice.invoiceDate) {
        const date = new Date(invoice.invoiceDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { count: 0, total: 0 };
        }

        monthlyData[monthKey].count += 1;
        monthlyData[monthKey].total += Math.abs(invoice.invoiceTotal || 0);
      }
    });

    // Convert to array format
    const trends = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        invoiceCount: data.count,
        totalSpend: parseFloat(data.total.toFixed(2)),
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    res.json(trends);
  } catch (error) {
    console.error('Error fetching invoice trends:', error);
    res.status(500).json({ error: 'Failed to fetch invoice trends' });
  }
});

// GET /api/vendors/top10 - Returns top 10 vendors by spend
app.get('/api/vendors/top10', async (req: Request, res: Response) => {
  try {
    const vendors = await prisma.vendor.findMany({
      include: {
        document: {
          include: {
            invoice: true,
          },
        },
      },
    });

    // Aggregate spending by vendor
    const vendorSpending: { [key: string]: number } = {};

    vendors.forEach((vendor) => {
      const vendorName = vendor.vendorName || 'Unknown Vendor';
      const invoiceTotal = Math.abs(
        vendor.document.invoice?.invoiceTotal || 0
      );

      if (!vendorSpending[vendorName]) {
        vendorSpending[vendorName] = 0;
      }
      vendorSpending[vendorName] += invoiceTotal;
    });

    // Sort and get top 10
    const top10 = Object.entries(vendorSpending)
      .map(([name, total]) => ({
        vendorName: name,
        totalSpend: parseFloat(total.toFixed(2)),
      }))
      .sort((a, b) => b.totalSpend - a.totalSpend)
      .slice(0, 10);

    res.json(top10);
  } catch (error) {
    console.error('Error fetching top vendors:', error);
    res.status(500).json({ error: 'Failed to fetch top vendors' });
  }
});

// GET /api/category-spend - Returns spend grouped by category
app.get('/api/category-spend', async (req: Request, res: Response) => {
  try {
    const lineItems = await prisma.lineItem.findMany({
      select: {
        category: true,
        totalPrice: true,
      },
    });

    // Aggregate by category
    const categorySpending: { [key: string]: number } = {};

    lineItems.forEach((item) => {
      const category = item.category || 'Operations';
      const price = Math.abs(item.totalPrice || 0);

      if (!categorySpending[category]) {
        categorySpending[category] = 0;
      }
      categorySpending[category] += price;
    });

    // Convert to array format
    const categories = Object.entries(categorySpending).map(
      ([category, total]) => ({
        category,
        total: parseFloat(total.toFixed(2)),
      })
    );

    res.json(categories);
  } catch (error) {
    console.error('Error fetching category spending:', error);
    res.status(500).json({ error: 'Failed to fetch category spending' });
  }
});

// GET /api/cash-outflow - Returns expected cash outflow by date range
app.get('/api/cash-outflow', async (req: Request, res: Response) => {
  try {
    const payments = await prisma.payment.findMany({
      where: {
        dueDate: {
          not: null,
        },
      },
      include: {
        document: {
          include: {
            invoice: true,
          },
        },
      },
    });

    // Group by due date ranges
    const now = new Date();
    const ranges = {
      '0-7 days': 0,
      '8-30 days': 0,
      '31-60 days': 0,
      '60+ days': 0,
    };

    payments.forEach((payment) => {
      if (payment.dueDate) {
        const dueDate = new Date(payment.dueDate);
        const daysUntilDue = Math.ceil(
          (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        const amount = Math.abs(
          payment.document.invoice?.invoiceTotal || 0
        );

        if (daysUntilDue <= 7 && daysUntilDue >= 0) {
          ranges['0-7 days'] += amount;
        } else if (daysUntilDue <= 30) {
          ranges['8-30 days'] += amount;
        } else if (daysUntilDue <= 60) {
          ranges['31-60 days'] += amount;
        } else {
          ranges['60+ days'] += amount;
        }
      }
    });

    const outflow = Object.entries(ranges).map(([range, amount]) => ({
      range,
      amount: parseFloat(amount.toFixed(2)),
    }));

    res.json(outflow);
  } catch (error) {
    console.error('Error fetching cash outflow:', error);
    res.status(500).json({ error: 'Failed to fetch cash outflow' });
  }
});

// GET /api/invoices - Returns list of invoices with filters/search
app.get('/api/invoices', async (req: Request, res: Response) => {
  try {
    const { search, status, sortBy = 'invoiceDate', order = 'desc', page = '1', limit = '50' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        {
          invoiceId: {
            contains: search as string,
            mode: 'insensitive',
          },
        },
        {
          document: {
            vendor: {
              vendorName: {
                contains: search as string,
                mode: 'insensitive',
              },
            },
          },
        },
      ];
    }

    if (status) {
      where.document = {
        status: status as string,
      };
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          document: {
            include: {
              vendor: true,
            },
          },
        },
        orderBy: {
          [sortBy as string]: order as 'asc' | 'desc',
        },
        skip,
        take: limitNum,
      }),
      prisma.invoice.count({ where }),
    ]);

    const formattedInvoices = invoices.map((invoice) => ({
      id: invoice.id,
      invoiceId: invoice.invoiceId,
      invoiceDate: invoice.invoiceDate,
      vendorName: invoice.document.vendor?.vendorName || 'Unknown',
      invoiceTotal: Math.abs(invoice.invoiceTotal || 0),
      status: invoice.document.status,
      documentId: invoice.documentId,
    }));

    res.json({
      invoices: formattedInvoices,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// POST /api/chat-with-data - Forwards NL queries to Vanna AI
app.post('/api/chat-with-data', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const vannaBaseUrl = process.env.VANNA_API_BASE_URL || 'http://localhost:8000';

    // Forward to Vanna AI service
    const response = await fetch(`${vannaBaseUrl}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question: query }),
    });

    if (!response.ok) {
      throw new Error(`Vanna AI service error: ${response.statusText}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error in chat-with-data:', error);
    res.status(500).json({
      error: 'Failed to process query',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
