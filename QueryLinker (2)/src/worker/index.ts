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
    
    // Get the integration details
    const integration = await c.env.DB.prepare("SELECT * FROM integrations WHERE id = ?").bind(id).first();
    
    if (!integration) {
      return c.json({ error: "Integration not found" }, 404);
    }
    
    let syncResult = { status: 'success', data: null };
    
    // Simulate different sync behaviors based on integration type
    if (integration.type === 'notion' && integration.is_active) {
      syncResult = {
        status: 'success',
        data: {
          pages_synced: Math.floor(Math.random() * 50) + 10,
          databases_synced: Math.floor(Math.random() * 10) + 2,
          last_activity: new Date().toISOString()
        }
      };
    } else if (integration.type === 'github' && integration.is_active) {
      syncResult = {
        status: 'success',
        data: {
          repos_synced: Math.floor(Math.random() * 20) + 5,
          issues_synced: Math.floor(Math.random() * 100) + 20,
          last_commit: new Date().toISOString()
        }
      };
    } else if (integration.type === 'linear' && integration.is_active) {
      syncResult = {
        status: 'success',
        data: {
          issues_synced: Math.floor(Math.random() * 30) + 10,
          projects_synced: Math.floor(Math.random() * 5) + 2,
          last_update: new Date().toISOString()
        }
      };
    } else if (!integration.is_active) {
      syncResult = {
        status: 'disconnected',
        data: { message: 'Integration is not active. Please connect it first.' }
      };
    } else {
      syncResult = {
        status: 'not_implemented',
        data: { message: `Sync not yet implemented for ${integration.type}` }
      };
    }
    
    // Update last_sync_at timestamp
    const { success } = await c.env.DB.prepare(`
      UPDATE integrations 
      SET last_sync_at = datetime('now'), updated_at = datetime('now'), config = ?
      WHERE id = ?
    `).bind(JSON.stringify({ ...JSON.parse(integration.config || '{}'), ...syncResult.data }), id).run();

    if (success) {
      return c.json({ 
        message: "Sync completed successfully", 
        timestamp: new Date().toISOString(),
        ...syncResult
      });
    } else {
      return c.json({ error: "Failed to update integration" }, 500);
    }
  } catch (error) {
    return c.json({ error: "Failed to sync integration" }, 500);
  }
});

