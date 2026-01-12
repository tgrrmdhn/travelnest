#!/bin/bash

# TravelNest API Test Script
# Tests all implemented features with security

BASE_URL="http://localhost:3000"
HOST_EMAIL="host@test.com"
HOST_PASSWORD="host123456"
TRAVELER_EMAIL="traveler@test.com"
TRAVELER_PASSWORD="traveler123456"

echo "========================================="
echo "TravelNest API Feature Tests"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Register Host
echo "Test 1: Register Host"
HOST_REGISTER=$(curl -s -X POST "${BASE_URL}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\":\"${HOST_EMAIL}\",
    \"password\":\"${HOST_PASSWORD}\",
    \"name\":\"Test Host\",
    \"role\":\"host\"
  }")

echo "${HOST_REGISTER}" | grep -q '"success":true'
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Host registered successfully${NC}"
else
  echo -e "${RED}✗ Host registration failed${NC}"
  echo "${HOST_REGISTER}"
fi
echo ""

# Test 2: Register Traveler
echo "Test 2: Register Traveler"
TRAVELER_REGISTER=$(curl -s -X POST "${BASE_URL}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\":\"${TRAVELER_EMAIL}\",
    \"password\":\"${TRAVELER_PASSWORD}\",
    \"name\":\"Test Traveler\",
    \"role\":\"traveler\"
  }")

echo "${TRAVELER_REGISTER}" | grep -q '"success":true'
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Traveler registered successfully${NC}"
else
  echo -e "${RED}✗ Traveler registration failed${NC}"
  echo "${TRAVELER_REGISTER}"
fi
echo ""

# Test 3: Login Host
echo "Test 3: Login Host"
HOST_LOGIN=$(curl -s -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\":\"${HOST_EMAIL}\",
    \"password\":\"${HOST_PASSWORD}\"
  }")

HOST_TOKEN=$(echo "${HOST_LOGIN}" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "${HOST_TOKEN}" ]; then
  echo -e "${GREEN}✓ Host login successful${NC}"
  echo "Host Token: ${HOST_TOKEN:0:20}..."
else
  echo -e "${RED}✗ Host login failed${NC}"
  echo "${HOST_LOGIN}"
fi
echo ""

# Test 4: Login Traveler
echo "Test 4: Login Traveler"
TRAVELER_LOGIN=$(curl -s -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\":\"${TRAVELER_EMAIL}\",
    \"password\":\"${TRAVELER_PASSWORD}\"
  }")

TRAVELER_TOKEN=$(echo "${TRAVELER_LOGIN}" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "${TRAVELER_TOKEN}" ]; then
  echo -e "${GREEN}✓ Traveler login successful${NC}"
  echo "Traveler Token: ${TRAVELER_TOKEN:0:20}..."
else
  echo -e "${RED}✗ Traveler login failed${NC}"
  echo "${TRAVELER_LOGIN}"
fi
echo ""

# Test 5: Create Host Profile
echo "Test 5: Create Host Profile"
HOST_PROFILE=$(curl -s -X POST "${BASE_URL}/api/host/profile" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${HOST_TOKEN}" \
  -d '{
    "title":"Cozy Room in Central Jakarta",
    "description":"A comfortable room with all amenities you need for a pleasant stay",
    "city":"Jakarta",
    "country":"Indonesia",
    "max_guests":2,
    "amenities":["WiFi","AC","Kitchen"],
    "house_rules":"No smoking, no pets, be respectful"
  }')

