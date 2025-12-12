#!/bin/bash

echo "========================================="
echo "Testing Todo Backend Validation"
echo "========================================="
echo ""

# Test 1: Valid todo
echo "Test 1: Valid todo (should succeed)"
curl -X POST http://localhost:8081/todos \
  -H "Content-Type: application/json" \
  -d '{"text":"Valid todo"}' \
  -w "\nHTTP Status: %{http_code}\n\n"

# Test 2: Empty todo
echo "Test 2: Empty todo (should fail)"
curl -X POST http://localhost:8081/todos \
  -H "Content-Type: application/json" \
  -d '{"text":""}' \
  -w "\nHTTP Status: %{http_code}\n\n"

# Test 3: Exactly 140 characters (should succeed)
echo "Test 3: Exactly 140 characters (should succeed)"
TEXT_140="1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789"
curl -X POST http://localhost:8081/todos \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"$TEXT_140\"}" \
  -w "\nHTTP Status: %{http_code}\n\n"

# Test 4: 141 characters (should fail)
echo "Test 4: 141 characters (should fail)"
TEXT_141="12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890"
curl -X POST http://localhost:8081/todos \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"$TEXT_141\"}" \
  -w "\nHTTP Status: %{http_code}\n\n"

# Test 5: Very long todo (should fail)
echo "Test 5: Very long todo (should fail)"
curl -X POST http://localhost:8081/todos \
  -H "Content-Type: application/json" \
  -d '{"text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."}' \
  -w "\nHTTP Status: %{http_code}\n\n"

echo "========================================="
echo "Testing completed"
echo "Check Grafana to see all logged events"
echo "========================================="
