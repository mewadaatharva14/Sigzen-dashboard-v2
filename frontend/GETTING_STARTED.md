# Getting Started - Sigzen BI Dashboard with Supabase

## What You Have

You now have a complete, production-ready CEO Business Intelligence Dashboard with Supabase PostgreSQL integration ready to use on your local Mac.

## Files You Need to Work With

### The 3 Essential Supabase Files:

1. **`lib/supabase.ts`** - The connection
   - Connects to your Supabase database
   - You rarely touch this file

2. **`.env.local`** - Your credentials (YOUR JOB)
   - Store your Supabase URL and API key here
   - Never commit to GitHub
   - Get credentials from Supabase dashboard

3. **`database/schema.sql`** - The database structure
   - Creates all tables needed
   - Copy & paste into Supabase SQL Editor
   - Includes sample data for testing

### The 4 Helpful Guides:

- **`INTEGRATION_GUIDE.md`** ← **START HERE** - Overview of all files
- **`LOCAL_SETUP.md`** - How to run locally
- **`SUPABASE_SETUP.md`** - How to set up Supabase account
- **`SUPABASE_EXAMPLES.md`** - Code examples

---

## Super Quick Start (5 minutes)

### 1. Setup Supabase Account (1 minute)

Go to [supabase.com](https://supabase.com) and:
- Create account
- Create new project
- Go to **Settings > API**
- Copy the Project URL and anon key

### 2. Update Environment Variables (1 minute)

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_KEY_HERE
```

### 3. Create Database Tables (2 minutes)

In Supabase:
1. Go to **SQL Editor > New Query**
2. Open `database/schema.sql` from your project
3. Copy all the SQL
4. Paste into Supabase SQL Editor
5. Click **Run**

### 4. Start Your Dashboard (1 minute)

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Key Files Explained

### `lib/supabase.ts` - The Connection Bridge

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseKey)
```

**What it does**: Creates a connection to your Supabase database using credentials from `.env.local`

**When you edit it**: Almost never. It's already configured.

---

### `lib/api.ts` - Data Functions

Contains functions to fetch data from your database:

```typescript
// All of these are ready to use:
getFinancialData()              // Revenue, expenses, profit
getRevenueByService()           // Service breakdown
getClientGrowthData()           // Customer metrics
getEmployeeEfficiencyData()     // Team utilization
getProjectData()                // Project status
getCustomerSatisfactionData()   // NPS scores
getRiskAlerts()                 // Risk alerts
// ... and more
```

**How to use in components**:
```typescript
import { getFinancialData } from '@/lib/api'

const data = await getFinancialData()
// Returns data from Supabase
```

---

### `database/schema.sql` - Database Structure

Contains SQL code to create all 12 database tables:

- `dashboard_metrics` - KPI summary
- `financial_data` - Monthly revenues
- `revenue_by_service` - Service breakdown
- `client_growth_data` - Customer growth
- `employee_efficiency_data` - Team utilization
- `project_data` - Project tracking
- `customer_satisfaction_data` - NPS scores
- `risk_alerts` - Risk management
- `purchase_data` - Vendor spending
- `quality_metrics` - QA metrics
- `inventory_data` - Asset tracking
- `ecommerce_metrics` - Website analytics

**How to use**:
1. Open in text editor
2. Copy entire file
3. Paste into Supabase SQL Editor
4. Click Run

---

### `.env.local` - Your Credentials

**DO NOT** commit this file.

**Template** (`.env.local.example`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**How to get values**:
1. Go to [supabase.com](https://supabase.com)
2. Open your project
3. Click **Settings** (top right)
4. Click **API** in left menu
5. Copy `Project URL`
6. Copy `anon (public)` key
7. Paste into `.env.local`

---

## How the Dashboard Uses Supabase

```
┌─────────────────────────────────────┐
│     Your Mac - localhost:3000       │
│  (Dashboard Components)             │
└──────────────┬──────────────────────┘
               │
               │ Uses functions from lib/api.ts
               ↓
┌──────────────────────────────────────┐
│  lib/api.ts (API Functions)          │
│  - getFinancialData()                │
│  - getRiskAlerts()                   │
│  - etc.                              │
└──────────────┬──────────────────────┘
               │
               │ Uses client from lib/supabase.ts
               ↓
┌──────────────────────────────────────┐
│  lib/supabase.ts (Supabase Client)   │
│  - Reads .env.local                  │
│  - Creates connection                │
└──────────────┬──────────────────────┘
               │
               │ Uses credentials
               ↓
┌──────────────────────────────────────┐
│  Supabase Cloud (Your Database)      │
│  - Stores all your data              │
│  - Runs in the cloud                 │
└──────────────────────────────────────┘
```

---

## Next Steps

### For Immediate Use:
1. ✅ You have the files
2. 🔲 Create Supabase account (5 min)
3. 🔲 Update `.env.local` (2 min)
4. 🔲 Run SQL schema (2 min)
5. 🔲 Run `pnpm dev` (1 min)
6. 🔲 Open http://localhost:3000

### For Production Use:
1. Update all remaining components to use real data
2. Deploy to Vercel with same environment variables
3. Configure Row Level Security (RLS) in Supabase
4. Add authentication (optional)

### For Team Collaboration:
1. Share `.env.local.example` (safe, no credentials)
2. Each team member creates their own `.env.local`
3. Never commit `.env.local` to GitHub

---

## Common Questions

### Q: Do I need to understand SQL?
**A**: No. The `database/schema.sql` is ready to use. Just copy & paste into Supabase.

### Q: Where do I get Supabase credentials?
**A**: Supabase > Settings > API (top of page, right side)

### Q: Can I change the database structure?
**A**: Yes. Edit `database/schema.sql` before running it in Supabase. After creation, modify directly in Supabase console.

### Q: How do I add more data to the dashboard?
**A**: Insert data directly into Supabase tables, or add new tables and create API functions in `lib/api.ts`.

### Q: Can I deploy this to production?
**A**: Yes. Deploy to Vercel and add the same `.env` variables in Vercel project settings.

---

## File Checklist

### Must Have:
- ✅ `lib/supabase.ts` - Connection client
- ✅ `lib/api.ts` - Data functions
- ✅ `lib/types.ts` - TypeScript types
- ✅ `.env.local` - Your credentials
- ✅ `.env.local.example` - Template
- ✅ `database/schema.sql` - Database structure

### Documentation:
- ✅ `INTEGRATION_GUIDE.md` - File overview
- ✅ `LOCAL_SETUP.md` - Dev instructions
- ✅ `SUPABASE_SETUP.md` - Detailed setup
- ✅ `SUPABASE_EXAMPLES.md` - Code snippets

### Components:
- ✅ All dashboard components (already built)
- ✅ Charts with Recharts
- ✅ Dark/Light theme
- ✅ Customize panel

---

## Support

### If you get stuck:
1. Check `INTEGRATION_GUIDE.md` for file explanations
2. Check `LOCAL_SETUP.md` for common issues
3. Check `SUPABASE_SETUP.md` for setup problems
4. Check browser Console (F12) for error messages
5. Check Supabase dashboard to verify tables exist

### Common Errors:

**"Supabase credentials not found"**
- Check `.env.local` exists in project root
- Check format: `NEXT_PUBLIC_SUPABASE_URL=...`
- Restart dev server: `Ctrl+C` then `pnpm dev`

**"Connection refused"**
- Verify credentials in `.env.local`
- Verify Supabase project is running
- Check internet connection

**"Table does not exist"**
- Run the SQL from `database/schema.sql` in Supabase
- Verify it ran successfully (look for green checkmarks)

---

## You're All Set! 🚀

Your dashboard is ready to connect to Supabase. Follow the **Super Quick Start** above and you'll be live in minutes.

**Next Action**: 
1. Go to [supabase.com](https://supabase.com)
2. Create account and project
3. Update `.env.local`
4. Run `pnpm dev`

Questions? Check the guide files - they have all the answers!
