import { Hono } from "hono";
import { cors } from "hono/cors";
import { CreateKnowledgeBaseRequestSchema, CreateIntegrationRequestSchema, SearchRequestSchema } from "@/shared/types";

type Env = {
  DB: D1Database;
  MOCHA_USERS_SERVICE_API_KEY: string;
  MOCHA_USERS_SERVICE_API_URL: string;
};

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors());

// Health check
app.get("/api/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Integrations endpoints
app.get("/api/integrations", async (c) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT * FROM integrations ORDER BY created_at DESC").all();
    return c.json(results);
  } catch (error) {
    return c.json({ error: "Failed to fetch integrations" }, 500);
  }
});

app.post("/api/integrations", async (c) => {
  try {
    const body = await c.req.json();
    const validated = CreateIntegrationRequestSchema.parse(body);
    
    const { success } = await c.env.DB.prepare(`
      INSERT INTO integrations (name, type, config, is_active, created_at, updated_at)
      VALUES (?, ?, ?, 1, datetime('now'), datetime('now'))
    `).bind(validated.name, validated.type, JSON.stringify(validated.config)).run();

    if (success) {
      return c.json({ message: "Integration created successfully" }, 201);
    } else {
      return c.json({ error: "Failed to create integration" }, 500);
    }
  } catch (error) {
    return c.json({ error: "Invalid request data" }, 400);
  }
});

app.put("/api/integrations/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    
    const { success } = await c.env.DB.prepare(`
      UPDATE integrations 
      SET name = ?, type = ?, config = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(body.name, body.type, JSON.stringify(body.config), id).run();

    if (success) {
      return c.json({ message: "Integration updated successfully" });
    } else {
      return c.json({ error: "Integration not found" }, 404);
    }
  } catch (error) {
    return c.json({ error: "Failed to update integration" }, 500);
  }
});

app.delete("/api/integrations/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const { success } = await c.env.DB.prepare("DELETE FROM integrations WHERE id = ?").bind(id).run();

    if (success) {
      return c.json({ message: "Integration deleted successfully" });
    } else {
      return c.json({ error: "Integration not found" }, 404);
    }
  } catch (error) {
    return c.json({ error: "Failed to delete integration" }, 500);
  }
});

app.post("/api/integrations/:id/sync", async (c) => {
  try {
    const id = c.req.param("id");
    
    // Update last_sync_at timestamp
    const { success } = await c.env.DB.prepare(`
      UPDATE integrations 
      SET last_sync_at = datetime('now'), updated_at = datetime('now')
      WHERE id = ?
    `).bind(id).run();

    if (success) {
      return c.json({ message: "Sync completed successfully", timestamp: new Date().toISOString() });
    } else {
      return c.json({ error: "Integration not found" }, 404);
    }
  } catch (error) {
    return c.json({ error: "Failed to sync integration" }, 500);
  }
});

// Knowledge Base endpoints
app.get("/api/knowledge-base", async (c) => {
  try {
    const category = c.req.query("category");
    const search = c.req.query("search");
    const sortBy = c.req.query("sortBy") || "created_at";
    
    let query = "SELECT * FROM knowledge_base WHERE 1=1";
    const params: any[] = [];
    
    if (category && category !== "All Articles") {
      query += " AND category = ?";
      params.push(category);
    }
    
    if (search) {
      query += " AND (title LIKE ? OR content LIKE ? OR tags LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    switch (sortBy) {
      case "popular":
        query += " ORDER BY views DESC";
        break;
      case "rating":
        query += " ORDER BY rating DESC";
        break;
      case "recent":
      default:
        query += " ORDER BY updated_at DESC";
        break;
    }
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    return c.json(results);
  } catch (error) {
    return c.json({ error: "Failed to fetch knowledge base articles" }, 500);
  }
});

app.post("/api/knowledge-base", async (c) => {
  try {
    const body = await c.req.json();
    const validated = CreateKnowledgeBaseRequestSchema.parse(body);
    
    const { success } = await c.env.DB.prepare(`
      INSERT INTO knowledge_base (title, content, category, tags, is_published, created_at, updated_at)
      VALUES (?, ?, ?, ?, 1, datetime('now'), datetime('now'))
    `).bind(
      validated.title,
      validated.content,
      validated.category || "",
      JSON.stringify(validated.tags || [])
    ).run();

    if (success) {
      return c.json({ message: "Knowledge base article created successfully" }, 201);
    } else {
      return c.json({ error: "Failed to create article" }, 500);
    }
  } catch (error) {
    return c.json({ error: "Invalid request data" }, 400);
  }
});

app.put("/api/knowledge-base/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    
    const { success } = await c.env.DB.prepare(`
      UPDATE knowledge_base 
      SET title = ?, content = ?, category = ?, tags = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      body.title,
      body.content,
      body.category || "",
      JSON.stringify(body.tags || []),
      id
    ).run();

    if (success) {
      return c.json({ message: "Article updated successfully" });
    } else {
      return c.json({ error: "Article not found" }, 404);
    }
  } catch (error) {
    return c.json({ error: "Failed to update article" }, 500);
  }
});

