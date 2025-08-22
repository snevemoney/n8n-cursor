#!/bin/bash

# 🚀 CONSOLIDATED DOCKER-TOOLS - Merged from multiple scripts
# 🧹 This file consolidates the functionality of:
#   - docker_isolation_system.sh
#   - docker_management_rules.sh

# 🎯 Single script for all docker-tools operations

# === FROM docker_isolation_system.sh ===
# 17:setup_isolated_docker() {
# 31:setup_nginx_proxy() {
# 67:create_isolated_compose() {
# 106:prevent_port_conflicts() {
# 129:check_service_isolation() {
# 156:emergency_isolate() {
case "${1:-help}" in
"setup")
  setup_isolated_docker
  setup_nginx_proxy
  create_isolated_compose
  prevent_port_conflicts
  ;;
"start")
  setup_isolated_docker
  docker-compose -f docker-compose-isolated.yml up -d
  check_service_isolation
  ;;
"stop")
  docker-compose -f docker-compose-isolated.yml down
  ;;
"emergency")
  emergency_isolate
  ;;
"check")
  check_service_isolation
  ;;
*)
  echo "Docker Isolation System - Prevent ALL conflicts"
  echo "=============================================="
  echo ""
  echo "Usage:"
  echo "  ./docker_isolation_system.sh setup     - Set up complete isolation"
  echo "  ./docker_isolation_system.sh start     - Start isolated Docker n8n"
  echo "  ./docker_isolation_system.sh stop      - Stop Docker services"
  echo "  ./docker_isolation_system.sh emergency - Emergency isolation"
  echo "  ./docker_isolation_system.sh check     - Check isolation status"
  echo ""
  echo "Isolation Rules:"
  echo "1. Docker uses ports 15678+ (never 5678)"
  echo "2. Docker uses isolated network 172.30.x.x"
  echo "3. Nginx proxy handles routing"
  echo "4. Host services always have priority"
  echo "5. Emergency isolation if conflicts occur"
  echo ""
  echo "Access:"
  echo "- Host n8n:   https://n8ncloud.tech (port 5678)"
  echo "- Docker n8n: http://localhost:15680 (isolated)"
  ;;
esac

# === END docker_isolation_system.sh ===

# === FROM docker_management_rules.sh ===
# 10:backup_n8n_data() {
# 18:check_port_conflicts() {
# 30:clean_docker_restart() {
# 39:verify_container_health() {
# 57:emergency_cleanup() {
case "${1:-help}" in
"backup")
  backup_n8n_data
  ;;
"restart")
  backup_n8n_data
  clean_docker_restart
  verify_container_health
  ;;
"emergency")
  backup_n8n_data
  emergency_cleanup
  clean_docker_restart
  verify_container_health
  ;;
"check")
  check_port_conflicts
  verify_container_health
  ;;
*)
  echo "Usage:"
  echo "  ./docker_management_rules.sh backup    - Backup n8n data"
  echo "  ./docker_management_rules.sh restart   - Clean restart with rules"
  echo "  ./docker_management_rules.sh emergency - Emergency cleanup & restart"
  echo "  ./docker_management_rules.sh check     - Check current status"
  echo ""
  echo "Professional Docker Rules:"
  echo "1. Always backup before Docker operations"
  echo "2. Check for port conflicts before starting"
  echo "3. Use clean stops/starts (no force unless emergency)"
  echo "4. Verify container health after operations"
  echo "5. Emergency cleanup only when needed"
  ;;
esac

# === END docker_management_rules.sh ===

# 🎯 CONSOLIDATED MAIN FUNCTION
main() {
  case "${1:-}" in
  "start" | "start-n8n")
    start_n8n
    ;;
  "stop" | "stop-n8n")
    stop_n8n
    ;;
  "status" | "status-n8n")
    status_n8n
    ;;
  "fix" | "fix-workflows")
    fix_workflows
    ;;
  "cleanup" | "clean")
    cleanup_system
    ;;
  "docker" | "docker-manage")
    manage_docker
    ;;
  "mcp" | "mcp-setup")
    setup_mcp
    ;;
  *)
    echo "Usage: $0 {start|stop|status|fix|cleanup|docker|mcp}"
    ;;
  esac
}

# 🚀 Launch consolidated script
main "$@"
