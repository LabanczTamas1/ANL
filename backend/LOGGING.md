# Structured Logging with Pino

This application uses [Pino](https://getpino.io/) for structured, high-performance logging.

## Features

- **Structured JSON Logs**: All logs are structured with contextual data
- **Multiple Log Levels**: debug, info, warn, error
- **HTTP Request Logging**: Automatic logging of all HTTP requests with timing
- **File Logging**: Logs are written to files in production
- **Pretty Printing**: Colored, human-readable logs in development

## Log Files

Logs are stored in the `logs/` directory:

- `logs/app.log` - All application logs
- `logs/error.log` - Error logs only

## Usage

### Import the logger

```javascript
const { logger, logError, logBusinessEvent } = require('./config/logger');
```

### Basic logging

```javascript
// Info log
logger.info('User logged in successfully');

// With context
logger.info({ userId: 123, action: 'login' }, 'User logged in');

// Warning
logger.warn({ userId: 123 }, 'User attempted invalid action');

// Error with full stack trace
logger.error({ err: error, userId: 123 }, 'Failed to process request');
```

### Error logging helper

```javascript
// Use logError for automatic error formatting
try {
  // some code
} catch (error) {
  logError(error, { 
    context: 'functionName',
    userId: user.id,
    additionalData: 'value'
  });
}
```

### Business event logging

```javascript
// Track important business events
logBusinessEvent('booking_created', {
  bookingId: '123-456',
  email: 'user@example.com',
  date: '2026-03-01'
});
```

### HTTP request logging

HTTP requests are automatically logged with:
- Method and URL
- Response status code
- Response time
- User agent and IP
- User ID (if authenticated)

## Querying Logs

### Using command line tools

```bash
# View recent logs
tail -f logs/app.log

# Pretty print JSON logs
tail -f logs/app.log | npx pino-pretty

# Filter by log level
cat logs/app.log | grep '"level":"error"'

# Search for specific user
cat logs/app.log | grep '"userId":"user@example.com"'

# Find all business events
cat logs/app.log | grep '"eventType":"business"'

# Get all bookings created today
cat logs/app.log | grep '"eventName":"booking_created"' | grep "$(date +%Y-%m-%d)"
```

### Using jq for advanced queries

```bash
# Get all errors from the last hour
cat logs/error.log | jq 'select(.time > '$(date -d '1 hour ago' +%s000)')'

# Count errors by context
cat logs/error.log | jq -r '.context' | sort | uniq -c

# Get all requests that took longer than 1 second
cat logs/app.log | jq 'select(.responseTime > 1000)'

# Extract all booking IDs
cat logs/app.log | jq -r 'select(.eventName == "booking_created") | .bookingId'
```

## Log Levels

Set the `LOG_LEVEL` environment variable to control verbosity:

```bash
LOG_LEVEL=debug  # Show all logs
LOG_LEVEL=info   # Default - show info, warn, error
LOG_LEVEL=warn   # Show only warnings and errors
LOG_LEVEL=error  # Show only errors
```

## Environment Configuration

### Development
- Logs output to console with pretty printing
- Colorized output
- Human-readable timestamps

### Production
- Logs written to files
- JSON format for parsing/querying
- Both console and file outputs

## Log Structure

Every log entry includes:

```json
{
  "level": "info",
  "time": "2026-02-27T13:00:00.000Z",
  "pid": 12345,
  "hostname": "server-01",
  "env": "production",
  "msg": "Booking created successfully",
  "context": "createBooking",
  "bookingId": "abc-123",
  "email": "user@example.com"
}
```

## Best Practices

1. **Always add context**: Include relevant IDs and data
   ```javascript
   logger.info({ userId, bookingId }, 'Booking confirmed');
   ```

2. **Use appropriate log levels**:
   - `debug`: Detailed debugging information
   - `info`: General information (successful operations)
   - `warn`: Warning messages (recoverable issues)
   - `error`: Error messages (failures)

3. **Log business events**: Track important actions
   ```javascript
   logBusinessEvent('user_registered', { userId, email, source });
   ```

4. **Don't log sensitive data**: Avoid logging passwords, tokens, or PII unnecessarily

5. **Use structured data**: Pass objects, not strings
   ```javascript
   // Good
   logger.info({ userId: 123, action: 'login' }, 'User action');
   
   // Avoid
   logger.info(`User ${userId} performed ${action}`);
   ```

## Monitoring and Analysis

For production monitoring, consider:

1. **Log aggregation**: Ship logs to services like:
   - Datadog
   - Elasticsearch + Kibana
   - Splunk
   - CloudWatch Logs

2. **Alerting**: Set up alerts for:
   - Error rate spikes
   - Slow requests
   - Failed business events

3. **Metrics**: Extract metrics from logs:
   - Request rates
   - Error rates
   - Response times
   - Business event counts