app.delete("/api/knowledge-base/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const { success } = await c.env.DB.prepare("DELETE FROM knowledge_base WHERE id = ?").bind(id).run();

    if (success) {
      return c.json({ message: "Article deleted successfully" });
    } else {
      return c.json({ error: "Article not found" }, 404);
    }
  } catch (error) {
    return c.json({ error: "Failed to delete article" }, 500);
  }
});

app.post("/api/knowledge-base/:id/view", async (c) => {
  try {
    const id = c.req.param("id");
    const { success } = await c.env.DB.prepare(`
      UPDATE knowledge_base 
      SET views = views + 1, updated_at = datetime('now')
      WHERE id = ?
    `).bind(id).run();

    if (success) {
      return c.json({ message: "View count updated" });
    } else {
      return c.json({ error: "Article not found" }, 404);
    }
  } catch (error) {
    return c.json({ error: "Failed to update view count" }, 500);
  }
});

// SLA Configuration endpoints
app.get("/api/sla-configs", async (c) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT * FROM sla_configs ORDER BY created_at DESC").all();
    return c.json(results);
  } catch (error) {
    return c.json({ error: "Failed to fetch SLA configurations" }, 500);
  }
});

app.post("/api/sla-configs", async (c) => {
  try {
    const body = await c.req.json();
    
    const { success } = await c.env.DB.prepare(`
      INSERT INTO sla_configs (name, priority, response_time, resolution_time, escalation_rules, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))
    `).bind(
      body.name,
      body.priority,
      body.response_time,
      body.resolution_time,
      JSON.stringify(body.escalation_rules || {})
    ).run();

    if (success) {
      return c.json({ message: "SLA configuration created successfully" }, 201);
    } else {
      return c.json({ error: "Failed to create SLA configuration" }, 500);
    }
  } catch (error) {
    return c.json({ error: "Invalid request data" }, 400);
  }
});

app.put("/api/sla-configs/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    
    const { success } = await c.env.DB.prepare(`
      UPDATE sla_configs 
      SET name = ?, priority = ?, response_time = ?, resolution_time = ?, escalation_rules = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      body.name,
      body.priority,
      body.response_time,
      body.resolution_time,
      JSON.stringify(body.escalation_rules || {}),
      id
    ).run();

    if (success) {
      return c.json({ message: "SLA configuration updated successfully" });
    } else {
      return c.json({ error: "SLA configuration not found" }, 404);
    }
  } catch (error) {
    return c.json({ error: "Failed to update SLA configuration" }, 500);
  }
});

app.delete("/api/sla-configs/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const { success } = await c.env.DB.prepare("DELETE FROM sla_configs WHERE id = ?").bind(id).run();

    if (success) {
      return c.json({ message: "SLA configuration deleted successfully" });
    } else {
      return c.json({ error: "SLA configuration not found" }, 404);
    }
  } catch (error) {
    return c.json({ error: "Failed to delete SLA configuration" }, 500);
  }
});

app.put("/api/sla-configs/:id/toggle", async (c) => {
  try {
    const id = c.req.param("id");
    
    const { success } = await c.env.DB.prepare(`
      UPDATE sla_configs 
      SET is_active = NOT is_active, updated_at = datetime('now')
      WHERE id = ?
    `).bind(id).run();

    if (success) {
      return c.json({ message: "SLA configuration toggled successfully" });
    } else {
      return c.json({ error: "SLA configuration not found" }, 404);
    }
  } catch (error) {
    return c.json({ error: "Failed to toggle SLA configuration" }, 500);
  }
});

// Search endpoints
app.post("/api/search", async (c) => {
  try {
    const body = await c.req.json();
    const validated = SearchRequestSchema.parse(body);
    
    const startTime = Date.now();
    
    // Search across knowledge base
    const kbQuery = `
      SELECT 'knowledge_base' as source, title, content, category, tags, rating, views
      FROM knowledge_base 
      WHERE (title LIKE ? OR content LIKE ? OR tags LIKE ?) AND is_published = 1
      ORDER BY rating DESC, views DESC
      LIMIT ?
    `;
    
    const searchTerm = `%${validated.query}%`;
    const { results } = await c.env.DB.prepare(kbQuery).bind(
      searchTerm, searchTerm, searchTerm, validated.limit
    ).all();
    
    const executionTime = (Date.now() - startTime) / 1000;
    
    // Log search query
    await c.env.DB.prepare(`
      INSERT INTO search_queries (query, results_count, execution_time, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `).bind(validated.query, results.length, executionTime).run();
    
    return c.json({
      query: validated.query,
      results: results,
      resultCount: results.length,
      executionTime: executionTime
    });
  } catch (error) {
    return c.json({ error: "Search failed" }, 500);
  }
});

app.get("/api/search/recent", async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT DISTINCT query 
      FROM search_queries 
      ORDER BY created_at DESC 
      LIMIT 10
    `).all();
    
    return c.json(results.map(r => r.query));
  } catch (error) {
    return c.json({ error: "Failed to fetch recent searches" }, 500);
  }
});

