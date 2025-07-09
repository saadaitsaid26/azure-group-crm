"""
Manual API testing script for Azure Group CRM.
Tests authentication endpoints and verifies API functionality.
"""

import requests
import json
from typing import Dict, Optional

# Configuration
BASE_URL = "http://127.0.0.1:3000/api/v1"
TEST_USER = {
    "email": "user@azuregroup.com",
    "password": "user123"
}
TEST_ADMIN = {
    "email": "admin@azuregroup.com",
    "password": "admin123"
}


class Colors:
    """ANSI color codes for terminal output."""
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'


def print_header(text: str):
    """Print a formatted header."""
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'=' * 60}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{text:^60}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'=' * 60}{Colors.RESET}\n")


def print_test(name: str, passed: bool, details: str = ""):
    """Print test result."""
    status = f"{Colors.GREEN}✓ PASS{Colors.RESET}" if passed else f"{Colors.RED}✗ FAIL{Colors.RESET}"
    print(f"{status} - {name}")
    if details:
        print(f"    {Colors.YELLOW}{details}{Colors.RESET}")


def print_response(response: requests.Response):
    """Print formatted response details."""
    print(f"\n  Status Code: {response.status_code}")
    try:
        data = response.json()
        print(f"  Response: {json.dumps(data, indent=2)}")
    except:
        print(f"  Response: {response.text[:200]}")
    if response.cookies:
        print(f"  Cookies: {list(response.cookies.keys())}")


def test_api_documentation():
    """Test that API documentation endpoints are accessible."""
    print_header("Testing API Documentation")
    
    # Test Swagger UI
    try:
        response = requests.get("http://127.0.0.1:3000/api/docs/")
        passed = response.status_code == 200
        print_test("Swagger UI accessible", passed, 
                   f"http://127.0.0.1:3000/api/docs/ - Status: {response.status_code}")
    except Exception as e:
        print_test("Swagger UI accessible", False, str(e))
    
    # Test ReDoc
    try:
        response = requests.get("http://127.0.0.1:3000/api/redoc/")
        passed = response.status_code == 200
        print_test("ReDoc accessible", passed,
                   f"http://127.0.0.1:3000/api/redoc/ - Status: {response.status_code}")
    except Exception as e:
        print_test("ReDoc accessible", False, str(e))
    
    # Test OpenAPI Schema
    try:
        response = requests.get("http://127.0.0.1:3000/api/schema/")
        passed = response.status_code == 200
        print_test("OpenAPI Schema accessible", passed,
                   f"http://127.0.0.1:3000/api/schema/ - Status: {response.status_code}")
    except Exception as e:
        print_test("OpenAPI Schema accessible", False, str(e))


def test_unauthorized_access():
    """Test that protected endpoints reject unauthorized requests."""
    print_header("Testing Unauthorized Access")
    
    try:
        response = requests.get(f"{BASE_URL}/auth/me")
        passed = response.status_code == 401
        print_test("Unauthorized /auth/me returns 401", passed,
                   f"Expected 401, got {response.status_code}")
        if not passed:
            print_response(response)
    except Exception as e:
        print_test("Unauthorized /auth/me returns 401", False, str(e))


def test_invalid_login():
    """Test login with invalid credentials."""
    print_header("Testing Invalid Login")
    
    invalid_credentials = {
        "email": "user@azuregroup.com",
        "password": "wrongpassword"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=invalid_credentials)
        passed = response.status_code == 401
        print_test("Invalid credentials return 401", passed,
                   f"Expected 401, got {response.status_code}")
        
        if response.status_code == 401:
            data = response.json()
            has_error = "error" in data
            print_test("Response contains error message", has_error,
                       f"Error: {data.get('error', {}).get('message', 'N/A')}")
    except Exception as e:
        print_test("Invalid credentials return 401", False, str(e))


