#!/bin/bash

# Rollback Script for Production Deployment
# Usage: ./scripts/rollback.sh [timestamp|latest]

set -e

# Configuration
ROLLBACK_TARGET=${1:-latest}
BUILD_DIR="dist"
BACKUP_DIR="backups"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Find backup to rollback to
find_backup() {
    if [ "$ROLLBACK_TARGET" = "latest" ]; then
        # Get the most recent backup
        BACKUP=$(ls -1t "$BACKUP_DIR" 2>/dev/null | head -n 1)
        if [ -z "$BACKUP" ]; then
            log_error "No backups found in $BACKUP_DIR"
            exit 1
        fi
        ROLLBACK_PATH="$BACKUP_DIR/$BACKUP"
    else
        # Use specified timestamp
        ROLLBACK_PATH="$BACKUP_DIR/$ROLLBACK_TARGET"
        if [ ! -d "$ROLLBACK_PATH" ]; then
            log_error "Backup not found: $ROLLBACK_PATH"
            log_info "Available backups:"
            ls -1t "$BACKUP_DIR" 2>/dev/null || echo "  No backups found"
            exit 1
        fi
    fi
    
    log_info "Selected backup: $ROLLBACK_PATH"
}

# Verify backup integrity
verify_backup() {
    log_info "Verifying backup integrity..."
    
    # Check required files
    if [ ! -f "$ROLLBACK_PATH/deployment.json" ]; then
        log_error "Deployment metadata not found in backup"
        exit 1
    fi
    
    if [ ! -d "$ROLLBACK_PATH/dist_backup" ]; then
        log_error "Build backup not found"
        exit 1
    fi
    
    if [ ! -f "$ROLLBACK_PATH/commit_hash.txt" ]; then
        log_warning "Git commit hash not found in backup"
    fi
    
    # Display backup information
    if command -v jq &> /dev/null && [ -f "$ROLLBACK_PATH/deployment.json" ]; then
        log_info "Backup details:"
        jq '.' "$ROLLBACK_PATH/deployment.json"
    fi
    
    log_info "Backup verification passed ✓"
}

# Create current state backup before rollback
backup_current_state() {
    log_info "Backing up current state before rollback..."
    
    ROLLBACK_BACKUP_DIR="$BACKUP_DIR/pre_rollback_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$ROLLBACK_BACKUP_DIR"
    
    # Backup current build
    if [ -d "$BUILD_DIR" ]; then
        cp -r "$BUILD_DIR" "$ROLLBACK_BACKUP_DIR/dist_backup"
    fi
    
    # Save rollback metadata
    cat > "$ROLLBACK_BACKUP_DIR/rollback.json" << EOF
{
    "timestamp": "$(date -Iseconds)",
    "rolled_back_to": "$ROLLBACK_TARGET",
    "rolled_back_by": "$(whoami)",
    "reason": "Manual rollback"
}
EOF
    
    log_info "Current state backed up to: $ROLLBACK_BACKUP_DIR"
}

# Perform rollback
perform_rollback() {
    log_info "Performing rollback..."
    
    # Remove current build
    if [ -d "$BUILD_DIR" ]; then
        rm -rf "$BUILD_DIR"
        log_info "Removed current build"
    fi
    
    # Restore backup build
    cp -r "$ROLLBACK_PATH/dist_backup" "$BUILD_DIR"
    log_info "Restored build from backup"
    
    # Restore git commit if available
    if [ -f "$ROLLBACK_PATH/commit_hash.txt" ]; then
        COMMIT_HASH=$(cat "$ROLLBACK_PATH/commit_hash.txt")
        log_info "Target git commit: $COMMIT_HASH"
        
        # Ask user if they want to checkout the commit
        read -p "Do you want to checkout this commit? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git checkout "$COMMIT_HASH"
            log_info "Checked out commit: $COMMIT_HASH"
        else
            log_warning "Git commit not restored. Build and code may be out of sync."
        fi
    fi
    
    # Restore environment file if it exists
    if [ -f "$ROLLBACK_PATH/.env.production" ]; then
        cp "$ROLLBACK_PATH/.env.production" ".env.production"
        log_info "Restored environment configuration"
    fi
    
    log_info "Rollback completed"
}

# Deploy rolled back version
deploy_rollback() {
    log_info "Deploying rolled back version..."
    
    # Check which deployment method to use
    if command -v netlify &> /dev/null; then
        log_info "Deploying to Netlify..."
        netlify deploy --prod --dir="$BUILD_DIR" || {
            log_error "Deployment failed"
            exit 1
        }
    elif command -v vercel &> /dev/null; then
        log_info "Deploying to Vercel..."
        vercel --prod || {
            log_error "Deployment failed"
            exit 1
        }
    else
        log_warning "No deployment CLI found. Please deploy manually."
    fi
    
    log_info "Deployment completed"
}

# Health check after rollback
post_rollback_health_check() {
    log_info "Running post-rollback health checks..."
    
    # Check if site is accessible
    URL="https://meta3ventures.com"
    HTTP_STATUS=$(curl -o /dev/null -s -w "%{http_code}" "$URL" 2>/dev/null || echo "000")
    
    if [ "$HTTP_STATUS" -eq 200 ]; then
        log_info "Health check passed. Site is accessible (HTTP $HTTP_STATUS)"
    else
        log_warning "Health check returned HTTP $HTTP_STATUS"
    fi
}

# Send rollback notification
send_rollback_notification() {
    log_info "Sending rollback notification..."
    
    # Create notification
    NOTIFICATION="⚠️ ROLLBACK PERFORMED
    
Environment: Production
Rolled back to: $ROLLBACK_TARGET
Performed by: $(whoami)
Timestamp: $(date -Iseconds)
    
Please verify that the application is working correctly."
    
    # Log notification
    echo "$NOTIFICATION" >> "$BACKUP_DIR/rollback_history.log"
    
    # Send to webhook if configured
    if [ ! -z "$DEPLOYMENT_WEBHOOK" ]; then
        curl -X POST "$DEPLOYMENT_WEBHOOK" \
            -H "Content-Type: application/json" \
            -d "{\"text\": \"$NOTIFICATION\"}" \
            2>/dev/null || log_warning "Failed to send webhook notification"
    fi
    
    log_info "Rollback notification sent"
}

# Main rollback flow
main() {
    log_warning "🔄 Starting rollback process"
    log_warning "This will replace the current production deployment!"
    
    # Confirm rollback
    read -p "Are you sure you want to rollback? (yes/no) " -r
    if [ "$REPLY" != "yes" ]; then
        log_info "Rollback cancelled"
        exit 0
    fi
    
    # Execute rollback steps
    find_backup
    verify_backup
    backup_current_state
    perform_rollback
    deploy_rollback
    post_rollback_health_check
    send_rollback_notification
    
    log_info "✅ Rollback completed successfully!"
    log_info "Rolled back to: $ROLLBACK_PATH"
    log_warning "Please verify that the application is working as expected"
}

# Run main function
main