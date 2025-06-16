#!/bin/bash

# MCP Installation Script for Claude Code
# This script installs all the essential MCPs for Keycloak-Terraform development

echo "🚀 Installing Claude Code MCP servers for Keycloak-Terraform development..."

# Core Infrastructure MCPs
echo "📦 Installing Terraform MCP..."
claude mcp add terraform-cloud npx @severity1/terraform-cloud-mcp

echo "🐘 Installing PostgreSQL MCP..."
claude mcp add postgres npx @modelcontextprotocol/server-postgres

echo "🐳 Installing Docker MCP..."
claude mcp add docker npx @modelcontextprotocol/server-docker

# Development MCPs
echo "🐙 Installing GitHub MCP..."
claude mcp add github npx @modelcontextprotocol/server-github

echo "📁 Installing Filesystem MCP..."
claude mcp add filesystem npx @modelcontextprotocol/server-filesystem

echo "🌐 Installing Git MCP..."
claude mcp add git npx @modelcontextprotocol/server-git

# Web Automation MCP
echo "🎭 Installing Puppeteer MCP..."
claude mcp add puppeteer npx @modelcontextprotocol/server-puppeteer

echo "✅ All MCPs installed successfully!"
echo ""
echo "📋 Installed MCPs:"
claude mcp list

echo ""
echo "🎯 Your environment is now ready for:"
echo "  • Terraform/Terragrunt validation and testing"
echo "  • PostgreSQL database operations for Keycloak"
echo "  • Docker container management"
echo "  • GitHub repository operations"
echo "  • Advanced file system operations"
echo "  • Git version control automation"
echo "  • Web automation for testing"
echo ""
echo "🚦 Next steps:"
echo "  1. Set up environment variables for Terraform Cloud (TFC_TOKEN)"
echo "  2. Configure PostgreSQL connection strings"
echo "  3. Set up GitHub tokens for repository access"
echo "  4. Test your Keycloak-to-Terraform conversion workflow"