// Analytics endpoints
app.get("/api/analytics/overview", async (c) => {
  try {
    const timeRange = c.req.query("timeRange") || "7d";
    
    // Calculate date range
    const daysBack = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : 365;
    
    // Get basic counts
    const kbCount = await c.env.DB.prepare("SELECT COUNT(*) as count FROM knowledge_base WHERE is_published = 1").first();
    const integrationCount = await c.env.DB.prepare("SELECT COUNT(*) as count FROM integrations WHERE is_active = 1").first();
    const slaCount = await c.env.DB.prepare("SELECT COUNT(*) as count FROM sla_configs WHERE is_active = 1").first();
    const searchCount = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM search_queries 
      WHERE created_at >= datetime('now', '-${daysBack} days')
    `).first();
    
    return c.json({
      knowledgeBaseArticles: kbCount?.count || 0,
      activeIntegrations: integrationCount?.count || 0,
      activeSLAs: slaCount?.count || 0,
      totalSearches: searchCount?.count || 0,
      timeRange: timeRange
    });
  } catch (error) {
    return c.json({ error: "Failed to fetch analytics overview" }, 500);
  }
});

app.get("/api/analytics/export", async (c) => {
  try {
    const format = c.req.query("format") || "json";
    const timeRange = c.req.query("timeRange") || "7d";
    
    // Get analytics data
    const overview = await c.env.DB.prepare("SELECT COUNT(*) as kb_count FROM knowledge_base WHERE is_published = 1").first();
    const searches = await c.env.DB.prepare("SELECT * FROM search_queries ORDER BY created_at DESC LIMIT 100").all();
    
    const data = {
      timestamp: new Date().toISOString(),
      timeRange: timeRange,
      overview: overview,
      recentSearches: searches.results
    };
    
    if (format === "csv") {
      // Convert to CSV format
      const csv = [
        "timestamp,query,results_count,execution_time",
        ...searches.results.map((s: any) => `${s.created_at},${s.query},${s.results_count},${s.execution_time}`)
      ].join("\n");
      
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": "attachment; filename=analytics-export.csv"
        }
      });
    }
    
    return c.json(data);
  } catch (error) {
    return c.json({ error: "Failed to export analytics data" }, 500);
  }
});

// Dashboard refresh endpoint
app.post("/api/dashboard/refresh", async (c) => {
  try {
    // Simulate data refresh by updating timestamps
    await c.env.DB.prepare(`
      UPDATE integrations 
      SET last_sync_at = datetime('now'), updated_at = datetime('now')
      WHERE is_active = 1
    `).run();
    
    return c.json({ 
      message: "Dashboard data refreshed successfully", 
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    return c.json({ error: "Failed to refresh dashboard data" }, 500);
  }
});

export default app;