def test_valid_login_and_auth_flow():
    """Test complete authentication flow: login, get user, refresh, logout."""
    print_header("Testing Valid Authentication Flow")
    
    session = requests.Session()
    
    # Step 1: Login
    print(f"\n{Colors.BOLD}Step 1: Login{Colors.RESET}")
    try:
        response = session.post(f"{BASE_URL}/auth/login", json=TEST_USER)
        passed = response.status_code == 200
        print_test("Login successful", passed, f"Status: {response.status_code}")
        
        if passed:
            data = response.json()
            has_user = "user" in data
            print_test("Response contains user data", has_user)
            
            has_cookies = "access_token" in response.cookies and "refresh_token" in response.cookies
            print_test("Cookies set (access_token, refresh_token)", has_cookies,
                       f"Cookies: {list(response.cookies.keys())}")
            
            if has_user:
                user = data["user"]
                print(f"    User ID: {user.get('id')}")
                print(f"    Email: {user.get('email')}")
                print(f"    Name: {user.get('first_name')} {user.get('last_name')}")
                print(f"    Role: {user.get('role')}")
        else:
            print_response(response)
            return
    except Exception as e:
        print_test("Login successful", False, str(e))
        return
    
    # Step 2: Get current user
    print(f"\n{Colors.BOLD}Step 2: Get Current User (/auth/me){Colors.RESET}")
    try:
        response = session.get(f"{BASE_URL}/auth/me")
        passed = response.status_code == 200
        print_test("Get current user successful", passed, f"Status: {response.status_code}")
        
        if passed:
            data = response.json()
            email_matches = data.get("email") == TEST_USER["email"]
            print_test("User email matches", email_matches,
                       f"Expected: {TEST_USER['email']}, Got: {data.get('email')}")
        else:
            print_response(response)
    except Exception as e:
        print_test("Get current user successful", False, str(e))
    
    # Step 3: Refresh token
    print(f"\n{Colors.BOLD}Step 3: Refresh Token{Colors.RESET}")
    try:
        response = session.post(f"{BASE_URL}/auth/refresh")
        passed = response.status_code == 200
        print_test("Token refresh successful", passed, f"Status: {response.status_code}")
        
        if passed:
            has_new_cookies = "access_token" in response.cookies
            print_test("New access token cookie set", has_new_cookies)
    except Exception as e:
        print_test("Token refresh successful", False, str(e))
    
    # Step 4: Logout
    print(f"\n{Colors.BOLD}Step 4: Logout{Colors.RESET}")
    try:
        response = session.post(f"{BASE_URL}/auth/logout")
        passed = response.status_code == 200
        print_test("Logout successful", passed, f"Status: {response.status_code}")
        
        if passed:
            # Check if cookies are cleared
            cookies_cleared = (
                response.cookies.get("access_token") == "" or 
                "access_token" not in response.cookies
            )
            print_test("Cookies cleared", cookies_cleared)
    except Exception as e:
        print_test("Logout successful", False, str(e))
    
    # Step 5: Verify logged out
    print(f"\n{Colors.BOLD}Step 5: Verify Logged Out{Colors.RESET}")
    try:
        response = session.get(f"{BASE_URL}/auth/me")
        passed = response.status_code == 401
        print_test("Cannot access /auth/me after logout", passed,
                   f"Expected 401, got {response.status_code}")
    except Exception as e:
        print_test("Cannot access /auth/me after logout", False, str(e))


def test_admin_login():
    """Test admin user login."""
    print_header("Testing Admin User Login")
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=TEST_ADMIN)
        passed = response.status_code == 200
        print_test("Admin login successful", passed, f"Status: {response.status_code}")
        
        if passed:
            data = response.json()
            user = data.get("user", {})
            is_admin = user.get("role") == "admin"
            print_test("User has admin role", is_admin,
                       f"Role: {user.get('role')}")
            
            print(f"    User ID: {user.get('id')}")
            print(f"    Email: {user.get('email')}")
            print(f"    Name: {user.get('first_name')} {user.get('last_name')}")
        else:
            print_response(response)
    except Exception as e:
        print_test("Admin login successful", False, str(e))


def run_all_tests():
    """Run all API tests."""
    print(f"\n{Colors.BOLD}{Colors.GREEN}")
    print("╔══════════════════════════════════════════════════════════╗")
    print("║         Azure Group CRM - API Testing Suite             ║")
    print("╚══════════════════════════════════════════════════════════╝")
    print(f"{Colors.RESET}")
    print(f"Base URL: {BASE_URL}")
    print(f"Testing with user: {TEST_USER['email']}")
    
    try:
        # Run all tests
        test_api_documentation()
        test_unauthorized_access()
        test_invalid_login()
        test_valid_login_and_auth_flow()
        test_admin_login()
        
        # Summary
        print_header("Test Summary")
        print(f"{Colors.GREEN}All manual tests completed!{Colors.RESET}")
        print(f"\nNext steps:")
        print(f"  1. Open browser to http://127.0.0.1:3000/api/docs/ to view Swagger UI")
        print(f"  2. Test endpoints interactively in Swagger")
        print(f"  3. Run automated tests: pytest -v")
        
    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}Tests interrupted by user{Colors.RESET}")
    except Exception as e:
        print(f"\n\n{Colors.RED}Unexpected error: {e}{Colors.RESET}")


if __name__ == "__main__":
    run_all_tests()