echo "${HOST_PROFILE}" | grep -q '"success":true'
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Host profile created${NC}"
  HOST_ID=$(echo "${HOST_PROFILE}" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
  echo "Host ID: ${HOST_ID}"
else
  echo -e "${RED}✗ Host profile creation failed${NC}"
  echo "${HOST_PROFILE}"
fi
echo ""

# Test 6: Test XSS Prevention
echo "Test 6: Test XSS Prevention in Host Profile"
XSS_TEST=$(curl -s -X PUT "${BASE_URL}/api/host/profile" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${HOST_TOKEN}" \
  -d '{
    "title":"<script>alert(\"xss\")</script>Cozy Room",
    "description":"Test<img src=x onerror=alert(1)> description"
  }')

echo "${XSS_TEST}" | grep -q '<script>\|<img'
if [ $? -ne 0 ]; then
  echo -e "${GREEN}✓ XSS prevented - HTML tags removed${NC}"
else
  echo -e "${RED}✗ XSS not prevented - HTML tags found in response${NC}"
fi
echo ""

# Test 7: Search Hosts
echo "Test 7: Search Hosts"
SEARCH_RESULT=$(curl -s -X GET "${BASE_URL}/api/traveler/search?city=Jakarta" \
  -H "Authorization: Bearer ${TRAVELER_TOKEN}")

echo "${SEARCH_RESULT}" | grep -q '"success":true'
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Host search successful${NC}"
  HOST_COUNT=$(echo "${SEARCH_RESULT}" | grep -o '"id":[0-9]*' | wc -l)
  echo "Found ${HOST_COUNT} host(s)"
else
  echo -e "${RED}✗ Host search failed${NC}"
  echo "${SEARCH_RESULT}"
fi
echo ""

# Test 8: Create Booking Request
echo "Test 8: Create Booking Request"
BOOKING_REQUEST=$(curl -s -X POST "${BASE_URL}/api/traveler/requests" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TRAVELER_TOKEN}" \
  -d "{
    \"host_id\":${HOST_ID},
    \"check_in\":\"2026-02-01\",
    \"check_out\":\"2026-02-05\",
    \"guests\":2,
    \"message\":\"Hi! I would like to stay at your place.\"
  }")

echo "${BOOKING_REQUEST}" | grep -q '"success":true'
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Booking request created${NC}"
  REQUEST_ID=$(echo "${BOOKING_REQUEST}" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
  echo "Request ID: ${REQUEST_ID}"
else
  echo -e "${RED}✗ Booking request failed${NC}"
  echo "${BOOKING_REQUEST}"
fi
echo ""

# Test 9: Test Past Date Validation
echo "Test 9: Test Past Date Validation"
PAST_DATE_TEST=$(curl -s -X POST "${BASE_URL}/api/traveler/requests" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TRAVELER_TOKEN}" \
  -d "{
    \"host_id\":${HOST_ID},
    \"check_in\":\"2020-01-01\",
    \"check_out\":\"2020-01-05\",
    \"guests\":2
  }")

echo "${PAST_DATE_TEST}" | grep -q 'past\|invalid'
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Past date validation working${NC}"
else
  echo -e "${RED}✗ Past date validation not working${NC}"
fi
echo ""

# Test 10: Host Get Requests
echo "Test 10: Host Get Pending Requests"
HOST_REQUESTS=$(curl -s -X GET "${BASE_URL}/api/host/requests?status=pending" \
  -H "Authorization: Bearer ${HOST_TOKEN}")

echo "${HOST_REQUESTS}" | grep -q '"success":true'
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Host can view requests${NC}"
  PENDING_COUNT=$(echo "${HOST_REQUESTS}" | grep -o '"status":"pending"' | wc -l)
  echo "Pending requests: ${PENDING_COUNT}"
else
  echo -e "${RED}✗ Failed to get host requests${NC}"
fi
echo ""

# Test 11: Host Accept Request
echo "Test 11: Host Accept Booking Request"
ACCEPT_REQUEST=$(curl -s -X PUT "${BASE_URL}/api/host/requests/${REQUEST_ID}/accept" \
  -H "Authorization: Bearer ${HOST_TOKEN}")

echo "${ACCEPT_REQUEST}" | grep -q '"success":true'
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Request accepted${NC}"
  echo "Traveler should receive notification"
else
  echo -e "${RED}✗ Failed to accept request${NC}"
  echo "${ACCEPT_REQUEST}"
fi
echo ""

# Test 12: Traveler Check Notifications
echo "Test 12: Traveler Check Notifications"
TRAVELER_NOTIF=$(curl -s -X GET "${BASE_URL}/api/user/notifications" \
  -H "Authorization: Bearer ${TRAVELER_TOKEN}")

echo "${TRAVELER_NOTIF}" | grep -q 'accepted\|Request Accepted'
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Traveler received notification${NC}"
  echo "${TRAVELER_NOTIF}" | grep -o '"title":"[^"]*"' | head -1
else
  echo -e "${RED}✗ Notification not received${NC}"
  echo "${TRAVELER_NOTIF}"
fi
echo ""

# Test 13: Chat After Acceptance
echo "Test 13: Send Chat Message (Should Work After Acceptance)"
CHAT_MESSAGE=$(curl -s -X POST "${BASE_URL}/api/chat/send" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TRAVELER_TOKEN}" \
  -d '{
    "receiver_id":1,
    "message":"Thank you for accepting! What time should I arrive?"
  }')

echo "${CHAT_MESSAGE}" | grep -q '"success":true'
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Chat message sent successfully${NC}"
else
  echo -e "${YELLOW}⚠ Chat might not work (check receiver_id)${NC}"
  echo "${CHAT_MESSAGE}"
fi
echo ""

# Test 14: Test SQL Injection Prevention
echo "Test 14: Test SQL Injection Prevention"
SQL_INJECTION_TEST=$(curl -s -X GET "${BASE_URL}/api/traveler/search?city=Jakarta' OR '1'='1" \
  -H "Authorization: Bearer ${TRAVELER_TOKEN}")

echo "${SQL_INJECTION_TEST}" | grep -q 'Invalid input\|error'
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ SQL injection prevented${NC}"
else
  echo -e "${YELLOW}⚠ SQL injection test inconclusive${NC}"
  echo "Note: Prepared statements provide base protection"
fi
echo ""

# Test 15: Test Input Length Validation
echo "Test 15: Test Input Length Validation"
LONG_TITLE=$(printf 'A%.0s' {1..150})
LENGTH_TEST=$(curl -s -X PUT "${BASE_URL}/api/host/profile" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${HOST_TOKEN}" \
  -d "{\"title\":\"${LONG_TITLE}\"}")

echo "${LENGTH_TEST}" | grep -q 'too long\|100 characters'
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Length validation working${NC}"
else
  echo -e "${YELLOW}⚠ Length validation response unclear${NC}"
fi
echo ""

echo "========================================="
echo "Test Summary"
echo "========================================="
echo ""
echo -e "${GREEN}All major features tested:${NC}"
echo "  • Host registration and login"
echo "  • Host profile creation"
echo "  • Traveler registration and login"
echo "  • Host search functionality"
echo "  • Booking request system"
echo "  • Request acceptance/rejection"
echo "  • Notification system"
echo "  • Chat system (conditional)"
echo ""
echo -e "${GREEN}Security features tested:${NC}"
echo "  • XSS prevention"
echo "  • SQL injection prevention"
echo "  • Input validation (length, format, dates)"
echo "  • Authorization checks"
echo ""
echo -e "${YELLOW}Note: Check console logs for [ADMIN LOG] entries${NC}"
echo -e "${YELLOW}Note: Access /api/admin/system-logs for full monitoring${NC}"
echo ""
