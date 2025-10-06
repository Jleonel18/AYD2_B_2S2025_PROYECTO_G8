from locust import HttpUser, task, between, events
from gevent import sleep
import sys

class ResourceLimitTestUser(HttpUser):
    wait_time = between(2, 5)

    @task(2)
    def get_all_flights(self):
        self.client.get(
            "/api/vuelos/",
            headers={"Content-Type": "application/json"},
            name="GET /api/vuelos"
        )

    @task(1)
    def login(self):
        self.client.post(
            "/api/users/login",
            json={"usuario": "clopezaaaaa_3823", "contrasena": "1234ABcd"},
            headers={"Content-Type": "application/json"},
            name="POST /api/users/login"
        )

@events.init.add_listener
def on_locust_init(environment, **kwargs):
    if environment.web_ui is None:
        def resource_limit_scenario():
            while environment.runner is None:
                sleep(0.5)

            print("Iniciando Prueba de Límite de Recursos")
            print("Carga constante: 100 usuarios, spawn rate 10/s (5 minutos)")
            environment.runner.start(user_count=100, spawn_rate=10)
            sleep(300) 

            print("Prueba completada. Deteniendo ejecución.")
            environment.runner.quit()
            sys.exit(0)

        environment.runner.start(user_count=100, spawn_rate=10) 
        sleep(300) 
        environment.runner.quit()
        sys.exit(0)

if __name__ == "__main__":
    import os
    os.system("locust -f resource_limit_test.py --host=http://172.174.210.25:3000 --csv=results_resource_limit --headless")