# Supabase Pricing: Tiered Data Consumption Guide

## Overview

Supabase pricing is based on **base plan cost + overage fees** for exceeding included quotas. All pricing is **per project**, but organization-level quota aggregation is available.

---

## Pricing Tiers & Included Quotas

### **Free Tier** - $0/month

| Resource | Included Quota | Overage Cost |
|----------|---------------|--------------|
| **Database Size** | 500 MB | $0.125/GB/month |
| **File Storage** | 1 GB | $0.021/GB/month |
| **Uncached Egress** | 5 GB/month | $0.09/GB |
| **Cached Egress (CDN)** | 5 GB/month | $0.03/GB |
| **Monthly Active Users (MAU)** | 50,000 | $0.00325/MAU |
| **API Requests** | Unlimited | Free |
| **Compute** | Shared (small) | Included |

**Best For:**
- ✅ Development/testing
- ✅ Small personal projects
- ✅ Low-traffic prototypes
- ✅ < 50K users/month
- ✅ < 500MB database
- ✅ < 1GB file storage

---

### **Pro Tier** - $25/month

| Resource | Included Quota | Overage Cost |
|----------|---------------|--------------|
| **Database Size** | 8 GB | $0.125/GB/month |
| **File Storage** | 100 GB | $0.021/GB/month |
| **Uncached Egress** | 250 GB/month | $0.09/GB |
| **Cached Egress (CDN)** | 250 GB/month | $0.03/GB |
| **Monthly Active Users (MAU)** | 100,000 | $0.00325/MAU |
| **API Requests** | Unlimited | Free |
| **Compute** | Shared (medium) | Included |
| **Daily Backups** | ✅ Included | - |
| **Point-in-Time Recovery (PITR)** | ❌ Add-on | $25/month |

**Best For:**
- ✅ Production apps
- ✅ Small to medium businesses
- ✅ 50K-100K users/month
- ✅ < 8GB database (or small overages)
- ✅ < 100GB file storage
- ✅ < 250GB egress/month

**Additional Add-ons Available:**
- **PITR (Point-in-Time Recovery):** +$25/month
- **Dedicated Compute:** Higher costs (see below)
- **Log Drains:** Varies
- **Custom Domains:** Free
- **SOC2/HIPAA Compliance:** Enterprise tier

---

### **Team Tier** - $599/month

| Resource | Included Quota | Overage Cost |
|----------|---------------|--------------|
| **Database Size** | 8 GB (higher limits available) | $0.125/GB/month |
| **File Storage** | 100 GB (higher limits available) | $0.021/GB/month |
| **Uncached Egress** | 250 GB/month | $0.09/GB |
| **Cached Egress (CDN)** | 250 GB/month | $0.03/GB |
| **Monthly Active Users (MAU)** | 100,000 | $0.00325/MAU |
| **API Requests** | Unlimited | Free |
| **Compute** | Dedicated (better performance) | Included |
| **Daily Backups** | ✅ Included | - |
| **Point-in-Time Recovery (PITR)** | ✅ Included | - |
| **Extended Log Retention** | ✅ Included | - |
| **Team Features** | ✅ Included | - |
| **Priority Support** | ✅ Included | - |

**Best For:**
- ✅ Large teams
- ✅ Enterprise features needed
- ✅ Security compliance (SOC2, etc.)
- ✅ Priority support
- ✅ Extended log retention
- ✅ Similar data needs as Pro, but need team features

---

### **Enterprise Tier** - Custom Pricing

| Feature | Description |
|---------|-------------|
| **Database Size** | Custom limits (unlimited available) |
| **File Storage** | Custom limits (unlimited available) |
| **Compute** | Dedicated instances (any size) |
| **SLA** | 99.99% uptime guarantee |
| **Private Cloud** | Available |
| **Compliance** | HIPAA, SOC2, ISO 27001 |
| **Custom Contracts** | Available |
| **Dedicated Support** | Available |

**Best For:**
- ✅ Large enterprises
- ✅ High-scale applications
- ✅ Compliance requirements
- ✅ Custom needs
- ✅ SLA requirements

---

## Overage Costs (Per Unit)

Once you exceed included quotas, you pay these rates:

### Database Size
- **Overage:** $0.125 per GB per month
- **Example:** If you use 12 GB on Pro (8 GB included), you pay:
  - Base: $25/month
  - Overage: (12 - 8) × $0.125 = $0.50/month
  - **Total: $25.50/month**

### File Storage
- **Overage:** $0.021 per GB per month
- **Example:** If you use 150 GB on Pro (100 GB included), you pay:
  - Overage: (150 - 100) × $0.021 = $1.05/month
  - **Total: $26.05/month** (plus base $25)

