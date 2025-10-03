from locust import HttpUser, task, between

class FlightStressTestUser(HttpUser):
    wait_time = between(1, 3)

    """def on_start(self):
        self.token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4Y2YwZDJkNjE2NWI2N2VhOGFlNzRhMiIsInVzdWFyaW8iOiJkZ29uZ29yYV8xNzk1IiwidGlwbyI6InBhc2FqZXJvIiwibm9tYnJlIjoiRGF2aWQgR29uZ29yYW8iLCJjb3JyZW8iOiJqZGdvbmdvcmFvQGdtYWlsLmNvbSIsImlhdCI6MTc1OTUyMDU1NywiZXhwIjoxNzU5NTI0MTU3fQ.HXgvunIbCnbDy9UQv1s8EkYKlW3MMcM3Bd-_3LTXE0I"
    """
    @task(5)
    def login(self):
        response = self.client.post(
            "/api/users/login",
            json={"usuario": "clopezaaaaa_3823", "contrasena": "1234ABcd"},
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 200:
            self.token = response.json().get("token")

    @task(4)
    def get_all_flights(self):
            response = self.client.get(
                "/api/vuelos/",
                            headers={"Content-Type": "application/json"}
            )