// requestTracker.js
const redis = require('redis');
const jwt = require('jsonwebtoken');

// Using the existing Redis client configuration
const redisClient = redis.createClient({
  url: "redis://localhost:6380",
  socket: {
    connectTimeout: 5000, // 5 seconds timeout
    reconnectStrategy: (retries) => Math.min(retries * 100, 3000) // Exponential backoff
  }
});

// Add event listeners for connection status
redisClient.on('error', (err) => {
  console.error("[RequestTracker] Redis connection error:", err);
});

redisClient.on('ready', () => {
  console.log("[RequestTracker] Redis connection ready");
});

redisClient.on('reconnecting', () => {
  console.log("[RequestTracker] Redis reconnecting...");
});

// Initialize Redis connection if not already connected
const ensureRedisConnection = async () => {
  if (!redisClient.isReady) {
    try {
      await Promise.race([
        redisClient.connect(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Redis connection timeout')), 5000)
        )
      ]);
      console.log("[RequestTracker] Connected to Redis");
    } catch (err) {
      console.error("[RequestTracker] Redis connection error:", err);
      throw new Error(`Unable to connect to Redis: ${err.message}`);
    }
  }
};

/**
 * Middleware to track API requests by user role, HTTP method, and status code
 * The response's status code is captured in the onFinish handler
 */
const trackRequest = async (req, res, next) => {
  try {
    // Ensure Redis is connected
    await ensureRedisConnection();
    
    // Get the current timestamp
    const timestamp = new Date().toISOString();
    const method = req.method;
    const path = req.originalUrl;
    
    // Better role detection logic
    let role = 'anonymous';
    
    // Check if request has authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        // Verify and decode the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-fallback-secret-key");
        role = decoded.role || 'user';
      } catch (tokenError) {
        console.log('[RequestTracker] Invalid token, using anonymous role');
      }
    } else if (req.user && req.user.role) {
      // If req.user is already available from previous middleware
      role = req.user.role;
    }
    
    // Increment request counters
    await redisClient.incr('stats:total_requests');
    await redisClient.incr(`stats:method:${method}`);
    await redisClient.incr(`stats:role:${role}`);
    await redisClient.incr(`stats:role:${role}:method:${method}`);

    // Create a request data object that will be stored when the response finishes
    const requestData = {
      timestamp,
      method,
      path,
      role,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    };
    
    // Capture the status code after the response is sent
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
      // Call the original end method
      originalEnd.call(this, chunk, encoding);
      
      // Now capture and store the status code
      const statusCode = res.statusCode;
      const statusCategory = getStatusCategory(statusCode);
      
      // Store the request with status code
      requestData.statusCode = statusCode;
      
      // Track status code statistics asynchronously
      (async () => {
        try {
          // Increment status code counters
          await redisClient.incr(`stats:status:${statusCode}`);
          await redisClient.incr(`stats:status_category:${statusCategory}`);
          
          // Store timestamp with status for time-series data
          // We'll use a hash to store counts by timestamp (hourly buckets)
          const hourTimestamp = new Date(timestamp);
          hourTimestamp.setMinutes(0, 0, 0); // Round to hour
          const hourKey = hourTimestamp.toISOString();
          
          await redisClient.hIncrBy('stats:hourly_status', `${hourKey}:${statusCategory}`, 1);
          
          // Store daily statistics for longer retention
          const dayTimestamp = new Date(timestamp);
          dayTimestamp.setHours(0, 0, 0, 0); // Round to day
          const dayKey = dayTimestamp.toISOString();
          
          await redisClient.hIncrBy('stats:daily_status', `${dayKey}:${statusCategory}`, 1);
          
          // Store complete request data in the recent requests list
          const requestDetails = JSON.stringify(requestData);
          await redisClient.lPush('stats:recent_requests', requestDetails);
          await redisClient.lTrim('stats:recent_requests', 0, 999); // Keep only the 1000 most recent
          
          console.log(`[RequestTracker] Tracked ${method} request by ${role} for ${path} with status ${statusCode}`);
        } catch (err) {
          console.error('[RequestTracker] Error storing status code data:', err);
        }
      })();
    };
    
  } catch (error) {
    console.error('[RequestTracker] Error tracking request:', error);
  }
  
  next();
};

/**
 * Helper function to categorize status codes
 */
const getStatusCategory = (statusCode) => {
  if (statusCode >= 200 && statusCode < 300) return '2xx';
  if (statusCode >= 300 && statusCode < 400) return '3xx';
  if (statusCode >= 400 && statusCode < 500) return '4xx';
  if (statusCode >= 500) return '5xx';
  return 'unknown';
};

/**
 * Get request statistics with improved timeout handling and status code data
 */