### Uncached Egress (Data Transfer Out)
- **Overage:** $0.09 per GB
- **Most expensive overage!** ⚠️
- **Example:** If you serve 400 GB/month on Pro (250 GB included), you pay:
  - Overage: (400 - 250) × $0.09 = $13.50/month
  - **Total: $38.50/month** (plus base $25)

### Cached Egress (CDN Hits)
- **Overage:** $0.03 per GB
- **Cheaper than uncached** ✅
- **Example:** If you serve 500 GB cached/month on Pro (250 GB included), you pay:
  - Overage: (500 - 250) × $0.03 = $7.50/month
  - **Total: $32.50/month** (plus base $25)

### Monthly Active Users (MAU)
- **Overage:** $0.00325 per MAU
- **Example:** If you have 150,000 MAUs on Pro (100,000 included), you pay:
  - Overage: (150,000 - 100,000) × $0.00325 = $162.50/month
  - **Total: $187.50/month** (plus base $25)

---

## Real-World Cost Scenarios

### Scenario 1: Small Admin Panel
**Usage:**
- Database: 2 GB
- File Storage: 5 GB
- Egress: 50 GB/month (cached)
- MAUs: 5,000
- **Plan:** Pro ($25/month)
- **Overage:** None
- **Total Cost: $25/month**

---

### Scenario 2: Growing Business App
**Usage:**
- Database: 15 GB (7 GB over quota)
- File Storage: 200 GB (100 GB over quota)
- Uncached Egress: 400 GB (150 GB over quota)
- Cached Egress: 150 GB (within quota)
- MAUs: 120,000 (20,000 over quota)
- **Plan:** Pro ($25/month)

**Overage Calculations:**
- Database: 7 GB × $0.125 = $0.88/month
- File Storage: 100 GB × $0.021 = $2.10/month
- Uncached Egress: 150 GB × $0.09 = $13.50/month
- MAUs: 20,000 × $0.00325 = $65.00/month
- **Overage Total: $81.48/month**
- **Base Plan: $25.00/month**
- **Total Cost: $106.48/month**

---

### Scenario 3: High-Traffic App
**Usage:**
- Database: 50 GB (42 GB over quota)
- File Storage: 500 GB (400 GB over quota)
- Uncached Egress: 1 TB (750 GB over quota)
- Cached Egress: 500 GB (250 GB over quota)
- MAUs: 500,000 (400,000 over quota)
- **Plan:** Pro ($25/month)

**Overage Calculations:**
- Database: 42 GB × $0.125 = $5.25/month
- File Storage: 400 GB × $0.021 = $8.40/month
- Uncached Egress: 750 GB × $0.09 = $67.50/month
- Cached Egress: 250 GB × $0.03 = $7.50/month
- MAUs: 400,000 × $0.00325 = $1,300.00/month
- **Overage Total: $1,388.65/month**
- **Base Plan: $25.00/month**
- **Total Cost: $1,413.65/month**

⚠️ **At this scale, Enterprise tier would be better value!**

---

### Scenario 4: Media-Heavy App
**Usage:**
- Database: 5 GB (within quota)
- File Storage: 500 GB (400 GB over quota)
- Uncached Egress: 2 TB (1,750 GB over quota) ⚠️
- Cached Egress: 200 GB (within quota)
- MAUs: 80,000 (within quota)
- **Plan:** Pro ($25/month)

**Overage Calculations:**
- File Storage: 400 GB × $0.021 = $8.40/month
- Uncached Egress: 1,750 GB × $0.09 = $157.50/month ⚠️ **Expensive!**
- **Overage Total: $165.90/month**
- **Base Plan: $25.00/month**
- **Total Cost: $190.90/month**

💡 **Tip:** Use Cloudflare or another CDN to cache files and reduce uncached egress costs!

---

## Cost Optimization Tips

### 1. **Reduce Egress Costs** (Biggest Savings)

**Problem:** Uncached egress is expensive ($0.09/GB)

**Solutions:**
- ✅ **Use CDN** (Cloudflare, etc.) to cache files
- ✅ **Serve static assets** from CDN instead of Supabase Storage
- ✅ **Optimize images** before serving (smaller files = less egress)
- ✅ **Enable cached egress** where possible ($0.03/GB vs $0.09/GB)

**Savings Example:**
- 1 TB uncached egress: $90/month
- 1 TB cached egress: $30/month
- **Savings: $60/month (67% reduction)**

---

### 2. **Monitor Database Size**

**Problem:** Database bloat increases costs

**Solutions:**
- ✅ **Clean up old data** regularly
- ✅ **Archive old records** to cold storage
- ✅ **Optimize indexes** (reduce size)
- ✅ **Monitor table sizes** with queries
- ✅ **Use connection pooling** (reduces compute needs)

