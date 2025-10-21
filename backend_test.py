import requests
import sys
import json
from datetime import datetime, timedelta

class DriveAppointmentAPITester:
    def __init__(self, base_url="https://driver-scheduler-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}, Expected: {expected_status}"
            
            if not success:
                try:
                    error_detail = response.json()
                    details += f", Response: {error_detail}"
                except:
                    details += f", Response: {response.text[:200]}"
            
            self.log_test(name, success, details)
            
            if success:
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_login_success(self):
        """Test successful login with correct password"""
        success, response = self.run_test(
            "Login with correct password",
            "POST",
            "auth/login",
            200,
            data={"password": "driver123"}
        )
        if success and 'token' in response:
            self.token = response['token']
            return True
        return False

    def test_login_failure(self):
        """Test login failure with wrong password"""
        success, _ = self.run_test(
            "Login with wrong password",
            "POST", 
            "auth/login",
            401,
            data={"password": "wrongpassword"}
        )
        return success

    def test_create_appointment(self):
        """Test creating a new appointment"""
        now = datetime.now()
        pickup_time = (now + timedelta(hours=2)).isoformat()
        arrival_time = (now + timedelta(hours=3)).isoformat()
        
        appointment_data = {
            "client_name": "測試客戶",
            "pickup_time": pickup_time,
            "pickup_location": "台北車站",
            "arrival_time": arrival_time,
            "arrival_location": "桃園機場",
            "flight_info": "CI123",
            "luggage_count": 2,
            "other_details": "測試預約",
            "status": "scheduled"
        }
        
        success, response = self.run_test(
            "Create appointment",
            "POST",
            "appointments",
            200,
            data=appointment_data
        )
        
        if success and 'id' in response:
            return response['id']
        return None

    def test_get_appointments(self):
        """Test getting all appointments"""
        success, response = self.run_test(
            "Get all appointments",
            "GET",
            "appointments",
            200
        )
        return success, response if success else []

    def test_get_appointment_by_id(self, appointment_id):
        """Test getting specific appointment by ID"""
        success, response = self.run_test(
            f"Get appointment by ID: {appointment_id}",
            "GET",
            f"appointments/{appointment_id}",
            200
        )
        return success

    def test_update_appointment(self, appointment_id):
        """Test updating an appointment"""
        update_data = {
            "client_name": "更新的客戶",
            "other_details": "已更新的備註"
        }
        
        success, response = self.run_test(
            f"Update appointment: {appointment_id}",
            "PUT",
            f"appointments/{appointment_id}",
            200,
            data=update_data
        )
        return success

    def test_filter_appointments(self):
        """Test filtering appointments by status"""
        success, response = self.run_test(
            "Filter appointments by status",
            "GET",
            "appointments?status=scheduled",
            200
        )
        return success

    def test_search_appointments(self):
        """Test searching appointments by client name"""
        success, response = self.run_test(
            "Search appointments by client name",
            "GET",
            "appointments?client_name=測試",
            200
        )
        return success

    def test_delete_appointment(self, appointment_id):
        """Test deleting an appointment"""
        success, response = self.run_test(
            f"Delete appointment: {appointment_id}",
            "DELETE",
            f"appointments/{appointment_id}",
            200
        )
        return success

    def test_unauthorized_access(self):
        """Test accessing protected endpoints without token"""
        # Temporarily remove token
        original_token = self.token
        self.token = None
        
        success, _ = self.run_test(
            "Unauthorized access to appointments",
            "GET",
            "appointments",
            401
        )
        
        # Restore token
        self.token = original_token
        return success

def main():
    print("🚗 Starting Driving Appointments API Tests...")
    print("=" * 50)
    
    tester = DriveAppointmentAPITester()
    
    # Test authentication
    print("\n📋 Testing Authentication...")
    if not tester.test_login_success():
        print("❌ Login failed, stopping tests")
        return 1
    
    tester.test_login_failure()
    tester.test_unauthorized_access()
    
    # Test CRUD operations
    print("\n📋 Testing CRUD Operations...")
    appointment_id = tester.test_create_appointment()
    
    if not appointment_id:
        print("❌ Appointment creation failed, stopping CRUD tests")
    else:
        tester.test_get_appointment_by_id(appointment_id)
        tester.test_update_appointment(appointment_id)
        
        # Test filtering and searching
        print("\n📋 Testing Search & Filter...")
        tester.test_filter_appointments()
        tester.test_search_appointments()
        
        # Get all appointments
        success, appointments = tester.test_get_appointments()
        
        # Clean up - delete test appointment
        tester.test_delete_appointment(appointment_id)
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed. Check details above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())