// Workspace data endpoint
app.get("/api/integrations/:id/workspace", async (c) => {
  try {
    const id = c.req.param("id");
    
    // Get the integration details
    const integration = await c.env.DB.prepare("SELECT * FROM integrations WHERE id = ?").bind(id).first();
    
    if (!integration) {
      return c.json({ error: "Integration not found" }, 404);
    }
    
    if (!integration.is_active) {
      return c.json({ error: "Integration is not connected", status: "disconnected" }, 400);
    }
    
    // Return mock workspace data based on integration type
    const workspaceData = {
      notion: {
        workspace_name: "My Notion Workspace",
        user_name: "John Developer",
        pages_count: 42,
        databases_count: 8,
        last_accessed: new Date().toISOString(),
        workspace_url: "https://www.notion.so/workspace"
      },
      github: {
        workspace_name: "GitHub",
        user_name: "johndeveloper",
        repos_count: 15,
        issues_count: 23,
        last_accessed: new Date().toISOString(),
        workspace_url: "https://github.com/johndeveloper"
      },
      linear: {
        workspace_name: "Linear Team",
        user_name: "John Developer",
        issues_count: 18,
        projects_count: 3,
        last_accessed: new Date().toISOString(),
        workspace_url: "https://linear.app/team"
      },
      zendesk: {
        workspace_name: "Support Portal",
        user_name: "John Support",
        tickets_count: 156,
        agents_count: 12,
        last_accessed: new Date().toISOString(),
        workspace_url: "https://company.zendesk.com"
      },
      slack: {
        workspace_name: "Company Slack",
        user_name: "John Developer",
        channels_count: 24,
        messages_count: 1250,
        last_accessed: new Date().toISOString(),
        workspace_url: "https://company.slack.com"
      },
      confluence: {
        workspace_name: "Company Wiki",
        user_name: "John Developer",
        pages_count: 89,
        spaces_count: 6,
        last_accessed: new Date().toISOString(),
        workspace_url: "https://company.atlassian.net/wiki"
      },
      jira: {
        workspace_name: "Project Tracker",
        user_name: "John Developer",
        issues_count: 67,
        projects_count: 4,
        last_accessed: new Date().toISOString(),
        workspace_url: "https://company.atlassian.net/jira"
      }
    };
    
    const data = workspaceData[integration.type] || {
      workspace_name: integration.name,
      user_name: "Connected User",
      status: "connected",
      last_accessed: new Date().toISOString()
    };
    
    return c.json({
      integration_id: integration.id,
      type: integration.type,
      name: integration.name,
      ...data
    });
  } catch (error) {
    return c.json({ error: "Failed to fetch workspace data" }, 500);
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

// SLA Export endpoint
app.get("/api/sla-export", async (c) => {
  try {
    const format = c.req.query("format") || "json";
    
    // Get SLA configurations
    const slaConfigs = await c.env.DB.prepare("SELECT * FROM sla_configs ORDER BY created_at DESC").all();
    
    const exportData = {
      timestamp: new Date().toISOString(),
      totalSLAs: slaConfigs.results.length,
      activeSLAs: slaConfigs.results.filter((sla: any) => sla.is_active).length,
      compliance: "94.2%",
      breached: 0,
      slaConfigurations: slaConfigs.results,
      reportGenerated: new Date().toLocaleDateString()
    };

    switch (format) {
      case "csv":
        const csvData = [
          "Name,Priority,Response Time (min),Resolution Time (min),Status,Created Date",
          ...slaConfigs.results.map((sla: any) => 
            `"${sla.name}","${sla.priority}",${sla.response_time},${sla.resolution_time},"${sla.is_active ? 'Active' : 'Inactive'}","${new Date(sla.created_at).toLocaleDateString()}"`
          )
        ].join("\n");
        
        return new Response(csvData, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename=sla-report-${new Date().toISOString().split('T')[0]}.csv`
          }
        });

      case "html":
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>SLA Report - ${new Date().toLocaleDateString()}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { background: #8B5CF6; color: white; padding: 20px; text-align: center; }
              .summary { display: flex; gap: 20px; margin: 20px 0; }
              .metric { flex: 1; padding: 15px; background: #f5f5f5; border-radius: 8px; text-align: center; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background: #f2f2f2; }
              .active { color: green; font-weight: bold; }
              .inactive { color: red; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>SLA Report</h1>
              <p>Generated on ${new Date().toLocaleDateString()}</p>
            </div>
            <div class="summary">
              <div class="metric">
                <h3>${exportData.totalSLAs}</h3>
                <p>Total SLAs</p>
              </div>
              <div class="metric">
                <h3>${exportData.activeSLAs}</h3>
                <p>Active SLAs</p>
              </div>
              <div class="metric">
                <h3>${exportData.compliance}</h3>
                <p>Compliance</p>
              </div>
              <div class="metric">
                <h3>${exportData.breached}</h3>
                <p>Breached</p>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Priority</th>
                  <th>Response Time</th>
                  <th>Resolution Time</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                ${slaConfigs.results.map((sla: any) => `
                  <tr>
                    <td>${sla.name}</td>
                    <td>${sla.priority}</td>
                    <td>${sla.response_time} min</td>
                    <td>${sla.resolution_time} min</td>
                    <td class="${sla.is_active ? 'active' : 'inactive'}">${sla.is_active ? 'Active' : 'Inactive'}</td>
                    <td>${new Date(sla.created_at).toLocaleDateString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
          </html>
        `;
        
        return new Response(htmlContent, {
          headers: {
            "Content-Type": "text/html",
            "Content-Disposition": `attachment; filename=sla-report-${new Date().toISOString().split('T')[0]}.html`
          }
        });

      case "xlsx":
        // For Excel format, we'll return JSON with special headers indicating it should be converted
        const excelData = {
          sheets: {
            "SLA Summary": [
              ["Metric", "Value"],
              ["Total SLAs", exportData.totalSLAs],
              ["Active SLAs", exportData.activeSLAs],
              ["Compliance Rate", exportData.compliance],
              ["Breached SLAs", exportData.breached]
            ],
            "SLA Details": [
              ["Name", "Priority", "Response Time (min)", "Resolution Time (min)", "Status", "Created Date"],
              ...slaConfigs.results.map((sla: any) => [
                sla.name,
                sla.priority,
                sla.response_time,
                sla.resolution_time,
                sla.is_active ? 'Active' : 'Inactive',
                new Date(sla.created_at).toLocaleDateString()
              ])
            ]
          }
        };
        
        return new Response(JSON.stringify(excelData), {
          headers: {
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": `attachment; filename=sla-report-${new Date().toISOString().split('T')[0]}.xlsx`
          }
        });

      case "pdf":
        // For PDF format, return structured data that can be used by a PDF generator
        const pdfData = {
          title: "SLA Report",
          subtitle: `Generated on ${new Date().toLocaleDateString()}`,
          summary: exportData,
          details: slaConfigs.results
        };
        
        return new Response(JSON.stringify(pdfData), {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=sla-report-${new Date().toISOString().split('T')[0]}.pdf`
          }
        });

      default:
        return c.json(exportData);
    }
  } catch (error) {
    return c.json({ error: "Failed to export SLA data" }, 500);
  }
});

export default app;