**Query to check table sizes:**
```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

### 3. **Optimize File Storage**

**Problem:** Storage costs add up ($0.021/GB/month)

**Solutions:**
- ✅ **Compress images** before upload
- ✅ **Delete unused files** regularly
- ✅ **Use CDN** for public files (cheaper than Supabase egress)
- ✅ **Move to S3/Cloudflare R2** for large files (may be cheaper)

**Storage Comparison:**
- Supabase Storage: $0.021/GB/month
- Cloudflare R2: $0.015/GB/month (cheaper)
- AWS S3: $0.023/GB/month (similar)

---

### 4. **Reduce MAU Costs**

**Problem:** MAU overage is expensive ($0.00325/MAU)

**Solutions:**
- ✅ **Implement session cleanup** (remove inactive users from count)
- ✅ **Use unique monthly tracking** (don't double-count)
- ✅ **Consider Free tier** if < 50K MAUs
- ✅ **Optimize auth flows** (reduce unnecessary sign-ins)

**Savings Example:**
- 150K MAUs on Pro: $87.50 overage
- If you optimize to 100K: $0 overage
- **Savings: $87.50/month**

---

### 5. **Choose Right Tier**

**Problem:** Paying for tier you don't need

**Guidelines:**
- **Free:** < 50K MAUs, < 500MB DB, < 1GB storage
- **Pro:** 50K-100K MAUs, < 8GB DB, < 100GB storage
- **Team:** Need team features, compliance, support
- **Enterprise:** > 100K MAUs, > 8GB DB, need SLA

**Cost Comparison:**
- Free tier with overages often costs MORE than Pro!
- Example: 10GB DB on Free = $1.19/month base + $1.19 overage = $2.38
- But you lose many features (daily backups, etc.)
- **Better to pay $25 for Pro if you're close to limits**

---

## Common Cost Traps

### ⚠️ Trap 1: Egress Spike

**Problem:** Serving large files directly from Supabase Storage

**Example:**
- 100 MB file downloaded 1,000 times = 100 GB egress
- Cost: 100 GB × $0.09 = $9.00
- **Solution:** Use CDN ($0-2/month for same traffic)

---

### ⚠️ Trap 2: Database Bloat

**Problem:** Never cleaning up old data

**Example:**
- Database grows from 8GB to 15GB
- Cost: 7 GB × $0.125 = $0.88/month ongoing
- **Solution:** Archive old data regularly

---

### ⚠️ Trap 3: MAU Inflation

**Problem:** Counting test users, bots, or inactive users

**Example:**
- Real users: 80K
- Counted MAUs: 150K (due to double-counting)
- Cost: 50K × $0.00325 = $162.50/month unnecessary
- **Solution:** Clean up MAU counting logic

---

## Cost Calculator Formula

**Monthly Cost = Base Plan + Sum of Overage Costs**

```
Total Cost = Base Plan
           + (Database Overage GB × $0.125)
           + (Storage Overage GB × $0.021)
           + (Uncached Egress GB × $0.09)
           + (Cached Egress GB × $0.03)
           + (MAU Overage × $0.00325)
           + Add-ons (PITR: +$25, etc.)
```

---

## Monitoring Your Usage

### Dashboard
- Go to Supabase Dashboard → Settings → Usage
- View current usage vs quotas
- Set up billing alerts

### API Monitoring
- Use Supabase Metrics API
- Track usage programmatically
- Alert when approaching limits

---

## Comparison: Free vs Pro

| Usage Level | Free Tier Cost | Pro Tier Cost | Better Option |
|-------------|---------------|---------------|---------------|
| **Within Free quotas** | $0 | $25 | Free (obviously) |
| **Slight overages** | $5-15/month | $25 | Free (cheaper) |
| **Moderate overages** | $20-40/month | $25-50 | **Pro** (better features) |
| **Heavy usage** | $50-100+/month | $25-100 | **Pro** (better value) |

**Rule of Thumb:** If Free tier overages cost > $15/month, switch to Pro for better features + similar cost.

---

## Summary

**Key Takeaways:**
1. **Egress is expensive** - Use CDN to cache files
2. **Monitor database size** - Clean up regularly
3. **Choose right tier** - Free often costs more with overages
4. **Optimize MAU counting** - Don't pay for double-counted users
5. **Use cached egress** - 67% cheaper than uncached

**For Your Project (Lord's Gym):**
- Likely **Free tier** or **Pro tier**
- Monitor **file storage** (media library)
- Use **CDN** for images (reduce egress costs)
- **Pro tier** recommended if > 50K users or > 500MB DB

Want me to estimate costs based on your specific usage patterns?