const getRequestStats = async () => {
  // First check if Redis is even connected
  if (!redisClient.isReady) {
    try {
      await Promise.race([
        redisClient.connect(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Redis connection timeout')), 5000)
        )
      ]);
    } catch (err) {
      // Return fallback empty stats if we can't even connect
      console.error("[RequestTracker] Redis connection failed:", err);
      return {
        totalRequests: '0',
        methodCounts: { GET: '0', POST: '0', PUT: '0', PATCH: '0', DELETE: '0' },
        roleCounts: { anonymous: '0' },
        roleMethodCounts: {},
        statusCounts: { '2xx': '0', '3xx': '0', '4xx': '0', '5xx': '0' },
        timeSeriesData: {},
        recentRequests: [],
        _status: 'degraded',
        _error: err.message
      };
    }
  }
  
  // Use a more aggressive timeout that applies to the entire function
  const GLOBAL_TIMEOUT = 8000; // 8 seconds maximum for the entire function
  
  // Create a cancellation signal for the entire operation
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GLOBAL_TIMEOUT);
  
  try {
    // Create empty response object that we'll gradually fill
    const response = {
      totalRequests: '0',
      methodCounts: {},
      roleCounts: {},
      roleMethodCounts: {},
      statusCounts: { '2xx': '0', '3xx': '0', '4xx': '0', '5xx': '0' },
      timeSeriesData: {
        hourly: [],
        daily: []
      },
      recentRequests: []
    };
    
    // Get each major section in parallel with individual timeouts
    await Promise.all([
      // Section 1: Basic counters with 3s timeout
      (async () => {
        try {
          const basicPipeline = redisClient.multi();
          basicPipeline.get('stats:total_requests');
          
          const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
          methods.forEach(method => {
            basicPipeline.get(`stats:method:${method}`);
          });
          
          const results = await Promise.race([
            basicPipeline.exec(),
            new Promise((_, reject) => setTimeout(() => {
              reject(new Error('Basic stats timeout'));
            }, 3000))
          ]);
          
          if (results && results.length > 0) {
            response.totalRequests = results[0] || '0';
            methods.forEach((method, i) => {
              response.methodCounts[method] = results[i + 1] || '0';
            });
          }
        } catch (err) {
          console.warn('[RequestTracker] Basic stats retrieval error:', err.message);
          // Set default values if this section fails
          response.methodCounts = { GET: '0', POST: '0', PUT: '0', PATCH: '0', DELETE: '0' };
        }
      })(),
      
      // Section 2: Role counts with 3s timeout
      (async () => {
        try {
          // For role counts, we'll use a simpler approach - just get the 5 most common roles
          // This avoids expensive SCAN operations that often cause timeouts
          const commonRoles = ['admin', 'user', 'editor', 'manager', 'anonymous'];
          const rolePipeline = redisClient.multi();
          
          commonRoles.forEach(role => {
            rolePipeline.get(`stats:role:${role}`);
          });
          
          const results = await Promise.race([
            rolePipeline.exec(),
            new Promise((_, reject) => setTimeout(() => {
              reject(new Error('Role stats timeout'));
            }, 3000))
          ]);
          
          if (results && results.length > 0) {
            commonRoles.forEach((role, i) => {
              const count = results[i] || '0';
              if (count !== '0') {
                response.roleCounts[role] = count;
              }
            });
          }
          
          // Also get combined role+method stats for the same common roles
          const roleMethodPipeline = redisClient.multi();
          const methods = ['GET', 'POST', 'PUT', 'DELETE'];
          
          commonRoles.forEach(role => {
            methods.forEach(method => {
              roleMethodPipeline.get(`stats:role:${role}:method:${method}`);
            });
          });
          
          const roleMethodResults = await Promise.race([
            roleMethodPipeline.exec(),
            new Promise((_, reject) => setTimeout(() => {
              reject(new Error('Role-method stats timeout'));
            }, 3000))
          ]);
          
          if (roleMethodResults && roleMethodResults.length > 0) {
            let index = 0;
            commonRoles.forEach(role => {
              response.roleMethodCounts[role] = {};
              methods.forEach(method => {
                const count = roleMethodResults[index++] || '0';
                if (count !== '0') {
                  response.roleMethodCounts[role][method] = count;
                }
              });
            });
          }
        } catch (err) {
          console.warn('[RequestTracker] Role stats retrieval error:', err.message);
          // Keep empty objects as defaults if this section fails
        }
      })(),
      
      // Section 3: Status code statistics with 3s timeout
      (async () => {
        try {
          const statusPipeline = redisClient.multi();
          const statusCategories = ['2xx', '3xx', '4xx', '5xx'];
          
          // Get aggregated status category counts
          statusCategories.forEach(category => {
            statusPipeline.get(`stats:status_category:${category}`);
          });
          
          const results = await Promise.race([
            statusPipeline.exec(),
            new Promise((_, reject) => setTimeout(() => {
              reject(new Error('Status stats timeout'));
            }, 3000))
          ]);
          
          if (results && results.length > 0) {
            statusCategories.forEach((category, i) => {
              response.statusCounts[category] = results[i] || '0';
            });
          }
          
          // Get time series data for hourly status codes (last 48 hours)
          const hourlyData = await Promise.race([
            redisClient.hGetAll('stats:hourly_status'),
            new Promise((_, reject) => setTimeout(() => {
              reject(new Error('Hourly status timeout'));
            }, 3000))
          ]);
          
          // Process hourly time series data
          if (hourlyData) {
            const hourlyMap = {};
            
            // Process each timestamp:category:count entry
            Object.entries(hourlyData).forEach(([key, count]) => {
              const [timestamp, category] = key.split(':');
              
              if (!hourlyMap[timestamp]) {
                hourlyMap[timestamp] = {
                  timestamp,
                  '2xx': 0,
                  '3xx': 0,
                  '4xx': 0,
                  '5xx': 0,
                  total: 0
                };
              }
              
              const countValue = parseInt(count, 10) || 0;
              hourlyMap[timestamp][category] = countValue;
              hourlyMap[timestamp].total += countValue;
            });
            
            // Convert to array and sort by timestamp
            response.timeSeriesData.hourly = Object.values(hourlyMap)
              .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          }
          
          // Get time series data for daily status codes (last 90 days)
          const dailyData = await Promise.race([
            redisClient.hGetAll('stats:daily_status'),
            new Promise((_, reject) => setTimeout(() => {
              reject(new Error('Daily status timeout'));
            }, 3000))
          ]);
          
          // Process daily time series data
          if (dailyData) {
            const dailyMap = {};
            
            // Process each timestamp:category:count entry
            Object.entries(dailyData).forEach(([key, count]) => {
              const [timestamp, category] = key.split(':');
              
              if (!dailyMap[timestamp]) {
                dailyMap[timestamp] = {
                  timestamp,
                  '2xx': 0,
                  '3xx': 0,
                  '4xx': 0,
                  '5xx': 0,
                  total: 0
                };
              }
              
              const countValue = parseInt(count, 10) || 0;
              dailyMap[timestamp][category] = countValue;
              dailyMap[timestamp].total += countValue;
            });
            
            // Convert to array and sort by timestamp
            response.timeSeriesData.daily = Object.values(dailyMap)
              .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          }
        } catch (err) {
          console.warn('[RequestTracker] Status code stats retrieval error:', err.message);
          // Keep default values if this section fails
        }
      })(),
      
      // Section 4: Recent requests with 3s timeout
      (async () => {
        try {
          // Get the 100 most recent requests
          const recentData = await Promise.race([
            redisClient.lRange('stats:recent_requests', 0, -1),
            new Promise((_, reject) => setTimeout(() => {
              reject(new Error('Recent requests timeout'));
            }, 3000))
          ]);
          
          if (recentData && recentData.length > 0) {
            response.recentRequests = recentData.map(item => {
              try {
                return JSON.parse(item);
              } catch (e) {
                return { error: 'Parse error', raw: item };
              }
            });
          }
        } catch (err) {
          console.warn('[RequestTracker] Recent requests retrieval error:', err.message);
          // Keep empty array as default if this section fails
        }
      })()
    ]);
    
    // Clear the global timeout since we're done
    clearTimeout(timeoutId);
    
    return response;
  } catch (error) {
    // Clear the global timeout to prevent memory leaks
    clearTimeout(timeoutId);
    
    console.error('[RequestTracker] Fatal error getting request stats:', error);
    
    // Rather than failing completely, return a partial response with error info
    return {
      totalRequests: '0',
      methodCounts: { GET: '0', POST: '0', PUT: '0', PATCH: '0', DELETE: '0' },
      roleCounts: {},
      roleMethodCounts: {},
      statusCounts: { '2xx': '0', '3xx': '0', '4xx': '0', '5xx': '0' },
      timeSeriesData: {
        hourly: [],
        daily: []
      },
      recentRequests: [],
      _status: 'error',
      _error: error.message
    };
  }
};

/**
 * Reset all request statistics
 */
const resetRequestStats = async () => {
  await ensureRedisConnection();
  
  // Get all stats keys
  let allKeys = [];
  let cursor = '0';
  
  do {
    const result = await redisClient.scan(cursor, {
      MATCH: 'stats:*',
      COUNT: 100
    });
    
    cursor = result.cursor;
    allKeys = allKeys.concat(result.keys);
  } while (cursor !== '0');
  
  // Delete all stats keys
  if (allKeys.length > 0) {
    await redisClient.del(allKeys);
  }
  
  return { message: 'All request statistics reset successfully' };
};

module.exports = {
  trackRequest,
  getRequestStats,
  resetRequestStats
};