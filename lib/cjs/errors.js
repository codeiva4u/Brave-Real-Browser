/**
 * Error Handling System for Brave Real Browser
 * 
 * Provides standardized error classes and utilities for browser operations
 */

// ============================================================================
// ERROR CATEGORIES
// ============================================================================

const ErrorCategory = {
  // Browser connection errors
  CONNECTION_FAILED: 'CONNECTION_FAILED',
  BROWSER_LAUNCH_FAILED: 'BROWSER_LAUNCH_FAILED',
  BROWSER_CLOSED: 'BROWSER_CLOSED',
  
  // Page errors
  PAGE_CREATION_FAILED: 'PAGE_CREATION_FAILED',
  PAGE_CLOSED: 'PAGE_CLOSED',
  
  // Plugin errors
  PLUGIN_LOAD_FAILED: 'PLUGIN_LOAD_FAILED',
  
  // Proxy errors
  PROXY_CONNECTION_FAILED: 'PROXY_CONNECTION_FAILED',
  INVALID_PROXY_CONFIG: 'INVALID_PROXY_CONFIG',
  
  // System errors
  XVFB_INIT_FAILED: 'XVFB_INIT_FAILED',
  PORT_UNAVAILABLE: 'PORT_UNAVAILABLE',
  
  // Protocol errors
  PROTOCOL_ERROR: 'PROTOCOL_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  
  // Unknown
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

// ============================================================================
// ERROR SEVERITY LEVELS
// ============================================================================

const ErrorSeverity = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
};

// ============================================================================
// CUSTOM ERROR CLASS
// ============================================================================

/**
 * Base error class for Brave Real Browser errors
 */
class BraveRealBrowserError extends Error {
  constructor(
    message,
    category = ErrorCategory.UNKNOWN_ERROR,
    severity = ErrorSeverity.MEDIUM,
    isRecoverable = false,
    context = {}
  ) {
    super(message);
    this.name = 'BraveRealBrowserError';
    this.category = category;
    this.severity = severity;
    this.isRecoverable = isRecoverable;
    this.timestamp = new Date();
    this.context = context;
    
    // Maintains proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Convert error to user-friendly message
   */
  toUserMessage() {
    let message = `❌ ${this.message}\n\n`;
    message += `📋 Category: ${this.category}\n`;
    message += `⚠️ Severity: ${this.severity}\n`;
    
    if (Object.keys(this.context).length > 0) {
      message += `\n🔍 Context: ${JSON.stringify(this.context, null, 2)}\n`;
    }
    
    return message;
  }
}

// ============================================================================
// ERROR FACTORY FUNCTIONS
// ============================================================================

/**
 * Create browser launch error
 */
function createBrowserLaunchError(originalError, context = {}) {
  return new BraveRealBrowserError(
    `Failed to launch browser: ${originalError.message}`,
    ErrorCategory.BROWSER_LAUNCH_FAILED,
    ErrorSeverity.CRITICAL,
    false,
    { originalError: originalError.message, ...context }
  );
}

/**
 * Create connection error
 */
function createConnectionError(url, originalError) {
  return new BraveRealBrowserError(
    `Failed to connect to browser at ${url}: ${originalError.message}`,
    ErrorCategory.CONNECTION_FAILED,
    ErrorSeverity.CRITICAL,
    true,
    { url, originalError: originalError.message }
  );
}

/**
 * Create page creation error
 */
function createPageCreationError(originalError) {
  return new BraveRealBrowserError(
    `Failed to create or access page: ${originalError.message}`,
    ErrorCategory.PAGE_CREATION_FAILED,
    ErrorSeverity.HIGH,
    true,
    { originalError: originalError.message }
  );
}

/**
 * Create plugin load error
 */
function createPluginLoadError(pluginName, originalError) {
  return new BraveRealBrowserError(
    `Failed to load plugin '${pluginName}': ${originalError.message}`,
    ErrorCategory.PLUGIN_LOAD_FAILED,
    ErrorSeverity.MEDIUM,
    true,
    { pluginName, originalError: originalError.message }
  );
}

/**
 * Create proxy error
 */
function createProxyError(proxyConfig, originalError) {
  return new BraveRealBrowserError(
    `Proxy connection failed: ${originalError.message}`,
    ErrorCategory.PROXY_CONNECTION_FAILED,
    ErrorSeverity.HIGH,
    true,
    { proxyConfig, originalError: originalError.message }
  );
}

/**
 * Create XVFB initialization error
 */
function createXvfbError(originalError) {
  return new BraveRealBrowserError(
    `Failed to initialize Xvfb: ${originalError.message}`,
    ErrorCategory.XVFB_INIT_FAILED,
    ErrorSeverity.MEDIUM,
    false,
    { 
      originalError: originalError.message,
      suggestion: 'Install xvfb with: sudo apt-get install xvfb'
    }
  );
}

/**
 * Create port unavailable error
 */
function createPortUnavailableError(port) {
  return new BraveRealBrowserError(
    `Port ${port} is not available`,
    ErrorCategory.PORT_UNAVAILABLE,
    ErrorSeverity.HIGH,
    true,
    { port }
  );
}

// ============================================================================
// ERROR CATEGORIZATION
// ============================================================================

/**
 * Categorize a generic error into BraveRealBrowserError
 */
function categorizeError(error) {
  // Already a BraveRealBrowserError
  if (error instanceof BraveRealBrowserError) {
    return error;
  }
  
  // Convert to Error if not already
  const err = error instanceof Error ? error : new Error(String(error));
  const message = err.message.toLowerCase();
  
  // Browser launch errors
  if (message.includes('failed to launch') || message.includes('chrome') && message.includes('launch')) {
    return createBrowserLaunchError(err);
  }
  
  // Connection errors
  if (message.includes('econnrefused') || message.includes('connection refused')) {
    return new BraveRealBrowserError(
      err.message,
      ErrorCategory.CONNECTION_FAILED,
      ErrorSeverity.CRITICAL,
      true,
      { originalError: err.message }
    );
  }
  
  // Protocol errors
  if (message.includes('protocol error') || message.includes('target closed')) {
    return new BraveRealBrowserError(
      err.message,
      ErrorCategory.PROTOCOL_ERROR,
      ErrorSeverity.HIGH,
      true,
      { originalError: err.message }
    );
  }
  
  // Timeout errors
  if (message.includes('timeout')) {
    return new BraveRealBrowserError(
      err.message,
      ErrorCategory.TIMEOUT_ERROR,
      ErrorSeverity.MEDIUM,
      true,
      { originalError: err.message }
    );
  }
  
  // Port errors
  if (message.includes('eaddrinuse') || message.includes('address in use')) {
    return new BraveRealBrowserError(
      err.message,
      ErrorCategory.PORT_UNAVAILABLE,
      ErrorSeverity.HIGH,
      true,
      { originalError: err.message }
    );
  }
  
  // Default unknown error
  return new BraveRealBrowserError(
    err.message,
    ErrorCategory.UNKNOWN_ERROR,
    ErrorSeverity.MEDIUM,
    false,
    { originalError: err.message, stack: err.stack }
  );
}

/**
 * Check if error is recoverable
 */
function isRecoverableError(error) {
  if (error instanceof BraveRealBrowserError) {
    return error.isRecoverable;
  }
  
  const categorized = categorizeError(error);
  return categorized.isRecoverable;
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  ErrorCategory,
  ErrorSeverity,
  BraveRealBrowserError,
  createBrowserLaunchError,
  createConnectionError,
  createPageCreationError,
  createPluginLoadError,
  createProxyError,
  createXvfbError,
  createPortUnavailableError,
  categorizeError,
  isRecoverableError,
};
